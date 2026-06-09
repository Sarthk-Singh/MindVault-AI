import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { type UserRole } from "@prisma/client";
import { env } from "../../config/env";
import { AppError } from "../../middleware/errorHandler";
import "../../types/express";

type JwtPayload = {
  id: string;
  email: string;
  role: UserRole;
};

export const verifyToken = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

    if (!token) {
      throw new AppError("Authentication token is required", 401);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError("Invalid authentication token", 401));
  }
};
