import api from './base.api';

export const maintenanceApi = {
  getSchedules: async (params?: any) => {
    const response = await api.get('/maintenance/schedules', { params });
    return response.data;
  },
  createSchedule: async (data: any) => {
    const response = await api.post('/maintenance/schedules', data);
    return response.data;
  },
  updateScheduleStatus: async (id: string, status: string) => {
    const response = await api.patch(`/maintenance/schedules/${id}/status`, { status });
    return response.data;
  },
  getCalibrationRecords: async (params?: any) => {
    const response = await api.get('/maintenance/calibration', { params });
    return response.data;
  },
  createCalibrationRecord: async (data: any) => {
    const response = await api.post('/maintenance/calibration', data);
    return response.data;
  }
};