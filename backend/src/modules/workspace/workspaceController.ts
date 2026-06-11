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
  }
};

