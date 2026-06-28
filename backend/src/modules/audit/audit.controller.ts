/**
 * HAL OIMS — Audit Controller
 */
import { Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { sendSuccess } from '../../shared/response';
import { AuthenticatedRequest } from '../../shared/types';
import { parsePagination, buildMeta } from '../../shared/pagination';

export const auditController = {
  async getLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { skip, take, page, pageSize } = parsePagination(req);
      const q = req.query;

      const where: any = {
        ...(q.module && { module: q.module }),
        ...(q.action && { action: q.action }),
        ...(q.userId && { userId: q.userId }),
        ...(q.fromDate && q.toDate && {
          createdAt: { gte: new Date(q.fromDate as string), lte: new Date(q.toDate as string) },
        }),
      };

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where, skip, take, orderBy: { createdAt: 'desc' },
          include: { user: { select: { username: true } } },
        }),
        prisma.auditLog.count({ where }),
      ]);

      sendSuccess(res, logs, 'Audit logs retrieved', 200, buildMeta(total, { skip, take, page, pageSize }));
    } catch (err) { next(err); }
  }
};
