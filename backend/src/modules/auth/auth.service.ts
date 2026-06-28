/**
 * HAL OIMS — Auth Service
 * Phase 3: Business logic for login, token management, password operations
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../config/database';
import { env, CONSTANTS } from '../../config/constants';
import { logger } from '../../config/logger';
import { AppError } from '../../middleware/errorHandler.middleware';
import { createAuditEntry } from '../../middleware/audit.middleware';
import { JWTPayload } from '../../shared/types';

export const authService = {
  /**
   * Login — validates credentials and returns tokens
   */
  async login(username: string, password: string, ipAddress?: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
        deletedAt: null,
      },
      include: { 
        role: true,
        employee: {
          include: { designation: true }
        }
      },
    });

    if (!user) {
      throw new AppError('Invalid username or password', 401);
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new AppError(`Account locked. Try again in ${minutesLeft} minute(s)`, 423);
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError(`Account is ${user.status.toLowerCase()}. Contact administrator.`, 403);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      const attempts = user.failedLoginAttempts + 1;
      const shouldLock = attempts >= CONSTANTS.MAX_LOGIN_ATTEMPTS;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: attempts,
          lockedUntil: shouldLock
            ? new Date(Date.now() + CONSTANTS.LOCKOUT_MINUTES * 60000)
            : null,
        },
      });

      await createAuditEntry({
        userId: user.id,
        action: 'FAILED_LOGIN',
        module: 'auth',
        description: `Failed login attempt (${attempts}/${CONSTANTS.MAX_LOGIN_ATTEMPTS})`,
        ipAddress,
      });

      if (shouldLock) {
        throw new AppError(`Too many failed attempts. Account locked for ${CONSTANTS.LOCKOUT_MINUTES} minutes.`, 423);
      }

      throw new AppError('Invalid username or password', 401);
    }

    // Reset failed attempts on success
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    // Generate tokens
    const payload: JWTPayload = {
      userId:   user.id,
      username: user.username,
      email:    user.email,
      roleId:   user.roleId,
      roleName: user.role.name,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });

    const refreshToken = jwt.sign(
      { userId: user.id, tokenId: crypto.randomUUID() },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES as any }
    );

    await createAuditEntry({
      userId: user.id,
      action: 'LOGIN',
      module: 'auth',
      description: `User ${user.username} logged in`,
      ipAddress,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_EXPIRES_IN,
      forcePasswordChange: user.forcePasswordChange,
      user: {
        id:         user.id,
        username:   user.username,
        email:      user.email,
        firstName:  user.firstName,
        lastName:   user.lastName,
        avatar:     user.avatar,
        role:       user.role.name,
        roleDisplay: user.role.displayName,
        designation: user.employee?.designation?.name,
      },
    };
  },

  /**
   * Refresh access token
   */
  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { role: true },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new AppError('Invalid refresh token', 401);
      }

      const payload: JWTPayload = {
        userId:   user.id,
        username: user.username,
        email:    user.email,
        roleId:   user.roleId,
        roleName: user.role.name,
      };

      const accessToken = jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as any,
      });

      return { accessToken, expiresIn: env.JWT_EXPIRES_IN };
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  },

  /**
   * Change password (authenticated)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new AppError('Current password is incorrect', 400);

    const hash = await bcrypt.hash(newPassword, CONSTANTS.BCRYPT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hash,
        forcePasswordChange: false,
        passwordChangedAt: new Date(),
      },
    });

    await createAuditEntry({
      userId,
      action: 'UPDATE',
      module: 'auth',
      description: 'Password changed successfully',
    });
  },

  /**
   * Get current authenticated user profile
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, username: true, email: true,
        firstName: true, lastName: true, phone: true,
        avatar: true, status: true, lastLoginAt: true,
        forcePasswordChange: true,
        role: { select: { name: true, displayName: true } },
        employee: {
          select: {
            employeeCode: true,
            department: { select: { name: true } },
            designation: { select: { name: true } },
          },
        },
      },
    });

    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  /**
   * Logout — records audit log
   */
  async logout(userId: string, ipAddress?: string) {
    await createAuditEntry({
      userId,
      action: 'LOGOUT',
      module: 'auth',
      description: 'User logged out',
      ipAddress,
    });
  },
};
