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
      const response = await axiosInstance.post('/services', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
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
