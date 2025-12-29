import { api } from '@/utils/api';

export const userService = {
  async getProfile() {
    try {
      const response = await api('/api/users/me');
      return response.data;
    } catch (error) {
      console.error('User service error:', error);
      throw error;
    }
  },

  async updateProfile(userData) {
    try {
      const response = await api('/api/users/profile', { method: 'PUT', body: JSON.stringify(userData) });
      return response.data;
    } catch (error) {
      console.error('User service error:', error);
      throw error;
    }
  },

  async changePassword(passwordData) {
    try {
      const response = await api('/api/users/password', { method: 'PUT', body: JSON.stringify(passwordData) });
      return response.data;
    } catch (error) {
      console.error('User service error:', error);
      throw error;
    }
  }
};
