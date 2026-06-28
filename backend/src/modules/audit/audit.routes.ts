/**
 * HAL OIMS — Audit Routes
 */
import { Router } from 'express';
import { auditController } from './audit.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

router.get('/', authorize('audit', 'read'), auditController.getLogs);

export default router;
