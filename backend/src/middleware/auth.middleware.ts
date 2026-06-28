/**
 * HAL OIMS — JWT Authentication Middleware
 * Phase 3: Verifies JWT, attaches user to request, checks account status
 */

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/constants';
import { prisma } from '../config/database';
import { sendUnauthorized } from '../shared/response';
import { AuthenticatedRequest, JWTPayload } from '../shared/types';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      sendUnauthorized(res, 'No token provided');
      return;
    }

    const token = authHeader.split(' ')[1];

    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    } catch (err) {
      const message = err instanceof jwt.TokenExpiredError
        ? 'Token expired. Please log in again.'
        : 'Invalid token.';
      sendUnauthorized(res, message);
      return;
    }

    // Fetch fresh user from DB to check status
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true, username: true, email: true,
        status: true, roleId: true,
        role: { select: { name: true } },
        lockedUntil: true,
      },
    });

    if (!user) {
      sendUnauthorized(res, 'User not found');
      return;
    }

    if (user.status !== 'ACTIVE') {
      sendUnauthorized(res, `Account is ${user.status.toLowerCase()}`);
      return;
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      sendUnauthorized(res, 'Account temporarily locked. Try again later.');
      return;
    }

    // Attach user to request
    req.user = {
      userId:   user.id,
      username: user.username,
      email:    user.email,
      roleId:   user.roleId,
      roleName: user.role.name,
      status:   user.status,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/** Optional authentication — doesn't fail if no token */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }
  return authenticate(req, res, next);
};