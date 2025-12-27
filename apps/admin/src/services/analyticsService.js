import api from '@/lib/axios';

export const analyticsService = {
  getDashboardStats: async () => {
    const { data } = await api.get('/admin/dashboard/stats');
    return data;
  },

  getOverview: async () => {
    const { data } = await api.get('/admin/analytics/overview');
    return data;
  },

  getTrends: async () => {
    const { data } = await api.get('/admin/analytics/trends');
    return data;
  },

  getStatusDistribution: async () => {
    const { data } = await api.get('/admin/analytics/distribution');
    return data;
  },

  getDemographics: async () => {
    const { data } = await api.get('/admin/analytics/demographics');
    return data;
  },

  getRegionalStats: async () => {
    const { data } = await api.get('/admin/analytics/regions');
    return data;
  }
};
