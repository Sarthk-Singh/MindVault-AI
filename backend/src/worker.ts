import "dotenv/config";
import { randomUUID } from "node:crypto";
import { Worker } from "bullmq";
import { prisma } from "./config/prisma";
import { env } from "./config/env";
import { geminiService } from "./services/geminiService";
import { Prisma } from "@prisma/client";
import { storeEmbedding } from "./services/embeddingService";


const chunkTranscript = (transcript: string, chunkSize = 500) => {
  const words = transcript.trim().split(/\s+/).filter(Boolean);

  return words.reduce<string[]>((chunks, word, index) => {
    const chunkIndex = Math.floor(index / chunkSize);
    const currentChunk = chunks[chunkIndex] ?? "";

    chunks[chunkIndex] = `${currentChunk} ${word}`.trim();

    return chunks;
  }, []);
};

const processTranscribeJob = async (jobData: { recordingId: string; meetingId: string }) => {
  const recording = await prisma.recording.findUnique({
    where: { id: jobData.recordingId }
  });

  if (!recording) {
    throw new Error("Recording not found for AI transcription job");
  }

  await prisma.meeting.update({
    where: { id: recording.meetingId },
    data: { status: "PROCESSING" }
  });

  const transcript = await geminiService.transcribeAudio(recording.fileUrl);
  const chunks = chunkTranscript(transcript);

  await prisma.transcriptChunk.deleteMany({ where: { meetingId: recording.meetingId } });

  const chunkRecords = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunkRecord = await prisma.transcriptChunk.create({
      data: {
        meetingId: recording.meetingId,
        content: chunks[i],
        chunkIndex: i
      }
    });
    chunkRecords.push(chunkRecord);
  }

  await Promise.all(
    chunkRecords.map((chunk) =>
      storeEmbedding(chunk.id, "transcript", chunk.content)
    )
  );

  const [summaryResult, actionItems, decisions] = await Promise.all([
    geminiService.generateSummary(transcript),
    geminiService.extractActionItems(transcript),
    geminiService.extractDecisions(transcript)
  ]);

  await prisma.summary.deleteMany({ where: { meetingId: recording.meetingId } });
  await prisma.actionItem.deleteMany({ where: { meetingId: recording.meetingId } });
  await prisma.decision.deleteMany({ where: { meetingId: recording.meetingId } });

  const summary = await prisma.summary.create({
    data: {
      meetingId: recording.meetingId,
      summary: summaryResult.summary,
      keyPoints: summaryResult.keyPoints as unknown as Prisma.InputJsonValue
    }
  });

  await storeEmbedding(summary.id, "summary", summary.summary);

  if (actionItems.length > 0) {
    await prisma.actionItem.createMany({
      data: actionItems.map((item) => ({
        meetingId: recording.meetingId,
        task: item.task,
        assignee: item.assignee
      }))
    });
  }

  if (decisions.length > 0) {
    await prisma.decision.createMany({
      data: decisions.map((decision) => ({
        meetingId: recording.meetingId,
        decision
      }))
    });
  }

  await prisma.meeting.update({
    where: { id: recording.meetingId },
    data: { status: "DONE" }
  });
};

const worker = new Worker(
  "ai-jobs",
  async (job) => {
    try {
      if (job.name === "transcribe" || job.name === "summarize" || job.name === "action-items") {
        await processTranscribeJob(job.data as { recordingId: string; meetingId: string });
        return;
      }

      if (job.name === "screenshot-analysis") {
        const { screenshotId } = job.data as { screenshotId: string; meetingId: string };

        const screenshot = await prisma.screenshot.findUnique({ where: { id: screenshotId } });

        if (!screenshot) {
          throw new Error("Screenshot not found for analysis job");
        }

        const analysis = await geminiService.analyzeScreenshot(screenshot.imageUrl);

        await prisma.screenshot.update({
          where: { id: screenshotId },
          data: {
            ocrText: analysis.ocrText,
            summary: analysis.summary,
            concepts: analysis.concepts as unknown as Prisma.InputJsonValue
          }
        });

        const combinedText = `${analysis.ocrText} ${analysis.summary}`.trim();
        await storeEmbedding(screenshotId, "screenshot", combinedText);

        await prisma.meeting.update({
          where: { id: screenshot.meetingId },
          data: { status: "DONE" }
        });

        return;
      }

      console.log("[worker] unknown job", job.name, job.data);
    } catch (error) {
      console.error("[worker] job failed", job.name, error);

      const meetingId = typeof job.data?.meetingId === "string" ? job.data.meetingId : "";

      if (meetingId) {
        await prisma.meeting.update({
          where: { id: meetingId },
          data: { status: "FAILED" }
        }).catch((updateError) => {
          console.error("[worker] failed to mark meeting as FAILED", updateError);
        });
      }

      throw error;
    }
  },
  { connection: { url: env.REDIS_URL } }
);

worker.on("completed", (job) => console.log(`[worker] job ${job.id} completed`));
worker.on("failed", (job, err) => console.error(`[worker] job ${job?.id} failed`, err));

process.on("SIGINT", async () => {
  await worker.close();
  process.exit(0);
});
