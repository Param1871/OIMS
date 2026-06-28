/**
 * HAL OIMS — Purchase Controller
 */
import { Response, NextFunction } from 'express';
import { purchaseService } from './purchase.service';
import { sendSuccess, sendCreated } from '../../shared/response';
import { AuthenticatedRequest } from '../../shared/types';

export const purchaseController = {
  // PRs
  async getAllPRs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await purchaseService.findAllPRs(req); sendSuccess(res, r.prs, 'PRs retrieved', 200, r.meta); }
    catch (err) { next(err); }
  },
  async createPR(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendCreated(res, await purchaseService.createPR(req.body, req.user!.userId), 'Purchase Request created'); }
    catch (err) { next(err); }
  },
  async submitPR(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await purchaseService.submitPR(req.params.id, req.user!.userId), 'PR submitted'); }
    catch (err) { next(err); }
  },
  async approvePR(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await purchaseService.approvePR(req.params.id, req.user!.userId), 'PR approved'); }
    catch (err) { next(err); }
  },
  async rejectPR(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await purchaseService.rejectPR(req.params.id, req.user!.userId, req.body.reason), 'PR rejected'); }
    catch (err) { next(err); }
  },
  // POs
  async getAllPOs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await purchaseService.findAllPOs(req); sendSuccess(res, r.pos, 'POs retrieved', 200, r.meta); }
    catch (err) { next(err); }
  },
  async createPO(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendCreated(res, await purchaseService.createPO(req.body, req.user!.userId), 'Purchase Order created'); }
    catch (err) { next(err); }
  },
  // GRN
  async getAllGRNs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { const r = await purchaseService.findAllGRNs(req); sendSuccess(res, r.grns, 'GRNs retrieved', 200, r.meta); }
    catch (err) { next(err); }
  },
  async createGRN(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendCreated(res, await purchaseService.createGRN(req.body, req.user!.userId), 'GRN created'); }
    catch (err) { next(err); }
  },
  async postGRN(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await purchaseService.postGRN(req.params.id, req.user!.userId), 'GRN posted to inventory'); }
    catch (err) { next(err); }
  },
};
