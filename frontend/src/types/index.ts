// Auth & User Types
export type UserRole = "student" | "course coordinator";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  school?: string;
  major?: string;
  verificationNeeded?: boolean;
  groupId?: string;
  course?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  school?: string;
  major: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface UserResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export interface Course {
  id: string;
  programName: string;
  courseNumber: string;
  section: string;
  semester: string;
  year: number;
  code: string;
  coordinatorId: string;
  isOpen: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  courseId?: string;
  advisors: Advisor[];
  sponsors: Sponsor[];
  requiredMajors: MajorRequirement[];
  status: "Open" | "Closed" | "Assigned";
  sponsorType: "Internal" | "External";
  attachedFiles?: File[];
  year: number;
  assignedGroupId?: string;
}

export interface Advisor {
  name: string;
  email: string;
}

export interface Sponsor {
  name: string;
  email: string;
}

export interface MajorRequirement {
  major: string;
  quantity: number;
}

export interface Group {
  id: string;
  groupNumber: string;
  code: string;
  courseId?: string;
  members: GroupMember[];
  interestedProjects: string[];
  status: "Open" | "Closed";
  assignedProjectId?: string;
}

export interface GroupMember {
  userId: string;
  name: string;
  email: string;
}

export interface Interest {
  projectId: string;
  groupId: string;
}
