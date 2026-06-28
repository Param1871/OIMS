import api from './base.api';

export const notificationApi = {
  getMine: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },
  
  markAsRead: async (id: string) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },

  clearAll: async () => {
    const res = await api.delete('/notifications/clear-all');
    return res.data;
  }
};