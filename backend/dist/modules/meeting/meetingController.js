"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meetingController = void 0;
const meetingService_1 = require("./meetingService");
const errorHandler_1 = require("../../middleware/errorHandler");
const rbac_1 = require("../../middleware/rbac");
exports.meetingController = {
    async createMeeting(req, res, next) {
        try {
            const { title, workspaceId, date } = req.body;
            if (!workspaceId || !title || !date)
                throw new errorHandler_1.AppError("Missing required fields", 400);
            await (0, rbac_1.checkWorkspaceAccess)(req, workspaceId);
            const meeting = await meetingService_1.meetingService.createMeeting({
                title,
                workspaceId,
                date: new Date(date),
                createdById: req.user.id
            });
            res.status(201).json({ meeting });
        }
        catch (error) {
            next(error);
        }
    },
    async getMeetings(req, res, next) {
        try {
            const workspaceId = String(req.query.workspaceId || "");
            if (!workspaceId)
                throw new errorHandler_1.AppError("workspaceId query parameter is required", 400);
            await (0, rbac_1.checkWorkspaceAccess)(req, workspaceId);
            const meetings = await meetingService_1.meetingService.getMeetings(workspaceId);
            res.status(200).json({ meetings });
        }
        catch (error) {
            next(error);
        }
    },
    async getMeetingById(req, res, next) {
        try {
            const id = req.params.id;
            const meeting = await meetingService_1.meetingService.getMeetingById(id);
            if (!meeting)
                throw new errorHandler_1.AppError("Meeting not found", 404);
            await (0, rbac_1.checkWorkspaceAccess)(req, meeting.workspaceId);
            res.status(200).json({ meeting });
        }
        catch (error) {
            next(error);
        }
    },
    async updateMeeting(req, res, next) {
        try {
            const id = req.params.id;
            const meeting = await meetingService_1.meetingService.getMeetingById(id);
            if (!meeting)
                throw new errorHandler_1.AppError("Meeting not found", 404);
            await (0, rbac_1.checkWorkspaceAccess)(req, meeting.workspaceId);
            const data = req.body;
            const updatedMeeting = await meetingService_1.meetingService.updateMeeting(id, data);
            res.status(200).json({ meeting: updatedMeeting });
        }
        catch (error) {
            next(error);
        }
    },
    async deleteMeeting(req, res, next) {
        try {
            // Only allow users with role MEETING_OWNER or ADMIN
            const role = req.user?.role;
            if (role !== "ADMIN" && role !== "MEETING_OWNER") {
                throw new errorHandler_1.AppError("Forbidden", 403);
            }
            const id = req.params.id;
            const meeting = await meetingService_1.meetingService.getMeetingById(id);
            if (!meeting)
                throw new errorHandler_1.AppError("Meeting not found", 404);
            await (0, rbac_1.checkWorkspaceAccess)(req, meeting.workspaceId);
            await meetingService_1.meetingService.deleteMeeting(id);
            res.status(200).json({ success: true });
        }
        catch (error) {
            next(error);
        }
    }
};
