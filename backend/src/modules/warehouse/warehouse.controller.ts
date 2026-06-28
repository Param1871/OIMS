/**
 * HAL OIMS — Warehouse Controller
 */
import { Response, NextFunction } from 'express';
import { warehouseService } from './warehouse.service';
import { sendSuccess, sendCreated } from '../../shared/response';
import { AuthenticatedRequest } from '../../shared/types';

export const warehouseController = {
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await warehouseService.findAll(req);
      sendSuccess(res, result.warehouses, 'Warehouses retrieved', 200, result.meta);
    } catch (err) { next(err); }
  },
  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await warehouseService.findById(req.params.id)); }
    catch (err) { next(err); }
  },
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendCreated(res, await warehouseService.create(req.body), 'Warehouse created'); }
    catch (err) { next(err); }
  },
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await warehouseService.update(req.params.id, req.body), 'Warehouse updated'); }
    catch (err) { next(err); }
  },
  async transferStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await warehouseService.transferStock({ ...req.body, performedById: req.user!.userId });
      sendSuccess(res, result, 'Stock transferred successfully');
    } catch (err) { next(err); }
  },
  async getUtilization(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await warehouseService.getUtilization(req.params.id)); }
    catch (err) { next(err); }
  },
};
