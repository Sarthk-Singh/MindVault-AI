"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceController = void 0;
const errorHandler_1 = require("../../middleware/errorHandler");
const workspaceService_1 = require("./workspaceService");
exports.workspaceController = {
    async createWorkspace(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError("Authentication is required", 401);
            }
            const { name } = req.body;
            const workspace = await workspaceService_1.workspaceService.createWorkspace(name, req.user.id);
            res.status(201).json({ workspace });
        }
        catch (error) {
            next(error);
        }
    },
    async updateWorkspace(req, res, next) {
        try {
            const { id } = req.params;
            const workspace = await workspaceService_1.workspaceService.updateWorkspace(String(id), req.body);
            res.status(200).json({ workspace });
        }
        catch (error) {
            next(error);
        }
    },
    async inviteMember(req, res, next) {
        try {
            const { id } = req.params;
            const { email, role } = req.body;
            const member = await workspaceService_1.workspaceService.inviteMember(String(id), email, role);
            res.status(201).json({ member });
        }
        catch (error) {
            next(error);
        }
    },
    async generateInviteLink(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError("Authentication is required", 401);
            }
            const { id } = req.params;
            const result = await workspaceService_1.workspaceService.generateInviteLink(String(id), req.user.id);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async joinWorkspace(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError("Authentication is required", 401);
            }
            const { token } = req.params;
            const result = await workspaceService_1.workspaceService.joinWorkspace(String(token), req.user.id);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async inviteById(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError("Authentication is required", 401);
            }
            const { id } = req.params;
            const { userId } = req.body;
            await workspaceService_1.workspaceService.inviteById(String(id), req.user.id, userId);
            res.status(200).json({ success: true });
        }
        catch (error) {
            next(error);
        }
    },
    async getWorkspaces(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError("Authentication is required", 401);
            }
            const workspaces = await workspaceService_1.workspaceService.listWorkspaces(req.user.id);
            res.status(200).json({ workspaces });
        }
        catch (error) {
            next(error);
        }
    },
    async getWorkspaceById(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError("Authentication is required", 401);
            }
            const { id } = req.params;
            const workspace = await workspaceService_1.workspaceService.getWorkspaceById(String(id), req.user.id);
            res.status(200).json({ workspace });
        }
        catch (error) {
            next(error);
        }
    },
    async getMembers(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError("Authentication is required", 401);
            }
            const { id } = req.params;
            const members = await workspaceService_1.workspaceService.getWorkspaceMembers(String(id), req.user.id);
            res.status(200).json({ members });
        }
        catch (error) {
            next(error);
        }
    },
    async removeMember(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError("Authentication is required", 401);
            }
            const { id, userId } = req.params;
            const result = await workspaceService_1.workspaceService.removeWorkspaceMember(String(id), req.user.id, String(userId));
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async leaveWorkspace(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError("Authentication is required", 401);
            }
            const { id } = req.params;
            const result = await workspaceService_1.workspaceService.leaveWorkspace(String(id), req.user.id);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    },
    async getActiveInviteLinks(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError("Authentication is required", 401);
            }
            const { id } = req.params;
            const invites = await workspaceService_1.workspaceService.getActiveInviteLinks(String(id), req.user.id);
            res.status(200).json({ invites });
        }
        catch (error) {
            next(error);
        }
    },
    async updateMemberRole(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError("Authentication is required", 401);
            }
            const { id, userId } = req.params;
            const { role } = req.body;
            const member = await workspaceService_1.workspaceService.updateMemberRole(String(id), req.user.id, String(userId), role);
            res.status(200).json({ member });
        }
        catch (error) {
            next(error);
        }
    },
    async inviteByEmail(req, res, next) {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError("Authentication is required", 401);
            }
            const { id } = req.params;
            const { email } = req.body;
            const result = await workspaceService_1.workspaceService.inviteByEmail(String(id), req.user.id, email);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
};
