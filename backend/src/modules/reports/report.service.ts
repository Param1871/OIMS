/**
 * HAL OIMS — Report Service
 * Phase 3: Analytics queries for all report types
 */
import { prisma } from '../../config/database';

export const reportService = {
  async inventoryReport(filters: any) {
    return prisma.inventoryItem.findMany({
      where: {
        deletedAt: null,
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.warehouseId && {
          stockLocations: { some: { warehouseId: filters.warehouseId } },
        }),
      },
      include: {
        category:    { select: { name: true } },
        subcategory: { select: { name: true } },
        vendor:      { select: { name: true } },
        stockLocations: { include: { warehouse: { select: { name: true } } } },
      },
      orderBy: { itemCode: 'asc' },
    });
  },

  async purchaseReport(filters: any) {
    const where: any = {
      ...(filters.fromDate && filters.toDate && {
        createdAt: { gte: new Date(filters.fromDate), lte: new Date(filters.toDate) },
      }),
      ...(filters.vendorId && { vendorId: filters.vendorId }),
      ...(filters.status   && { status: filters.status }),
    };
    return prisma.purchaseOrder.findMany({
      where,
      include: {
        vendor:    { select: { name: true, vendorCode: true } },
        createdBy: { select: { username: true } },
        items:     { include: { item: { select: { itemCode: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async lowStockReport() {
    return prisma.inventoryItem.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        currentQuantity: { lte: prisma.inventoryItem.fields.reorderLevel },
        reorderLevel: { gt: 0 },
      },
      include: {
        category: { select: { name: true } },
        vendor:   { select: { name: true, email: true, phone: true } },
      },
      orderBy: { currentQuantity: 'asc' },
    });
  },

  async abcAnalysis() {
    const items = await prisma.inventoryItem.findMany({
      where: { deletedAt: null, status: 'ACTIVE' },
      select: {
        id: true, itemCode: true, name: true,
        totalStockValueInr: true, currentQuantity: true, purchaseCostInr: true,
        category: { select: { name: true } },
      },
      orderBy: { totalStockValueInr: 'desc' },
    });

    const totalValue = items.reduce((sum, i) => sum + (i.totalStockValueInr || 0), 0);
    let cumulative = 0;

    return items.map((item) => {
      cumulative += item.totalStockValueInr || 0;
      const cumulativePercent = totalValue > 0 ? (cumulative / totalValue) * 100 : 0;
      const classification = cumulativePercent <= 70 ? 'A' : cumulativePercent <= 90 ? 'B' : 'C';
      return { ...item, cumulativePercent: Math.round(cumulativePercent * 100) / 100, classification };
    });
  },

  async stockMovementSummary(fromDate: string, toDate: string) {
    const transactions = await prisma.stockTransaction.groupBy({
      by: ['type'],
      where: {
        createdAt: { gte: new Date(fromDate), lte: new Date(toDate) },
      },
      _count: { _all: true },
      _sum: { quantity: true, totalCostInr: true },
    });
    return transactions;
  },

  async vendorReport() {
    const vendors = await prisma.vendor.findMany({
      where: { deletedAt: null },
      include: {
        _count: { select: { purchaseOrders: true } },
        purchaseOrders: {
          select: { totalAmountInr: true, status: true },
        },
      },
    });

    return vendors.map((v) => ({
      ...v,
      totalOrderValue: v.purchaseOrders.reduce((s, o) => s + o.totalAmountInr, 0),
      completedOrders: v.purchaseOrders.filter((o) => o.status === 'FULLY_RECEIVED').length,
    }));
  },

  async expiryAlertReport(daysThreshold = 90) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysThreshold);

    return prisma.inventoryItem.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        isExpiryTracked: true,
        expiryDate: { lte: threshold },
      },
      include: { category: true, vendor: { select: { name: true, email: true } } },
      orderBy: { expiryDate: 'asc' },
    });
  },

  async calibrationDueReport(daysThreshold = 30) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysThreshold);

    return prisma.calibrationRecord.findMany({
      where: { nextCalibrationDate: { lte: threshold } },
      orderBy: { nextCalibrationDate: 'asc' },
    });
  },

  async dashboardSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalItems, lowStock, outOfStock, totalValue,
      pendingPOs, todayTx, vendorCount, employeeCount] = await Promise.all([
      prisma.inventoryItem.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
      prisma.inventoryItem.count({ where: { deletedAt: null, status: 'ACTIVE', currentQuantity: { lte: 10 }, reorderLevel: { gt: 0 } } }),
      prisma.inventoryItem.count({ where: { deletedAt: null, status: 'ACTIVE', currentQuantity: { lte: 0 } } }),
      prisma.inventoryItem.aggregate({ where: { deletedAt: null }, _sum: { totalStockValueInr: true } }),
      prisma.purchaseOrder.count({ where: { status: { in: ['DRAFT', 'SENT_TO_VENDOR', 'ACKNOWLEDGED'] } } }),
      prisma.stockTransaction.count({ where: { createdAt: { gte: today } } }),
      prisma.vendor.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
      prisma.employee.count({ where: { deletedAt: null, isActive: true } }),
    ]);

    return {
      totalItems,
      lowStockItems:        lowStock,
      outOfStockItems:      outOfStock,
      totalStockValueInr:   totalValue._sum.totalStockValueInr || 0,
      pendingPurchaseOrders: pendingPOs,
      todayTransactions:    todayTx,
      activeVendors:        vendorCount,
      activeEmployees:      employeeCount,
    };
  },
};
