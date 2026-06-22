import type { Request, Response, NextFunction } from "express";
import { authService } from "./authService";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role } = req.body;
      const user = await authService.register(name, email, password, role);

      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const tokens = await authService.login(email, password);

      res.status(200).json(tokens);
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refresh(refreshToken);

      res.status(200).json(tokens);
    } catch (error) {
      next(error);
    }
  },

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.logout();

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async deletePreview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const preview = await authService.getDeletePreview(userId);
      res.status(200).json(preview);
    } catch (error) {
      next(error);
    }
  },

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { password, deleteStuff } = req.body;
      const result = await authService.deleteAccount(userId, password, deleteStuff);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { currentPassword, newPassword } = req.body;
      const result = await authService.updatePassword(userId, currentPassword, newPassword);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const user = await authService.getCurrentUser(userId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};
