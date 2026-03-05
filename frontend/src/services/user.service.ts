import api from "./api";
import type { UserResponse } from "../types";

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword?: string;
}

export const userService = {
  async updateProfile(data: UpdateProfileRequest): Promise<UserResponse> {
    const response = await api.patch<UserResponse>("/users", data);
    return response.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await api.patch("/users/password", data);
  },
};
