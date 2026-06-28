import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding Stock Transactions...');

  const adminUser = await prisma.user.findFirst({ where: { username: 'admin' } });
  const item1 = await prisma.inventoryItem.findFirst({ where: { itemCode: 'ITM-AEP-001' } });
  const item2 = await prisma.inventoryItem.findFirst({ where: { itemCode: 'ITM-BRG-001' } });

  if (!adminUser || !item1 || !item2) {
    console.log('Core data missing. Run seed.ts first.');
    return;
  }

  await prisma.stockTransaction.create({
    data: {
      transactionNumber: 'TXN-2024-001',
      type: 'MANUAL_ADJUSTMENT_IN',
      itemId: item1.id,
      quantity: 10,
      balanceBefore: item1.currentQuantity - 10,
      balanceAfter: item1.currentQuantity,
      unitCostInr: item1.purchaseCostInr,
      totalCostInr: item1.purchaseCostInr * 10,
      referenceType: 'MANUAL',
      performedById: adminUser.id,
      reason: 'Initial stock correction',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    }
  });

  await prisma.stockTransaction.create({
    data: {
      transactionNumber: 'TXN-2024-002',
      type: 'MANUAL_ADJUSTMENT_OUT',
      itemId: item2.id,
      quantity: 5,
      balanceBefore: item2.currentQuantity + 5,
      balanceAfter: item2.currentQuantity,
      unitCostInr: item2.purchaseCostInr,
      totalCostInr: item2.purchaseCostInr * 5,
      referenceType: 'MANUAL',
      performedById: adminUser.id,
      reason: 'Damaged during transit',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
    }
  });

  console.log('🎉 Stock transactions seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
