/**
 * HAL OIMS — Vendor Controller
 */
import { Response, NextFunction } from 'express';
import { vendorService } from './vendor.service';
import { sendSuccess, sendCreated } from '../../shared/response';
import { AuthenticatedRequest } from '../../shared/types';

export const vendorController = {
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await vendorService.findAll(req);
      sendSuccess(res, result.vendors, 'Vendors retrieved', 200, result.meta);
    } catch (err) { next(err); }
  },
  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await vendorService.findById(req.params.id)); }
    catch (err) { next(err); }
  },
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendCreated(res, await vendorService.create(req.body), 'Vendor created'); }
    catch (err) { next(err); }
  },
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await vendorService.update(req.params.id, req.body), 'Vendor updated'); }
    catch (err) { next(err); }
  },
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { await vendorService.softDelete(req.params.id); sendSuccess(res, null, 'Vendor deleted'); }
    catch (err) { next(err); }
  },
  async addContact(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendCreated(res, await vendorService.addContact(req.params.id, req.body), 'Contact added'); }
    catch (err) { next(err); }
  },
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await vendorService.getPerformanceStats(req.params.id)); }
    catch (err) { next(err); }
  },
};
