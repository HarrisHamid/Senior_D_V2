import { Request } from "express";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "student" | "course coordinator";
  verificationNeeded: boolean;
  course?: string;
  groupId?: string;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
