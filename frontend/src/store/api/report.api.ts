import api from './base.api';

export const reportApi = {
  getInventoryReport: async (params?: any) => {
    const response = await api.get('/reports/inventory', { params });
    return response.data;
  },
  getPurchaseReport: async (params?: any) => {
    const response = await api.get('/reports/purchase', { params });
    return response.data;
  },
  getLowStockReport: async (params?: any) => {
    const response = await api.get('/reports/inventory/low-stock', { params });
    return response.data;
  },
  getAbcAnalysis: async (params?: any) => {
    const response = await api.get('/reports/inventory/abc', { params });
    return response.data;
  },
  getStockMovement: async (params?: any) => {
    const response = await api.get('/reports/inventory/movement', { params });
    return response.data;
  },
  getDashboard: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  }
};