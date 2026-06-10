import type { Request, Response, NextFunction } from "express";
import { meetingService } from "./meetingService";
import { AppError } from "../../middleware/errorHandler";
import { checkWorkspaceAccess } from "../../middleware/rbac";

export const meetingController = {
  async createMeeting(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, workspaceId, date } = req.body;
      if (!workspaceId || !title || !date) throw new AppError("Missing required fields", 400);

      await checkWorkspaceAccess(req, workspaceId);

      const meeting = await meetingService.createMeeting({
        title,
        workspaceId,
        date: new Date(date),
        createdById: req.user!.id
      });

      res.status(201).json({ meeting });
    } catch (error) {
      next(error);
    }
  },

  async getMeetings(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = String(req.query.workspaceId || "");
      if (!workspaceId) throw new AppError("workspaceId query parameter is required", 400);

      await checkWorkspaceAccess(req, workspaceId);

      const meetings = await meetingService.getMeetings(workspaceId);
      res.status(200).json({ meetings });
    } catch (error) {
      next(error);
    }
  },

  async getMeetingById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const meeting = await meetingService.getMeetingById(id);
      if (!meeting) throw new AppError("Meeting not found", 404);

      await checkWorkspaceAccess(req, meeting.workspaceId);

      res.status(200).json({ meeting });
    } catch (error) {
      next(error);
    }
  },

  async updateMeeting(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const meeting = await meetingService.getMeetingById(id);
      if (!meeting) throw new AppError("Meeting not found", 404);

      await checkWorkspaceAccess(req, meeting.workspaceId);

      const data = req.body;
      const updatedMeeting = await meetingService.updateMeeting(id, data);
      res.status(200).json({ meeting: updatedMeeting });
    } catch (error) {
      next(error);
    }
  },

  async deleteMeeting(req: Request, res: Response, next: NextFunction) {
    try {
      // Only allow users with role MEETING_OWNER or ADMIN
      const role = req.user?.role;
      if (role !== "ADMIN" && role !== "MEETING_OWNER") {
        throw new AppError("Forbidden", 403);
      }

      const id = req.params.id as string;
      const meeting = await meetingService.getMeetingById(id);
      if (!meeting) throw new AppError("Meeting not found", 404);

      await checkWorkspaceAccess(req, meeting.workspaceId);

      await meetingService.deleteMeeting(id);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};
