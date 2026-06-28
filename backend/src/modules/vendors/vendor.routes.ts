/**
 * HAL OIMS — Vendor Routes
 */
import { Router } from 'express';
import { vendorController } from './vendor.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

router.get('/',                  authorize('vendor', 'read'),   vendorController.findAll);
router.get('/:id',               authorize('vendor', 'read'),   vendorController.findById);
router.get('/:id/stats',         authorize('vendor', 'read'),   vendorController.getStats);
router.post('/',                 authorize('vendor', 'create'),  vendorController.create);
router.put('/:id',               authorize('vendor', 'update'),  vendorController.update);
router.delete('/:id',            authorize('vendor', 'delete'),  vendorController.delete);
router.post('/:id/contacts',     authorize('vendor', 'update'),  vendorController.addContact);

export default router;
