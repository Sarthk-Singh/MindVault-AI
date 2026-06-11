"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const authMiddleware_1 = require("../auth/authMiddleware");
const errorHandler_1 = require("../../middleware/errorHandler");
const workspaceController_1 = require("./workspaceController");
const userRoleSchema = zod_1.z.enum(["ADMIN", "WORKSPACE_MANAGER", "MEETING_OWNER", "TEAM_MEMBER"]);
const createWorkspaceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1)
});
const updateWorkspaceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional()
});
const inviteMemberSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    role: userRoleSchema
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
exports.workspaceRouter = (0, express_1.Router)();
exports.workspaceRouter.use(authMiddleware_1.verifyToken);
exports.workspaceRouter.get("/", workspaceController_1.workspaceController.getWorkspaces);
exports.workspaceRouter.get("/:id", workspaceController_1.workspaceController.getWorkspaceById);
exports.workspaceRouter.post("/", validateBody(createWorkspaceSchema), workspaceController_1.workspaceController.createWorkspace);
exports.workspaceRouter.patch("/:id", validateBody(updateWorkspaceSchema), workspaceController_1.workspaceController.updateWorkspace);
exports.workspaceRouter.post("/:id/invite", validateBody(inviteMemberSchema), workspaceController_1.workspaceController.inviteMember);
