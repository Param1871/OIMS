/**
 * HAL OIMS — Audit Logging Middleware
 * Phase 3: Automatically logs mutating actions to the audit_logs table
 */

import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../shared/types';
import { getClientIP } from '../shared/helpers';
import { logger } from '../config/logger';

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Map HTTP method to audit action
const METHOD_TO_ACTION: Record<string, string> = {
  POST:   'CREATE',
  PUT:    'UPDATE',
  PATCH:  'UPDATE',
  DELETE: 'DELETE',
};

/**
 * Auto-audit middleware — attach to routes that need automatic audit logging
 */
export const auditLog = (module: string, entityType?: string) =>
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!MUTATING_METHODS.includes(req.method)) {
      return next();
    }

    // Intercept response to capture statusCode
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only log successful mutations (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const action = METHOD_TO_ACTION[req.method] || 'UPDATE';
        const entityId = req.params?.id || body?.data?.id;

        prisma.auditLog.create({
          data: {
            userId:      req.user.userId,
            action:      action as any,
            module,
            entityType:  entityType || module,
            entityId:    entityId,
            description: `${req.user.username} performed ${action} on ${entityType || module}`,
            newValues:   req.body ? JSON.stringify(req.body) : undefined,
            ipAddress:   getClientIP(req as any),
            userAgent:   req.headers['user-agent'] || undefined,
          },
        }).catch((err) => logger.error('Audit log failed:', err));
      }
      return originalJson(body);
    };

    next();
  };

/**
 * Manual audit log helper — call from service layer for custom events
 */
export const createAuditEntry = async (data: {
  userId?:     string;
  action:      string;
  module:      string;
  entityType?: string;
  entityId?:   string;
  description: string;
  oldValues?:  Record<string, unknown>;
  newValues?:  Record<string, unknown>;
  ipAddress?:  string;
  userAgent?:  string;
}): Promise<void> => {
  try {
    const logData = { ...data };
    if (logData.oldValues && typeof logData.oldValues === 'object') {
      logData.oldValues = JSON.stringify(logData.oldValues) as any;
    }
    if (logData.newValues && typeof logData.newValues === 'object') {
      logData.newValues = JSON.stringify(logData.newValues) as any;
    }
    await prisma.auditLog.create({ data: logData as any });
  } catch (error) {
    logger.error('Failed to create audit entry:', error);
  }
};