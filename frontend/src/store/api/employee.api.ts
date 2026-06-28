import api from './base.api';

export const employeeApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/employees', data);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  }
};