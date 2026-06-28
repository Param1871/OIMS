/**
 * HAL OIMS — Inventory Routes
 */
import { Router } from 'express';
import { inventoryController } from './inventory.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { auditLog } from '../../middleware/audit.middleware';
import { uploadItemImage } from '../../middleware/upload.middleware';
import { createInventorySchema, updateInventorySchema } from './inventory.schema';

const router = Router();
router.use(authenticate);

router.get('/stats',      authorize('inventory', 'read'),   inventoryController.getDashboardStats);
router.get('/code/:code', authorize('inventory', 'read'),   inventoryController.findByCode);
router.get('/',           authorize('inventory', 'read'),   inventoryController.findAll);
router.get('/:id',        authorize('inventory', 'read'),   inventoryController.findById);
router.get('/:id/history',authorize('inventory', 'read'),   inventoryController.getHistory);
router.post('/',          authorize('inventory', 'create'), auditLog('inventory', 'inventory_item'), validateBody(createInventorySchema), inventoryController.create);
router.put('/:id',        authorize('inventory', 'update'), auditLog('inventory', 'inventory_item'), validateBody(updateInventorySchema), inventoryController.update);
router.delete('/:id',     authorize('inventory', 'delete'), auditLog('inventory', 'inventory_item'), inventoryController.delete);

export default router;
