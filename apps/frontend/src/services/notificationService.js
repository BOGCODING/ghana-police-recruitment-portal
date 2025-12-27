import axios from '@/lib/axios';

export const notificationService = {
  async getNotifications() {
    try {
      const response = await axios.get('/notifications');
      return response.data.data;
    } catch (error) {
      console.error('Notification service error:', error);
      throw error;
    }
  },

  async markAsRead(id) {
    try {
      const response = await axios.put(`/notifications/${id}/read`);
      return response.data.data;
    } catch (error) {
      console.error('Notification service error:', error);
      throw error;
    }
  },

  async markAllAsRead() {
    try {
      const response = await axios.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Notification service error:', error);
      throw error;
    }
  }
};
