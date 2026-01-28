import { createContext } from "react";
import type { User, LoginRequest, RegisterRequest } from "../types/auth.types";

// contexts is React's built-in way to share data across
// many components without passing props manually at every level.

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
