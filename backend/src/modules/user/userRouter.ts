import { Router } from "express";
import { verifyToken } from "../auth/authMiddleware";
import { userController } from "./userController";

export const userRouter = Router();

userRouter.use(verifyToken);
userRouter.get("/search", userController.searchUserById);
