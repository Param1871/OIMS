/**
 * HAL OIMS — Database Seed Script
 * Phase 2: Sample data with HAL-realistic inventory items
 * Run: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting HAL OIMS database seed...');

  // ─── 1. ROLES ──────────────────────────────────────────────────────────────
  console.log('📋 Seeding roles...');
  const roleData = [
    { name: 'SUPER_ADMIN', displayName: 'Super Administrator', description: 'Full system access with all permissions' },
    { name: 'INVENTORY_MANAGER', displayName: 'Inventory Manager', description: 'Manages inventory, stock levels, and movements' },
    { name: 'STORE_KEEPER', displayName: 'Store Keeper', description: 'Day-to-day store operations, GRN, issue, receipt' },
    { name: 'PURCHASE_DEPARTMENT', displayName: 'Purchase Department', description: 'Manages purchase requests, orders, and vendor relations' },
    { name: 'PRODUCTION_DEPARTMENT', displayName: 'Production Department', description: 'Work orders, material issue requests, production tracking' },
    { name: 'QUALITY_DEPARTMENT', displayName: 'Quality Department', description: 'Quality inspection, GRN approval, calibration records' },
    { name: 'MAINTENANCE_DEPARTMENT', displayName: 'Maintenance Department', description: 'Equipment maintenance, calibration, repair history' },
    { name: 'FINANCE_DEPARTMENT', displayName: 'Finance Department', description: 'Invoice management, purchase cost analysis, reports' },
    { name: 'AUDITOR', displayName: 'Auditor', description: 'Read-only access to all modules including audit logs' },
    { name: 'READ_ONLY', displayName: 'Read Only User', description: 'View-only access to non-sensitive inventory data' },
  ];

  const roles: Record<string, any> = {};
  for (const r of roleData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
    roles[r.name] = role;
    console.log(`  ✅ Role: ${r.displayName}`);
  }

  // ─── 2. PERMISSIONS ────────────────────────────────────────────────────────
  console.log('🔐 Seeding permissions...');
  const modules = ['inventory', 'warehouse', 'purchase', 'vendor', 'transaction',
    'production', 'maintenance', 'employee', 'report', 'audit', 'notification', 'settings'];
  const actions = ['create', 'read', 'update', 'delete', 'approve', 'reject', 'export', 'import'];

  for (const mod of modules) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: { module_action: { module: mod, action } },
        update: {},
        create: {
          module: mod,
          action,
          displayName: `${action.charAt(0).toUpperCase() + action.slice(1)} ${mod}`,
        },
      });
    }
  }
  console.log(`  ✅ ${modules.length * actions.length} permissions created`);

  // ─── 3. DEPARTMENTS ────────────────────────────────────────────────────────
  console.log('🏭 Seeding departments...');
  const deptData = [
    { code: 'PROD-01', name: 'Aircraft Production Division', description: 'Manufacturing of fighter and trainer aircraft' },
    { code: 'PROD-02', name: 'Helicopter Manufacturing Division', description: 'Production of light and medium helicopters' },
    { code: 'ENGN-01', name: 'Aero Engine Division', description: 'Design, manufacturing and overhaul of aero engines' },
    { code: 'QUAL-01', name: 'Quality Assurance & Control', description: 'Quality inspection, certification and calibration' },
    { code: 'MAINT-01', name: 'Maintenance, Repair & Overhaul (MRO)', description: 'Aircraft and equipment maintenance' },
    { code: 'PURCH-01', name: 'Purchase & Procurement', description: 'Vendor management and procurement' },
    { code: 'STORE-01', name: 'Central Stores', description: 'Inventory storage and distribution' },
    { code: 'FIN-01', name: 'Finance & Accounts', description: 'Financial management and cost accounting' },
    { code: 'TOOL-01', name: 'Tool Room & Metrology', description: 'Tool management and precision measurement' },
    { code: 'IT-01', name: 'Information Technology', description: 'IT infrastructure and systems' },
  ];

  const depts: Record<string, any> = {};
  for (const d of deptData) {
    const dept = await prisma.department.upsert({
      where: { code: d.code },
      update: {},
      create: d,
    });
    depts[d.code] = dept;
  }
  console.log(`  ✅ ${deptData.length} departments seeded`);

  // ─── 4. DESIGNATIONS ───────────────────────────────────────────────────────
  console.log('👔 Seeding designations...');
  const desigData = [
    { code: 'GM', name: 'General Manager', grade: 'E9', level: 10 },
    { code: 'DGM', name: 'Deputy General Manager', grade: 'E8', level: 9 },
    { code: 'AGM', name: 'Assistant General Manager', grade: 'E7', level: 8 },
    { code: 'MGR', name: 'Manager', grade: 'E6', level: 7 },
    { code: 'SMGR', name: 'Senior Manager', grade: 'E5', level: 6 },
    { code: 'ENGG', name: 'Engineer', grade: 'E4', level: 5 },
    { code: 'SENGG', name: 'Senior Engineer', grade: 'E5', level: 6 },
    { code: 'SUPV', name: 'Supervisor', grade: 'S3', level: 4 },
    { code: 'TECH', name: 'Technician', grade: 'S2', level: 3 },
    { code: 'STORE_KPR', name: 'Store Keeper', grade: 'S1', level: 2 },
    { code: 'ASST', name: 'Assistant', grade: 'C1', level: 1 },
  ];

  const desigs: Record<string, any> = {};
  for (const d of desigData) {
    const desig = await prisma.designation.upsert({
      where: { code: d.code },
      update: {},
      create: d,
    });
    desigs[d.code] = desig;
  }
  console.log(`  ✅ ${desigData.length} designations seeded`);

  // ─── 5. USERS & EMPLOYEES ──────────────────────────────────────────────────
  console.log('👤 Seeding users and employees...');
  const adminPassword = await bcrypt.hash('HAL@2024!', 12);
  const employeePassword = await bcrypt.hash('Employee@2024!', 12);

  const usersData = [
    { username: 'admin', email: 'admin@hal-oims.local', firstName: 'System', lastName: 'Administrator',
      role: 'SUPER_ADMIN', empCode: 'HAL-EMP-001', deptCode: 'IT-01', desigCode: 'GM' },
    { username: 'rajesh.kumar', email: 'inv.manager@hal-oims.local', firstName: 'Rajesh', lastName: 'Kumar',
      role: 'INVENTORY_MANAGER', empCode: 'HAL-EMP-002', deptCode: 'STORE-01', desigCode: 'MGR' },
    { username: 'suresh.nair', email: 'sk1@hal-oims.local', firstName: 'Suresh', lastName: 'Nair',
      role: 'STORE_KEEPER', empCode: 'HAL-EMP-003', deptCode: 'STORE-01', desigCode: 'STORE_KPR' },
    { username: 'priya.sharma', email: 'purchase@hal-oims.local', firstName: 'Priya', lastName: 'Sharma',
      role: 'PURCHASE_DEPARTMENT', empCode: 'HAL-EMP-004', deptCode: 'PURCH-01', desigCode: 'SMGR' },
    { username: 'vikram.singh', email: 'prod@hal-oims.local', firstName: 'Vikram', lastName: 'Singh',
      role: 'PRODUCTION_DEPARTMENT', empCode: 'HAL-EMP-005', deptCode: 'PROD-01', desigCode: 'SENGG' },
    { username: 'anitha.reddy', email: 'qa@hal-oims.local', firstName: 'Anitha', lastName: 'Reddy',
      role: 'QUALITY_DEPARTMENT', empCode: 'HAL-EMP-006', deptCode: 'QUAL-01', desigCode: 'ENGG' },
    { username: 'ravi.pillai', email: 'maint@hal-oims.local', firstName: 'Ravi', lastName: 'Pillai',
      role: 'MAINTENANCE_DEPARTMENT', empCode: 'HAL-EMP-007', deptCode: 'MAINT-01', desigCode: 'SUPV' },
    { username: 'meera.iyer', email: 'finance@hal-oims.local', firstName: 'Meera', lastName: 'Iyer',
      role: 'FINANCE_DEPARTMENT', empCode: 'HAL-EMP-008', deptCode: 'FIN-01', desigCode: 'MGR' },
    { username: 'sanjay.gupta', email: 'auditor@hal-oims.local', firstName: 'Sanjay', lastName: 'Gupta',
      role: 'AUDITOR', empCode: 'HAL-EMP-009', deptCode: 'FIN-01', desigCode: 'SENGG' },
    { username: 'deepa.menon', email: 'readonly@hal-oims.local', firstName: 'Deepa', lastName: 'Menon',
      role: 'READ_ONLY', empCode: 'HAL-EMP-010', deptCode: 'PROD-02', desigCode: 'TECH' },
  ];

  for (const u of usersData) {
    const isSpecialAdmin = u.username === 'admin';
    const pwdHash = isSpecialAdmin ? adminPassword : employeePassword;
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: {
        passwordHash: pwdHash,
      },
      create: {
        username: u.username,
        email: u.email,
        passwordHash: pwdHash,
        firstName: u.firstName,
        lastName: u.lastName,
        employeeCode: u.empCode,
        roleId: roles[u.role].id,
        status: 'ACTIVE',
        forcePasswordChange: true,
      },
    });

    await prisma.employee.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        employeeCode: u.empCode,
        userId: user.id,
        departmentId: depts[u.deptCode].id,
        designationId: desigs[u.desigCode].id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        dateOfJoining: new Date('2020-01-01'),
      },
    });
  }
  console.log(`  ✅ ${usersData.length} users and employees seeded`);

  // ─── 6. WAREHOUSES ─────────────────────────────────────────────────────────
  console.log('🏠 Seeding warehouses...');
  const whData = [
    { code: 'WH-MAIN-01', name: 'Central Raw Material Store', type: 'MAIN',
      address: 'HAL Campus, Sector-A', city: 'Bengaluru', state: 'Karnataka', pincode: '560017' },
    { code: 'WH-MAIN-02', name: 'Component & Spares Store', type: 'MAIN',
      address: 'HAL Campus, Sector-B', city: 'Bengaluru', state: 'Karnataka', pincode: '560017' },
    { code: 'WH-TOOL-01', name: 'Tool Crib — Production Floor', type: 'TOOL_CRIB',
      address: 'HAL Campus, Production Block-1', city: 'Bengaluru', state: 'Karnataka', pincode: '560017' },
    { code: 'WH-QUAR-01', name: 'Quarantine Store', type: 'QUARANTINE',
      address: 'HAL Campus, QC Block', city: 'Bengaluru', state: 'Karnataka', pincode: '560017' },
    { code: 'WH-SCRAP-01', name: 'Scrap Yard', type: 'SCRAP',
      address: 'HAL Campus, Yard-D', city: 'Bengaluru', state: 'Karnataka', pincode: '560017' },
    { code: 'WH-BOND-01', name: 'Bonded Warehouse — Imports', type: 'BONDED',
      address: 'HAL Campus, Customs Section', city: 'Bengaluru', state: 'Karnataka', pincode: '560017' },
  ];

  const warehouses: Record<string, any> = {};
  for (const w of whData) {
    const wh = await prisma.warehouse.upsert({
      where: { code: w.code },
      update: {},
      create: w,
    });
    warehouses[w.code] = wh;
  }
  console.log(`  ✅ ${whData.length} warehouses seeded`);

  // Create zones, racks, shelves, bins for WH-MAIN-01
  const mainWh = warehouses['WH-MAIN-01'];
  const zoneA = await prisma.zone.upsert({
    where: { warehouseId_code: { warehouseId: mainWh.id, code: 'Z-A' } },
    update: {},
    create: { warehouseId: mainWh.id, code: 'Z-A', name: 'Zone A — Raw Materials' },
  });
  const zoneB = await prisma.zone.upsert({
    where: { warehouseId_code: { warehouseId: mainWh.id, code: 'Z-B' } },
    update: {},
    create: { warehouseId: mainWh.id, code: 'Z-B', name: 'Zone B — Engine Components' },
  });

  for (const rCode of ['R-01', 'R-02', 'R-03']) {
    const rack = await prisma.rack.upsert({
      where: { zoneId_code: { zoneId: zoneA.id, code: rCode } },
      update: {},
      create: { zoneId: zoneA.id, code: rCode, name: `Rack ${rCode}`, maxCapacity: 2000 },
    });
    for (const sCode of ['S-01', 'S-02', 'S-03', 'S-04']) {
      const shelf = await prisma.shelf.upsert({
        where: { rackId_code: { rackId: rack.id, code: sCode } },
        update: {},
        create: { rackId: rack.id, code: sCode, name: `Shelf ${sCode}` },
      });
      for (const bCode of ['B-01', 'B-02', 'B-03', 'B-04', 'B-05']) {
        await prisma.bin.upsert({
          where: { shelfId_code: { shelfId: shelf.id, code: bCode } },
          update: {},
          create: { shelfId: shelf.id, code: bCode, name: `Bin ${bCode}`, maxWeight: 150 },
        });
      }
    }
  }
  console.log('  ✅ Zones, racks, shelves, bins seeded for WH-MAIN-01');

  // ─── 7. CATEGORIES ─────────────────────────────────────────────────────────
  console.log('📁 Seeding categories...');
  const catData = [
    { code: 'CAT-AEP', name: 'Aero Engine Parts', description: 'Components for turbojet, turbofan and turboshaft engines' },
    { code: 'CAT-AFC', name: 'Airframe Components', description: 'Structural and aerodynamic parts for aircraft' },
    { code: 'CAT-HYD', name: 'Hydraulic Systems', description: 'Hydraulic pumps, actuators, valves and fittings' },
    { code: 'CAT-AVN', name: 'Avionics & Electronics', description: 'Navigation, communication and electronic systems' },
    { code: 'CAT-ELC', name: 'Electrical Components', description: 'Wiring harnesses, connectors, switches and relays' },
    { code: 'CAT-FAS', name: 'Fasteners & Hardware', description: 'Bolts, nuts, rivets, screws and washers' },
    { code: 'CAT-BRG', name: 'Bearings', description: 'Ball bearings, roller bearings and needle bearings' },
    { code: 'CAT-SEAL', name: 'Seals & Gaskets', description: 'O-rings, oil seals, gaskets and packings' },
    { code: 'CAT-LUB', name: 'Lubricants & Fluids', description: 'Engine oils, greases, hydraulic fluids and coolants' },
    { code: 'CAT-COMP', name: 'Composite Materials', description: 'Carbon fibre, glass fibre, Kevlar and prepregs' },
    { code: 'CAT-TOOL', name: 'Tools & Instruments', description: 'Hand tools, jigs, fixtures and measuring instruments' },
    { code: 'CAT-SAFE', name: 'Safety Equipment', description: 'PPE, fire safety and emergency equipment' },
    { code: 'CAT-PACK', name: 'Packaging Materials', description: 'Crates, foam, bubble wrap, desiccants and straps' },
    { code: 'CAT-MISS', name: 'Missile Components', description: 'Guidance, propulsion and structural missile parts' },
    { code: 'CAT-UAV', name: 'UAV Components', description: 'Unmanned aerial vehicle frames, motors and sensors' },
  ];

  const cats: Record<string, any> = {};
  for (const c of catData) {
    const cat = await prisma.category.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
    cats[c.code] = cat;
  }
  console.log(`  ✅ ${catData.length} categories seeded`);

  // Subcategories
  const subCatData = [
    { categoryCode: 'CAT-AEP', code: 'SUB-TB', name: 'Turbine Blades', description: 'High-temperature turbine blades and vanes' },
    { categoryCode: 'CAT-AEP', code: 'SUB-CBS', name: 'Combustion Chamber Components', description: 'Liners, injectors and igniters' },
    { categoryCode: 'CAT-AEP', code: 'SUB-CMP', name: 'Compressor Parts', description: 'Compressor blades, discs and stators' },
    { categoryCode: 'CAT-AEP', code: 'SUB-NZZL', name: 'Nozzle & Afterburner Parts', description: 'Exhaust nozzles and afterburner components' },
    { categoryCode: 'CAT-AFC', code: 'SUB-FUS', name: 'Fuselage Panels', description: 'Skin panels, frames and stringers' },
    { categoryCode: 'CAT-AFC', code: 'SUB-WING', name: 'Wing Structures', description: 'Wing ribs, spars and leading edges' },
    { categoryCode: 'CAT-AFC', code: 'SUB-LDG', name: 'Landing Gear Components', description: 'Main gear, nose gear and brake assemblies' },
    { categoryCode: 'CAT-HYD', code: 'SUB-PUMP', name: 'Hydraulic Pumps', description: 'Gear pumps and piston pumps' },
    { categoryCode: 'CAT-HYD', code: 'SUB-VALVE', name: 'Hydraulic Valves', description: 'Directional and pressure control valves' },
    { categoryCode: 'CAT-AVN', code: 'SUB-NAV', name: 'Navigation Systems', description: 'INS, GPS and attitude indicators' },
    { categoryCode: 'CAT-FAS', code: 'SUB-BOLT', name: 'Bolts & Screws', description: 'Hex bolts, machine screws and studs' },
    { categoryCode: 'CAT-FAS', code: 'SUB-RIVET', name: 'Rivets', description: 'Solid, blind and pop rivets' },
    { categoryCode: 'CAT-BRG', code: 'SUB-BALL', name: 'Ball Bearings', description: 'Deep groove and angular contact ball bearings' },
    { categoryCode: 'CAT-BRG', code: 'SUB-ROLLER', name: 'Roller Bearings', description: 'Cylindrical and tapered roller bearings' },
    { categoryCode: 'CAT-COMP', code: 'SUB-CFRP', name: 'Carbon Fibre Prepreg', description: 'UD and woven CFRP prepregs' },
  ];

  for (const sc of subCatData) {
    await prisma.subcategory.upsert({
      where: { code: sc.code },
      update: {},
      create: {
        categoryId: cats[sc.categoryCode].id,
        code: sc.code,
        name: sc.name,
        description: sc.description,
      },
    });
  }
  console.log(`  ✅ ${subCatData.length} subcategories seeded`);

  // ─── 8. MANUFACTURERS ──────────────────────────────────────────────────────
  console.log('🏗️ Seeding manufacturers...');
  const mfgData = [
    { code: 'MFG-HAL', name: 'Hindustan Aeronautics Limited (Indigenous)', country: 'INDIA' },
    { code: 'MFG-SNECMA', name: 'Safran Aircraft Engines (SNECMA)', country: 'FRANCE' },
    { code: 'MFG-GE', name: 'GE Aerospace', country: 'USA' },
    { code: 'MFG-RR', name: 'Rolls-Royce Holdings plc', country: 'UK' },
    { code: 'MFG-SKF', name: 'SKF Group', country: 'SWEDEN' },
    { code: 'MFG-FAG', name: 'Schaeffler / FAG Bearings', country: 'GERMANY' },
    { code: 'MFG-PARKER', name: 'Parker Hannifin Corporation', country: 'USA' },
    { code: 'MFG-MOOG', name: 'Moog Inc.', country: 'USA' },
    { code: 'MFG-ELBIT', name: 'Elbit Systems Ltd.', country: 'ISRAEL' },
    { code: 'MFG-BEL', name: 'Bharat Electronics Limited (BEL)', country: 'INDIA' },
    { code: 'MFG-ISRO', name: 'ISRO — Indigenous Space Components', country: 'INDIA' },
    { code: 'MFG-TORAY', name: 'Toray Industries (Composite Materials)', country: 'JAPAN' },
    { code: 'MFG-HEXCEL', name: 'Hexcel Corporation', country: 'USA' },
  ];

  const mfgs: Record<string, any> = {};
  for (const m of mfgData) {
    const mfg = await prisma.manufacturer.upsert({
      where: { code: m.code },
      update: {},
      create: m,
    });
    mfgs[m.code] = mfg;
  }
  console.log(`  ✅ ${mfgData.length} manufacturers seeded`);

  // ─── 9. VENDORS ────────────────────────────────────────────────────────────
  console.log('🤝 Seeding vendors...');
  const vendorData = [
    { vendorCode: 'VEN-001', name: 'Mishra Dhatu Nigam Ltd (MIDHANI)', gstNumber: '36AAACM7398J1ZH',
      panNumber: 'AAACM7398J', city: 'Hyderabad', state: 'Telangana', phone: '040-24340752',
      email: 'procurement@midhani.gov.in', paymentTerms: 'Net 45', performanceRating: 4.8,
      isApprovedVendor: true },
    { vendorCode: 'VEN-002', name: 'Bharat Forge Limited', gstNumber: '27AAACB0207M1ZY',
      panNumber: 'AAACB0207M', city: 'Pune', state: 'Maharashtra', phone: '020-66005500',
      email: 'aero@bharatforge.com', paymentTerms: 'Net 30', performanceRating: 4.5,
      isApprovedVendor: true },
    { vendorCode: 'VEN-003', name: 'Tata Advanced Systems Limited', gstNumber: '29AADCT2534P1ZV',
      panNumber: 'AADCT2534P', city: 'Bengaluru', state: 'Karnataka', phone: '080-67496000',
      email: 'defense@tataadvanced.com', paymentTerms: 'Net 30', performanceRating: 4.6,
      isApprovedVendor: true },
    { vendorCode: 'VEN-004', name: 'Walchandnagar Industries Ltd', gstNumber: '27AAACW0004A1ZH',
      panNumber: 'AAACW0004A', city: 'Walchandnagar', state: 'Maharashtra', phone: '02169-262001',
      email: 'wil@walchand.com', paymentTerms: 'Advance 20%, Net 60', performanceRating: 4.2,
      isApprovedVendor: true },
    { vendorCode: 'VEN-005', name: 'Dynamatic Technologies Ltd', gstNumber: '29AAACE2048F1ZX',
      panNumber: 'AAACE2048F', city: 'Bengaluru', state: 'Karnataka', phone: '080-28393700',
      email: 'aero@dynamatic.com', paymentTerms: 'Net 45', performanceRating: 4.3,
      isApprovedVendor: true },
    { vendorCode: 'VEN-006', name: 'Premier Explosives Ltd', gstNumber: '36AAACE2048F1ZR',
      panNumber: 'AAACE2049F', city: 'Hyderabad', state: 'Telangana', phone: '040-27704070',
      email: 'procurement@pelndia.com', paymentTerms: 'Advance 50%', performanceRating: 4.0,
      isApprovedVendor: false },
    { vendorCode: 'VEN-007', name: 'Larsen & Toubro Aerospace', gstNumber: '27AAACL0007A1ZY',
      panNumber: 'AAACL0007A', city: 'Mumbai', state: 'Maharashtra', phone: '022-67521656',
      email: 'aerospace@lntecc.com', paymentTerms: 'Net 30', performanceRating: 4.7,
      isApprovedVendor: true },
    { vendorCode: 'VEN-008', name: 'Godrej Aerospace', gstNumber: '27AAACG1234B1ZK',
      panNumber: 'AAACG1234B', city: 'Mumbai', state: 'Maharashtra', phone: '022-67960000',
      email: 'aerospace@godrej.com', paymentTerms: 'Net 45', performanceRating: 4.4,
      isApprovedVendor: true },
  ];

  const vendors: Record<string, any> = {};
  for (const v of vendorData) {
    const vendor = await prisma.vendor.upsert({
      where: { vendorCode: v.vendorCode },
      update: {},
      create: {
        ...v,
        country: 'India',
        currency: 'INR',
        status: 'ACTIVE',
      },
    });
    vendors[v.vendorCode] = vendor;
  }
  console.log(`  ✅ ${vendorData.length} vendors seeded`);

  // ─── 10. INVENTORY ITEMS ───────────────────────────────────────────────────
  console.log('📦 Seeding inventory items (HAL-realistic)...');

  // Fetch subcategories for linking
  const allSubCats = await prisma.subcategory.findMany();
  const subCatMap: Record<string, string> = {};
  allSubCats.forEach(sc => { subCatMap[sc.code] = sc.id; });

  const inventoryItems = [
    // Engine Parts
    { itemCode: 'ITM-AEP-001', partNumber: 'TB-LPT-001-HAL', name: 'Low Pressure Turbine Blade — Stage 1',
      catCode: 'CAT-AEP', subCatCode: 'SUB-TB', mfgCode: 'MFG-HAL', vendorCode: 'VEN-001',
      country: 'INDIA', unit: 'EACH',
      qty: 250, minStock: 50, maxStock: 500, reorderLevel: 75, reorderQty: 150,
      purchaseCost: 185000, gstRate: 5, isBatchTracked: true, isCritical: true,
      barcodeValue: 'HAL-TB-LPT-001', qrCodeValue: 'QR-TB-LPT-001' },
    { itemCode: 'ITM-AEP-002', partNumber: 'TB-HPT-002-HAL', name: 'High Pressure Turbine Blade — Stage 2',
      catCode: 'CAT-AEP', subCatCode: 'SUB-TB', mfgCode: 'MFG-HAL', vendorCode: 'VEN-001',
      country: 'INDIA', unit: 'EACH',
      qty: 180, minStock: 40, maxStock: 400, reorderLevel: 60, reorderQty: 120,
      purchaseCost: 245000, gstRate: 5, isBatchTracked: true, isCritical: true,
      barcodeValue: 'HAL-TB-HPT-002', qrCodeValue: 'QR-TB-HPT-002' },
    { itemCode: 'ITM-AEP-003', partNumber: 'COMP-BLD-003', name: 'Compressor Rotor Blade — Stage 3',
      catCode: 'CAT-AEP', subCatCode: 'SUB-CMP', mfgCode: 'MFG-SNECMA', vendorCode: 'VEN-003',
      country: 'FRANCE', unit: 'EACH',
      qty: 320, minStock: 80, maxStock: 600, reorderLevel: 100, reorderQty: 200,
      purchaseCost: 95000, gstRate: 5, isBatchTracked: true, isImported: true, isCritical: true,
      barcodeValue: 'SNECMA-COMP-003', qrCodeValue: 'QR-COMP-BLD-003' },
    { itemCode: 'ITM-AEP-004', partNumber: 'COMB-LNR-004', name: 'Combustion Chamber Liner',
      catCode: 'CAT-AEP', subCatCode: 'SUB-CBS', mfgCode: 'MFG-GE', vendorCode: 'VEN-007',
      country: 'USA', unit: 'EACH',
      qty: 45, minStock: 10, maxStock: 100, reorderLevel: 15, reorderQty: 30,
      purchaseCost: 750000, gstRate: 5, isBatchTracked: true, isImported: true, isCritical: true,
      barcodeValue: 'GE-COMB-LNR-004', qrCodeValue: 'QR-COMB-LNR-004' },
    // Bearings
    { itemCode: 'ITM-BRG-001', partNumber: 'SKF-6205-2RS', name: 'Deep Groove Ball Bearing 6205-2RS',
      catCode: 'CAT-BRG', subCatCode: 'SUB-BALL', mfgCode: 'MFG-SKF', vendorCode: 'VEN-002',
      country: 'SWEDEN', unit: 'EACH',
      qty: 1250, minStock: 200, maxStock: 2000, reorderLevel: 300, reorderQty: 500,
      purchaseCost: 850, gstRate: 18, isImported: true,
      barcodeValue: 'SKF-6205-2RS-01', qrCodeValue: 'QR-BRG-6205' },
    { itemCode: 'ITM-BRG-002', partNumber: 'FAG-22215-E1', name: 'Spherical Roller Bearing 22215-E1',
      catCode: 'CAT-BRG', subCatCode: 'SUB-ROLLER', mfgCode: 'MFG-FAG', vendorCode: 'VEN-002',
      country: 'GERMANY', unit: 'EACH',
      qty: 450, minStock: 80, maxStock: 800, reorderLevel: 100, reorderQty: 200,
      purchaseCost: 4200, gstRate: 18, isImported: true,
      barcodeValue: 'FAG-22215-E1-01', qrCodeValue: 'QR-BRG-22215' },
    // Hydraulics
    { itemCode: 'ITM-HYD-001', partNumber: 'PHR-3000-HAL', name: 'Hydraulic Pump — 3000 PSI Axial Piston',
      catCode: 'CAT-HYD', subCatCode: 'SUB-PUMP', mfgCode: 'MFG-PARKER', vendorCode: 'VEN-005',
      country: 'USA', unit: 'EACH',
      qty: 28, minStock: 5, maxStock: 60, reorderLevel: 8, reorderQty: 15,
      purchaseCost: 320000, gstRate: 18, isImported: true, isSerialTracked: true, isCritical: true,
      barcodeValue: 'PARKER-PHR-3000', qrCodeValue: 'QR-HYD-PUMP-001' },
    { itemCode: 'ITM-HYD-002', partNumber: 'HV-DCV-002-HAL', name: 'Directional Control Valve 4/3 — Aircraft Grade',
      catCode: 'CAT-HYD', subCatCode: 'SUB-VALVE', mfgCode: 'MFG-MOOG', vendorCode: 'VEN-005',
      country: 'USA', unit: 'EACH',
      qty: 85, minStock: 15, maxStock: 150, reorderLevel: 20, reorderQty: 40,
      purchaseCost: 45000, gstRate: 18, isImported: true, isCritical: true,
      barcodeValue: 'MOOG-HV-DCV-002', qrCodeValue: 'QR-HYD-VALVE-002' },
    // Fasteners
    { itemCode: 'ITM-FAS-001', partNumber: 'BOLT-NAS1304-4', name: 'NAS 1304 Hex Bolt M6x20 — High Tensile Aircraft Grade',
      catCode: 'CAT-FAS', subCatCode: 'SUB-BOLT', mfgCode: 'MFG-HAL', vendorCode: 'VEN-004',
      country: 'INDIA', unit: 'EACH',
      qty: 15000, minStock: 2000, maxStock: 25000, reorderLevel: 3000, reorderQty: 8000,
      purchaseCost: 12, gstRate: 18,
      barcodeValue: 'HAL-BOLT-NAS1304-4', qrCodeValue: 'QR-FAS-BOLT-001' },
    { itemCode: 'ITM-FAS-002', partNumber: 'RIVET-AN470-4-4', name: 'AN470 Solid Rivet AD4-4 — 2024-T4 Aluminum',
      catCode: 'CAT-FAS', subCatCode: 'SUB-RIVET', mfgCode: 'MFG-HAL', vendorCode: 'VEN-004',
      country: 'INDIA', unit: 'EACH',
      qty: 85000, minStock: 10000, maxStock: 150000, reorderLevel: 15000, reorderQty: 50000,
      purchaseCost: 2.5, gstRate: 18,
      barcodeValue: 'HAL-RIVET-AN470-4', qrCodeValue: 'QR-FAS-RIVET-002' },
    // Composite Materials
    { itemCode: 'ITM-COMP-001', partNumber: 'CFRP-UD-300-T700', name: 'Carbon Fibre Prepreg — Toray T700 UD 300g/m²',
      catCode: 'CAT-COMP', subCatCode: 'SUB-CFRP', mfgCode: 'MFG-TORAY', vendorCode: 'VEN-008',
      country: 'JAPAN', unit: 'SQUARE_METER',
      qty: 2200, minStock: 300, maxStock: 4000, reorderLevel: 400, reorderQty: 1000,
      purchaseCost: 3800, gstRate: 12, isImported: true, isExpiryTracked: true,
      expiryDate: new Date('2025-12-31'),
      barcodeValue: 'TORAY-T700-UD-300', qrCodeValue: 'QR-COMP-CFRP-001' },
    // Lubricants
    { itemCode: 'ITM-LUB-001', partNumber: 'MOBIL-JET-OIL-II', name: 'Mobil Jet Oil II — Aircraft Turbine Engine Oil',
      catCode: 'CAT-LUB', subCatCode: null, mfgCode: 'MFG-GE', vendorCode: 'VEN-003',
      country: 'USA', unit: 'LITER',
      qty: 3500, minStock: 500, maxStock: 6000, reorderLevel: 700, reorderQty: 2000,
      purchaseCost: 650, gstRate: 18, isImported: true, isExpiryTracked: true,
      expiryDate: new Date('2026-06-30'),
      barcodeValue: 'MOBIL-JET-OIL-II', qrCodeValue: 'QR-LUB-JETII-001' },
    // Safety
    { itemCode: 'ITM-SAFE-001', partNumber: 'PPE-HELMET-AERO', name: 'Industrial Safety Helmet — Aerospace Grade',
      catCode: 'CAT-SAFE', subCatCode: null, mfgCode: 'MFG-HAL', vendorCode: 'VEN-004',
      country: 'INDIA', unit: 'EACH',
      qty: 120, minStock: 20, maxStock: 200, reorderLevel: 30, reorderQty: 60,
      purchaseCost: 850, gstRate: 18,
      barcodeValue: 'HAL-PPE-HELMET-01', qrCodeValue: 'QR-SAFE-HELM-001' },
    // Landing Gear
    { itemCode: 'ITM-AFC-001', partNumber: 'LDG-NLG-ASSY-HAL', name: 'Nose Landing Gear Assembly',
      catCode: 'CAT-AFC', subCatCode: 'SUB-LDG', mfgCode: 'MFG-HAL', vendorCode: 'VEN-007',
      country: 'INDIA', unit: 'SET',
      qty: 12, minStock: 2, maxStock: 25, reorderLevel: 3, reorderQty: 5,
      purchaseCost: 8500000, gstRate: 5, isSerialTracked: true, isCritical: true,
      barcodeValue: 'HAL-LDG-NLG-ASSY', qrCodeValue: 'QR-AFC-LDG-001' },
    // Avionics
    { itemCode: 'ITM-AVN-001', partNumber: 'INS-RING-LASER', name: 'Ring Laser Gyro INS Unit',
      catCode: 'CAT-AVN', subCatCode: 'SUB-NAV', mfgCode: 'MFG-ELBIT', vendorCode: 'VEN-003',
      country: 'ISRAEL', unit: 'EACH',
      qty: 18, minStock: 3, maxStock: 40, reorderLevel: 5, reorderQty: 10,
      purchaseCost: 4500000, gstRate: 5, isImported: true, isSerialTracked: true, isCritical: true,
      isCalibrationRequired: true, calibrationIntervalDays: 365,
      barcodeValue: 'ELBIT-INS-RLG-001', qrCodeValue: 'QR-AVN-INS-001' },
  ];

  const createdItems: Record<string, any> = {};
  for (const item of inventoryItems) {
    const created = await prisma.inventoryItem.upsert({
      where: { itemCode: item.itemCode },
      update: {},
      create: {
        itemCode: item.itemCode,
        partNumber: item.partNumber,
        name: item.name,
        categoryId: cats[item.catCode].id,
        subcategoryId: item.subCatCode ? subCatMap[item.subCatCode] : undefined,
        manufacturerId: mfgs[item.mfgCode]?.id,
        vendorId: vendors[item.vendorCode]?.id,
        countryOfOrigin: item.country,
        unit: item.unit,
        currentQuantity: item.qty,
        reservedQuantity: 0,
        availableQuantity: item.qty,
        minimumStock: item.minStock,
        maximumStock: item.maxStock,
        reorderLevel: item.reorderLevel,
        reorderQuantity: item.reorderQty,
        purchaseCostInr: item.purchaseCost,
        gstRatePercent: item.gstRate,
        totalStockValueInr: item.qty * item.purchaseCost,
        isBatchTracked: item.isBatchTracked ?? false,
        isSerialTracked: item.isSerialTracked ?? false,
        isExpiryTracked: item.isExpiryTracked ?? false,
        isCalibrationRequired: item.isCalibrationRequired ?? false,
        isImported: item.isImported ?? false,
        isCritical: item.isCritical ?? false,
        calibrationIntervalDays: item.calibrationIntervalDays,
        expiryDate: item.expiryDate,
        barcodeValue: item.barcodeValue,
        qrCodeValue: item.qrCodeValue,
        status: 'ACTIVE',
      },
    });
    createdItems[item.itemCode] = created;
  }
  console.log(`  ✅ ${inventoryItems.length} inventory items seeded`);

  // ─── 11. SETTINGS ──────────────────────────────────────────────────────────
  console.log('⚙️ Seeding system settings...');
  const settings = [
    { key: 'app.name', value: 'HAL OIMS', description: 'Application name', isPublic: true, category: 'general' },
    { key: 'app.version', value: '1.0.0', description: 'Application version', isPublic: true, category: 'general' },
    { key: 'app.organization', value: 'Hindustan Aeronautics Limited', description: 'Organization name', isPublic: true, category: 'general' },
    { key: 'app.division', value: 'Aircraft Manufacturing Division — Bengaluru', description: 'Division name', isPublic: true, category: 'general' },
    { key: 'auth.jwt_expiry_hours', value: '8', description: 'JWT token expiry in hours', isPublic: false, category: 'security' },
    { key: 'auth.max_login_attempts', value: '5', description: 'Max failed login attempts before lockout', isPublic: false, category: 'security' },
    { key: 'auth.lockout_minutes', value: '30', description: 'Account lockout duration in minutes', isPublic: false, category: 'security' },
    { key: 'auth.password_min_length', value: '8', description: 'Minimum password length', isPublic: true, category: 'security' },
    { key: 'inventory.low_stock_threshold_percent', value: '20', description: 'Alert when stock drops below X% of minimum', isPublic: false, category: 'inventory' },
    { key: 'inventory.auto_reorder_enabled', value: 'false', description: 'Enable automatic reorder point alerts', isPublic: false, category: 'inventory' },
    { key: 'currency.default', value: 'INR', description: 'Default currency', isPublic: true, category: 'finance' },
    { key: 'currency.symbol', value: '₹', description: 'Currency symbol', isPublic: true, category: 'finance' },
    { key: 'gst.default_rate', value: '18', description: 'Default GST rate (%)', isPublic: false, category: 'finance' },
    { key: 'pr.auto_number_prefix', value: 'PR', description: 'Purchase Request number prefix', isPublic: false, category: 'purchase' },
    { key: 'po.auto_number_prefix', value: 'PO', description: 'Purchase Order number prefix', isPublic: false, category: 'purchase' },
    { key: 'grn.auto_number_prefix', value: 'GRN', description: 'Goods Received Note number prefix', isPublic: false, category: 'purchase' },
    { key: 'tx.auto_number_prefix', value: 'TXN', description: 'Transaction number prefix', isPublic: false, category: 'inventory' },
    { key: 'wo.auto_number_prefix', value: 'WO', description: 'Work Order number prefix', isPublic: false, category: 'production' },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log(`  ✅ ${settings.length} settings seeded`);

  console.log('\n🎉 HAL OIMS database seed complete!');
  console.log('\n📋 Default Login Credentials:');
  console.log('   All users: password = HAL@2024! (forced change on first login)');
  console.log('   Super Admin  → username: admin');
  console.log('   Inv. Manager → username: inv.manager');
  console.log('   Store Keeper → username: storekeeper1');
  console.log('   Purchase     → username: purchase.head');
  console.log('   Production   → username: prod.engineer');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });