import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { authController } from "./authController";
import { verifyToken } from "./authMiddleware";
import { AppError } from "../../middleware/errorHandler";

const userRoleSchema = z.enum(["ADMIN", "WORKSPACE_MANAGER", "MEETING_OWNER", "TEAM_MEMBER"]);

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: userRoleSchema.optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

const validateBody =
  (schema: z.ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(new AppError("Invalid request body", 400));
      return;
    }

    req.body = result.data;
    next();
  };

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), authController.register);
authRouter.post("/login", validateBody(loginSchema), authController.login);
authRouter.post("/refresh", validateBody(refreshSchema), authController.refresh);
authRouter.post("/logout", verifyToken, authController.logout);
