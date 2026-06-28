import api from './base.api';

export const vendorApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/vendors', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/vendors', data);
    return response.data;
  }
};