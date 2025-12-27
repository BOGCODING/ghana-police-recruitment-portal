import api from '@/lib/axios';

const systemService = {
  /**
   * Get all system settings
   */
  getSettings: async () => {
    try {
      const response = await api.get('/system/settings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update a system setting
   */
  updateSetting: async (key, value) => {
    try {
      const response = await api.post('/system/settings', { key, value });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get voucher price
   */
  getVoucherPrice: async () => {
    try {
      const response = await api.get('/system/voucher-price');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default systemService;
