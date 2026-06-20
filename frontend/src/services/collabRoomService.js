import axiosInstance from './api/axiosConfig';

const collabRoomService = {
  // Chat Messages
  getMessages: async (roomId) => {
    const response = await axiosInstance.get(`/collab-rooms/${roomId}/messages`);
    return response.data.data;
  },
  
  sendMessage: async (roomId, messageData) => {
    const response = await axiosInstance.post(`/collab-rooms/${roomId}/messages`, messageData);
    return response.data.data;
  },
  
  // Files
  getFiles: async (roomId) => {
    const response = await axiosInstance.get(`/collab-rooms/${roomId}/files`);
    return response.data.data;
  },
  
  uploadFile: async (roomId, formData, onUploadProgress) => {
    const response = await axiosInstance.post(`/collab-rooms/${roomId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress
    });
    return response.data.data;
  }
};

export default collabRoomService;
