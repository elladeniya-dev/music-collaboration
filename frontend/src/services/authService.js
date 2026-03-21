import axiosInstance from './api/axiosConfig';
import { API_CONFIG } from '../constants/config';

class AuthService {
  async getCurrentUser() {
    try {
      const response = await axiosInstance.get('/auth/me');
      // Backend returns ApiResponse: { success, message, data }
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      const response = await axiosInstance.post('/auth/logout');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  initiateGoogleLogin() {
    window.location.href = `${API_CONFIG.OAUTH2_URL}/google`;
  }
}

export default new AuthService();
