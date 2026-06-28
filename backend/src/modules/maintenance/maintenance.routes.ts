/**
 * HAL OIMS — Maintenance Routes
 */
import { Router } from 'express';
import { maintenanceController } from './maintenance.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

router.get('/schedules', authorize('maintenance', 'read'), maintenanceController.getSchedules);
router.post('/schedules', authorize('maintenance', 'create'), maintenanceController.createSchedule);
router.patch('/schedules/:id/status', authorize('maintenance', 'update'), maintenanceController.updateScheduleStatus);
router.get('/calibration', authorize('maintenance', 'read'), maintenanceController.getCalibrationRecords);
router.post('/calibration', authorize('maintenance', 'create'), maintenanceController.createCalibrationRecord);

export default router;
