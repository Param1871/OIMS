import api from './base.api';

export const categoryApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/categories', { params });
    return response.data;
  }
};
