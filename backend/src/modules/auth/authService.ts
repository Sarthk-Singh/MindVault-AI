import bcrypt from "bcryptjs";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { type UserRole } from "@prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import { emailService } from "../../services/emailService";

export type JwtPayload = {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  isGoogleUser?: boolean;
  userId?: string;
};

const signToken = (
  payload: JwtPayload,
  secret: Secret,
  expiresIn: SignOptions["expiresIn"]
) => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const createTokens = (payload: JwtPayload) => {
  const accessToken = signToken(payload, env.JWT_SECRET, "15m");
  const refreshToken = signToken(payload, env.JWT_REFRESH_SECRET, "7d");

  return { accessToken, refreshToken };
};

const DB_TIMEOUT_MS = 10_000;

const runDbOperation = <T>(operation: Promise<T>, operationName: string) => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new AppError(`Database request timed out while ${operationName}`, 503));
    }, DB_TIMEOUT_MS);

    operation
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
};

export const authService = {
  async register(name: string, email: string, password: string, role: UserRole = "TEAM_MEMBER") {
    try {
      const existingUser = await runDbOperation(
        prisma.user.findUnique({ where: { email } }),
        "checking for an existing user"
      );

      if (existingUser) {
        throw new AppError("Email is already registered", 409);
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const userId = 'MV-' + Math.floor(1000 + Math.random() * 9000).toString();

      const user = await runDbOperation(
        prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role,
            userId
          },
          select: {
            id: true,
            userId: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
          }
        }),
        "creating the user account"
      );

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      const isDatabaseError =
        error instanceof Error &&
        /prisma|database|timed out|connect|ECONN|ENOTFOUND|ETIMEDOUT/i.test(error.message);

      throw new AppError(
        isDatabaseError ? "Database is currently unavailable. Please try again later." : "Failed to register user",
        isDatabaseError ? 503 : 500
      );
    }
  },

  async login(email: string, password: string) {
    try {
      const user = await runDbOperation(
        prisma.user.findUnique({ where: { email } }),
        "looking up the user account"
      );

      if (!user) {
        throw new AppError("Invalid email or password", 401);
      }

      const passwordMatches = await bcrypt.compare(password, user.password);

      if (!passwordMatches) {
        throw new AppError("Invalid email or password", 401);
      }

      const tokens = createTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isGoogleUser: user.isGoogleUser,
        userId: user.userId
      });

      return {
        ...tokens,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isGoogleUser: user.isGoogleUser,
          userId: user.userId
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      const isDatabaseError =
        error instanceof Error &&
        /prisma|database|timed out|connect|ECONN|ENOTFOUND|ETIMEDOUT/i.test(error.message);

      throw new AppError(
        isDatabaseError ? "Database is currently unavailable. Please try again later." : "Failed to login",
        isDatabaseError ? 503 : 500
      );
    }
  },

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;

      return createTokens({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name,
        isGoogleUser: decoded.isGoogleUser,
        userId: decoded.userId
      });
    } catch {
      throw new AppError("Invalid refresh token", 401);
    }
  },

  async logout() {
    try {
      return { success: true };
    } catch {
      throw new AppError("Failed to logout");
    }
  },

  async getDeletePreview(userId: string) {
    try {
      const workspaces = await runDbOperation(
        prisma.workspace.findMany({
          where: { ownerId: userId },
          include: {
            _count: {
              select: { meetings: true, members: true }
            }
          }
        }),
        "fetching owned workspaces"
      );

      const meetings = await runDbOperation(
        prisma.meeting.findMany({
          where: {
            createdById: userId,
            workspace: {
              ownerId: { not: userId }
            }
          },
          include: {
            workspace: {
              select: { name: true }
            }
          }
        }),
        "fetching created meetings"
      );

      return {
        workspaces: workspaces.map((w) => ({
          id: w.id,
          name: w.name,
          meetingsCount: w._count.meetings,
          membersCount: w._count.members
        })),
        meetings: meetings.map((m) => ({
          id: m.id,
          title: m.title,
          workspaceName: m.workspace.name
        }))
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to fetch account deletion preview", 500);
    }
  },

  async deleteAccount(userId: string, password: string | undefined, deleteStuff: boolean) {
    try {
      const user = await runDbOperation(
        prisma.user.findUnique({ where: { id: userId } }),
        "looking up the user account for deletion"
      );

      if (!user) {
        throw new AppError("User not found", 404);
      }

      if (!user.isGoogleUser) {
        if (!password) {
          throw new AppError("Password is required to delete account", 400);
        }
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
          throw new AppError("Incorrect password", 400);
        }
      }

      if (deleteStuff) {
        // Complete cascade deletion
        await runDbOperation(
          prisma.user.delete({ where: { id: userId } }),
          "deleting user account and cascading content"
        );
      } else {
        // Transfer ownership of owned workspaces
        const ownedWorkspaces = await runDbOperation(
          prisma.workspace.findMany({
            where: { ownerId: userId },
            include: {
              members: {
                where: { userId: { not: userId } }
              }
            }
          }),
          "fetching owned workspaces for transfer"
        );

        for (const workspace of ownedWorkspaces) {
          if (workspace.members.length > 0) {
            // Find a successor (prefer ADMIN, then WORKSPACE_MANAGER, then others)
            const rolePriority = { ADMIN: 1, WORKSPACE_MANAGER: 2, MEETING_OWNER: 3, TEAM_MEMBER: 4 };
            const sortedMembers = [...workspace.members].sort((a, b) => {
              const priorityA = rolePriority[a.role] || 99;
              const priorityB = rolePriority[b.role] || 99;
              return priorityA - priorityB;
            });

            const successor = sortedMembers[0];

            // Update workspace owner
            await runDbOperation(
              prisma.workspace.update({
                where: { id: workspace.id },
                data: { ownerId: successor.userId }
              }),
              `transferring workspace ${workspace.name} ownership`
            );

            // Promote successor to ADMIN role inside workspace members
            await runDbOperation(
              prisma.workspaceMember.update({
                where: {
                  workspaceId_userId: {
                    workspaceId: workspace.id,
                    userId: successor.userId
                  }
                },
                data: { role: "ADMIN" }
              }),
              `promoting workspace member ${successor.userId} to ADMIN`
            );
          } else {
            // No other members, delete the workspace
            await runDbOperation(
              prisma.workspace.delete({ where: { id: workspace.id } }),
              `deleting workspace ${workspace.name} as it has no other members`
            );
          }
        }

        // Reassign meetings created by the user in remaining workspaces
        const createdMeetings = await runDbOperation(
          prisma.meeting.findMany({
            where: { createdById: userId }
          }),
          "fetching created meetings for reassignment"
        );

        for (const meeting of createdMeetings) {
          const workspace = await runDbOperation(
            prisma.workspace.findUnique({
              where: { id: meeting.workspaceId }
            }),
            "looking up meeting workspace"
          );

          if (workspace) {
            await runDbOperation(
              prisma.meeting.update({
                where: { id: meeting.id },
                data: { createdById: workspace.ownerId }
              }),
              `reassigning meeting ${meeting.title} creator`
            );
          }
        }

        // Finally delete the user
        await runDbOperation(
          prisma.user.delete({ where: { id: userId } }),
          "deleting user account"
        );
      }

      return { success: true };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to delete user account", 500);
    }
  },

  async updatePassword(userId: string, currentPassword: string | undefined, newPassword: string) {
    try {
      const user = await runDbOperation(
        prisma.user.findUnique({ where: { id: userId } }),
        "looking up user account for password update"
      );

      if (!user) {
        throw new AppError("User not found", 404);
      }

      if (!user.isGoogleUser) {
        if (!currentPassword) {
          throw new AppError("Current password is required", 400);
        }
        const passwordMatches = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatches) {
          throw new AppError("Incorrect current password", 400);
        }
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      const updatedUser = await runDbOperation(
        prisma.user.update({
          where: { id: userId },
          data: {
            password: hashedPassword,
            isGoogleUser: false
          }
        }),
        "updating user password"
      );

      const tokens = createTokens({
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        name: updatedUser.name,
        isGoogleUser: false,
        userId: updatedUser.userId
      });

      return { success: true, ...tokens };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to update password", 500);
    }
  },

  async getCurrentUser(userId: string) {
    try {
      const user = await runDbOperation(
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            userId: true,
            name: true,
            email: true,
            role: true,
            isGoogleUser: true,
            createdAt: true
          }
        }),
        "fetching currently authenticated user"
      );

      if (!user) {
        throw new AppError("User not found", 404);
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to fetch current user profile", 500);
    }
  },

  async forgotPassword(email: string) {
    try {
      const user = await runDbOperation(
        prisma.user.findUnique({ where: { email } }),
        "looking up user by email for password reset"
      );

      if (!user) {
        // Return success to prevent email enumeration
        return { success: true };
      }

      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await runDbOperation(
        prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            token,
            expiresAt
          }
        }),
        "creating password reset token"
      );

      const resetUrl = `${env.FRONTEND_URL}/reset-password/${token}`;
      await emailService.sendPasswordResetEmail(email, resetUrl);

      return { success: true };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to request password reset", 500);
    }
  },

  async resetPassword(token: string, newPassword: string) {
    try {
      const resetToken = await runDbOperation(
        prisma.passwordResetToken.findUnique({
          where: { token },
          include: { user: true }
        }),
        "looking up password reset token"
      );

      if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
        throw new AppError("Invalid or expired password reset token", 400);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await runDbOperation(
        prisma.$transaction([
          prisma.user.update({
            where: { id: resetToken.userId },
            data: {
              password: hashedPassword,
              isGoogleUser: false
            }
          }),
          prisma.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { used: true }
          })
        ]),
        "resetting user password"
      );

      return { success: true };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to reset password", 500);
    }
  }
};
