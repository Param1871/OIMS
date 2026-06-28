import api from './base.api';

export const purchaseApi = {
  getAllOrders: async (params?: any) => {
    const response = await api.get('/purchase/orders', { params });
    return response.data;
  },
  getOrderById: async (id: string) => {
    const response = await api.get(`/purchase/orders/${id}`);
    return response.data;
  },
  createOrder: async (data: any) => {
    const response = await api.post('/purchase/orders', data);
    return response.data;
  },
  createGRN: async (data: any) => {
    const response = await api.post('/purchase/grn', data);
    return response.data;
  },
  getAllGRNs: async (params?: any) => {
    const response = await api.get('/purchase/grn', { params });
    return response.data;
  },
  postGRN: async (id: string) => {
    const response = await api.patch(`/purchase/grn/${id}/post`);
    return response.data;
  },
  // PR Endpoints
  getAllPRs: async (params?: any) => {
    const response = await api.get('/purchase/requests', { params });
    return response.data;
  },
  createPR: async (data: any) => {
    const response = await api.post('/purchase/requests', data);
    return response.data;
  },
  submitPR: async (id: string) => {
    const response = await api.patch(`/purchase/requests/${id}/submit`);
    return response.data;
  },
  approvePR: async (id: string) => {
    const response = await api.patch(`/purchase/requests/${id}/approve`);
    return response.data;
  },
  rejectPR: async (id: string, reason: string) => {
    const response = await api.patch(`/purchase/requests/${id}/reject`, { reason });
    return response.data;
  }
};