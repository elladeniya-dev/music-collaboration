import axios from './api/axiosConfig';

class NotificationService {
  async getNotifications() {
    try {
      const response = await axios.get('/notifications');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId) {
    try {
      const response = await axios.put(`/notifications/${notificationId}/read`);
      return response.data.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
}

export default new NotificationService();
