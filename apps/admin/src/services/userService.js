import api from '@/lib/axios';

export const userService = {
  getAll: async () => {
    const { data } = await api.get('/admin/users');
    return data;
  },

  create: async (userData) => {
    const { data } = await api.post('/admin/users', userData);
    return data;
  },

  updateRole: async (userId, role) => {
    const { data } = await api.patch(`/admin/users/${userId}/role`, { role });
    return data;
  }
};
