/**
 * HAL OIMS — Employee Controller
 */
import { Response, NextFunction } from 'express';
import { employeeService } from './employee.service';
import { sendSuccess } from '../../shared/response';
import { AuthenticatedRequest } from '../../shared/types';

export const employeeController = {
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await employeeService.findAll(req);
      sendSuccess(res, result.employees, 'Employees retrieved', 200, result.meta);
    } catch (err) { next(err); }
  },
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await employeeService.create(req.body);
      sendSuccess(res, result, 'Employee created successfully', 201);
    } catch (err) { next(err); }
  },
  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await employeeService.findById(req.params.id)); }
    catch (err) { next(err); }
  },
  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await employeeService.remove(req.params.id);
      sendSuccess(res, null, 'Employee deleted successfully', 200);
    } catch (err) { next(err); }
  },
  async getDepartments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await employeeService.getDepartments()); }
    catch (err) { next(err); }
  },
  async getDesignations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try { sendSuccess(res, await employeeService.getDesignations()); }
    catch (err) { next(err); }
  },
};
