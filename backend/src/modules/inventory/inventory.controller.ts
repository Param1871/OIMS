/**
 * HAL OIMS — Inventory Controller
 */
import { Response, NextFunction } from 'express';
import { inventoryService } from './inventory.service';
import { sendSuccess, sendCreated } from '../../shared/response';
import { AuthenticatedRequest } from '../../shared/types';

export const inventoryController = {
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await inventoryService.findAll(req);
      sendSuccess(res, result.items, 'Inventory items retrieved', 200, result.meta);
    } catch (err) { next(err); }
  },

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = await inventoryService.findById(req.params.id);
      sendSuccess(res, item);
    } catch (err) { next(err); }
  },

  async findByCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = await inventoryService.findByCode(req.params.code);
      sendSuccess(res, item);
    } catch (err) { next(err); }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = await inventoryService.create(req.body, req.user!.userId);
      sendCreated(res, item, 'Inventory item created');
    } catch (err) { next(err); }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const item = await inventoryService.update(req.params.id, req.body, req.user!.userId);
      sendSuccess(res, item, 'Inventory item updated');
    } catch (err) { next(err); }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await inventoryService.softDelete(req.params.id, req.user!.userId);
      sendSuccess(res, null, 'Inventory item deleted');
    } catch (err) { next(err); }
  },

  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await inventoryService.getHistory(req.params.id, req);
      sendSuccess(res, result.transactions, 'Item history retrieved', 200, result.meta);
    } catch (err) { next(err); }
  },

  async getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await inventoryService.getDashboardStats();
      sendSuccess(res, stats, 'Dashboard stats retrieved');
    } catch (err) { next(err); }
  },
};
