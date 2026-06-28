/**
 * HAL OIMS — Production Routes
 */
import { Router } from 'express';
import { productionController } from './production.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

// Work Orders
router.get('/work-orders',            authorize('production', 'read'),   productionController.getWorkOrders);
router.post('/work-orders',           authorize('production', 'create'), productionController.createWorkOrder);
router.patch('/work-orders/:id/status', authorize('production', 'update'), productionController.updateWorkOrderStatus);

// Material Issues
router.get('/material-issues',        authorize('production', 'read'),   productionController.getMaterialIssues);
router.post('/material-issues',       authorize('production', 'create'), productionController.createMaterialIssue);

export default router;
