/**
 * HAL OIMS — Employee Routes
 */
import { Router } from 'express';
import { employeeController } from './employee.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

router.get('/departments',  authorize('employee', 'read'), employeeController.getDepartments);
router.get('/designations', authorize('employee', 'read'), employeeController.getDesignations);
router.get('/',             authorize('employee', 'read'), employeeController.findAll);
router.post('/',            authorize('employee', 'create'), employeeController.create);
router.get('/:id',          authorize('employee', 'read'), employeeController.findById);
router.delete('/:id',       authorize('employee', 'delete'), employeeController.remove);

export default router;
