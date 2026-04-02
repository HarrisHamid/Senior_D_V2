import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, LoginRequest, RegisterRequest } from "@/types";
import { authService } from "@/services/auth.service";
import {
  userService,
  type UpdateProfileRequest,
} from "@/services/user.service";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: UpdateProfileRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRole = (role: string): "student" | "course coordinator" => {
  const normalized = role.trim().toLowerCase();
  return normalized === "course coordinator" ? "course coordinator" : "student";
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data.user) {
        setUser({
          ...response.data.user,
          role: normalizeRole(response.data.user.role),
        });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    if (response.success && response.data.user) {
      setUser({
        ...response.data.user,
        role: normalizeRole(response.data.user.role),
      });
    }
  };

  const register = async (data: RegisterRequest) => {
    const response = await authService.register(data);
    if (response.success && response.data.user) {
      setUser({
        ...response.data.user,
        role: normalizeRole(response.data.user.role),
      });
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const updateUser = async (data: UpdateProfileRequest) => {
    const response = await userService.updateProfile(data);
    if (response.success && response.data.user) {
      setUser({
        ...response.data.user,
        role: normalizeRole(response.data.user.role),
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        refreshUser: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
