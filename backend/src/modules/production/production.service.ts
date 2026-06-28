import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler.middleware';
import { generateDocNumber } from '../../shared/helpers';
import { transactionService } from '../transactions/transaction.service';

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

export const productionService = {
  async findAllWorkOrders() {
    return prisma.workOrder.findMany({
      include: { materials: { include: { item: true } } },
      orderBy: { createdAt: 'desc' }
    });
  },

  async createWorkOrder(data: any) {
    const seq = await getNextSeq('WO');
    const woNumber = generateDocNumber('WO', seq);

    return prisma.workOrder.create({
      data: {
        woNumber,
        title: data.title,
        status: 'DRAFT',
        priority: data.priority || 'NORMAL',
        plannedQuantity: data.plannedQuantity,
        materials: {
          create: data.materials?.map((m: any) => ({
            itemId: m.itemId,
            requiredQty: m.requiredQty,
          })) || []
        }
      },
      include: { materials: true }
    });
  },

  async updateWorkOrderStatus(id: string, status: string) {
    return prisma.workOrder.update({
      where: { id },
      data: { status }
    });
  },

  async findAllMaterialIssues() {
    return prisma.materialIssue.findMany({
      include: { 
        workOrder: true,
        items: { include: { item: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async createMaterialIssue(data: any, userId: string) {
    const seq = await getNextSeq('MI');
    const issueNumber = generateDocNumber('MI', seq);

    const issue = await prisma.materialIssue.create({
      data: {
        issueNumber,
        workOrderId: data.workOrderId,
        issuedById: userId,
        status: 'ISSUED',
        notes: data.notes,
        items: {
          create: data.items?.map((item: any) => ({
            itemId: item.itemId,
            issuedQty: item.issuedQty,
          })) || []
        }
      },
      include: { items: true }
    });

    // Create stock transactions for each item issued
    for (const item of issue.items) {
      await transactionService.createTransaction({
        type: 'ISSUE_TO_PRODUCTION',
        itemId: item.itemId,
        quantity: item.issuedQty,
        referenceType: 'WORK_ORDER',
        referenceId: data.workOrderId,
        performedById: userId,
      });
    }

    return issue;
  }
};
