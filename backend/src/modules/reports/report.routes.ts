/**
 * HAL OIMS — Report Routes
 */
import { Router } from 'express';
import { reportController } from './report.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticate);

router.get('/dashboard',      authorize('report', 'read'),  reportController.dashboard);
router.get('/inventory',      authorize('report', 'read'),  reportController.inventoryReport);
router.get('/purchase',       authorize('report', 'read'),  reportController.purchaseReport);
router.get('/low-stock',      authorize('report', 'read'),  reportController.lowStockReport);
router.get('/abc-analysis',   authorize('report', 'read'),  reportController.abcAnalysis);
router.get('/stock-movement', authorize('report', 'read'),  reportController.stockMovement);
router.get('/vendors',        authorize('report', 'read'),  reportController.vendorReport);
router.get('/expiry-alerts',  authorize('report', 'read'),  reportController.expiryAlert);
router.get('/calibration-due',authorize('report', 'read'),  reportController.calibrationDue);

export default router;
