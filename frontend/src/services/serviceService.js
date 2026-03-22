import axiosInstance from './api/axiosConfig';

class ServiceService {
  async getAllServices() {
    try {
      const response = await axiosInstance.get('/services');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async getServicesByCategory(category) {
    try {
      const response = await axiosInstance.get(`/services/category/${category}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async getServicesBySeller(sellerId) {
    try {
      const response = await axiosInstance.get(`/services/seller/${sellerId}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async createService(data) {
    try {
      const mediaFiles = Array.isArray(data.mediaFiles) ? data.mediaFiles : [];
      const imageFile = mediaFiles.find((file) => file?.type?.startsWith('image/'));
      const audioFile = mediaFiles.find((file) => file?.type?.startsWith('audio/'));

      let response;
      if (imageFile || audioFile) {
        const formData = new FormData();
        formData.append('title', data.title ?? '');
        formData.append('description', data.description ?? '');
        formData.append('price', String(data.price ?? ''));
        formData.append('deliveryTime', String(data.deliveryTime ?? ''));

        if (data.category) {
          formData.append('category', data.category);
        }

        if (Array.isArray(data.tags) && data.tags.length) {
          formData.append('tags', JSON.stringify(data.tags));
        }

        if (imageFile) {
          formData.append('image', imageFile);
        }

        if (audioFile) {
          formData.append('audio', audioFile);
        }

        response = await axiosInstance.post('/services', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await axiosInstance.post('/services', data, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteService(id) {
    try {
      const response = await axiosInstance.delete(`/services/${id}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ServiceService();
