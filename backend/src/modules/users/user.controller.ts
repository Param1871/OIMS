/**
 * HAL OIMS — User Controller
 */
import { Response, NextFunction } from 'express';
import { userService } from './user.service';
import { sendSuccess, sendCreated, sendNotFound } from '../../shared/response';
import { AuthenticatedRequest } from '../../shared/types';

export const userController = {
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.findAll(req);
      sendSuccess(res, result.users, 'Users retrieved', 200, result.meta);
    } catch (err) { next(err); }
  },

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(req.params.id);
      sendSuccess(res, user);
    } catch (err) { next(err); }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.create(req.body);
      sendCreated(res, user, 'User created successfully');
    } catch (err) { next(err); }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.update(req.params.id, req.body);
      sendSuccess(res, user, 'User updated successfully');
    } catch (err) { next(err); }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await userService.softDelete(req.params.id);
      sendSuccess(res, null, 'User deleted successfully');
    } catch (err) { next(err); }
  },
};
