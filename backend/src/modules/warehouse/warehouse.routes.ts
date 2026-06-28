/**
 * HAL OIMS — Warehouse Routes
 */
import { Router } from 'express';
import { warehouseController } from './warehouse.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

router.get('/',                    authorize('warehouse', 'read'),   warehouseController.findAll);
router.get('/:id',                 authorize('warehouse', 'read'),   warehouseController.findById);
router.get('/:id/utilization',     authorize('warehouse', 'read'),   warehouseController.getUtilization);
router.post('/',                   authorize('warehouse', 'create'),  warehouseController.create);
router.put('/:id',                 authorize('warehouse', 'update'),  warehouseController.update);
router.post('/transfer',           authorize('warehouse', 'update'),  warehouseController.transferStock);

export default router;
