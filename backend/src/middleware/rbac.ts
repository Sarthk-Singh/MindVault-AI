import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "./errorHandler";

export const checkWorkspaceAccess = async (req: Request, workspaceId: string) => {
  if (!req.user) {
    throw new AppError("Authentication token is required", 401);
  }

  if (req.user.role === "ADMIN") {
    return true;
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: req.user.id
    }
  });

  if (!membership) {
    throw new AppError("Forbidden", 403);
  }

  return true;
};

export const requireWorkspaceAccess = (workspaceIdResolver: (req: Request) => string | undefined) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const workspaceId = workspaceIdResolver(req);

      if (!workspaceId) {
        next(new AppError("workspaceId is required", 400));
        return;
      }

      await checkWorkspaceAccess(req, workspaceId);
      next();
    } catch (error) {
      next(error);
    }
  };
};
