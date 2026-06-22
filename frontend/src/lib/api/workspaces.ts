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
  },

  async generateInviteLink(workspaceId: string): Promise<string> {
    const response = await api.post<{ inviteUrl: string }>(`/workspaces/${workspaceId}/invite-link`);
    return response.data.inviteUrl;
  },

  async inviteById(workspaceId: string, userId: string): Promise<void> {
    await api.post(`/workspaces/${workspaceId}/invite-by-id`, { userId });
  },

  async joinWorkspace(token: string): Promise<{ workspaceId: string; workspaceName: string }> {
    const response = await api.post<{ workspaceId: string; workspaceName: string }>(`/workspaces/join/${token}`);
    return response.data;
  },

  async searchUserById(userId: string): Promise<{ id: string; name: string; email: string; userId: string }> {
    const response = await api.get<{ id: string; name: string; email: string; userId: string }>(`/users/search`, {
      params: { userId }
    });
    return response.data;
  },

  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const response = await api.get<{ members: WorkspaceMember[] }>(`/workspaces/${workspaceId}/members`);
    return response.data.members;
  },

  async removeWorkspaceMember(workspaceId: string, userId: string): Promise<{ success: boolean }> {
    const response = await api.delete<{ success: boolean }>(`/workspaces/${workspaceId}/members/${userId}`);
    return response.data;
  },

  async leaveWorkspace(workspaceId: string): Promise<{ success: boolean }> {
    const response = await api.post<{ success: boolean }>(`/workspaces/${workspaceId}/leave`);
    return response.data;
  },

  async getActiveInviteLinks(workspaceId: string): Promise<any[]> {
    const response = await api.get<{ invites: any[] }>(`/workspaces/${workspaceId}/invite-links`);
    return response.data.invites;
  },

  async updateMemberRole(workspaceId: string, userId: string, role: string): Promise<WorkspaceMember> {
    const response = await api.patch<{ member: WorkspaceMember }>(`/workspaces/${workspaceId}/members/${userId}/role`, { role });
    return response.data.member;
  },

  async inviteByEmail(workspaceId: string, email: string): Promise<{ success: boolean }> {
    const response = await api.post<{ success: boolean }>(`/workspaces/${workspaceId}/invite-by-email`, { email });
    return response.data;
  }
};

