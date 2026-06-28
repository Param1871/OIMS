import api from './base.api';

export const inventoryApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/inventory', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/inventory', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/inventory/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await api.get('/inventory/stats');
    return response.data;
  },
  getHistory: async (id: string, params?: any) => {
    const response = await api.get(`/inventory/${id}/history`, { params });
    return response.data;
  }
};