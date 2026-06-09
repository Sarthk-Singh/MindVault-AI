"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const prisma_1 = require("../../config/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
const signToken = (payload, secret, expiresIn) => {
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
};
const createTokens = (payload) => {
    const accessToken = signToken(payload, env_1.env.JWT_SECRET, "15m");
    const refreshToken = signToken(payload, env_1.env.JWT_REFRESH_SECRET, "7d");
    return { accessToken, refreshToken };
};
exports.authService = {
    async register(name, email, password, role = "TEAM_MEMBER") {
        try {
            const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                throw new errorHandler_1.AppError("Email is already registered", 409);
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            const user = await prisma_1.prisma.user.create({
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
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                throw error;
            }
            throw new errorHandler_1.AppError("Failed to register user");
        }
    },
    async login(email, password) {
        try {
            const user = await prisma_1.prisma.user.findUnique({ where: { email } });
            if (!user) {
                throw new errorHandler_1.AppError("Invalid email or password", 401);
            }
            const passwordMatches = await bcryptjs_1.default.compare(password, user.password);
            if (!passwordMatches) {
                throw new errorHandler_1.AppError("Invalid email or password", 401);
            }
            return createTokens({
                id: user.id,
                email: user.email,
                role: user.role
            });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                throw error;
            }
            throw new errorHandler_1.AppError("Failed to login");
        }
    },
    async refresh(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
            return createTokens({
                id: decoded.id,
                email: decoded.email,
                role: decoded.role
            });
        }
        catch {
            throw new errorHandler_1.AppError("Invalid refresh token", 401);
        }
    },
    async logout() {
        try {
            return { success: true };
        }
        catch {
            throw new errorHandler_1.AppError("Failed to logout");
        }
    }
};
