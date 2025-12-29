import { api } from '@/utils/api';

export const notificationService = {
  async getNotifications() {
    try {
      const response = await api('/api/notifications');
      return response.data;
    } catch (error) {
      console.error('Notification service error:', error);
      throw error;
    }
  },

  async markAsRead(id) {
    try {
      const response = await api(`/api/notifications/${id}/read`, { method: 'PUT' });
      return response.data;
    } catch (error) {
      console.error('Notification service error:', error);
      throw error;
    }
  },

  async markAllAsRead() {
    try {
      const response = await api('/api/notifications/read-all', { method: 'PUT' });
      return response;
    } catch (error) {
      console.error('Notification service error:', error);
      throw error;
    }
  }
};
