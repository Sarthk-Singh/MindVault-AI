import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";

export const userController = {
  async searchUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.query;

      if (!userId || typeof userId !== "string") {
        throw new AppError("userId query parameter is required", 400);
      }

      const user = await prisma.user.findUnique({
        where: { userId },
        select: {
          id: true,
          name: true,
          email: true,
          userId: true
        }
      });

      if (!user) {
        throw new AppError("User not found with the provided ID code", 404);
      }

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
};
