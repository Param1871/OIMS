const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    if (user.username === 'admin') continue; // keep admin as admin

    const baseName = `${user.firstName}.${user.lastName}`.toLowerCase().replace(/\s+/g, '');
    const newEmail = `${baseName}@hal-oims.local`;
    
    // Update User
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: newEmail,
        username: baseName // Also update username for consistency
      }
    });

    // Update Employee
    await prisma.employee.updateMany({
      where: { userId: user.id },
      data: {
        email: newEmail
      }
    });
    
    console.log(`Updated user ${user.firstName} ${user.lastName} -> ${baseName}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
