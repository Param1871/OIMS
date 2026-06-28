/**
 * HAL OIMS — User Routes
 */
import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { createUserSchema, updateUserSchema } from './user.schema';

const router = Router();

router.use(authenticate);

router.get('/',     authorize('employee', 'read'),   userController.findAll);
router.get('/:id',  authorize('employee', 'read'),   userController.findById);
router.post('/',    authorize('employee', 'create'),  validateBody(createUserSchema), userController.create);
router.put('/:id',  authorize('employee', 'update'),  validateBody(updateUserSchema), userController.update);
router.delete('/:id', authorize('employee', 'delete'), userController.delete);

export default router;
