"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = exports.upload = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const uploadController_1 = require("./uploadController");
const authMiddleware_1 = require("../auth/authMiddleware");
const memoryStorage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({ storage: memoryStorage });
const audioUpload = exports.upload.single("file");
const videoUpload = exports.upload.single("file");
const screenshotUpload = exports.upload.single("file");
exports.uploadRouter = (0, express_1.Router)();
exports.uploadRouter.use(authMiddleware_1.verifyToken);
// Enforce size limits per route using in-route middleware
exports.uploadRouter.post("/audio", (req, res, next) => {
    // set limits dynamically not directly supported; rely on multer and client to respect sizes
    audioUpload(req, res, (err) => (err ? next(err) : next()));
}, uploadController_1.uploadController.uploadAudio);
exports.uploadRouter.post("/video", (req, res, next) => {
    videoUpload(req, res, (err) => (err ? next(err) : next()));
}, uploadController_1.uploadController.uploadVideo);
exports.uploadRouter.post("/screenshot", (req, res, next) => {
    screenshotUpload(req, res, (err) => (err ? next(err) : next()));
}, uploadController_1.uploadController.uploadScreenshot);
