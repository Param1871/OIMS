/**
 * HAL OIMS — Purchase Service
 * Phase 3: PR → PO → GRN → Invoice flow
 */
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler.middleware';
import { parsePagination, buildMeta } from '../../shared/pagination';
import { generateDocNumber, generateTransactionNumber } from '../../shared/helpers';
import { createAuditEntry } from '../../middleware/audit.middleware';
import { broadcastToAll, broadcastToRole } from '../../config/socket';
import { CONSTANTS } from '../../config/constants';
import { transactionService } from '../transactions/transaction.service';
import { Request } from 'express';

// Helper: get next document sequence
const getNextSeq = async (prefix: string): Promise<number> => {
  const setting = await prisma.setting.findFirst({ where: { key: `seq.${prefix}` } });
  const seq = parseInt(setting?.value || '0') + 1;
  await prisma.setting.upsert({
    where: { key: `seq.${prefix}` },
    update: { value: String(seq) },
    create: { key: `seq.${prefix}`, value: String(seq), category: 'sequence' },
  });
  return seq;
};

export const purchaseService = {
  // ── Purchase Requests ──────────────────────────────────────────────────────────
  async findAllPRs(req: Request) {
    const { skip, take, page, pageSize } = parsePagination(req);
    const where: any = {
      ...(req.query.status && { status: req.query.status }),
      ...(req.query.priority && { priority: req.query.priority }),
    };
    const [prs, total] = await Promise.all([
      prisma.purchaseRequest.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: {
          requestedBy: { select: { username: true, firstName: true, lastName: true } },
          approvedBy:  { select: { username: true } },
          items: { include: { item: { select: { itemCode: true, name: true, unit: true } } } },
        },
      }),
      prisma.purchaseRequest.count({ where }),
    ]);
    return { prs, meta: buildMeta(total, { skip, take, page, pageSize }) };
  },

  async createPR(data: any, userId: string) {
    const seq = await getNextSeq('PR');
    const prNumber = generateDocNumber(CONSTANTS.PR_PREFIX, seq);

    const pr = await prisma.purchaseRequest.create({
      data: {
        prNumber,
        title:         data.title,
        requestedById: userId,
        departmentId:  data.departmentId,
        priority:      data.priority || 'NORMAL',
        requiredByDate: data.requiredByDate ? new Date(data.requiredByDate) : undefined,
        notes:         data.notes,
        status:        'DRAFT',
        items: {
          create: data.items?.map((item: any) => ({
            itemId:          item.itemId,
            vendorId:        item.vendorId,
            requiredQuantity: item.requiredQuantity,
            estimatedCostInr: item.estimatedCostInr,
            unit:            item.unit || 'EACH',
            specification:   item.specification,
          })) || [],
        },
      },
      include: { items: { include: { item: true } }, requestedBy: true },
    });

    broadcastToRole('PURCHASE_DEPARTMENT', CONSTANTS.SOCKET_EVENTS.PR_CREATED, { prNumber: pr.prNumber });
    broadcastToRole('INVENTORY_MANAGER',   CONSTANTS.SOCKET_EVENTS.PR_CREATED, { prNumber: pr.prNumber });

    return pr;
  },

  async submitPR(id: string, userId: string) {
    const pr = await prisma.purchaseRequest.findFirst({ where: { id } });
    if (!pr) throw new AppError('PR not found', 404);
    if (pr.status !== 'DRAFT') throw new AppError('Only DRAFT PRs can be submitted', 400);
    return prisma.purchaseRequest.update({ where: { id }, data: { status: 'SUBMITTED' } });
  },

  async approvePR(id: string, userId: string) {
    const pr = await prisma.purchaseRequest.findFirst({ where: { id } });
    if (!pr) throw new AppError('PR not found', 404);
    if (pr.status !== 'SUBMITTED') throw new AppError('Only SUBMITTED PRs can be approved', 400);

    const updated = await prisma.purchaseRequest.update({
      where: { id },
      data: { status: 'APPROVED', approvedById: userId, approvedAt: new Date() },
    });

    broadcastToAll(CONSTANTS.SOCKET_EVENTS.PR_APPROVED, { prNumber: pr.prNumber });
    await createAuditEntry({ userId, action: 'APPROVE', module: 'purchase', entityType: 'purchase_request', entityId: id, description: `PR ${pr.prNumber} approved` });
    return updated;
  },

  async rejectPR(id: string, userId: string, reason: string) {
    const pr = await prisma.purchaseRequest.findFirst({ where: { id } });
    if (!pr) throw new AppError('PR not found', 404);
    return prisma.purchaseRequest.update({
      where: { id },
      data: { status: 'REJECTED', rejectedAt: new Date(), rejectionReason: reason },
    });
  },

  // ── Purchase Orders ──────────────────────────────────────────────────────────
  async findAllPOs(req: Request) {
    const { skip, take, page, pageSize } = parsePagination(req);
    const where: any = {
      ...(req.query.status   && { status: req.query.status }),
      ...(req.query.vendorId && { vendorId: req.query.vendorId }),
    };
    const [pos, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: {
          vendor:    { select: { name: true, vendorCode: true } },
          createdBy: { select: { username: true } },
          items:     { include: { item: { select: { itemCode: true, name: true } } } },
        },
      }),
      prisma.purchaseOrder.count({ where }),
    ]);
    return { pos, meta: buildMeta(total, { skip, take, page, pageSize }) };
  },

  async createPO(data: any, userId: string) {
    const seq = await getNextSeq('PO');
    const poNumber = generateDocNumber(CONSTANTS.PO_PREFIX, seq);

    // Calculate totals
    const items = data.items || [];
    const subTotal = items.reduce((sum: number, i: any) => sum + (i.orderedQuantity * i.unitCostInr), 0);
    const taxAmount = items.reduce((sum: number, i: any) => sum + ((i.orderedQuantity * i.unitCostInr * (i.taxRatePercent || 18)) / 100), 0);

    return prisma.purchaseOrder.create({
      data: {
        poNumber,
        purchaseRequestId: data.purchaseRequestId,
        vendorId:          data.vendorId,
        createdById:       userId,
        expectedDate:      data.expectedDate ? new Date(data.expectedDate) : undefined,
        deliveryAddress:   data.deliveryAddress,
        paymentTerms:      data.paymentTerms,
        notes:             data.notes,
        subTotalInr:       subTotal,
        taxAmountInr:      taxAmount,
        totalAmountInr:    subTotal + taxAmount + (data.freightCharges || 0),
        freightCharges:    data.freightCharges || 0,
        status:            'DRAFT',
        items: {
          create: items.map((item: any) => ({
            itemId:          item.itemId,
            orderedQuantity: item.orderedQuantity,
            unitCostInr:     item.unitCostInr,
            taxRatePercent:  item.taxRatePercent || 18,
            taxAmountInr:    (item.orderedQuantity * item.unitCostInr * (item.taxRatePercent || 18)) / 100,
            totalCostInr:    item.orderedQuantity * item.unitCostInr,
            pendingQuantity: item.orderedQuantity,
            unit:            item.unit || 'EACH',
          })),
        },
      },
      include: { vendor: true, items: { include: { item: true } } },
    });
  },

  // ── GRN ────────────────────────────────────────────────────────────────────
  async findAllGRNs(req: Request) {
    const { skip, take, page, pageSize } = parsePagination(req);
    const where: any = {
      ...(req.query.status && { status: req.query.status }),
      ...(req.query.purchaseOrderId && { purchaseOrderId: req.query.purchaseOrderId }),
    };
    const [grns, total] = await Promise.all([
      prisma.goodsReceivedNote.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: {
          purchaseOrder: { include: { vendor: { select: { name: true, vendorCode: true } } } },
          receivedBy:    { select: { username: true } },
          items:         { include: { item: { select: { itemCode: true, name: true } } } },
        },
      }),
      prisma.goodsReceivedNote.count({ where }),
    ]);
    return { grns, meta: buildMeta(total, { skip, take, page, pageSize }) };
  },

  async createGRN(data: any, userId: string) {
    const seq = await getNextSeq('GRN');
    const grnNumber = generateDocNumber(CONSTANTS.GRN_PREFIX, seq);

    const grn = await prisma.goodsReceivedNote.create({
      data: {
        grnNumber,
        purchaseOrderId: data.purchaseOrderId,
        warehouseId:     data.warehouseId,
        receivedById:    userId,
        challanNumber:   data.challanNumber,
        vehicleNumber:   data.vehicleNumber,
        notes:           data.notes,
        status:          'DRAFT',
        items: {
          create: data.items.map((item: any) => ({
            itemId:      item.itemId,
            orderedQty:  item.orderedQty,
            receivedQty: item.receivedQty,
            acceptedQty: item.acceptedQty ?? item.receivedQty,
            rejectedQty: item.rejectedQty || 0,
            batchNumber: item.batchNumber,
            expiryDate:  item.expiryDate ? new Date(item.expiryDate) : undefined,
            unitCostInr: item.unitCostInr,
            totalCostInr: item.receivedQty * item.unitCostInr,
          })),
        },
      },
      include: { items: { include: { item: true } }, purchaseOrder: true },
    });

    broadcastToAll(CONSTANTS.SOCKET_EVENTS.GRN_POSTED, { grnNumber });
    return grn;
  },

  async postGRN(id: string, userId: string) {
    const grn = await prisma.goodsReceivedNote.findFirst({
      where: { id },
      include: { items: { include: { item: true } } },
    });
    if (!grn) throw new AppError('GRN not found', 404);
    if (grn.status === 'POSTED') throw new AppError('GRN is already posted', 400);

    // Post each item to stock
    for (const grnItem of grn.items) {
      if (grnItem.acceptedQty > 0) {
        await transactionService.createTransaction({
          type:           'RECEIVE_FROM_GRN',
          itemId:         grnItem.itemId,
          toWarehouseId:  grn.warehouseId || undefined,
          quantity:       grnItem.acceptedQty,
          unitCostInr:    grnItem.unitCostInr,
          batchNumber:    grnItem.batchNumber || undefined,
          referenceType:  'GRN',
          referenceId:    grn.id,
          performedById:  userId,
        });
      }
    }

    return prisma.goodsReceivedNote.update({ where: { id }, data: { status: 'POSTED' } });
  },
};
