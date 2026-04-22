import api from "./api";

export interface JoinRequest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
}

export interface GroupData {
  _id: string;
  courseId?: string;
  groupNumber: number;
  name?: string;
  groupCode?: string;
  isOpen: boolean;
  isPublic: boolean;
  groupMembers: string[];
  interestedProjects: string[];
  assignedProject: string | null;
  joinRequests: JoinRequest[];
  numberOfMembers?: number;
}

// API returns data as a direct array: { success, data: GroupData[] }
export interface GroupsResponse {
  success: boolean;
  data: GroupData[];
}

export interface GroupResponse {
  success: boolean;
  data: { group: GroupData } | GroupData;
  message?: string;
  requestPending?: boolean;
}

export const groupService = {
  async createNewGroup(isPublic = true, name?: string): Promise<GroupResponse> {
    const response = await api.post<GroupResponse>("/groups", { isPublic, ...(name ? { name } : {}) });
    return response.data;
  },

  async getAllGroups(): Promise<GroupsResponse> {
    const response = await api.get<GroupsResponse>("/groups");
    return response.data;
  },

  async joinGroup(code: string): Promise<GroupResponse> {
    const response = await api.patch<GroupResponse>("/groups/join", {
      groupCode: code,
    });
    return response.data;
  },

  async getAllGroupsByCourse(courseId: string): Promise<GroupsResponse> {
    const response = await api.get<GroupsResponse>(
      `/groups/course/${courseId}`,
    );
    return response.data;
  },

  async getAllInterestedGroups(projectId: string): Promise<GroupsResponse> {
    const response = await api.get<GroupsResponse>(
      `/groups/interested/${projectId}`,
    );
    return response.data;
  },

  async getGroupById(
    groupId: string,
  ): Promise<{ success: boolean; data: GroupData }> {
    const response = await api.get<{ success: boolean; data: GroupData }>(
      `/groups/${groupId}`,
    );
    return response.data;
  },

  async leaveGroup(groupId: string): Promise<GroupResponse> {
    const response = await api.delete<GroupResponse>(
      `/groups/${groupId}/leave`,
    );
    return response.data;
  },

  async toggleStatus(
    groupId: string,
  ): Promise<{ success: boolean; data: GroupData }> {
    const response = await api.patch<{ success: boolean; data: GroupData }>(
      `/groups/${groupId}/toggle-status`,
    );
    return response.data;
  },

  async toggleVisibility(
    groupId: string,
  ): Promise<{ success: boolean; data: GroupData; message: string }> {
    const response = await api.patch<{
      success: boolean;
      data: GroupData;
      message: string;
    }>(`/groups/${groupId}/toggle-visibility`);
    return response.data;
  },

  async respondToJoinRequest(
    groupId: string,
    requestId: string,
    status: "approved" | "rejected",
  ): Promise<{ success: boolean; data: GroupData; message: string }> {
    const response = await api.patch<{
      success: boolean;
      data: GroupData;
      message: string;
    }>(`/groups/${groupId}/join-requests/${requestId}`, { status });
    return response.data;
  },

  async addInterestedProject(
    groupId: string,
    projectId: string,
  ): Promise<{ success: boolean; data: GroupData }> {
    const response = await api.post<{ success: boolean; data: GroupData }>(
      `/groups/${groupId}/interested-projects`,
      { projectId },
    );
    return response.data;
  },

  async removeMember(
    groupId: string,
    memberId: string,
  ): Promise<{ success: boolean; data: GroupData; message: string }> {
    const response = await api.delete<{
      success: boolean;
      data: GroupData;
      message: string;
    }>(`/groups/${groupId}/members/${memberId}`);
    return response.data;
  },

  async removeInterestedProject(
    groupId: string,
    projectId: string,
  ): Promise<{ success: boolean; data: GroupData }> {
    const response = await api.delete<{ success: boolean; data: GroupData }>(
      `/groups/${groupId}/interested-projects`,
      {
        data: { projectId },
      },
    );
    return response.data;
  },
};
