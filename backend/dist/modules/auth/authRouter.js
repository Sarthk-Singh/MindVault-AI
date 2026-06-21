"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const authController_1 = require("./authController");
const authMiddleware_1 = require("./authMiddleware");
const errorHandler_1 = require("../../middleware/errorHandler");
const userRoleSchema = zod_1.z.enum(["ADMIN", "WORKSPACE_MANAGER", "MEETING_OWNER", "TEAM_MEMBER"]);
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    role: userRoleSchema.optional()
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1)
});
const refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1)
});
const deleteAccountSchema = zod_1.z.object({
    password: zod_1.z.string().min(1),
    deleteStuff: zod_1.z.boolean()
});
const updatePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().optional(),
    newPassword: zod_1.z.string().min(8)
});
const validateBody = (schema) => (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        next(new errorHandler_1.AppError("Invalid request body", 400));
        return;
    }
    req.body = result.data;
    next();
};
const passport_1 = __importDefault(require("passport"));
const env_1 = require("../../config/env");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/register", validateBody(registerSchema), authController_1.authController.register);
exports.authRouter.post("/login", validateBody(loginSchema), authController_1.authController.login);
exports.authRouter.post("/refresh", validateBody(refreshSchema), authController_1.authController.refresh);
exports.authRouter.post("/logout", authMiddleware_1.verifyToken, authController_1.authController.logout);
exports.authRouter.get("/delete-preview", authMiddleware_1.verifyToken, authController_1.authController.deletePreview);
exports.authRouter.post("/delete-account", authMiddleware_1.verifyToken, validateBody(deleteAccountSchema), authController_1.authController.deleteAccount);
exports.authRouter.post("/update-password", authMiddleware_1.verifyToken, validateBody(updatePasswordSchema), authController_1.authController.updatePassword);
exports.authRouter.get("/me", authMiddleware_1.verifyToken, authController_1.authController.getCurrentUser);
exports.authRouter.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"], session: false }));
exports.authRouter.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/login", session: false }), (req, res) => {
    const user = req.user;
    res.redirect(`${env_1.env.FRONTEND_URL}/auth/callback?token=${user.accessToken}&refresh=${user.refreshToken}`);
});
