import api from './base.api';

export const productionApi = {
  // Work Orders
  getWorkOrders: async (params?: any) => {
    const response = await api.get('/production/work-orders', { params });
    return response.data;
  },
  createWorkOrder: async (data: any) => {
    const response = await api.post('/production/work-orders', data);
    return response.data;
  },
  updateWorkOrderStatus: async (id: string, status: string) => {
    const response = await api.patch(`/production/work-orders/${id}/status`, { status });
    return response.data;
  },
  
  // Material Issues
  getMaterialIssues: async (params?: any) => {
    const response = await api.get('/production/material-issues', { params });
    return response.data;
  },
  createMaterialIssue: async (data: any) => {
    const response = await api.post('/production/material-issues', data);
    return response.data;
  }
};