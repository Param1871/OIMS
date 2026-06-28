/**
 * HAL OIMS — Inventory Service
 * Phase 3: Business logic for inventory item management
 */
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler.middleware';
import { parsePagination, buildMeta } from '../../shared/pagination';
import { generateBarcode, generateQRCode } from '../../shared/helpers';
import { broadcastToAll } from '../../config/socket';
import { CONSTANTS } from '../../config/constants';
import { createAuditEntry } from '../../middleware/audit.middleware';
import { Request } from 'express';

export const inventoryService = {
  async findAll(req: Request) {
    const { skip, take, page, pageSize } = parsePagination(req);
    const q = req.query;

    const where: any = {
      deletedAt: null,
      ...(q.search && {
        OR: [
          { name:       { contains: q.search as string, mode: 'insensitive' } },
          { itemCode:   { contains: q.search as string, mode: 'insensitive' } },
          { partNumber: { contains: q.search as string, mode: 'insensitive' } },
          { barcodeValue: { contains: q.search as string, mode: 'insensitive' } },
          { qrCodeValue:  { contains: q.search as string, mode: 'insensitive' } },
        ],
      }),
      ...(q.categoryId    && { categoryId: q.categoryId }),
      ...(q.subcategoryId && { subcategoryId: q.subcategoryId }),
      ...(q.vendorId      && { vendorId: q.vendorId }),
      ...(q.manufacturerId && { manufacturerId: q.manufacturerId }),
      ...(q.status        && { status: q.status }),
      ...(q.isImported === 'true'  && { isImported: true }),
      ...(q.isCritical === 'true'  && { isCritical: true }),
      ...(q.lowStock === 'true'    && { currentQuantity: { lte: prisma.inventoryItem.fields.reorderLevel } }),
      ...(q.outOfStock === 'true'  && { currentQuantity: { lte: 0 } }),
    };

    const sortField = (q.sortBy as string) || 'createdAt';
    const sortOrder = (q.sortOrder as 'asc' | 'desc') || 'desc';

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where, skip, take,
        orderBy: { [sortField]: sortOrder },
        include: {
          category:     { select: { id: true, name: true, code: true } },
          subcategory:  { select: { id: true, name: true } },
          manufacturer: { select: { id: true, name: true, country: true } },
          vendor:       { select: { id: true, name: true, vendorCode: true } },
          stockLocations: {
            include: { warehouse: { select: { id: true, name: true, code: true } } },
          },
        },
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    return { items, meta: buildMeta(total, { skip, take, page, pageSize }) };
  },

  async findById(id: string) {
    const item = await prisma.inventoryItem.findFirst({
      where: { id, deletedAt: null },
      include: {
        category:     true,
        subcategory:  true,
        manufacturer: true,
        vendor:       true,
        batches:      true,
        serials:      { take: 50 },
        attachments:  true,
        stockLocations: {
          include: {
            warehouse: true,
            bin: { include: { shelf: { include: { rack: { include: { zone: true } } } } } },
          },
        },
      },
    });
    if (!item) throw new AppError('Inventory item not found', 404);
    return item;
  },

  async findByCode(code: string) {
    const item = await prisma.inventoryItem.findFirst({
      where: {
        OR: [
          { itemCode:     { equals: code } },
          { partNumber:   { equals: code } },
          { barcodeValue: { equals: code } },
          { qrCodeValue:  { equals: code } },
        ],
        deletedAt: null,
      },
      include: {
        category: true, vendor: true, manufacturer: true,
        stockLocations: { include: { warehouse: true } },
      },
    });
    if (!item) throw new AppError('Item not found by code/barcode/QR', 404);
    return item;
  },

  async create(data: any, userId: string) {
    // Check for duplicate itemCode
    const existing = await prisma.inventoryItem.findFirst({
      where: { OR: [{ itemCode: data.itemCode }, { partNumber: data.partNumber }], deletedAt: null },
    });
    if (existing) throw new AppError('Item code or part number already exists', 409);

    // Auto-generate barcode and QR if not provided
    if (!data.barcodeValue) data.barcodeValue = generateBarcode(data.itemCode);
    if (!data.qrCodeValue)  data.qrCodeValue  = generateQRCode(data.itemCode);

    const item = await prisma.inventoryItem.create({
      data: {
        ...data,
        currentQuantity:    0,
        reservedQuantity:   0,
        availableQuantity:  0,
        totalStockValueInr: 0,
      },
      include: { category: true, vendor: true },
    });

    await createAuditEntry({
      userId,
      action:      'CREATE',
      module:      'inventory',
      entityType:  'inventory_item',
      entityId:    item.id,
      description: `Created inventory item: ${item.itemCode} — ${item.name}`,
      newValues:   data,
    });

    broadcastToAll(CONSTANTS.SOCKET_EVENTS.INVENTORY_CREATED, {
      itemId: item.id, itemCode: item.itemCode, name: item.name,
    });

    return item;
  },

  async update(id: string, data: any, userId: string) {
    const existing = await prisma.inventoryItem.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new AppError('Inventory item not found', 404);

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...data,
        totalStockValueInr: (data.purchaseCostInr ?? existing.purchaseCostInr) * existing.currentQuantity,
      },
      include: { category: true, vendor: true },
    });

    await createAuditEntry({
      userId,
      action:      'UPDATE',
      module:      'inventory',
      entityType:  'inventory_item',
      entityId:    id,
      description: `Updated inventory item: ${existing.itemCode}`,
      oldValues:   existing as any,
      newValues:   data,
    });

    broadcastToAll(CONSTANTS.SOCKET_EVENTS.INVENTORY_UPDATED, {
      itemId: id, itemCode: updated.itemCode, name: updated.name,
    });

    return updated;
  },

  async softDelete(id: string, userId: string) {
    const item = await prisma.inventoryItem.findFirst({ where: { id, deletedAt: null } });
    if (!item) throw new AppError('Inventory item not found', 404);

    if (item.currentQuantity > 0) {
      throw new AppError('Cannot delete item with existing stock. Adjust stock to zero first.', 400);
    }

    await prisma.inventoryItem.update({ where: { id }, data: { deletedAt: new Date(), status: 'INACTIVE' } });

    await createAuditEntry({
      userId,
      action:      'DELETE',
      module:      'inventory',
      entityType:  'inventory_item',
      entityId:    id,
      description: `Deleted inventory item: ${item.itemCode}`,
    });
  },

  async getHistory(id: string, req: Request) {
    const { skip, take, page, pageSize } = parsePagination(req);
    const [transactions, total] = await Promise.all([
      prisma.stockTransaction.findMany({
        where: { itemId: id },
        skip, take,
        orderBy: { createdAt: 'desc' },
        include: {
          performedBy: { select: { username: true, firstName: true, lastName: true } },
          fromWarehouse: { select: { name: true } },
          toWarehouse:   { select: { name: true } },
        },
      }),
      prisma.stockTransaction.count({ where: { itemId: id } }),
    ]);
    return { transactions, meta: buildMeta(total, { skip, take, page, pageSize }) };
  },

  async getDashboardStats() {
    const [total, lowStock, outOfStock, totalValue, criticalItems] = await Promise.all([
      prisma.inventoryItem.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
      prisma.inventoryItem.count({
        where: {
          deletedAt: null, status: 'ACTIVE',
          currentQuantity: { lte: prisma.inventoryItem.fields.reorderLevel },
          reorderLevel: { gt: 0 },
        },
      }),
      prisma.inventoryItem.count({
        where: { deletedAt: null, status: 'ACTIVE', currentQuantity: { lte: 0 } },
      }),
      prisma.inventoryItem.aggregate({
        where: { deletedAt: null, status: 'ACTIVE' },
        _sum: { totalStockValueInr: true },
      }),
      prisma.inventoryItem.count({
        where: { deletedAt: null, isCritical: true, currentQuantity: { lte: prisma.inventoryItem.fields.reorderLevel } },
      }),
    ]);

    return {
      totalItems:         total,
      lowStockItems:      lowStock,
      outOfStockItems:    outOfStock,
      totalStockValueInr: totalValue._sum.totalStockValueInr || 0,
      criticalLowItems:   criticalItems,
    };
  },
};
