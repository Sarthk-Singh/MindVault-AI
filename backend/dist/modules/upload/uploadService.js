"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadService = void 0;
const cloudinary_1 = require("../../config/cloudinary");
const prisma_1 = require("../../config/prisma");
const queue_1 = require("../../queue/queue");
const errorHandler_1 = require("../../middleware/errorHandler");
exports.uploadService = {
    async uploadAudio(meetingId, file) {
        if (!file.mimetype.startsWith("audio/"))
            throw new errorHandler_1.AppError("Invalid audio file", 400);
        const result = await (0, cloudinary_1.uploadToCloudinary)(file.buffer, "amms/recordings", "auto");
        const recording = await prisma_1.prisma.recording.create({
            data: { meetingId, fileUrl: result.url, mimeType: file.mimetype }
        });
        await queue_1.aiQueue.add("transcribe", {
            recordingId: recording.id,
            meetingId,
            fileUrl: result.url,
            mimeType: file.mimetype
        });
        return recording;
    },
    async uploadVideo(meetingId, file) {
        if (!file.mimetype.startsWith("video/"))
            throw new errorHandler_1.AppError("Invalid video file", 400);
        const result = await (0, cloudinary_1.uploadToCloudinary)(file.buffer, "amms/recordings", "video");
        const recording = await prisma_1.prisma.recording.create({
            data: { meetingId, fileUrl: result.url, mimeType: file.mimetype }
        });
        await queue_1.aiQueue.add("transcribe", {
            recordingId: recording.id,
            meetingId,
            fileUrl: result.url,
            mimeType: file.mimetype
        });
        return recording;
    },
    async uploadScreenshot(meetingId, file) {
        if (!file.mimetype.startsWith("image/"))
            throw new errorHandler_1.AppError("Invalid image file", 400);
        const result = await (0, cloudinary_1.uploadToCloudinary)(file.buffer, "amms/screenshots", "image");
        const screenshot = await prisma_1.prisma.screenshot.create({
            data: { meetingId, imageUrl: result.url }
        });
        await queue_1.aiQueue.add("screenshot-analysis", {
            screenshotId: screenshot.id,
            meetingId,
            imageUrl: result.url
        });
        return screenshot;
    }
};
