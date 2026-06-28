/**
 * HAL OIMS — Warehouse Service
 */
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler.middleware';
import { parsePagination, buildMeta } from '../../shared/pagination';
import { transactionService } from '../transactions/transaction.service';
import { Request } from 'express';

export const warehouseService = {
  async findAll(req: Request) {
    const { skip, take, page, pageSize } = parsePagination(req);
    const search = req.query.search as string | undefined;

    const where: any = {
      deletedAt: null,
      isActive: true,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    const [warehouses, total] = await Promise.all([
      prisma.warehouse.findMany({
        where, skip, take,
        orderBy: { name: 'asc' },
        include: {
          zones: { include: { racks: { include: { shelves: { include: { bins: true } } } } } },
          _count: { select: { stockLocations: true } },
        },
      }),
      prisma.warehouse.count({ where }),
    ]);

    return { warehouses, meta: buildMeta(total, { skip, take, page, pageSize }) };
  },

  async findById(id: string) {
    const wh = await prisma.warehouse.findFirst({
      where: { id, deletedAt: null },
      include: {
        zones: {
          include: {
            racks: { include: { shelves: { include: { bins: true } } } },
          },
        },
        stockLocations: {
          take: 50,
          include: { item: { select: { itemCode: true, name: true, unit: true, currentQuantity: true } } },
        },
      },
    });
    if (!wh) throw new AppError('Warehouse not found', 404);
    return wh;
  },

  async create(data: any) {
    const existing = await prisma.warehouse.findFirst({ where: { code: data.code, deletedAt: null } });
    if (existing) throw new AppError('Warehouse code already exists', 409);
    return prisma.warehouse.create({ data });
  },

  async update(id: string, data: any) {
    const wh = await prisma.warehouse.findFirst({ where: { id, deletedAt: null } });
    if (!wh) throw new AppError('Warehouse not found', 404);
    return prisma.warehouse.update({ where: { id }, data });
  },

  async transferStock(data: {
    itemId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    performedById: string;
    reason?: string;
  }) {
    // TRANSFER_OUT from source
    await transactionService.createTransaction({
      type: 'TRANSFER_OUT',
      itemId: data.itemId,
      fromWarehouseId: data.fromWarehouseId,
      toWarehouseId: data.toWarehouseId,
      quantity: data.quantity,
      performedById: data.performedById,
      reason: data.reason,
      referenceType: 'TRANSFER',
    });

    // TRANSFER_IN to destination (quantity is already subtracted from main ledger)
    // Update stock_locations
    await prisma.stockLocation.upsert({
      where: { itemId_warehouseId_binId: { itemId: data.itemId, warehouseId: data.toWarehouseId, binId: null as any } },
      update: { quantity: { increment: data.quantity } },
      create: { itemId: data.itemId, warehouseId: data.toWarehouseId, quantity: data.quantity },
    });

    return { message: 'Transfer completed successfully' };
  },

  async getUtilization(id: string) {
    const locations = await prisma.stockLocation.findMany({
      where: { warehouseId: id },
      include: { item: { select: { name: true, unit: true, purchaseCostInr: true } } },
    });

    const totalItems  = locations.length;
    const totalValue  = locations.reduce((s, l) => s + l.quantity * (l.item.purchaseCostInr || 0), 0);

    return { totalItems, totalValueInr: totalValue, locations: locations.slice(0, 100) };
  },
};
