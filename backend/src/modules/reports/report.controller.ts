/**
 * HAL OIMS — Report Controller
 */
import { Response, NextFunction } from 'express';
import { reportService } from './report.service';
import { sendSuccess } from '../../shared/response';
import { AuthenticatedRequest } from '../../shared/types';

export const reportController = {
  async inventoryReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await reportService.inventoryReport(req.query)); }
    catch (err) { next(err); }
  },
  async purchaseReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await reportService.purchaseReport(req.query)); }
    catch (err) { next(err); }
  },
  async lowStockReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await reportService.lowStockReport()); }
    catch (err) { next(err); }
  },
  async abcAnalysis(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await reportService.abcAnalysis(), 'ABC Analysis complete'); }
    catch (err) { next(err); }
  },
  async stockMovement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { fromDate, toDate } = req.query as { fromDate: string; toDate: string };
      sendSuccess(res, await reportService.stockMovementSummary(fromDate, toDate));
    } catch (err) { next(err); }
  },
  async vendorReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await reportService.vendorReport()); }
    catch (err) { next(err); }
  },
  async expiryAlert(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await reportService.expiryAlertReport(Number(req.query.days) || 90)); }
    catch (err) { next(err); }
  },
  async calibrationDue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await reportService.calibrationDueReport(Number(req.query.days) || 30)); }
    catch (err) { next(err); }
  },
  async dashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await reportService.dashboardSummary()); }
    catch (err) { next(err); }
  },
};
