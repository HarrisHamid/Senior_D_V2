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
  async getAllGroupsByCourse(courseId: string): Promise<GroupsResponse> {
    const response = await api.get<GroupsResponse>(`/groups/course/${courseId}`);
    return response.data;
  },

  async getGroupById(groupId: string): Promise<GroupResponse> {
    const response = await api.get<GroupResponse>(`/groups/${groupId}`);
    return response.data;
  },
};
