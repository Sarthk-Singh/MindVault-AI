"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = void 0;
const uploadService_1 = require("./uploadService");
const errorHandler_1 = require("../../middleware/errorHandler");
exports.uploadController = {
    async uploadAudio(req, res, next) {
        try {
            const meetingId = String(req.body.meetingId || "");
            if (!meetingId)
                throw new errorHandler_1.AppError("meetingId is required", 400);
            if (!req.file)
                throw new errorHandler_1.AppError("file is required", 400);
            const recording = await uploadService_1.uploadService.uploadAudio(meetingId, req.file);
            res.status(201).json({ recording });
        }
        catch (error) {
            next(error);
        }
    },
    async uploadVideo(req, res, next) {
        try {
            const meetingId = String(req.body.meetingId || "");
            if (!meetingId)
                throw new errorHandler_1.AppError("meetingId is required", 400);
            if (!req.file)
                throw new errorHandler_1.AppError("file is required", 400);
            const recording = await uploadService_1.uploadService.uploadVideo(meetingId, req.file);
            res.status(201).json({ recording });
        }
        catch (error) {
            next(error);
        }
    },
    async uploadScreenshot(req, res, next) {
        try {
            const meetingId = String(req.body.meetingId || "");
            if (!meetingId)
                throw new errorHandler_1.AppError("meetingId is required", 400);
            if (!req.file)
                throw new errorHandler_1.AppError("file is required", 400);
            const screenshot = await uploadService_1.uploadService.uploadScreenshot(meetingId, req.file);
            res.status(201).json({ screenshot });
        }
        catch (error) {
            next(error);
        }
    }
};
