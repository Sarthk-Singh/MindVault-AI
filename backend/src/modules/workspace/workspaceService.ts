import { type Prisma, type UserRole } from "@prisma/client";
import crypto from "crypto";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import { env } from "../../config/env";

export const workspaceService = {
  async createWorkspace(name: string, ownerId: string) {
    try {
      return await prisma.workspace.create({
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
    } catch {
      throw new AppError("Failed to create workspace");
    }
  },

  async updateWorkspace(id: string, data: Prisma.WorkspaceUpdateInput) {
    try {
      return await prisma.workspace.update({
        where: { id },
        data
      });
    } catch {
      throw new AppError("Failed to update workspace");
    }
  },

  async inviteMember(workspaceId: string, email: string, role: UserRole) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      return await prisma.workspaceMember.create({
        data: {
          workspaceId,
          userId: user.id,
          role
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Failed to invite workspace member");
    }
  },

  async generateInviteLink(workspaceId: string, createdById: string) {
    try {
      const isMember = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: createdById
          }
        }
      });

      if (!isMember) {
        throw new AppError("Forbidden: You must be a member of the workspace to generate invite links", 403);
      }

      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiration

      const invite = await prisma.workspaceInvite.create({
        data: {
          workspaceId,
          token,
          expiresAt,
          createdById,
          usedBy: []
        }
      });

      return { inviteUrl: `${env.FRONTEND_URL}/join/${invite.token}` };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to generate invite link", 500);
    }
  },

  async joinWorkspace(token: string, userId: string) {
    try {
      const invite = await prisma.workspaceInvite.findUnique({
        where: { token },
        include: { workspace: true }
      });

      if (!invite) {
        throw new AppError("Invalid or expired invite link", 404);
      }

      if (invite.expiresAt < new Date()) {
        throw new AppError("Invite link has expired", 400);
      }

      const existingMember = await prisma.workspaceMember.findUnique({
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

      await prisma.workspaceMember.create({
        data: {
          workspaceId: invite.workspaceId,
          userId,
          role: "TEAM_MEMBER"
        }
      });

      await prisma.workspaceInvite.update({
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
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to join workspace", 500);
    }
  },

  async inviteById(workspaceId: string, currentUserId: string, targetUserCode: string) {
    try {
      const targetUser = await prisma.user.findUnique({
        where: { userId: targetUserCode }
      });

      if (!targetUser) {
        throw new AppError("User not found with the provided ID code", 404);
      }

      const isMember = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: currentUserId
          }
        }
      });

      if (!isMember) {
        throw new AppError("Forbidden: You must be a member of this workspace to invite others", 403);
      }

      const existingMember = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: targetUser.id
          }
        }
      });

      if (existingMember) {
        throw new AppError("User is already a member of this workspace", 400);
      }

      await prisma.workspaceMember.create({
        data: {
          workspaceId,
          userId: targetUser.id,
          role: "TEAM_MEMBER"
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to invite user by ID", 500);
    }
  },

  async listWorkspaces(userId: string) {
    try {
      return await prisma.workspace.findMany({
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
                  role: true
                }
              }
            }
          },
          meetings: true
        }
      });
    } catch {
      throw new AppError("Failed to list workspaces");
    }
  },

  async getWorkspaceById(id: string, userId: string) {
    try {
      const workspace = await prisma.workspace.findUnique({
        where: { id },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true
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
        throw new AppError("Workspace not found", 404);
      }

      const isMember = workspace.members.some((member) => member.userId === userId);
      if (!isMember) {
        throw new AppError("Forbidden", 403);
      }

      return workspace;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to fetch workspace");
    }
  }
};


