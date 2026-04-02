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

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  advisors?: { name: string; email: string }[];
  sponsor?: string;
  contacts?: { name: string; email: string }[];
  majors?: { major: string }[];
  year?: number;
  internal?: boolean;
  isOpen?: boolean;
}

export interface GetProjectsQuery {
  search?: string;
  major?: string | string[];
  status?: "open" | "closed";
  project_type?: "internal" | "external";
  year?: number;
  group?: boolean;
  page?: number;
  limit?: number;
}

export interface AssignGroupRequest {
  groupId: string;
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
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AssignGroupResponse {
  success: boolean;
  data: { project: ProjectData; group: object };
  message?: string;
}

export interface DeleteProjectResponse {
  success: boolean;
  message?: string;
}

export const projectService = {
  async createProject(data: CreateProjectRequest): Promise<ProjectResponse> {
    const response = await api.post<ProjectResponse>("/projects", data);
    return response.data;
  },

  async getProjectsByCourse(
    courseId: string,
    query?: GetProjectsQuery,
  ): Promise<ProjectsResponse> {
    const response = await api.get<ProjectsResponse>(
      `/projects/course/${courseId}`,
      { params: query },
    );
    return response.data;
  },

  async getProjectById(id: string): Promise<ProjectResponse> {
    const response = await api.get<ProjectResponse>(`/projects/${id}`);
    return response.data;
  },

  async updateProject(
    id: string,
    data: UpdateProjectRequest,
  ): Promise<ProjectResponse> {
    const response = await api.patch<ProjectResponse>(`/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: string): Promise<DeleteProjectResponse> {
    const response = await api.delete<DeleteProjectResponse>(`/projects/${id}`);
    return response.data;
  },

  async assignGroup(
    projectId: string,
    data: AssignGroupRequest,
  ): Promise<AssignGroupResponse> {
    const response = await api.post<AssignGroupResponse>(
      `/projects/${projectId}/assign-group`,
      data,
    );
    return response.data;
  },

  async unassignGroup(
    projectId: string,
    data: AssignGroupRequest,
  ): Promise<AssignGroupResponse> {
    const response = await api.patch<AssignGroupResponse>(
      `/projects/${projectId}/unassign-group`,
      data,
    );
    return response.data;
  },
};
