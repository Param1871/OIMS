import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding extra data (Purchase, Production, Maintenance)...');

  const adminUser = await prisma.user.findFirst({ where: { username: 'admin' } });
  const prodUser = await prisma.user.findFirst({ where: { username: 'prod.engineer' } });
  const purchaseUser = await prisma.user.findFirst({ where: { username: 'purchase.head' } });
  const vendor = await prisma.vendor.findFirst({ where: { vendorCode: 'VEN-002' } });
  const item1 = await prisma.inventoryItem.findFirst({ where: { itemCode: 'ITM-AEP-001' } });
  const item2 = await prisma.inventoryItem.findFirst({ where: { itemCode: 'ITM-BRG-001' } });

  if (!adminUser || !item1 || !vendor) {
    console.log('Core data missing. Run seed.ts first.');
    return;
  }

  // 1. Purchase Request
  const pr = await prisma.purchaseRequest.create({
    data: {
      prNumber: 'PR-2024-001',
      title: 'Restock of Turbine Blades',
      requestedById: prodUser?.id || adminUser.id,
      status: 'APPROVED',
      priority: 'HIGH',
      approvedById: purchaseUser?.id || adminUser.id,
      approvedAt: new Date(),
      items: {
        create: [
          { itemId: item1.id, requiredQuantity: 50, estimatedCostInr: 185000, unit: 'EACH' }
        ]
      }
    }
  });
  console.log('✅ Seeded Purchase Request');

  // 2. Purchase Order
  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2024-001',
      purchaseRequestId: pr.id,
      vendorId: vendor.id,
      createdById: purchaseUser?.id || adminUser.id,
      status: 'ISSUED',
      totalAmountInr: 9250000,
      items: {
        create: [
          { itemId: item1.id, orderedQuantity: 50, unitCostInr: 185000, totalCostInr: 9250000, unit: 'EACH' }
        ]
      }
    }
  });
  console.log('✅ Seeded Purchase Order');

  // 3. Work Order
  const wo = await prisma.workOrder.create({
    data: {
      woNumber: 'WO-PROD-2024-001',
      title: 'Assemble LPT Stage 1 Module',
      description: 'Standard assembly for engine module.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      plannedStart: new Date(),
      plannedEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      materials: {
        create: [
          { itemId: item1.id, requiredQty: 10, issuedQty: 0 },
          { itemId: item2?.id || item1.id, requiredQty: 20, issuedQty: 0 }
        ]
      }
    }
  });
  console.log('✅ Seeded Work Order');

  // 4. Maintenance Schedule
  const maint = await prisma.maintenanceSchedule.create({
    data: {
      scheduleNumber: 'MN-2024-001',
      title: 'Monthly Calibration for Ring Laser Gyro',
      assetCode: item1.itemCode,
      assetName: item1.name,
      assetType: 'INSTRUMENT',
      frequencyDays: 30,
      status: 'SCHEDULED',
      priority: 'HIGH',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      assignedToId: adminUser.id
    }
  });
  console.log('✅ Seeded Maintenance Schedule');

  console.log('🎉 Extra seed data successfully inserted.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
