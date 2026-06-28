import api from './base.api';

export const warehouseApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/warehouses', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  }
};