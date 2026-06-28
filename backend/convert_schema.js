const fs = require('fs');

const path = './prisma/schema.prisma';
let schema = fs.readFileSync(path, 'utf8');

// 1. Remove @db.VarChar(...)
schema = schema.replace(/@db\.VarChar\(\d+\)/g, '');

// 2. Change Json types to String
schema = schema.replace(/ Json\?/g, ' String?');
schema = schema.replace(/ Json\b/g, ' String');

// 3. Handle Enums
const enumMatches = [...schema.matchAll(/enum\s+(\w+)\s+\{([\s\S]*?)\}/g)];

for (const match of enumMatches) {
  const enumName = match[1];
  const enumBody = match[2];
  
  // Get all values for this enum
  const values = enumBody.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('//'));
    
  // Replace the type definition everywhere
  // e.g. status UserStatus @default(ACTIVE) -> status String @default("ACTIVE")
  
  const typeRegex = new RegExp(`(\\w+)\\s+${enumName}(\\s+)@default\\(([^)]+)\\)`, 'g');
  schema = schema.replace(typeRegex, (m, p1, p2, p3) => {
    return `${p1} String${p2}@default("${p3}")`;
  });
  
  // Replace references without defaults
  const typeRegexNoDefault = new RegExp(`(\\w+)\\s+${enumName}(\\s*)$`, 'gm');
  schema = schema.replace(typeRegexNoDefault, `$1 String$2`);
  
  // Delete the enum definition entirely
  schema = schema.replace(match[0], `// Enum ${enumName} removed for SQLite`);
}

fs.writeFileSync(path, schema);
console.log('Schema converted to SQLite successfully.');
