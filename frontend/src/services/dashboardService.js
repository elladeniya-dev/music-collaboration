import { getDashboardData } from './api/dashboard.api';

class DashboardService {
  async getDashboardData() {
    try {
      return await getDashboardData();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
}

export default new DashboardService();
