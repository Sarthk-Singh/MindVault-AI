"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const prisma_1 = require("../../config/prisma");
const errorHandler_1 = require("../../middleware/errorHandler");
exports.userController = {
    async searchUserById(req, res, next) {
        try {
            const { userId } = req.query;
            if (!userId || typeof userId !== "string") {
                throw new errorHandler_1.AppError("userId query parameter is required", 400);
            }
            const user = await prisma_1.prisma.user.findUnique({
                where: { userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    userId: true
                }
            });
            if (!user) {
                throw new errorHandler_1.AppError("User not found with the provided ID code", 404);
            }
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    }
};
