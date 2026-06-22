import { api } from "../api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "WORKSPACE_MANAGER" | "MEETING_OWNER" | "TEAM_MEMBER";
  createdAt: string;
  userId?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: User;
}

export const authApi = {
  async login(data: any): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", data);
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    if (user && user.name) {
      localStorage.setItem("userName", user.name);
    }
    return response.data;
  },

  async register(data: any): Promise<AuthResponse> {
    await api.post<{ user: User }>("/auth/register", data);
    const tokens = await authApi.login({
      email: data.email,
      password: data.password
    });
    return tokens;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/refresh", { refreshToken });
    return response.data;
  },

  async logout(): Promise<{ success: boolean }> {
    const response = await api.post<{ success: boolean }>("/auth/logout");
    return response.data;
  },

  async getDeletePreview(): Promise<{ workspaces: any[]; meetings: any[] }> {
    const response = await api.get<{ workspaces: any[]; meetings: any[] }>("/auth/delete-preview");
    return response.data;
  },

  async deleteAccount(data: { password?: string; deleteStuff: boolean }): Promise<{ success: boolean }> {
    const response = await api.post<{ success: boolean }>("/auth/delete-account", data);
    return response.data;
  },

  async updatePassword(data: { currentPassword?: string; newPassword: string }): Promise<{ success: boolean }> {
    const response = await api.post<{ success: boolean }>("/auth/update-password", data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    const response = await api.post<{ success: boolean }>("/auth/forgot-password", { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    const response = await api.post<{ success: boolean }>("/auth/reset-password", { token, newPassword });
    return response.data;
  }
};
