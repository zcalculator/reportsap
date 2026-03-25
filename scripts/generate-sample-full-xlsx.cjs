/**
 * Generates sample-full-maintenance-report.xlsx with report + equipment fields,
 * operations, components, and extra columns for additional_points testing.
 * Run: node scripts/generate-sample-full-xlsx.cjs
 */

const XLSX = require("xlsx");
const path = require("path");

const outPath = path.join(__dirname, "..", "sample-full-maintenance-report.xlsx");

// Single header row: all report + equipment fields + extra (additional_points-style)
const reportRows = [
  {
    reference_number: "WO-2026-DUMMY-001",
    report_date: "2026-03-25",
    scheduled_start_date: "2026-03-20",
    scheduled_finish_date: "2026-03-22",
    actual_start_date: "2026-03-21",
    actual_finish_date: "2026-03-23",
    order_type: "PM",
    maintenance_type: "preventive",
    status: "pending_review",
    priority: "high",
    plant_id: "PLANT-01",
    work_center: "MECH-A1",
    cost_center: "CC-4500",
    company_code: "COMP01",
    functional_location: "FL-WT-SECTOR-07",
    description:
      "Annual preventive maintenance — nacelle mechanical and electrical systems",
    work_performed:
      "Lubricated main shaft bearings, yaw system service, tower bolt torque verification, SCADA connectivity test",
    findings: "Yaw motor current 5% above baseline; gearbox oil analysis within spec; one MET sensor intermittent",
    recommendations:
      "Plan yaw motor replacement within 90 days; schedule MET sensor swap at next visit; next PM in 12 months",
    technician_name: "Alex Morgan",
    technician_company: "TurbineCare GmbH",
    hours_worked: 14.5,
    labor_cost: 2900,
    total_cost: 12450.75,
    next_scheduled_maintenance: "2027-03-25",
    equipment_number: "WT-EAST-42",
    equipment_type: "wind_turbine",
    serial_number: "SN-VST-2019-7721",
    manufacturer: "Vestas",
    model: "V150-4.2",
    site_location: "North Sea Alpha Array",
    equipment_functional_location: "FL-WT-EAST-42",
    equipment_installation_date: "2019-08-12",
    // Additional points (not in core SAP report field mapping — for AI bucket)
    warranty_expiry_date: "2028-01-15",
    purchase_order_reference: "PO-2026-88421",
    vibration_rms_mm_s: 1.35,
    insurance_policy_number: "INS-WIND-998877",
    safety_permit_work_order: "PTW-2026-0312",
    calibration_certificate_id: "CAL-LAB-441",
    subcontractor_batch_id: "SUB-BATCH-77A",
    customer_signoff_name: "Jordan Ellis",
    service_contract_tier: "GoldMax",
  },
];

const operationRows = [
  {
    operation_number: 1,
    description: "Visual inspection — tower, foundation, and access",
    work_center: "INSPECT",
    labor_hours: 2,
    scheduled_start: "2026-03-21T08:00:00Z",
    scheduled_end: "2026-03-21T10:00:00Z",
    actual_start: "2026-03-21T08:15:00Z",
    actual_end: "2026-03-21T10:10:00Z",
  },
  {
    operation_number: 2,
    description: "Nacelle mechanical service — lubrication and torque checks",
    work_center: "MECH-A1",
    labor_hours: 8.5,
    scheduled_start: "2026-03-21T10:30:00Z",
    scheduled_end: "2026-03-21T19:00:00Z",
    actual_start: "2026-03-21T10:45:00Z",
    actual_end: "2026-03-21T18:30:00Z",
  },
  {
    operation_number: 3,
    description: "Electrical, hydraulics, and SCADA verification",
    work_center: "ELEC-B2",
    labor_hours: 4,
    scheduled_start: "2026-03-22T07:00:00Z",
    scheduled_end: "2026-03-22T12:00:00Z",
    actual_start: "2026-03-22T07:00:00Z",
    actual_end: "2026-03-22T11:45:00Z",
  },
];

const componentRows = [
  {
    material_number: "MAT-OIL-SYN-75W90",
    material_description: "Synthetic gearbox oil 75W-90",
    quantity: 120,
    unit: "L",
    unit_cost: 4.25,
  },
  {
    material_number: "MAT-FLT-HYD-01",
    material_description: "Hydraulic filter element kit",
    quantity: 2,
    unit: "EA",
    unit_cost: 189.99,
  },
  {
    material_number: "MAT-GREASE-HITEMP",
    material_description: "High-temperature bearing grease cartridge",
    quantity: 6,
    unit: "EA",
    unit_cost: 42.5,
  },
];

const wb = XLSX.utils.book_new();

const wsReport = XLSX.utils.json_to_sheet(reportRows);
XLSX.utils.book_append_sheet(wb, wsReport, "Report");

const wsOps = XLSX.utils.json_to_sheet(operationRows);
XLSX.utils.book_append_sheet(wb, wsOps, "Operations");

const wsComp = XLSX.utils.json_to_sheet(componentRows);
XLSX.utils.book_append_sheet(wb, wsComp, "Components");

XLSX.writeFile(wb, outPath);
console.log("Wrote", outPath);
