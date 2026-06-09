"use strict";
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
const validateBody = (schema) => (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        next(new errorHandler_1.AppError("Invalid request body", 400));
        return;
    }
    req.body = result.data;
    next();
};
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/register", validateBody(registerSchema), authController_1.authController.register);
exports.authRouter.post("/login", validateBody(loginSchema), authController_1.authController.login);
exports.authRouter.post("/refresh", validateBody(refreshSchema), authController_1.authController.refresh);
exports.authRouter.post("/logout", authMiddleware_1.verifyToken, authController_1.authController.logout);
