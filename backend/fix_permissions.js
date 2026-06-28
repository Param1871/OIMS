const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany();
  const permissions = await prisma.permission.findMany();

  const rolePerms = [];

  for (const role of roles) {
    if (role.name === 'SUPER_ADMIN') continue; // Bypasses anyway
    
    // Give everyone READ access to common modules
    const readModules = ['inventory', 'warehouse', 'employee', 'report', 'transaction'];
    const readPerms = permissions.filter(p => readModules.includes(p.module) && p.action === 'read');
    
    for (const p of readPerms) {
      rolePerms.push({ roleId: role.id, permissionId: p.id });
    }

    // Role specific
    if (role.name === 'STORE_KEEPER' || role.name === 'INVENTORY_MANAGER') {
      const extraModules = ['inventory', 'transaction', 'warehouse'];
      const extraPerms = permissions.filter(p => extraModules.includes(p.module) && ['create', 'update', 'delete'].includes(p.action));
      for (const p of extraPerms) {
        rolePerms.push({ roleId: role.id, permissionId: p.id });
      }
    }
    
    if (role.name === 'PURCHASE_DEPARTMENT') {
      const extraModules = ['purchase', 'vendor'];
      const extraPerms = permissions.filter(p => extraModules.includes(p.module));
      for (const p of extraPerms) {
        rolePerms.push({ roleId: role.id, permissionId: p.id });
      }
    }
  }

  const uniquePerms = [...new Set(rolePerms.map(r => `${r.roleId}_${r.permissionId}`))].map(key => {
    const [roleId, permissionId] = key.split('_');
    return { roleId, permissionId };
  });

  for (const perm of uniquePerms) {
    try {
      await prisma.rolePermission.create({ data: perm });
    } catch (e) {
      // ignore
    }
  }
  
  console.log(`Assigned ${uniquePerms.length} permissions to roles.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
