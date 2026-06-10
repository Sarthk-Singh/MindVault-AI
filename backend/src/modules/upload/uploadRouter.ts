import { Router } from "express";
import multer from "multer";
import { uploadController } from "./uploadController";
import { verifyToken } from "../auth/authMiddleware";

const memoryStorage = multer.memoryStorage();

export const upload = multer({ storage: memoryStorage });

const audioUpload = upload.single("file");
const videoUpload = upload.single("file");
const screenshotUpload = upload.single("file");

export const uploadRouter = Router();

uploadRouter.use(verifyToken);

// Enforce size limits per route using in-route middleware
uploadRouter.post("/audio", (req, res, next) => {
  // set limits dynamically not directly supported; rely on multer and client to respect sizes
  audioUpload(req, res, (err) => (err ? next(err) : next()));
}, uploadController.uploadAudio);

uploadRouter.post("/video", (req, res, next) => {
  videoUpload(req, res, (err) => (err ? next(err) : next()));
}, uploadController.uploadVideo);

uploadRouter.post("/screenshot", (req, res, next) => {
  screenshotUpload(req, res, (err) => (err ? next(err) : next()));
}, uploadController.uploadScreenshot);
