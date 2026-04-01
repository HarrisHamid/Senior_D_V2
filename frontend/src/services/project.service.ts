import api from "./api";

export interface CreateProjectRequest {
  courseId: string;
  name: string;
  description: string;
  advisors?: { name: string; email: string }[];
  sponsor: string;
  contacts?: { name: string; email: string }[];
  majors?: { major: string }[];
  year: number;
  internal?: boolean;
}

export interface ProjectData {
  _id: string;
  courseId: string;
  userId: string;
  name: string;
  description: string;
  advisors: { name: string; email: string }[];
  sponsor: string;
  contacts: { name: string; email: string }[];
  majors: { major: string }[];
  year: number;
  internal: boolean;
  assignedGroup: string | null;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectResponse {
  success: boolean;
  data: { project: ProjectData };
  message?: string;
}

export interface ProjectsResponse {
  success: boolean;
  data: {
    projects: ProjectData[];
    count: number;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
}

export const projectService = {
  async createProject(data: CreateProjectRequest): Promise<ProjectResponse> {
    const response = await api.post<ProjectResponse>("/projects", data);
    return response.data;
  },

  async getProjectById(id: string): Promise<ProjectResponse> {
    const response = await api.get<ProjectResponse>(`/projects/${id}`);
    return response.data;
  },

  async getProjectsByCourse(courseId: string): Promise<ProjectsResponse> {
    const response = await api.get<ProjectsResponse>(`/projects/course/${courseId}`);
    return response.data;
  },
};
