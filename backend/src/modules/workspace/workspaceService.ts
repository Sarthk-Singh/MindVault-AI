import { type Prisma, type UserRole } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";

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

