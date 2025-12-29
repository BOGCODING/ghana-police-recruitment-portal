import { api } from '@/utils/api';

export const contactService = {
  sendMessage: async (data) => {
    try {
      const response = await api('/api/contact', { method: 'POST', body: JSON.stringify(data) });
      return response;
    } catch (error) {
      console.error('Contact service error:', error);
      throw error;
    }
  },
};
