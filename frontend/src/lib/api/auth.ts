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
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
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
  }
};
