import { Request, Response, NextFunction } from 'express';
import { taskService } from './task.service';
import { sendSuccess } from '../../shared/response';
import { AuthenticatedRequest } from '../../shared/types';

export const taskController = {
  getAll: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tasks = await taskService.getAllTasks();
      sendSuccess(res, tasks, 'Tasks retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  getMine: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tasks = await taskService.getMyTasks(req.user!.userId);
      sendSuccess(res, tasks, 'Your tasks retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
  
  getById: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const task = await taskService.getTaskById(req.params.id);
      sendSuccess(res, task, 'Task retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const task = await taskService.createTask(req.body, req.user!.userId);
      sendSuccess(res, task, 'Task assigned successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  updateStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const task = await taskService.updateTaskStatus(req.params.id, req.body.status, req.user!.userId);
      sendSuccess(res, task, 'Task status updated');
    } catch (error) {
      next(error);
    }
  },

  addMessage: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const message = await taskService.addMessage(req.params.id, req.body.content, req.user!.userId);
      sendSuccess(res, message, 'Message added', 201);
    } catch (error) {
      next(error);
    }
  },

  deleteTask: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const isAdmin = req.user!.roleName === 'SUPER_ADMIN';
      await taskService.deleteTask(req.params.id, req.user!.userId, isAdmin);
      sendSuccess(res, null, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }
};
