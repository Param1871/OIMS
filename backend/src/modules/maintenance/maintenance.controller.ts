/**
 * HAL OIMS — Maintenance Controller (Phase 8 Placeholder)
 */
import { Response, NextFunction } from 'express';
import { sendSuccess, sendCreated } from '../../shared/response';
import { AuthenticatedRequest } from '../../shared/types';
import { maintenanceService } from './maintenance.service';

export const maintenanceController = {
  async getSchedules(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      sendSuccess(res, await maintenanceService.findAllSchedules());
    } catch (err) { next(err); }
  },

  async createSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      sendCreated(res, await maintenanceService.createSchedule(req.body), 'Schedule created');
    } catch (err) { next(err); }
  },

  async updateScheduleStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      sendSuccess(res, await maintenanceService.updateScheduleStatus(req.params.id, req.body.status), 'Status updated');
    } catch (err) { next(err); }
  },

  async getCalibrationRecords(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      sendSuccess(res, await maintenanceService.findAllCalibrationRecords());
    } catch (err) { next(err); }
  },

  async createCalibrationRecord(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      sendCreated(res, await maintenanceService.createCalibrationRecord(req.body), 'Calibration logged');
    } catch (err) { next(err); }
  }
};
