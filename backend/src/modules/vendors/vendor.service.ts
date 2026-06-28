/**
 * HAL OIMS — Vendor Service
 */
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler.middleware';
import { parsePagination, buildMeta } from '../../shared/pagination';
import { Request } from 'express';

export const vendorService = {
  async findAll(req: Request) {
    const { skip, take, page, pageSize } = parsePagination(req);
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;

    const where: any = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { vendorCode: { contains: search, mode: 'insensitive' } },
          { gstNumber: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
    };

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where, skip, take,
        orderBy: { name: 'asc' },
        include: {
          contacts: { where: { isPrimary: true } },
          _count: { select: { purchaseOrders: true } },
        },
      }),
      prisma.vendor.count({ where }),
    ]);

    return { vendors, meta: buildMeta(total, { skip, take, page, pageSize }) };
  },

  async findById(id: string) {
    const vendor = await prisma.vendor.findFirst({
      where: { id, deletedAt: null },
      include: {
        contacts: true,
        purchaseOrders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: { poNumber: true, status: true, totalAmountInr: true, orderDate: true },
        },
        _count: { select: { purchaseOrders: true, items: true } },
      },
    });
    if (!vendor) throw new AppError('Vendor not found', 404);
    return vendor;
  },

  async create(data: any) {
    const existing = await prisma.vendor.findFirst({
      where: { OR: [{ vendorCode: data.vendorCode }, ...(data.gstNumber ? [{ gstNumber: data.gstNumber }] : [])], deletedAt: null },
    });
    if (existing) throw new AppError('Vendor code or GST number already exists', 409);
    return prisma.vendor.create({ data, include: { contacts: true } });
  },

  async update(id: string, data: any) {
    const vendor = await prisma.vendor.findFirst({ where: { id, deletedAt: null } });
    if (!vendor) throw new AppError('Vendor not found', 404);
    return prisma.vendor.update({ where: { id }, data, include: { contacts: true } });
  },

  async softDelete(id: string) {
    const vendor = await prisma.vendor.findFirst({ where: { id, deletedAt: null } });
    if (!vendor) throw new AppError('Vendor not found', 404);
    return prisma.vendor.update({ where: { id }, data: { deletedAt: new Date(), status: 'INACTIVE' } });
  },

  async addContact(vendorId: string, data: any) {
    return prisma.vendorContact.create({ data: { ...data, vendorId } });
  },

  async getPerformanceStats(id: string) {
    const orders = await prisma.purchaseOrder.findMany({
      where: { vendorId: id },
      select: { status: true, totalAmountInr: true, createdAt: true },
    });
    const totalOrders = orders.length;
    const totalValue  = orders.reduce((sum, o) => sum + o.totalAmountInr, 0);
    const completed   = orders.filter((o) => o.status === 'FULLY_RECEIVED').length;
    return { totalOrders, totalValue, completedOrders: completed, onTimeRate: totalOrders > 0 ? (completed / totalOrders) * 100 : 0 };
  },
};
