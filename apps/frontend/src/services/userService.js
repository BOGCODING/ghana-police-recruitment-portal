import axios from '@/lib/axios';

export const userService = {
  async getProfile() {
    try {
      const response = await axios.get('/users/me');
      return response.data.data;
    } catch (error) {
      console.error('User service error:', error);
      throw error;
    }
  },

  async updateProfile(userData) {
    try {
      const response = await axios.put('/users/profile', userData);
      return response.data.data;
    } catch (error) {
      console.error('User service error:', error);
      throw error;
    }
  },

  async changePassword(passwordData) {
    try {
      const response = await axios.put('/users/password', passwordData);
      return response.data.data;
    } catch (error) {
      console.error('User service error:', error);
      throw error;
    }
  }
};
