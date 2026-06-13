"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const authMiddleware_1 = require("../auth/authMiddleware");
const errorHandler_1 = require("../../middleware/errorHandler");
const prisma_1 = require("../../config/prisma");
const searchService_1 = require("../../services/searchService");
require("../../types/express");
const searchSchema = zod_1.z.object({
    query: zod_1.z.string().min(1),
    workspaceId: zod_1.z.string().min(1)
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
exports.searchRouter = (0, express_1.Router)();
exports.searchRouter.post("/", authMiddleware_1.verifyToken, validateBody(searchSchema), async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError("Authentication is required", 401);
        }
        const { query, workspaceId } = req.body;
        const member = await prisma_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId: req.user.id
                }
            }
        });
        if (!member) {
            throw new errorHandler_1.AppError("Forbidden: You are not a member of this workspace", 403);
        }
        const results = await (0, searchService_1.semanticSearch)(query, workspaceId);
        res.status(200).json({ results });
    }
    catch (error) {
        next(error);
    }
});
