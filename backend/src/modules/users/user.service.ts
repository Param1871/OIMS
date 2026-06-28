/**
 * HAL OIMS — User Management Service
 * Phase 3: CRUD operations for system users
 */
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler.middleware';
import { CONSTANTS } from '../../config/constants';
import { parsePagination, buildMeta } from '../../shared/pagination';
import { Request } from 'express';

export const userService = {
  async findAll(req: Request) {
    const { skip, take, page, pageSize } = parsePagination(req);
    const search = req.query.search as string | undefined;
    const roleId = req.query.roleId as string | undefined;

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { username: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(roleId && { roleId }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip, take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, username: true, email: true,
          firstName: true, lastName: true, phone: true,
          status: true, lastLoginAt: true, createdAt: true,
          role: { select: { name: true, displayName: true } },
          employee: { select: { employeeCode: true, department: { select: { name: true } } } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, meta: buildMeta(total, { skip, take, page, pageSize }) };
  },

  async findById(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true, username: true, email: true,
        firstName: true, lastName: true, phone: true,
        avatar: true, status: true, lastLoginAt: true,
        createdAt: true, updatedAt: true,
        role: { select: { id: true, name: true, displayName: true } },
        employee: {
          select: {
            employeeCode: true,
            dateOfJoining: true,
            department: { select: { id: true, name: true } },
            designation: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  async create(data: {
    username: string; email: string; password: string;
    firstName: string; lastName: string; phone?: string;
    roleId: string; employeeCode?: string;
  }) {
    const exists = await prisma.user.findFirst({
      where: { OR: [{ username: data.username }, { email: data.email }], deletedAt: null },
    });
    if (exists) throw new AppError('Username or email already exists', 409);

    const passwordHash = await bcrypt.hash(data.password, CONSTANTS.BCRYPT_ROUNDS);
    return prisma.user.create({
      data: {
        username:     data.username,
        email:        data.email,
        passwordHash,
        firstName:    data.firstName,
        lastName:     data.lastName,
        phone:        data.phone,
        roleId:       data.roleId,
        employeeCode: data.employeeCode,
        forcePasswordChange: true,
      },
      select: {
        id: true, username: true, email: true,
        firstName: true, lastName: true, status: true,
        role: { select: { name: true, displayName: true } },
      },
    });
  },

  async update(id: string, data: any) {
    const user = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) throw new AppError('User not found', 404);
    return prisma.user.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    const user = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) throw new AppError('User not found', 404);
    return prisma.user.update({ where: { id }, data: { deletedAt: new Date(), status: 'INACTIVE' } });
  },

  async updateAvatar(id: string, avatarUrl: string) {
    return prisma.user.update({ where: { id }, data: { avatar: avatarUrl } });
  },
};
