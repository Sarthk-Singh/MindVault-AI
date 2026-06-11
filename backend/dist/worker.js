"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_crypto_1 = require("node:crypto");
const bullmq_1 = require("bullmq");
const prisma_1 = require("./config/prisma");
const env_1 = require("./config/env");
const geminiService_1 = require("./services/geminiService");
const chunkTranscript = (transcript, chunkSize = 500) => {
    const words = transcript.trim().split(/\s+/).filter(Boolean);
    return words.reduce((chunks, word, index) => {
        const chunkIndex = Math.floor(index / chunkSize);
        const currentChunk = chunks[chunkIndex] ?? "";
        chunks[chunkIndex] = `${currentChunk} ${word}`.trim();
        return chunks;
    }, []);
};
const storeEmbedding = async (sourceId, sourceType, text) => {
    const vector = Array.from({ length: 768 }, () => 0);
    const vectorLiteral = `[${vector.join(",")}]`;
    await prisma_1.prisma.$executeRaw `INSERT INTO "Embedding" ("id", "sourceId", "sourceType", "vector", "createdAt") VALUES (${(0, node_crypto_1.randomUUID)()}, ${sourceId}, ${sourceType}, ${vectorLiteral}::vector(768), NOW())`;
    console.log(`[worker] stubbed embedding stored for ${sourceType}:${sourceId}`, text.slice(0, 120));
};
const processTranscribeJob = async (jobData) => {
    const recording = await prisma_1.prisma.recording.findUnique({
        where: { id: jobData.recordingId }
    });
    if (!recording) {
        throw new Error("Recording not found for AI transcription job");
    }
    await prisma_1.prisma.meeting.update({
        where: { id: recording.meetingId },
        data: { status: "PROCESSING" }
    });
    const transcript = await geminiService_1.geminiService.transcribeAudio(recording.fileUrl);
    const chunks = chunkTranscript(transcript);
    await prisma_1.prisma.transcriptChunk.createMany({
        data: chunks.map((content, chunkIndex) => ({
            meetingId: recording.meetingId,
            content,
            chunkIndex
        }))
    });
    const [summaryResult, actionItems, decisions] = await Promise.all([
        geminiService_1.geminiService.generateSummary(transcript),
        geminiService_1.geminiService.extractActionItems(transcript),
        geminiService_1.geminiService.extractDecisions(transcript)
    ]);
    await prisma_1.prisma.summary.deleteMany({ where: { meetingId: recording.meetingId } });
    await prisma_1.prisma.actionItem.deleteMany({ where: { meetingId: recording.meetingId } });
    await prisma_1.prisma.decision.deleteMany({ where: { meetingId: recording.meetingId } });
    await prisma_1.prisma.summary.create({
        data: {
            meetingId: recording.meetingId,
            summary: summaryResult.summary,
            keyPoints: summaryResult.keyPoints
        }
    });
    if (actionItems.length > 0) {
        await prisma_1.prisma.actionItem.createMany({
            data: actionItems.map((item) => ({
                meetingId: recording.meetingId,
                task: item.task,
                assignee: item.assignee
            }))
        });
    }
    if (decisions.length > 0) {
        await prisma_1.prisma.decision.createMany({
            data: decisions.map((decision) => ({
                meetingId: recording.meetingId,
                decision
            }))
        });
    }
    await prisma_1.prisma.meeting.update({
        where: { id: recording.meetingId },
        data: { status: "DONE" }
    });
};
const worker = new bullmq_1.Worker("ai-jobs", async (job) => {
    try {
        if (job.name === "transcribe" || job.name === "summarize" || job.name === "action-items") {
            await processTranscribeJob(job.data);
            return;
        }
        if (job.name === "screenshot-analysis") {
            const { screenshotId } = job.data;
            const screenshot = await prisma_1.prisma.screenshot.findUnique({ where: { id: screenshotId } });
            if (!screenshot) {
                throw new Error("Screenshot not found for analysis job");
            }
            const analysis = await geminiService_1.geminiService.analyzeScreenshot(screenshot.imageUrl);
            await prisma_1.prisma.screenshot.update({
                where: { id: screenshotId },
                data: {
                    ocrText: analysis.ocrText,
                    summary: analysis.summary,
                    concepts: analysis.concepts
                }
            });
            const combinedText = `${analysis.ocrText} ${analysis.summary}`.trim();
            await storeEmbedding(screenshotId, "screenshot", combinedText);
            await prisma_1.prisma.meeting.update({
                where: { id: screenshot.meetingId },
                data: { status: "DONE" }
            });
            return;
        }
        console.log("[worker] unknown job", job.name, job.data);
    }
    catch (error) {
        console.error("[worker] job failed", job.name, error);
        const meetingId = typeof job.data?.meetingId === "string" ? job.data.meetingId : "";
        if (meetingId) {
            await prisma_1.prisma.meeting.update({
                where: { id: meetingId },
                data: { status: "FAILED" }
            }).catch((updateError) => {
                console.error("[worker] failed to mark meeting as FAILED", updateError);
            });
        }
        throw error;
    }
}, { connection: { url: env_1.env.REDIS_URL } });
worker.on("completed", (job) => console.log(`[worker] job ${job.id} completed`));
worker.on("failed", (job, err) => console.error(`[worker] job ${job?.id} failed`, err));
process.on("SIGINT", async () => {
    await worker.close();
    process.exit(0);
});
