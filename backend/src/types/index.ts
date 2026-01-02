import { Request } from 'express';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'Student' | 'Course Coordinator';
  verificationNeeded: boolean;
  course?: string;
  groupId?: string;
}

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
