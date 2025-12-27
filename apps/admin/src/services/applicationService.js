import api from '@/lib/axios';

export const applicationService = {
  getAll: async (params) => {
    const { data } = await api.get('/admin/applications', { params });
    return data;
  },
  
  getOne: async (id) => {
    const { data } = await api.get(`/admin/applications/${id}`);
    return data;
  },

  updateStatus: async (id, status, comment) => {
    const { data } = await api.patch(`/admin/applications/${id}/status`, { status, comment });
    return data;
  },

  approve: async (id, comments) => {
    const { data } = await api.post(`/admin/applications/${id}/approve`, { comments });
    return data;
  },

  reject: async (id, reason, comments) => {
    const { data } = await api.post(`/admin/applications/${id}/reject`, { reason, comments });
    return data;
  },

  requestDocuments: async (id, documents, message) => {
    const { data } = await api.post(`/admin/applications/${id}/request-documents`, { documents, message });
    return data;
  },

  // Bulk actions
  bulkApprove: async (applicationIds, comments) => {
    const { data } = await api.post('/admin/applications/bulk/approve', { applicationIds, comments });
    return data;
  },

  bulkReject: async (applicationIds, reason, comments) => {
    const { data } = await api.post('/admin/applications/bulk/reject', { applicationIds, reason, comments });
    return data;
  },

  // Notes
  getNotes: async (id) => {
    const { data } = await api.get(`/admin/applications/${id}/notes`);
    return data;
  },

  addNote: async (id, content, isPrivate = false) => {
    const { data } = await api.post(`/admin/applications/${id}/notes`, { content, isPrivate });
    return data;
  },

  deleteNote: async (id, noteId) => {
    const { data } = await api.delete(`/admin/applications/${id}/notes/${noteId}`);
    return data;
  },

  // Timeline
  getTimeline: async (id) => {
    const { data } = await api.get(`/admin/applications/${id}/timeline`);
    return data;
  },

  // Export
  getExportUrl: (params) => {
    const queryParams = new URLSearchParams(params);
    return `/admin/applications/export?${queryParams}`;
  },

  getStats: async () => {
    const { data } = await api.get('/admin/stats');
    return data;
  }
};
