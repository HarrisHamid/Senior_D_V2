import api from './api';

export const GroupService = {
  createNewGroup: async (courseId: string) => {
    const response = await api.post('/groups', { courseId });
    return response.data;
  },

  joinGroup: async (code: string) => {
    const response = await api.patch('/groups/join', { code });
    return response.data;
  },

  getAllGroupsByCourse: async (courseId: string) => {
    const response = await api.get(`/groups/course/${courseId}`);
    // Assuming backend returns { data: Group[] } or just Group[]
    return response.data;
  },

  getAllInterestedGroups: async (projectId: string) => {
    const response = await api.get(`/groups/interested/${projectId}`);
    return response.data;
  },

  getGroupById: async (groupId: string) => {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  },

  leaveGroup: async (groupId: string) => {
    const response = await api.delete(`/groups/${groupId}/leave`);
    return response.data;
  },

  toggleStatus: async (groupId: string) => {
    const response = await api.patch(`/groups/${groupId}/toggle-status`);
    return response.data;
  },

  addInterestedProject: async (groupId: string, projectId: string) => {
    const response = await api.post(`/groups/${groupId}/interested-projects`, { projectId });
    return response.data;
  },

  removeInterestedProject: async (groupId: string, projectId: string) => {
    const response = await api.delete(`/groups/${groupId}/interested-projects`, {
      data: { projectId } // axios requires body in `data` prop for DELETE
    });
    return response.data;
  }
};
