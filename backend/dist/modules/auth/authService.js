"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.createTokens = void 0;
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
exports.createTokens = createTokens;
const DB_TIMEOUT_MS = 10_000;
const runDbOperation = (operation, operationName) => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new errorHandler_1.AppError(`Database request timed out while ${operationName}`, 503));
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
exports.authService = {
    async register(name, email, password, role = "TEAM_MEMBER") {
        try {
            const existingUser = await runDbOperation(prisma_1.prisma.user.findUnique({ where: { email } }), "checking for an existing user");
            if (existingUser) {
                throw new errorHandler_1.AppError("Email is already registered", 409);
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            const user = await runDbOperation(prisma_1.prisma.user.create({
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
            }), "creating the user account");
            return user;
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                throw error;
            }
            const isDatabaseError = error instanceof Error &&
                /prisma|database|timed out|connect|ECONN|ENOTFOUND|ETIMEDOUT/i.test(error.message);
            throw new errorHandler_1.AppError(isDatabaseError ? "Database is currently unavailable. Please try again later." : "Failed to register user", isDatabaseError ? 503 : 500);
        }
    },
    async login(email, password) {
        try {
            const user = await runDbOperation(prisma_1.prisma.user.findUnique({ where: { email } }), "looking up the user account");
            if (!user) {
                throw new errorHandler_1.AppError("Invalid email or password", 401);
            }
            const passwordMatches = await bcryptjs_1.default.compare(password, user.password);
            if (!passwordMatches) {
                throw new errorHandler_1.AppError("Invalid email or password", 401);
            }
            const tokens = (0, exports.createTokens)({
                id: user.id,
                email: user.email,
                role: user.role
            });
            return {
                ...tokens,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            };
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                throw error;
            }
            const isDatabaseError = error instanceof Error &&
                /prisma|database|timed out|connect|ECONN|ENOTFOUND|ETIMEDOUT/i.test(error.message);
            throw new errorHandler_1.AppError(isDatabaseError ? "Database is currently unavailable. Please try again later." : "Failed to login", isDatabaseError ? 503 : 500);
        }
    },
    async refresh(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
            return (0, exports.createTokens)({
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
