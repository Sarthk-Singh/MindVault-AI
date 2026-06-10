import type { Express } from "express";
import { uploadToCloudinary } from "../../config/cloudinary";
import { prisma } from "../../config/prisma";
import { aiQueue } from "../../queue/queue";
import { AppError } from "../../middleware/errorHandler";

export const uploadService = {
  async uploadAudio(meetingId: string, file: Express.Multer.File) {
    if (!file.mimetype.startsWith("audio/")) throw new AppError("Invalid audio file", 400);

    const result = await uploadToCloudinary(file.buffer, "amms/recordings", "auto");

    const recording = await prisma.recording.create({
      data: { meetingId, fileUrl: result.url, mimeType: file.mimetype }
    });

    await aiQueue.add("transcribe", {
      recordingId: recording.id,
      meetingId,
      fileUrl: result.url,
      mimeType: file.mimetype
    });

    return recording;
  },

  async uploadVideo(meetingId: string, file: Express.Multer.File) {
    if (!file.mimetype.startsWith("video/")) throw new AppError("Invalid video file", 400);

    const result = await uploadToCloudinary(file.buffer, "amms/recordings", "video");

    const recording = await prisma.recording.create({
      data: { meetingId, fileUrl: result.url, mimeType: file.mimetype }
    });

    await aiQueue.add("transcribe", {
      recordingId: recording.id,
      meetingId,
      fileUrl: result.url,
      mimeType: file.mimetype
    });

    return recording;
  },

  async uploadScreenshot(meetingId: string, file: Express.Multer.File) {
    if (!file.mimetype.startsWith("image/")) throw new AppError("Invalid image file", 400);

    const result = await uploadToCloudinary(file.buffer, "amms/screenshots", "image");

    const screenshot = await prisma.screenshot.create({
      data: { meetingId, imageUrl: result.url }
    });

    await aiQueue.add("screenshot-analysis", {
      screenshotId: screenshot.id,
      meetingId,
      imageUrl: result.url
    });

    return screenshot;
  }
};
