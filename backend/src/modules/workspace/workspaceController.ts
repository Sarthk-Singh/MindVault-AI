import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler";
import { workspaceService } from "./workspaceService";

export const workspaceController = {
  async createWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication is required", 401);
      }

      const { name } = req.body;
      const workspace = await workspaceService.createWorkspace(name, req.user.id);

      res.status(201).json({ workspace });
    } catch (error) {
      next(error);
    }
  },

  async updateWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const workspace = await workspaceService.updateWorkspace(String(id), req.body);

      res.status(200).json({ workspace });
    } catch (error) {
      next(error);
    }
  },

  async inviteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { email, role } = req.body;
      const member = await workspaceService.inviteMember(String(id), email, role);

      res.status(201).json({ member });
    } catch (error) {
      next(error);
    }
  },

  async generateInviteLink(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication is required", 401);
      }
      const { id } = req.params;
      const result = await workspaceService.generateInviteLink(String(id), req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async joinWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication is required", 401);
      }
      const { token } = req.params;
      const result = await workspaceService.joinWorkspace(String(token), req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async inviteById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication is required", 401);
      }
      const { id } = req.params;
      const { userId } = req.body;
      await workspaceService.inviteById(String(id), req.user.id, userId);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  },


  async getWorkspaces(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication is required", 401);
      }

      const workspaces = await workspaceService.listWorkspaces(req.user.id);
      res.status(200).json({ workspaces });
    } catch (error) {
      next(error);
    }
  },

  async getWorkspaceById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication is required", 401);
      }

      const { id } = req.params;
      const workspace = await workspaceService.getWorkspaceById(String(id), req.user.id);
      res.status(200).json({ workspace });
    } catch (error) {
      next(error);
    }
  },

  async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication is required", 401);
      }
      const { id } = req.params;
      const members = await workspaceService.getWorkspaceMembers(String(id), req.user.id);
      res.status(200).json({ members });
    } catch (error) {
      next(error);
    }
  },

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication is required", 401);
      }
      const { id, userId } = req.params;
      const result = await workspaceService.removeWorkspaceMember(String(id), req.user.id, String(userId));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async leaveWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication is required", 401);
      }
      const { id } = req.params;
      const result = await workspaceService.leaveWorkspace(String(id), req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getActiveInviteLinks(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication is required", 401);
      }
      const { id } = req.params;
      const invites = await workspaceService.getActiveInviteLinks(String(id), req.user.id);
      res.status(200).json({ invites });
    } catch (error) {
      next(error);
    }
  },

  async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication is required", 401);
      }
      const { id, userId } = req.params;
      const { role } = req.body;
      const member = await workspaceService.updateMemberRole(String(id), req.user.id, String(userId), role);
      res.status(200).json({ member });
    } catch (error) {
      next(error);
    }
  },

  async inviteByEmail(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError("Authentication is required", 401);
      }
      const { id } = req.params;
      const { email } = req.body;
      const result = await workspaceService.inviteByEmail(String(id), req.user.id, email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};

