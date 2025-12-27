import api from '@/lib/axios';

export const adminAuthService = {
  login: async (email, password) => {
    const { data } = await api.post('/admin/login', { email, password });
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get('/admin/me');
    return data;
  },

  logout: async () => {
    try {
      await api.post('/admin/logout');
    } catch (e) {
      console.error(e);
    }
  }
};
