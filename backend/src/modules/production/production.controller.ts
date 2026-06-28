/**
 * HAL OIMS — Production Controller (Phase 8 Placeholder)
 */
import { Response, NextFunction } from 'express';
import { sendSuccess, sendCreated } from '../../shared/response';
import { AuthenticatedRequest } from '../../shared/types';
import { productionService } from './production.service';

export const productionController = {
  async getWorkOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const orders = await productionService.findAllWorkOrders();
      sendSuccess(res, orders);
    } catch (err) { next(err); }
  },

  async createWorkOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const wo = await productionService.createWorkOrder(req.body);
      sendCreated(res, wo, 'Work order created');
    } catch (err) { next(err); }
  },

  async updateWorkOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const wo = await productionService.updateWorkOrderStatus(req.params.id, req.body.status);
      sendSuccess(res, wo, 'Work order updated');
    } catch (err) { next(err); }
  },

  async getMaterialIssues(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const issues = await productionService.findAllMaterialIssues();
      sendSuccess(res, issues);
    } catch (err) { next(err); }
  },

  async createMaterialIssue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const issue = await productionService.createMaterialIssue(req.body, req.user!.userId);
      sendCreated(res, issue, 'Material issue created');
    } catch (err) { next(err); }
  }
};
