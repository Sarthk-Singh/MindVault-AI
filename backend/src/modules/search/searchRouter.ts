import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { verifyToken } from "../auth/authMiddleware";
import { AppError } from "../../middleware/errorHandler";
import { prisma } from "../../config/prisma";
import { semanticSearch } from "../../services/searchService";
import "../../types/express";

const searchSchema = z.object({
  query: z.string().min(1),
  workspaceId: z.string().min(1)
});

const validateBody =
  (schema: z.ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(new AppError("Invalid request body", 400));
      return;
    }

    req.body = result.data;
    next();
  };

export const searchRouter = Router();

searchRouter.post(
  "/",
  verifyToken,
  validateBody(searchSchema),
  async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication is required", 401);
      }

      const { query, workspaceId } = req.body;

      const member = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: req.user.id
          }
        }
      });

      if (!member) {
        throw new AppError("Forbidden: You are not a member of this workspace", 403);
      }

      const results = await semanticSearch(query, workspaceId);

      res.status(200).json({ results });
    } catch (error) {
      next(error);
    }
  }
);
