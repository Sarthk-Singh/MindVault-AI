import { Router } from "express";
import { verifyToken } from "../auth/authMiddleware";
import { AppError } from "../../middleware/errorHandler";
import { checkWorkspaceAccess } from "../../middleware/rbac";
import { prisma } from "../../config/prisma";
import { aiQueue } from "../../queue/queue";

export const aiRouter = Router();

aiRouter.use(verifyToken);

const getLatestRecording = async (meetingId: string) => {
  const recording = await prisma.recording.findFirst({
    where: { meetingId },
    orderBy: { createdAt: "desc" }
  });

  if (!recording) {
    throw new AppError("No recording found for this meeting", 404);
  }

  return recording;
};

const ensureMeetingAccess = async (req: any, meetingId: string) => {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    select: { workspaceId: true }
  });

  if (!meeting) {
    throw new AppError("Meeting not found", 404);
  }

  await checkWorkspaceAccess(req, meeting.workspaceId);

  return meeting;
};

const queueAiJob = async (jobName: string, meetingId: string) => {
  const recording = await getLatestRecording(meetingId);

  await aiQueue.add(jobName, {
    recordingId: recording.id,
    meetingId,
    fileUrl: recording.fileUrl,
    mimeType: recording.mimeType
  });

  return {
    message: `${jobName} job queued successfully`,
    jobName,
    meetingId,
    recordingId: recording.id
  };
};

aiRouter.post("/transcribe", async (req, res, next) => {
  try {
    const meetingId = typeof req.body?.meetingId === "string" ? req.body.meetingId.trim() : "";

    if (!meetingId) {
      throw new AppError("meetingId is required", 400);
    }

    await ensureMeetingAccess(req, meetingId);

    const result = await queueAiJob("transcribe", meetingId);

    res.status(202).json(result);
  } catch (error) {
    next(error);
  }
});

aiRouter.post("/summarize", async (req, res, next) => {
  try {
    const meetingId = typeof req.body?.meetingId === "string" ? req.body.meetingId.trim() : "";

    if (!meetingId) {
      throw new AppError("meetingId is required", 400);
    }

    await ensureMeetingAccess(req, meetingId);

    const result = await queueAiJob("summarize", meetingId);

    res.status(202).json(result);
  } catch (error) {
    next(error);
  }
});

aiRouter.post("/action-items", async (req, res, next) => {
  try {
    const meetingId = typeof req.body?.meetingId === "string" ? req.body.meetingId.trim() : "";

    if (!meetingId) {
      throw new AppError("meetingId is required", 400);
    }

    await ensureMeetingAccess(req, meetingId);

    const result = await queueAiJob("action-items", meetingId);

    res.status(202).json(result);
  } catch (error) {
    next(error);
  }
});

aiRouter.post("/screenshot-analysis", async (req, res, next) => {
  try {
    const screenshotId = typeof req.body?.screenshotId === "string" ? req.body.screenshotId.trim() : "";

    if (!screenshotId) {
      throw new AppError("screenshotId is required", 400);
    }

    const screenshot = await prisma.screenshot.findUnique({
      where: { id: screenshotId },
      include: { meeting: { select: { workspaceId: true } } }
    });

    if (!screenshot) {
      throw new AppError("Screenshot not found", 404);
    }

    await checkWorkspaceAccess(req, screenshot.meeting.workspaceId);

    await aiQueue.add("screenshot-analysis", {
      screenshotId,
      meetingId: screenshot.meetingId,
      imageUrl: screenshot.imageUrl
    });

    res.status(202).json({
      message: "screenshot-analysis job queued successfully",
      jobName: "screenshot-analysis",
      meetingId: screenshot.meetingId,
      screenshotId
    });
  } catch (error) {
    next(error);
  }
});
