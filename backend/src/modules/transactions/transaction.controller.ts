/**
 * HAL OIMS — Transaction Controller
 */
import { Response, NextFunction } from 'express';
import { transactionService } from './transaction.service';
import { sendSuccess, sendCreated } from '../../shared/response';
import { AuthenticatedRequest } from '../../shared/types';

export const transactionController = {
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await transactionService.findAll(req);
      sendSuccess(res, result.transactions, 'Transactions retrieved', 200, result.meta);
    } catch (err) { next(err); }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const txn = await transactionService.createTransaction({
        ...req.body,
        performedById: req.user!.userId,
      });
      sendCreated(res, txn, 'Stock transaction recorded');
    } catch (err) { next(err); }
  },

  async getDailySummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      sendSuccess(res, await transactionService.getDailySummary());
    } catch (err) { next(err); }
  },
};
