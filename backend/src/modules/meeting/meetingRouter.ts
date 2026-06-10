import { Router } from "express";
import { meetingController } from "./meetingController";
import { verifyToken } from "../auth/authMiddleware";

export const meetingRouter = Router();

meetingRouter.use(verifyToken);

meetingRouter.post("/", meetingController.createMeeting);
meetingRouter.get("/", meetingController.getMeetings);
meetingRouter.get(":id", meetingController.getMeetingById);
meetingRouter.patch(":id", meetingController.updateMeeting);
meetingRouter.delete(":id", meetingController.deleteMeeting);
