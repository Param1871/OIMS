import api from './base.api';

export const transactionApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },
  getDailySummary: async (params?: any) => {
    const response = await api.get('/transactions/summary', { params });
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/transactions', data);
    return response.data;
  }
};