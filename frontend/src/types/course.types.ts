// Frontend types for course-related data
// TODO: Replace these with backend-generated types once API is finalized

export interface Course {
  _id: string;
  userId: string;
  name: string; // coordinator name
  email: string;
  program: string;
  courseNumber: string;
  courseSection: string;
  season: "Fall" | "Spring" | "Summer" | "Winter";
  year: number;
  minGroupSize: number;
  maxGroupSize: number;
  courseCode: string;
  lastGroupNumber: number;
  closed: boolean;
  createdAt: string;
  updatedAt: string;
}

// TODO: Replace with backend-generated type once Project model is created
export interface RequiredMajor {
  major: string;
  count: number;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  status: "Open" | "Closed" | "In Progress";
  courseId: string;
  requiredMajors: RequiredMajor[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  _id: string;
  name: string;
  email: string;
}

export interface Group {
  _id: string;
  groupNumber: number;
  courseId: string;
  groupMembers: GroupMember[];
  groupCode: string;
  isOpen: boolean;
  interestedProjects: string[]; // project IDs
  assignedProject: string | null;
  createdAt: string;
  updatedAt: string;
}
