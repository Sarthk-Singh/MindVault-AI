import type { Request, Response, NextFunction } from "express";
import { uploadService } from "./uploadService";
import { AppError } from "../../middleware/errorHandler";
import { checkWorkspaceAccess } from "../../middleware/rbac";
import { prisma } from "../../config/prisma";

export const uploadController = {
  async uploadAudio(req: Request, res: Response, next: NextFunction) {
    try {
      const meetingId = String(req.body.meetingId || "");
      if (!meetingId) throw new AppError("meetingId is required", 400);
      if (!req.file) throw new AppError("file is required", 400);

      const meeting = await prisma.meeting.findUnique({ where: { id: meetingId }, select: { workspaceId: true } });
      if (!meeting) throw new AppError("Meeting not found", 404);

      await checkWorkspaceAccess(req, meeting.workspaceId);

      const recording = await uploadService.uploadAudio(meetingId, req.file);
      res.status(201).json({ recording });
    } catch (error) {
      next(error);
    }
  },

  async uploadVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const meetingId = String(req.body.meetingId || "");
      if (!meetingId) throw new AppError("meetingId is required", 400);
      if (!req.file) throw new AppError("file is required", 400);

      const meeting = await prisma.meeting.findUnique({ where: { id: meetingId }, select: { workspaceId: true } });
      if (!meeting) throw new AppError("Meeting not found", 404);

      await checkWorkspaceAccess(req, meeting.workspaceId);

      const recording = await uploadService.uploadVideo(meetingId, req.file);
      res.status(201).json({ recording });
    } catch (error) {
      next(error);
    }
  },

  async uploadScreenshot(req: Request, res: Response, next: NextFunction) {
    try {
      const meetingId = String(req.body.meetingId || "");
      if (!meetingId) throw new AppError("meetingId is required", 400);
      if (!req.file) throw new AppError("file is required", 400);

      const meeting = await prisma.meeting.findUnique({ where: { id: meetingId }, select: { workspaceId: true } });
      if (!meeting) throw new AppError("Meeting not found", 404);

      await checkWorkspaceAccess(req, meeting.workspaceId);

      const screenshot = await uploadService.uploadScreenshot(meetingId, req.file);
      res.status(201).json({ screenshot });
    } catch (error) {
      next(error);
    }
  }
};
