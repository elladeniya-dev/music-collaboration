import axiosInstance from './api/axiosConfig';

class UserService {
  async getBulkUsers(ids) {
    try {
      const query = ids.map(id => `ids=${id}`).join('&');
      const response = await axiosInstance.get(`/users/bulk?${query}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const response = await axiosInstance.get(`/users/by-email/${encodeURIComponent(email)}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const response = await axiosInstance.get('/users/me');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(data) {
    try {
      const response = await axiosInstance.put('/users/profile', data);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async addPortfolioItem(data) {
    try {
      const response = await axiosInstance.post('/users/portfolio', data);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async deletePortfolioItem(id) {
    try {
      const response = await axiosInstance.delete(`/users/portfolio/${id}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async updateAvailability(availability) {
    try {
      const response = await axiosInstance.put('/users/availability', { availability });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();
