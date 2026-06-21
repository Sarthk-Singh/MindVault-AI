"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const authService_1 = require("./authService");
exports.authController = {
    async register(req, res, next) {
        try {
            const { name, email, password, role } = req.body;
            const user = await authService_1.authService.register(name, email, password, role);
            res.status(201).json({ user });
        }
        catch (error) {
            next(error);
        }
    },
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const tokens = await authService_1.authService.login(email, password);
            res.status(200).json(tokens);
        }
        catch (error) {
            next(error);
        }
    },
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const tokens = await authService_1.authService.refresh(refreshToken);
            res.status(200).json(tokens);
        }
        catch (error) {
            next(error);
        }
    },
    async logout(_req, res, next) {
        try {
            const result = await authService_1.authService.logout();
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async deletePreview(req, res, next) {
        try {
            const userId = req.user?.id;
            const preview = await authService_1.authService.getDeletePreview(userId);
            res.status(200).json(preview);
        }
        catch (error) {
            next(error);
        }
    },
    async deleteAccount(req, res, next) {
        try {
            const userId = req.user?.id;
            const { password, deleteStuff } = req.body;
            const result = await authService_1.authService.deleteAccount(userId, password, deleteStuff);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async updatePassword(req, res, next) {
        try {
            const userId = req.user?.id;
            const { currentPassword, newPassword } = req.body;
            const result = await authService_1.authService.updatePassword(userId, currentPassword, newPassword);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async getCurrentUser(req, res, next) {
        try {
            const userId = req.user?.id;
            const user = await authService_1.authService.getCurrentUser(userId);
            res.status(200).json(user);
        }
        catch (error) {
            next(error);
        }
    }
};
