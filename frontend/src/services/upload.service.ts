import api from './api';

export const UploadService = {
  uploadFile: async (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Using api from api.ts (Axios instance)
    const response = await api.post(`/uploads/${projectId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  listFiles: async (projectId: string) => {
    const response = await api.get(`/uploads/${projectId}`);
    return response.data;
  },

  downloadFile: async (projectId: string, fileId: string) => {
    const response = await api.get(`/uploads/${projectId}/${fileId}`, {
      // Very imported for binary downloads using axios:
      responseType: 'blob',
    });
    
    // In many cases frontend components like to receive the raw blob to construct an object URL
    return response.data as Blob;
  },

  deleteFile: async (projectId: string, fileId: string) => {
    const response = await api.delete(`/uploads/${projectId}/${fileId}`);
    return response.data;
  }
};
