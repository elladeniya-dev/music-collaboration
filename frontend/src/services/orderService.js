import axiosInstance from './api/axiosConfig';

class OrderService {
  async createOrder(serviceId) {
    try {
      const response = await axiosInstance.post('/orders', { serviceId });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async getMyOrders() {
    try {
      const response = await axiosInstance.get('/orders/my');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async acceptOrder(id) {
    try {
      const response = await axiosInstance.put(`/orders/${id}/accept`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async deliverOrder(id, data) {
    try {
      const response = await axiosInstance.put(`/orders/${id}/deliver`, data);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async completeOrder(id) {
    try {
      const response = await axiosInstance.put(`/orders/${id}/complete`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new OrderService();
