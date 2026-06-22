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

const deleteAccountSchema = z.object({
  password: z.string().optional(),
  deleteStuff: z.boolean()
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8)
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8)
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

import passport from "passport";
import { env } from "../../config/env";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), authController.register);
authRouter.post("/login", validateBody(loginSchema), authController.login);
authRouter.post("/refresh", validateBody(refreshSchema), authController.refresh);
authRouter.post("/logout", verifyToken, authController.logout);
authRouter.get("/delete-preview", verifyToken, authController.deletePreview);
authRouter.post("/delete-account", verifyToken, validateBody(deleteAccountSchema), authController.deleteAccount);
authRouter.post("/update-password", verifyToken, validateBody(updatePasswordSchema), authController.updatePassword);
authRouter.get("/me", verifyToken, authController.getCurrentUser);
authRouter.post("/forgot-password", validateBody(forgotPasswordSchema), authController.forgotPassword);
authRouter.post("/reset-password", validateBody(resetPasswordSchema), authController.resetPassword);

authRouter.get(
  "/google",
  (req, res, next) => {
    const state = req.query.state as string;
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
      state: state
    })(req, res, next);
  }
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req, res) => {
    const user = req.user as any;
    const state = req.query.state as string;
    const redirectParam = state ? `&redirect=${encodeURIComponent(state)}` : "";
    res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${user.accessToken}&refresh=${user.refreshToken}${redirectParam}`);
  }
);
