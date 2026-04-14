import api from "./api";

import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserResponse,
} from "../types";

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async getCurrentUser(): Promise<UserResponse> {
    const response = await api.get<UserResponse>("/auth/me");
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post(`/auth/reset-password/${token}`, { password });
  },
};
