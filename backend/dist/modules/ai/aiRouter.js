"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../auth/authMiddleware");
const errorHandler_1 = require("../../middleware/errorHandler");
const rbac_1 = require("../../middleware/rbac");
const prisma_1 = require("../../config/prisma");
const queue_1 = require("../../queue/queue");
exports.aiRouter = (0, express_1.Router)();
exports.aiRouter.use(authMiddleware_1.verifyToken);
const getLatestRecording = async (meetingId) => {
    const recording = await prisma_1.prisma.recording.findFirst({
        where: { meetingId },
        orderBy: { createdAt: "desc" }
    });
    if (!recording) {
        throw new errorHandler_1.AppError("No recording found for this meeting", 404);
    }
    return recording;
};
const ensureMeetingAccess = async (req, meetingId) => {
    const meeting = await prisma_1.prisma.meeting.findUnique({
        where: { id: meetingId },
        select: { workspaceId: true }
    });
    if (!meeting) {
        throw new errorHandler_1.AppError("Meeting not found", 404);
    }
    await (0, rbac_1.checkWorkspaceAccess)(req, meeting.workspaceId);
    return meeting;
};
const queueAiJob = async (jobName, meetingId) => {
    const recording = await getLatestRecording(meetingId);
    await queue_1.aiQueue.add(jobName, {
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
exports.aiRouter.post("/transcribe", async (req, res, next) => {
    try {
        const meetingId = typeof req.body?.meetingId === "string" ? req.body.meetingId.trim() : "";
        if (!meetingId) {
            throw new errorHandler_1.AppError("meetingId is required", 400);
        }
        await ensureMeetingAccess(req, meetingId);
        const result = await queueAiJob("transcribe", meetingId);
        res.status(202).json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.aiRouter.post("/summarize", async (req, res, next) => {
    try {
        const meetingId = typeof req.body?.meetingId === "string" ? req.body.meetingId.trim() : "";
        if (!meetingId) {
            throw new errorHandler_1.AppError("meetingId is required", 400);
        }
        await ensureMeetingAccess(req, meetingId);
        const result = await queueAiJob("summarize", meetingId);
        res.status(202).json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.aiRouter.post("/action-items", async (req, res, next) => {
    try {
        const meetingId = typeof req.body?.meetingId === "string" ? req.body.meetingId.trim() : "";
        if (!meetingId) {
            throw new errorHandler_1.AppError("meetingId is required", 400);
        }
        await ensureMeetingAccess(req, meetingId);
        const result = await queueAiJob("action-items", meetingId);
        res.status(202).json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.aiRouter.post("/screenshot-analysis", async (req, res, next) => {
    try {
        const screenshotId = typeof req.body?.screenshotId === "string" ? req.body.screenshotId.trim() : "";
        if (!screenshotId) {
            throw new errorHandler_1.AppError("screenshotId is required", 400);
        }
        const screenshot = await prisma_1.prisma.screenshot.findUnique({
            where: { id: screenshotId },
            include: { meeting: { select: { workspaceId: true } } }
        });
        if (!screenshot) {
            throw new errorHandler_1.AppError("Screenshot not found", 404);
        }
        await (0, rbac_1.checkWorkspaceAccess)(req, screenshot.meeting.workspaceId);
        await queue_1.aiQueue.add("screenshot-analysis", {
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
    }
    catch (error) {
        next(error);
    }
});
