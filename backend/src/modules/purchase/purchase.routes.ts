/**
 * HAL OIMS — Purchase Routes
 */
import { Router } from 'express';
import { purchaseController } from './purchase.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

// Purchase Requests
router.get('/requests',                 authorize('purchase', 'read'),   purchaseController.getAllPRs);
router.post('/requests',                authorize('purchase', 'create'),  purchaseController.createPR);
router.patch('/requests/:id/submit',    authorize('purchase', 'create'),  purchaseController.submitPR);
router.patch('/requests/:id/approve',   authorize('purchase', 'approve'), purchaseController.approvePR);
router.patch('/requests/:id/reject',    authorize('purchase', 'reject'),  purchaseController.rejectPR);

// Purchase Orders
router.get('/orders',                   authorize('purchase', 'read'),   purchaseController.getAllPOs);
router.post('/orders',                  authorize('purchase', 'create'),  purchaseController.createPO);

// GRN
router.get('/grn',                      authorize('purchase', 'read'),    purchaseController.getAllGRNs);
router.post('/grn',                     authorize('purchase', 'create'),  purchaseController.createGRN);
router.patch('/grn/:id/post',           authorize('purchase', 'approve'), purchaseController.postGRN);

export default router;
