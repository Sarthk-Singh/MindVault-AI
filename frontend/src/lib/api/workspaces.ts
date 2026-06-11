import { api } from "../api";
import { User } from "./auth";

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: "ADMIN" | "WORKSPACE_MANAGER" | "MEETING_OWNER" | "TEAM_MEMBER";
  joinedAt: string;
  user?: User;
}

export interface Meeting {
  id: string;
  title: string;
  workspaceId: string;
  createdById: string;
  date: string;
  status: "PENDING" | "PROCESSING" | "DONE" | "FAILED";
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  members?: WorkspaceMember[];
  meetings?: Meeting[];
}

export const workspacesApi = {
  async listWorkspaces(): Promise<Workspace[]> {
    const response = await api.get<{ workspaces: Workspace[] }>("/workspaces");
    return response.data.workspaces;
  },

  async getWorkspace(id: string): Promise<Workspace> {
    const response = await api.get<{ workspace: Workspace }>(`/workspaces/${id}`);
    return response.data.workspace;
  },

  async createWorkspace(name: string): Promise<Workspace> {
    const response = await api.post<{ workspace: Workspace }>("/workspaces", { name });
    return response.data.workspace;
  },

  async inviteMember(workspaceId: string, email: string, role: string): Promise<WorkspaceMember> {
    const response = await api.post<{ member: WorkspaceMember }>(`/workspaces/${workspaceId}/invite`, {
      email,
      role
    });
    return response.data.member;
  }
};
