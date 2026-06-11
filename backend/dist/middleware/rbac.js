"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireWorkspaceAccess = exports.checkWorkspaceAccess = void 0;
const prisma_1 = require("../config/prisma");
const errorHandler_1 = require("./errorHandler");
const checkWorkspaceAccess = async (req, workspaceId) => {
    if (!req.user) {
        throw new errorHandler_1.AppError("Authentication token is required", 401);
    }
    if (req.user.role === "ADMIN") {
        return true;
    }
    const membership = await prisma_1.prisma.workspaceMember.findFirst({
        where: {
            workspaceId,
            userId: req.user.id
        }
    });
    if (!membership) {
        throw new errorHandler_1.AppError("Forbidden", 403);
    }
    return true;
};
exports.checkWorkspaceAccess = checkWorkspaceAccess;
const requireWorkspaceAccess = (workspaceIdResolver) => {
    return async (req, _res, next) => {
        try {
            const workspaceId = workspaceIdResolver(req);
            if (!workspaceId) {
                next(new errorHandler_1.AppError("workspaceId is required", 400));
                return;
            }
            await (0, exports.checkWorkspaceAccess)(req, workspaceId);
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireWorkspaceAccess = requireWorkspaceAccess;
