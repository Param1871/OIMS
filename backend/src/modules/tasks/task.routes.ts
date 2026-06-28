import { Router } from 'express';
import { taskController } from './task.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createTaskSchema, updateTaskStatusSchema, addTaskMessageSchema } from './task.schema';
import { authorizeRoles } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

// Admin routes
router.get('/', authorizeRoles('SUPER_ADMIN'), taskController.getAll);
router.post('/', authorizeRoles('SUPER_ADMIN'), validate(createTaskSchema), taskController.create);

// Employee (and Admin) routes
router.get('/me', taskController.getMine);
router.get('/:id', taskController.getById);
router.patch('/:id/status', validate(updateTaskStatusSchema), taskController.updateStatus);
router.post('/:id/messages', validate(addTaskMessageSchema), taskController.addMessage);
router.delete('/:id', taskController.deleteTask);

export default router;
