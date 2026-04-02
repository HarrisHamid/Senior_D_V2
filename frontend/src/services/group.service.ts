import api from "./api";

export interface GroupData {
  _id: string;
  courseId: string;
  groupNumber: number;
  groupCode?: string;
  isOpen: boolean;
  groupMembers: string[];
  interestedProjects: string[];
  assignedProject: string | null;
  numberOfMembers?: number;
}

// API returns data as a direct array: { success, data: GroupData[] }
export interface GroupsResponse {
  success: boolean;
  data: GroupData[];
}

export interface GroupResponse {
  success: boolean;
  data: { group: GroupData };
}

export const groupService = {
  async createNewGroup(courseId: string): Promise<GroupResponse> {
    const response = await api.post<GroupResponse>("/groups", { courseId });
    return response.data;
  },

  async joinGroup(code: string): Promise<GroupResponse> {
    const response = await api.patch<GroupResponse>("/groups/join", { code });
    return response.data;
  },

  async getAllGroupsByCourse(courseId: string): Promise<GroupsResponse> {
    const response = await api.get<GroupsResponse>(`/groups/course/${courseId}`);
    return response.data;
  },

  async getAllInterestedGroups(projectId: string): Promise<GroupsResponse> {
    const response = await api.get<GroupsResponse>(`/groups/interested/${projectId}`);
    return response.data;
  },

  async getGroupById(groupId: string): Promise<GroupResponse> {
    const response = await api.get<GroupResponse>(`/groups/${groupId}`);
    return response.data;
  },

  async leaveGroup(groupId: string): Promise<GroupResponse> {
    const response = await api.delete<GroupResponse>(`/groups/${groupId}/leave`);
    return response.data;
  },

  async toggleStatus(groupId: string): Promise<GroupResponse> {
    const response = await api.patch<GroupResponse>(`/groups/${groupId}/toggle-status`);
    return response.data;
  },

  async addInterestedProject(groupId: string, projectId: string): Promise<GroupResponse> {
    const response = await api.post<GroupResponse>(`/groups/${groupId}/interested-projects`, { projectId });
    return response.data;
  },

  async removeInterestedProject(groupId: string, projectId: string): Promise<GroupResponse> {
    const response = await api.delete<GroupResponse>(`/groups/${groupId}/interested-projects`, {
      data: { projectId },
    });
    return response.data;
  },
};
