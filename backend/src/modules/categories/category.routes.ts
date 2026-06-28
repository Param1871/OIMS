/**
 * HAL OIMS — Category Routes
 */
import { Router } from 'express';
import { categoryController } from './category.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

router.get('/',                    authorize('inventory', 'read'),   categoryController.findAll);
router.get('/:id',                 authorize('inventory', 'read'),   categoryController.findById);
router.post('/',                   authorize('inventory', 'create'),  categoryController.create);
router.put('/:id',                 authorize('inventory', 'update'),  categoryController.update);
router.post('/:id/subcategories',  authorize('inventory', 'create'),  categoryController.createSubcategory);

export default router;
