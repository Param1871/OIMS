// HAL-specific mock data for UI demonstration

export const mockInventoryItems = [
  {
    id: "INV-1001",
    itemCode: "HAL-ENG-001",
    partNumber: "TB-AL-31FP",
    name: "Turbine Blade (AL-31FP Engine)",
    category: "Aero Engine Parts",
    subcategory: "Turbine Section",
    currentQuantity: 145,
    minimumStock: 50,
    unit: "EACH",
    unitCost: 125000,
    status: "ACTIVE",
    isCritical: true,
    location: "Zone-A, Rack-12",
  },
  {
    id: "INV-1002",
    itemCode: "HAL-HYD-042",
    partNumber: "HA-SU30-MKI",
    name: "Hydraulic Actuator System",
    category: "Hydraulic Components",
    subcategory: "Actuators",
    currentQuantity: 12,
    minimumStock: 15,
    unit: "SET",
    unitCost: 850000,
    status: "ACTIVE",
    isCritical: true,
    location: "Zone-B, Rack-04",
  },
  {
    id: "INV-1003",
    itemCode: "HAL-AV-105",
    partNumber: "RADAR-N011M",
    name: "Bars Radar Module",
    category: "Avionics",
    subcategory: "Radar Systems",
    currentQuantity: 3,
    minimumStock: 5,
    unit: "EACH",
    unitCost: 4500000,
    status: "ACTIVE",
    isCritical: true,
    location: "Zone-C, Rack-01 (Secure)",
  },
  {
    id: "INV-1004",
    itemCode: "HAL-CON-201",
    partNumber: "FAST-TIT-M8",
    name: "Titanium Fasteners M8",
    category: "Consumables",
    subcategory: "Hardware",
    currentQuantity: 8500,
    minimumStock: 2000,
    unit: "PACK",
    unitCost: 2500,
    status: "ACTIVE",
    isCritical: false,
    location: "Zone-D, Rack-45",
  },
  {
    id: "INV-1005",
    itemCode: "HAL-FUE-001",
    partNumber: "JET-A1-SPEC",
    name: "Aviation Turbine Fuel (Jet A-1)",
    category: "Consumables",
    subcategory: "Fuel & Oils",
    currentQuantity: 45000,
    minimumStock: 10000,
    unit: "LITER",
    unitCost: 110,
    status: "ACTIVE",
    isCritical: true,
    location: "Underground Tank-1",
  },
  {
    id: "INV-1006",
    itemCode: "HAL-MAT-992",
    partNumber: "AL-ALLOY-7075",
    name: "Aluminum Alloy Sheet 7075-T6",
    category: "Raw Materials",
    subcategory: "Metals",
    currentQuantity: 240,
    minimumStock: 100,
    unit: "SHEET",
    unitCost: 15000,
    status: "ACTIVE",
    isCritical: false,
    location: "Zone-E, Rack-08",
  }
];

export const mockTransactions = [
  { id: "TXN-001", date: "2026-06-25", type: "GOODS_IN", quantity: 50, reference: "GRN-2026-089", performedBy: "Store Keeper 1" },
  { id: "TXN-002", date: "2026-06-24", type: "ISSUE_TO_PRODUCTION", quantity: 12, reference: "WO-2026-102", performedBy: "Production Sup." },
  { id: "TXN-003", date: "2026-06-20", type: "STOCK_ADJUSTMENT_MINUS", quantity: 1, reference: "Audit", performedBy: "Inventory Mgr" },
];

export const mockVendors = [
  { id: "VEN-001", name: "Aerospace Dynamics Intl", code: "ADI", type: "OEM", status: "ACTIVE", rating: 4.8, country: "USA", contact: "john.doe@adi.com" },
  { id: "VEN-002", name: "Global Aviation Supplies", code: "GAS", type: "DISTRIBUTOR", status: "ACTIVE", rating: 4.2, country: "UK", contact: "sales@gas.co.uk" },
  { id: "VEN-003", name: "Titanium Forge Works", code: "TFW", type: "MANUFACTURER", status: "UNDER_EVALUATION", rating: 3.5, country: "INDIA", contact: "info@tfw.in" },
  { id: "VEN-004", name: "Avionics Tech Solutions", code: "ATS", type: "OEM", status: "ACTIVE", rating: 4.9, country: "ISRAEL", contact: "support@ats.il" },
  { id: "VEN-005", name: "Defect Supplier Ltd", code: "DSL", type: "DISTRIBUTOR", status: "BLACKLISTED", rating: 1.2, country: "UNKNOWN", contact: "none" },
];

export const mockPurchaseRequests = [
  { id: "PR-2026-042", date: "2026-06-24", requestedBy: "Engine Div", priority: "HIGH", status: "APPROVED", item: "Turbine Blade (AL-31FP Engine)", quantity: 200, estimatedValue: 25000000 },
  { id: "PR-2026-043", date: "2026-06-25", requestedBy: "Avionics Dept", priority: "URGENT", status: "UNDER_REVIEW", item: "Bars Radar Module", quantity: 2, estimatedValue: 9000000 },
  { id: "PR-2026-044", date: "2026-06-26", requestedBy: "Maintenance", priority: "NORMAL", status: "SUBMITTED", item: "Hydraulic Fluid Skydrol", quantity: 1000, estimatedValue: 450000 },
  { id: "PR-2026-041", date: "2026-06-20", requestedBy: "Structural Div", priority: "NORMAL", status: "REJECTED", item: "Carbon Fiber Roll", quantity: 50, estimatedValue: 750000 },
];

export const mockPurchaseOrders = [
  { id: "PO-2026-089", date: "2026-06-15", vendor: "Aerospace Dynamics Intl", status: "SENT_TO_VENDOR", totalValue: 25000000, expectedDelivery: "2026-07-15", prReference: "PR-2026-021" },
  { id: "PO-2026-090", date: "2026-06-18", vendor: "Avionics Tech Solutions", status: "PARTIALLY_RECEIVED", totalValue: 18000000, expectedDelivery: "2026-06-30", prReference: "PR-2026-025" },
  { id: "PO-2026-091", date: "2026-06-20", vendor: "Global Aviation Supplies", status: "ACKNOWLEDGED", totalValue: 450000, expectedDelivery: "2026-07-05", prReference: "PR-2026-030" },
  { id: "PO-2026-085", date: "2026-05-10", vendor: "Titanium Forge Works", status: "FULLY_RECEIVED", totalValue: 1250000, expectedDelivery: "2026-06-01", prReference: "PR-2026-015" },
];

export const mockGRNs = [
  { id: "GRN-2026-105", date: "2026-06-25", poReference: "PO-2026-090", vendor: "Avionics Tech Solutions", status: "QUALITY_PENDING", itemsReceived: 12, inspector: "Unassigned" },
  { id: "GRN-2026-104", date: "2026-06-24", poReference: "PO-2026-085", vendor: "Titanium Forge Works", status: "POSTED", itemsReceived: 50, inspector: "QCI-John" },
  { id: "GRN-2026-103", date: "2026-06-23", poReference: "PO-2026-088", vendor: "Global Aviation Supplies", status: "QUALITY_REJECTED", itemsReceived: 100, inspector: "QCI-Sarah" },
];

export const mockWorkOrders = [
  { id: "WO-2026-102", title: "LCA Tejas Fuselage Assembly", department: "Structural Div", startDate: "2026-06-01", targetDate: "2026-08-15", status: "IN_PROGRESS", priority: "HIGH", progress: 45 },
  { id: "WO-2026-105", title: "AL-31FP Engine Overhaul (Unit #45)", department: "Engine Div", startDate: "2026-06-20", targetDate: "2026-07-10", status: "RELEASED", priority: "URGENT", progress: 10 },
  { id: "WO-2026-108", title: "Helicopter Rotor Blade Fab", department: "Helicopter Div", startDate: "2026-06-25", targetDate: "2026-07-25", status: "DRAFT", priority: "NORMAL", progress: 0 },
  { id: "WO-2026-099", title: "Avionics Suite Retrofit", department: "Avionics Dept", startDate: "2026-05-15", targetDate: "2026-06-20", status: "COMPLETED", priority: "NORMAL", progress: 100 },
];

export const mockMaterialIssues = [
  { id: "MIS-2026-056", date: "2026-06-25", workOrder: "WO-2026-105", requestedBy: "Eng. R. Sharma", item: "Turbine Blade (AL-31FP Engine)", requestedQty: 12, issuedQty: 12, status: "FULLY_ISSUED" },
  { id: "MIS-2026-057", date: "2026-06-25", workOrder: "WO-2026-102", requestedBy: "Sup. K. Patel", item: "Aluminum Alloy Sheet 7075-T6", requestedQty: 50, issuedQty: 30, status: "PARTIALLY_ISSUED" },
  { id: "MIS-2026-058", date: "2026-06-26", workOrder: "WO-2026-108", requestedBy: "Mgr. A. Kumar", item: "Carbon Fiber Roll", requestedQty: 5, issuedQty: 0, status: "PENDING_ISSUE" },
];

export const mockMaintenanceRecords = [
  { id: "MNT-001", assetId: "MAC-CNC-004", assetName: "5-Axis CNC Milling Machine", type: "PREVENTIVE", scheduledDate: "2026-06-28", status: "SCHEDULED", assignee: "Tech Team A" },
  { id: "MNT-002", assetId: "MAC-ROB-012", assetName: "Welding Robot Arm", type: "CORRECTIVE", scheduledDate: "2026-06-25", status: "IN_PROGRESS", assignee: "Tech Team B" },
  { id: "MNT-003", assetId: "FAC-HVAC-001", assetName: "Clean Room HVAC", type: "PREVENTIVE", scheduledDate: "2026-06-20", status: "COMPLETED", assignee: "Facility Mgmt" },
  { id: "MNT-004", assetId: "MAC-PR-009", assetName: "Hydraulic Press (1000T)", type: "PREVENTIVE", scheduledDate: "2026-06-15", status: "OVERDUE", assignee: "Tech Team A" },
];

export const mockCalibrationRecords = [
  { id: "CAL-001", instrumentId: "INS-MIC-045", instrumentName: "Digital Micrometer (0-25mm)", range: "0-25mm", lastCalibration: "2025-12-20", nextDueDate: "2026-06-20", result: "FAIL", performedBy: "NABL Lab A" },
  { id: "CAL-002", instrumentId: "INS-TRQ-012", instrumentName: "Torque Wrench (50-250 Nm)", range: "50-250 Nm", lastCalibration: "2026-01-15", nextDueDate: "2026-07-15", result: "PASS", performedBy: "Internal QC" },
  { id: "CAL-003", instrumentId: "INS-CMM-002", instrumentName: "Coordinate Measuring Machine", range: "1000x1000x800", lastCalibration: "2026-06-24", nextDueDate: "2027-06-24", result: "PASS", performedBy: "OEM Cert" },
];
