"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceService = void 0;
const prisma_1 = require("../../config/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
exports.workspaceService = {
    async createWorkspace(name, ownerId) {
        try {
            return await prisma_1.prisma.workspace.create({
                data: {
                    name,
                    ownerId,
                    members: {
                        create: {
                            userId: ownerId,
                            role: "WORKSPACE_MANAGER"
                        }
                    }
                }
            });
        }
        catch {
            throw new errorHandler_1.AppError("Failed to create workspace");
        }
    },
    async updateWorkspace(id, data) {
        try {
            return await prisma_1.prisma.workspace.update({
                where: { id },
                data
            });
        }
        catch {
            throw new errorHandler_1.AppError("Failed to update workspace");
        }
    },
    async inviteMember(workspaceId, email, role) {
        try {
            const user = await prisma_1.prisma.user.findUnique({ where: { email } });
            if (!user) {
                throw new errorHandler_1.AppError("User not found", 404);
            }
            return await prisma_1.prisma.workspaceMember.create({
                data: {
                    workspaceId,
                    userId: user.id,
                    role
                }
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                throw error;
            }
            throw new errorHandler_1.AppError("Failed to invite workspace member");
        }
    }
};
