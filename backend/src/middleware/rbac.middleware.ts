/**
 * HAL OIMS — Role-Based Access Control (RBAC) Middleware
 * Phase 3: Checks user has required module+action permission
 */

import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { sendForbidden } from '../shared/response';
import { AuthenticatedRequest } from '../shared/types';

// Cache permissions for 5 minutes per role
const permissionCache = new Map<string, { permissions: Set<string>; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000;

const getPermissionsForRole = async (roleId: string): Promise<Set<string>> => {
  const cached = permissionCache.get(roleId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.permissions;
  }

  const rolePermissions = await prisma.rolePermission.findMany({
    where: { roleId },
    include: { permission: true },
  });

  const permissions = new Set(
    rolePermissions.map((rp) => `${rp.permission.module}:${rp.permission.action}`)
  );

  permissionCache.set(roleId, { permissions, expiresAt: Date.now() + CACHE_TTL });
  return permissions;
};

/** Clear permission cache (call after role changes) */
export const clearPermissionCache = (roleId?: string): void => {
  if (roleId) permissionCache.delete(roleId);
  else permissionCache.clear();
};

/**
 * Authorize a specific module + action pair
 * Usage: router.get('/', authenticate, authorize('inventory', 'read'), controller)
 */
export const authorize = (module: string, action: string) =>
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        sendForbidden(res);
        return;
      }

      // Super Admin bypasses all permission checks
      if (req.user.roleName === 'SUPER_ADMIN') {
        return next();
      }

      const permissions = await getPermissionsForRole(req.user.roleId);
      const required = `${module}:${action}`;

      if (!permissions.has(required)) {
        sendForbidden(res, `You do not have permission to ${action} ${module}`);
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };

/**
 * Authorize one of multiple roles (role-based check, not permission-based)
 */
export const authorizeRoles = (...allowedRoles: string[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendForbidden(res);
      return;
    }
    if (!allowedRoles.includes(req.user.roleName)) {
      sendForbidden(res, 'Your role does not have access to this resource');
      return;
    }
    next();
  };