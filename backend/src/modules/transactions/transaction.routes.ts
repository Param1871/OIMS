/**
 * HAL OIMS — Transaction Routes
 */
import { Router } from 'express';
import { transactionController } from './transaction.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

router.get('/summary', authorize('transaction', 'read'), transactionController.getDailySummary);
router.get('/',        authorize('transaction', 'read'), transactionController.findAll);
router.post('/',       authorize('transaction', 'create'), transactionController.create);

export default router;
