// Data shapes for auth related operations

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Student" | "Course Coordinator";
  verificationNeeded?: boolean;
  course?: string;
  groupId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: "Student" | "Course Coordinator";
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}


// Response shape for fetching current user
export interface UserResponse {
  success: boolean;
  data: {
    user: User;
  };
}

// Error response shape
export interface ApiError {
  success: false;
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}
