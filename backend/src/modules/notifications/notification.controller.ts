/**
 * HAL OIMS — Notification Controller
 */
import { Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { sendSuccess } from '../../shared/response';
import { AuthenticatedRequest } from '../../shared/types';
import { parsePagination, buildMeta } from '../../shared/pagination';

export const notificationController = {
  async getMyNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { skip, take, page, pageSize } = parsePagination(req);
      const where = { userId: req.user!.userId };
      
      const [notifications, total] = await Promise.all([
        prisma.userNotification.findMany({ where, skip, take, include: { notification: true }, orderBy: { createdAt: 'desc' } }),
        prisma.userNotification.count({ where }),
      ]);
      
      sendSuccess(res, notifications, 'Notifications retrieved', 200, buildMeta(total, { skip, take, page, pageSize }));
    } catch (err) { next(err); }
  },

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await prisma.userNotification.updateMany({
        where: { notificationId: req.params.id, userId: req.user!.userId },
        data: { isRead: true, readAt: new Date() },
      });
      sendSuccess(res, null, 'Notification marked as read');
    } catch (err) { next(err); }
  },

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await prisma.userNotification.updateMany({
        where: { userId: req.user!.userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
      sendSuccess(res, null, 'All notifications marked as read');
    } catch (err) { next(err); }
  },

  async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await prisma.userNotification.deleteMany({
        where: { notificationId: req.params.id, userId: req.user!.userId },
      });
      sendSuccess(res, null, 'Notification deleted');
    } catch (err) { next(err); }
  },

  async clearAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await prisma.userNotification.deleteMany({
        where: { userId: req.user!.userId },
      });
      sendSuccess(res, null, 'All notifications cleared');
    } catch (err) { next(err); }
  }
};
