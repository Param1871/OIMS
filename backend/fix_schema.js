const fs = require('fs');

const path = './prisma/schema.prisma';
let schema = fs.readFileSync(path, 'utf8');

const enumsToReplace = [
  'UserStatus', 'RoleName', 'TransactionType', 'PurchaseRequestStatus', 
  'PurchaseOrderStatus', 'GRNStatus', 'ItemStatus', 'UnitOfMeasure', 
  'CountryOfOrigin', 'MaintenanceStatus', 'WorkOrderStatus', 'NotificationType', 
  'NotificationSeverity', 'AuditAction', 'WarehouseType', 'VendorStatus', 
  'InvoiceStatus', 'IssuePriority', 'CalibrationResult'
];

enumsToReplace.forEach(e => {
  // Replace instances where the enum is used as a type (e.g., `name RoleName @unique`)
  // We use word boundaries \b to ensure we match the exact type name.
  // We replace it with String
  const regex = new RegExp(`\\b${e}\\b`, 'g');
  schema = schema.replace(regex, 'String');
});

fs.writeFileSync(path, schema);
console.log('Schema fixed successfully.');
