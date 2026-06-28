/**
 * HAL OIMS — Employee Service
 */
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler.middleware';
import { parsePagination, buildMeta } from '../../shared/pagination';
import { Request } from 'express';

export const employeeService = {
  async findAll(req: Request) {
    const { skip, take, page, pageSize } = parsePagination(req);
    const search = req.query.search as string | undefined;
    const departmentId = req.query.departmentId as string | undefined;

    const where: any = {
      deletedAt: null,
      ...(search && {
        OR: [
          { firstName:    { contains: search, mode: 'insensitive' } },
          { lastName:     { contains: search, mode: 'insensitive' } },
          { email:        { contains: search, mode: 'insensitive' } },
          { employeeCode: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(departmentId && { departmentId }),
    };

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where, skip, take,
        orderBy: { firstName: 'asc' },
        include: {
          department:  { select: { id: true, name: true, code: true } },
          designation: { select: { id: true, name: true, grade: true } },
          user:        { select: { id: true, username: true, email: true, status: true, role: { select: { displayName: true } } } },
        },
      }),
      prisma.employee.count({ where }),
    ]);

    return { employees, meta: buildMeta(total, { skip, take, page, pageSize }) };
  },

  async create(data: any) {
    const { firstName, lastName, email, phone, employeeCode, departmentId, designationId } = data;
    const bcrypt = require('bcryptjs');
    const defaultPassword = await bcrypt.hash('Employee@2024!', 12);
    
    // Find READ_ONLY role or fallback
    const role = await prisma.role.findFirst({ where: { name: 'READ_ONLY' } });
    if (!role) throw new AppError('Default role not found', 500);

    const generatedUsername = `${firstName}.${lastName}`.toLowerCase().replace(/\s+/g, '');

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: generatedUsername,
          email,
          passwordHash: defaultPassword,
          firstName,
          lastName,
          employeeCode,
          roleId: role.id,
          status: 'ACTIVE',
          forcePasswordChange: true
        }
      });

      return tx.employee.create({
        data: {
          employeeCode,
          userId: user.id,
          departmentId,
          designationId,
          firstName,
          lastName,
          email,
          phone,
          dateOfJoining: new Date()
        }
      });
    });
  },

  async findById(id: string) {
    const emp = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
      include: {
        department:  true,
        designation: true,
        user:        { 
          select: { 
            username: true, email: true, status: true, lastLoginAt: true, role: true,
            stockTransactions: {
              take: 5,
              orderBy: { createdAt: 'desc' },
              include: { item: { select: { itemCode: true, name: true } } }
            },
            assignedTasks: {
              where: { status: { not: 'COMPLETED' } },
              orderBy: { createdAt: 'desc' },
              include: { assigner: { select: { firstName: true, lastName: true } } }
            }
          } 
        },
      },
    });
    if (!emp) throw new AppError('Employee not found', 404);
    return emp;
  },

  async remove(id: string) {
    const emp = await prisma.employee.findFirst({ where: { id, deletedAt: null } });
    if (!emp) throw new AppError('Employee not found', 404);
    
    // Soft delete employee and user
    return prisma.$transaction(async (tx) => {
      await tx.employee.update({
        where: { id },
        data: { deletedAt: new Date(), isActive: false }
      });
      if (emp.userId) {
        await tx.user.update({
          where: { id: emp.userId },
          data: { status: 'INACTIVE' }
        });
      }
    });
  },

  async getDepartments() {
    return prisma.department.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { employees: true } } },
      orderBy: { name: 'asc' },
    });
  },

  async getDesignations() {
    return prisma.designation.findMany({ orderBy: { level: 'desc' } });
  },
};
