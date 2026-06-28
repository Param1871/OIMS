/**
 * HAL OIMS — Stock Transaction Service
 * Phase 3: Handles all stock movements with ledger entries
 */
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler.middleware';
import { parsePagination, buildMeta } from '../../shared/pagination';
import { generateTransactionNumber } from '../../shared/helpers';
import { emitStockChange } from '../../config/socket';
import { createAuditEntry } from '../../middleware/audit.middleware';
import { Request } from 'express';

export const transactionService = {
  async findAll(req: Request) {
    const { skip, take, page, pageSize } = parsePagination(req);
    const q = req.query;

    const where: any = {
      ...(q.itemId && { itemId: q.itemId }),
      ...(q.type   && { type: q.type }),
      ...(q.fromDate && q.toDate && {
        createdAt: { gte: new Date(q.fromDate as string), lte: new Date(q.toDate as string) },
      }),
    };

    const [transactions, total] = await Promise.all([
      prisma.stockTransaction.findMany({
        where, skip, take,
        orderBy: { createdAt: 'desc' },
        include: {
          item: { select: { itemCode: true, name: true, unit: true } },
          performedBy: { select: { username: true, firstName: true, lastName: true } },
          fromWarehouse: { select: { name: true, code: true } },
          toWarehouse:   { select: { name: true, code: true } },
        },
      }),
      prisma.stockTransaction.count({ where }),
    ]);

    return { transactions, meta: buildMeta(total, { skip, take, page, pageSize }) };
  },

  /**
   * Create a stock transaction and update inventory quantities
   * This is the core ledger operation — all stock changes go through here
   */
  async createTransaction(data: {
    type: string;
    itemId: string;
    quantity: number;
    fromWarehouseId?: string;
    toWarehouseId?: string;
    fromBinId?: string;
    toBinId?: string;
    unitCostInr?: number;
    batchNumber?: string;
    serialNumber?: string;
    referenceType?: string;
    referenceId?: string;
    reason?: string;
    remarks?: string;
    performedById: string;
  }) {
    // Get current item state
    const item = await prisma.inventoryItem.findFirst({
      where: { id: data.itemId, deletedAt: null },
    });
    if (!item) throw new AppError('Inventory item not found', 404);

    const { quantity, type } = data;

    // Determine quantity delta based on transaction type
    const outboundTypes = [
      'GOODS_OUT', 'DAMAGE', 'LOST', 'SCRAP',
      'RETURN_TO_VENDOR', 'ISSUE_TO_PRODUCTION',
      'TRANSFER_OUT', 'STOCK_ADJUSTMENT_MINUS',
    ];
    const isOutbound = outboundTypes.includes(type);

    if (isOutbound && item.currentQuantity < quantity) {
      throw new AppError(
        `Insufficient stock. Available: ${item.availableQuantity} ${item.unit}`,
        400
      );
    }

    const delta        = isOutbound ? -quantity : quantity;
    const balanceBefore = item.currentQuantity;
    const balanceAfter  = Math.max(0, balanceBefore + delta);

    // Run in a transaction to ensure atomicity
    const [txn] = await prisma.$transaction([
      // 1. Create transaction record
      prisma.stockTransaction.create({
        data: {
          transactionNumber: generateTransactionNumber(),
          type:              data.type as any,
          itemId:            data.itemId,
          fromWarehouseId:   data.fromWarehouseId,
          toWarehouseId:     data.toWarehouseId,
          fromBinId:         data.fromBinId,
          toBinId:           data.toBinId,
          quantity,
          balanceBefore,
          balanceAfter,
          unitCostInr:       data.unitCostInr,
          totalCostInr:      data.unitCostInr ? data.unitCostInr * quantity : undefined,
          batchNumber:       data.batchNumber,
          serialNumber:      data.serialNumber,
          referenceType:     data.referenceType,
          referenceId:       data.referenceId,
          reason:            data.reason,
          remarks:           data.remarks,
          performedById:     data.performedById,
        },
        include: {
          item: { select: { itemCode: true, name: true, unit: true } },
          performedBy: { select: { username: true } },
        },
      }),
      // 2. Update inventory quantities
      prisma.inventoryItem.update({
        where: { id: data.itemId },
        data: {
          currentQuantity:    balanceAfter,
          availableQuantity:  Math.max(0, balanceAfter - item.reservedQuantity),
          totalStockValueInr: balanceAfter * item.purchaseCostInr,
        },
      }),
    ]);

    // Emit real-time update to all clients
    emitStockChange({
      itemId:          item.id,
      itemCode:        item.itemCode,
      itemName:        item.name,
      transactionType: type,
      quantity,
      newQuantity:     balanceAfter,
      warehouseId:     data.toWarehouseId || data.fromWarehouseId,
      performedBy:     data.performedById,
    } as any);

    await createAuditEntry({
      userId:      data.performedById,
      action:      'CREATE',
      module:      'transaction',
      entityType:  'stock_transaction',
      entityId:    txn.id,
      description: `Stock ${type}: ${item.itemCode} — Qty: ${quantity} (Balance: ${balanceBefore} → ${balanceAfter})`,
    });

    return txn;
  },

  async getDailySummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayCount, goodsIn, goodsOut] = await Promise.all([
      prisma.stockTransaction.count({ where: { createdAt: { gte: today } } }),
      prisma.stockTransaction.count({ where: { createdAt: { gte: today }, type: 'GOODS_IN' } }),
      prisma.stockTransaction.count({ where: { createdAt: { gte: today }, type: 'GOODS_OUT' } }),
    ]);

    return { todayTotal: todayCount, goodsIn, goodsOut };
  },
};
