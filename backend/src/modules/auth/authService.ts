import bcrypt from "bcryptjs";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { type UserRole } from "@prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";

type JwtPayload = {
  id: string;
  email: string;
  role: UserRole;
};

const signToken = (
  payload: JwtPayload,
  secret: Secret,
  expiresIn: SignOptions["expiresIn"]
) => {
  return jwt.sign(payload, secret, { expiresIn });
};

const createTokens = (payload: JwtPayload) => {
  const accessToken = signToken(payload, env.JWT_SECRET, "15m");
  const refreshToken = signToken(payload, env.JWT_REFRESH_SECRET, "7d");

  return { accessToken, refreshToken };
};

export const authService = {
  async register(name: string, email: string, password: string, role: UserRole = "TEAM_MEMBER") {
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        throw new AppError("Email is already registered", 409);
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Failed to register user");
    }
  },

  async login(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new AppError("Invalid email or password", 401);
      }

      const passwordMatches = await bcrypt.compare(password, user.password);

      if (!passwordMatches) {
        throw new AppError("Invalid email or password", 401);
      }

      return createTokens({
        id: user.id,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Failed to login");
    }
  },

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;

      return createTokens({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
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
  }
};
