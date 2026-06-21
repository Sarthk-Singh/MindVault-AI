import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { verifyToken } from "../auth/authMiddleware";
import { AppError } from "../../middleware/errorHandler";
import { workspaceController } from "./workspaceController";

const userRoleSchema = z.enum(["ADMIN", "WORKSPACE_MANAGER", "MEETING_OWNER", "TEAM_MEMBER"]);

const createWorkspaceSchema = z.object({
  name: z.string().min(1)
});

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).optional()
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: userRoleSchema
});

const validateBody =
  (schema: z.ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(new AppError("Invalid request body", 400));
      return;
    }

    req.body = result.data;
    next();
  };

const inviteByIdSchema = z.object({
  userId: z.string().min(1)
});

const updateRoleSchema = z.object({
  role: z.enum(["TEAM_MEMBER", "MEETING_OWNER", "WORKSPACE_MANAGER"])
});

export const workspaceRouter = Router();

workspaceRouter.use(verifyToken);
workspaceRouter.get("/", workspaceController.getWorkspaces);
workspaceRouter.get("/:id", workspaceController.getWorkspaceById);
workspaceRouter.post("/", validateBody(createWorkspaceSchema), workspaceController.createWorkspace);
workspaceRouter.patch("/:id", validateBody(updateWorkspaceSchema), workspaceController.updateWorkspace);
workspaceRouter.post("/:id/invite", validateBody(inviteMemberSchema), workspaceController.inviteMember);
workspaceRouter.post("/:id/invite-link", workspaceController.generateInviteLink);
workspaceRouter.post("/join/:token", workspaceController.joinWorkspace);
workspaceRouter.post("/:id/invite-by-id", validateBody(inviteByIdSchema), workspaceController.inviteById);

workspaceRouter.get("/:id/members", workspaceController.getMembers);
workspaceRouter.delete("/:id/members/:userId", workspaceController.removeMember);
workspaceRouter.post("/:id/leave", workspaceController.leaveWorkspace);
workspaceRouter.get("/:id/invite-links", workspaceController.getActiveInviteLinks);
workspaceRouter.patch("/:id/members/:userId/role", validateBody(updateRoleSchema), workspaceController.updateMemberRole);



