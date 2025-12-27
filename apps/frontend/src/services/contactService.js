import axios from '@/lib/axios';

export const contactService = {
  sendMessage: async (data) => {
    try {
      const response = await axios.post('/contact', data);
      return response.data;
    } catch (error) {
      console.error('Contact service error:', error);
      throw error;
    }
  },
};
