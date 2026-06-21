"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../../config/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
const env_1 = require("../../config/env");
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
    },
    async generateInviteLink(workspaceId, createdById) {
        try {
            const isMember = await prisma_1.prisma.workspaceMember.findUnique({
                where: {
                    workspaceId_userId: {
                        workspaceId,
                        userId: createdById
                    }
                }
            });
            if (!isMember) {
                throw new errorHandler_1.AppError("Forbidden: You must be a member of the workspace to generate invite links", 403);
            }
            const token = crypto_1.default.randomUUID();
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiration
            const invite = await prisma_1.prisma.workspaceInvite.create({
                data: {
                    workspaceId,
                    token,
                    expiresAt,
                    createdById,
                    usedBy: []
                }
            });
            return { inviteUrl: `${env_1.env.FRONTEND_URL}/join/${invite.token}` };
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            throw new errorHandler_1.AppError("Failed to generate invite link", 500);
        }
    },
    async joinWorkspace(token, userId) {
        try {
            const invite = await prisma_1.prisma.workspaceInvite.findUnique({
                where: { token },
                include: { workspace: true }
            });
            if (!invite) {
                throw new errorHandler_1.AppError("Invalid or expired invite link", 404);
            }
            if (invite.expiresAt < new Date()) {
                throw new errorHandler_1.AppError("Invite link has expired", 400);
            }
            const existingMember = await prisma_1.prisma.workspaceMember.findUnique({
                where: {
                    workspaceId_userId: {
                        workspaceId: invite.workspaceId,
                        userId
                    }
                }
            });
            if (existingMember) {
                return {
                    success: true,
                    workspaceId: invite.workspaceId,
                    workspaceName: invite.workspace.name
                };
            }
            await prisma_1.prisma.workspaceMember.create({
                data: {
                    workspaceId: invite.workspaceId,
                    userId,
                    role: "TEAM_MEMBER"
                }
            });
            await prisma_1.prisma.workspaceInvite.update({
                where: { token },
                data: {
                    usedBy: {
                        push: userId
                    }
                }
            });
            return {
                success: true,
                workspaceId: invite.workspaceId,
                workspaceName: invite.workspace.name
            };
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            throw new errorHandler_1.AppError("Failed to join workspace", 500);
        }
    },
    async inviteById(workspaceId, currentUserId, targetUserCode) {
        try {
            const targetUser = await prisma_1.prisma.user.findUnique({
                where: { userId: targetUserCode }
            });
            if (!targetUser) {
                throw new errorHandler_1.AppError("User not found with the provided ID code", 404);
            }
            const isMember = await prisma_1.prisma.workspaceMember.findUnique({
                where: {
                    workspaceId_userId: {
                        workspaceId,
                        userId: currentUserId
                    }
                }
            });
            if (!isMember) {
                throw new errorHandler_1.AppError("Forbidden: You must be a member of this workspace to invite others", 403);
            }
            const existingMember = await prisma_1.prisma.workspaceMember.findUnique({
                where: {
                    workspaceId_userId: {
                        workspaceId,
                        userId: targetUser.id
                    }
                }
            });
            if (existingMember) {
                throw new errorHandler_1.AppError("User is already a member of this workspace", 400);
            }
            await prisma_1.prisma.workspaceMember.create({
                data: {
                    workspaceId,
                    userId: targetUser.id,
                    role: "TEAM_MEMBER"
                }
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            throw new errorHandler_1.AppError("Failed to invite user by ID", 500);
        }
    },
    async listWorkspaces(userId) {
        try {
            return await prisma_1.prisma.workspace.findMany({
                where: {
                    members: {
                        some: {
                            userId
                        }
                    }
                },
                include: {
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                    userId: true
                                }
                            }
                        }
                    },
                    meetings: true
                }
            });
        }
        catch {
            throw new errorHandler_1.AppError("Failed to list workspaces");
        }
    },
    async getWorkspaceById(id, userId) {
        try {
            const workspace = await prisma_1.prisma.workspace.findUnique({
                where: { id },
                include: {
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                    userId: true
                                }
                            }
                        }
                    },
                    meetings: {
                        orderBy: {
                            date: "desc"
                        }
                    }
                }
            });
            if (!workspace) {
                throw new errorHandler_1.AppError("Workspace not found", 404);
            }
            const isMember = workspace.members.some((member) => member.userId === userId);
            if (!isMember) {
                throw new errorHandler_1.AppError("Forbidden", 403);
            }
            return workspace;
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                throw error;
            }
            throw new errorHandler_1.AppError("Failed to fetch workspace");
        }
    },
    async getWorkspaceMembers(workspaceId, currentUserId) {
        try {
            const isMember = await prisma_1.prisma.workspaceMember.findUnique({
                where: {
                    workspaceId_userId: {
                        workspaceId,
                        userId: currentUserId
                    }
                }
            });
            if (!isMember) {
                throw new errorHandler_1.AppError("Forbidden: You must be a member of the workspace to view members", 403);
            }
            const members = await prisma_1.prisma.workspaceMember.findMany({
                where: { workspaceId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            userId: true
                        }
                    }
                },
                orderBy: { joinedAt: "asc" }
            });
            return members;
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            throw new errorHandler_1.AppError("Failed to fetch workspace members", 500);
        }
    },
    async removeWorkspaceMember(workspaceId, currentUserId, targetUserId) {
        try {
            const workspace = await prisma_1.prisma.workspace.findUnique({
                where: { id: workspaceId }
            });
            if (!workspace) {
                throw new errorHandler_1.AppError("Workspace not found", 404);
            }
            if (targetUserId === workspace.ownerId) {
                throw new errorHandler_1.AppError("Cannot remove the workspace owner", 400);
            }
            const currentUserMember = await prisma_1.prisma.workspaceMember.findUnique({
                where: {
                    workspaceId_userId: {
                        workspaceId,
                        userId: currentUserId
                    }
                }
            });
            if (!currentUserMember || (currentUserMember.role !== "ADMIN" && currentUserMember.role !== "WORKSPACE_MANAGER")) {
                throw new errorHandler_1.AppError("Forbidden: Only WORKSPACE_MANAGER or ADMIN can remove other members", 403);
            }
            const targetMember = await prisma_1.prisma.workspaceMember.findUnique({
                where: {
                    workspaceId_userId: {
                        workspaceId,
                        userId: targetUserId
                    }
                }
            });
            if (!targetMember) {
                throw new errorHandler_1.AppError("Member not found in this workspace", 404);
            }
            await prisma_1.prisma.workspaceMember.delete({
                where: {
                    workspaceId_userId: {
                        workspaceId,
                        userId: targetUserId
                    }
                }
            });
            return { success: true };
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            throw new errorHandler_1.AppError("Failed to remove workspace member", 500);
        }
    },
    async leaveWorkspace(workspaceId, currentUserId) {
        try {
            const workspace = await prisma_1.prisma.workspace.findUnique({
                where: { id: workspaceId }
            });
            if (!workspace) {
                throw new errorHandler_1.AppError("Workspace not found", 404);
            }
            if (currentUserId === workspace.ownerId) {
                throw new errorHandler_1.AppError("Transfer ownership before leaving", 400);
            }
            const isMember = await prisma_1.prisma.workspaceMember.findUnique({
                where: {
                    workspaceId_userId: {
                        workspaceId,
                        userId: currentUserId
                    }
                }
            });
            if (!isMember) {
                throw new errorHandler_1.AppError("You are not a member of this workspace", 400);
            }
            await prisma_1.prisma.workspaceMember.delete({
                where: {
                    workspaceId_userId: {
                        workspaceId,
                        userId: currentUserId
                    }
                }
            });
            return { success: true };
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            throw new errorHandler_1.AppError("Failed to leave workspace", 500);
        }
    },
    async getActiveInviteLinks(workspaceId, currentUserId) {
        try {
            const isMember = await prisma_1.prisma.workspaceMember.findUnique({
                where: {
                    workspaceId_userId: {
                        workspaceId,
                        userId: currentUserId
                    }
                }
            });
            if (!isMember) {
                throw new errorHandler_1.AppError("Forbidden: You must be a member of the workspace to view invite links", 403);
            }
            const activeInvites = await prisma_1.prisma.workspaceInvite.findMany({
                where: {
                    workspaceId,
                    expiresAt: {
                        gte: new Date()
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            });
            return activeInvites;
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            throw new errorHandler_1.AppError("Failed to fetch active invite links", 500);
        }
    },
    async updateMemberRole(workspaceId, currentUserId, targetUserId, newRole) {
        try {
            const workspace = await prisma_1.prisma.workspace.findUnique({
                where: { id: workspaceId }
            });
            if (!workspace) {
                throw new errorHandler_1.AppError("Workspace not found", 404);
            }
            if (targetUserId === workspace.ownerId) {
                throw new errorHandler_1.AppError("Cannot change the workspace owner's role", 400);
            }
            const currentUserMember = await prisma_1.prisma.workspaceMember.findUnique({
                where: {
                    workspaceId_userId: {
                        workspaceId,
                        userId: currentUserId
                    }
                }
            });
            if (!currentUserMember || (currentUserMember.role !== "ADMIN" && currentUserMember.role !== "WORKSPACE_MANAGER")) {
                throw new errorHandler_1.AppError("Forbidden: Only WORKSPACE_MANAGER or ADMIN can change member roles", 403);
            }
            const targetMember = await prisma_1.prisma.workspaceMember.findUnique({
                where: {
                    workspaceId_userId: {
                        workspaceId,
                        userId: targetUserId
                    }
                }
            });
            if (!targetMember) {
                throw new errorHandler_1.AppError("Member not found in this workspace", 404);
            }
            const updated = await prisma_1.prisma.workspaceMember.update({
                where: {
                    workspaceId_userId: {
                        workspaceId,
                        userId: targetUserId
                    }
                },
                data: {
                    role: newRole
                }
            });
            return updated;
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError)
                throw error;
            throw new errorHandler_1.AppError("Failed to update member role", 500);
        }
    }
};
