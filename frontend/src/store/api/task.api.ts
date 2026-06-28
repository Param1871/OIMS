import api from './base.api';

export const taskApi = {
  getAll: async () => {
    const res = await api.get('/tasks');
    return res.data;
  },

  getMine: async () => {
    const res = await api.get('/tasks/me');
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/tasks/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    const res = await api.post('/tasks', data);
    return res.data;
  },

  updateStatus: async (id: string, status: string) => {
    const res = await api.patch(`/tasks/${id}/status`, { status });
    return res.data;
  },

  addMessage: async (id: string, content: string) => {
    const res = await api.post(`/tasks/${id}/messages`, { content });
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  }
};
