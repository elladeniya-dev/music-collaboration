import axios from './api/axiosConfig';

class DashboardService {
  async getDashboardData() {
    try {
      const response = await axios.get('/dashboard');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
}

export default new DashboardService();
