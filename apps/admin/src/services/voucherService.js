import api from '@/lib/axios';

const voucherService = {
  getAll: async (params) => {
    const { data } = await api.get('/vouchers', { params });
    return data;
  },

  generateSingle: async (data) => {
    const { data: res } = await api.post('/vouchers/generate', data);
    return res;
  },

  generateBulk: async (payload) => {
    const { data } = await api.post('/vouchers/generate-bulk', payload);
    return data;
  },

  deactivate: async (code) => {
    const { data } = await api.patch(`/vouchers/${code}/deactivate`);
    return data;
  },

  delete: async (code) => {
    const { data } = await api.delete(`/vouchers/${code}`);
    return data;
  },

  getStats: async () => {
    const { data } = await api.get('/vouchers/stats');
    return data;
  }
};

export default voucherService;
