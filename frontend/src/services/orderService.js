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

  async deliverOrder(id, data, onUploadProgress) {
    try {
      let payload;
      
      if (data instanceof FormData) {
        payload = data;
      } else {
        payload = new FormData();
        payload.append('deliveryMessage', data.deliveryMessage || '');
        if (data.deliveryFileUrl) {
          payload.append('fileUrl', data.deliveryFileUrl);
        }
        if (data.file) {
          payload.append('file', data.file);
        }
      }

      const response = await axiosInstance.put(`/orders/${id}/deliver`, payload, { 
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async cancelOrder(id) {
    try {
      const response = await axiosInstance.delete(`/orders/${id}`);
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
