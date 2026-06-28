const fs = require('fs');

const path = './prisma/seed.ts';
let seed = fs.readFileSync(path, 'utf8');

// Remove enum imports from PrismaClient import
seed = seed.replace(/import\s*\{\s*PrismaClient\s*,\s*[^}]+\}\s*from\s*'@prisma\/client';/, "import { PrismaClient } from '@prisma/client';");

// Replace enum usages with string literals (e.g. RoleName.SUPER_ADMIN -> 'SUPER_ADMIN')
const enumRegex = /(?:RoleName|UnitOfMeasure|CountryOfOrigin|WarehouseType|VendorStatus|ItemStatus|TransactionType)\.([A-Z_0-9]+)/g;
seed = seed.replace(enumRegex, "'$1'");

fs.writeFileSync(path, seed);
console.log('Seed file fixed successfully.');
