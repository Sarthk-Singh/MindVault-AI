import { api } from "../api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "WORKSPACE_MANAGER" | "MEETING_OWNER" | "TEAM_MEMBER";
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  async login(data: any): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  async register(data: any): Promise<User> {
    const response = await api.post<{ user: User }>("/auth/register", data);
    return response.data.user;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/refresh", { refreshToken });
    return response.data;
  },

  async logout(): Promise<{ success: boolean }> {
    const response = await api.post<{ success: boolean }>("/auth/logout");
    return response.data;
  }
};
