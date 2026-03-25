/**
 * Single-sheet dummy XLSX files aligned with Supabase reportsap schema.
 * Writes one workbook per machine scenario (wind_turbine, gearbox, generator).
 *
 * Run: node scripts/generate-dummy-single-sheet-reportsap.cjs
 */

const XLSX = require("xlsx");
const path = require("path");

const root = path.join(__dirname, "..");

const scenarios = [
  {
    file: "dummy-maintenance-report-reportsap.xlsx",
    row: {
      reference_number: "WO-RPTSAP-2026-003",
      report_date: "2026-03-24",
      scheduled_start_date: "2026-03-22T07:00:00+00:00",
      scheduled_finish_date: "2026-03-24T18:00:00+00:00",
      actual_start_date: "2026-03-22T07:30:00+00:00",
      actual_finish_date: "2026-03-24T17:15:00+00:00",
      order_type: "PM",
      maintenance_type: "preventive",
      status: "pending_review",
      priority: "high",
      plant_id: "IWERK-NORD-01",
      work_center: "WT-MEC-TEAM-A",
      cost_center: "CC-77821",
      company_code: "2910",
      functional_location: "FUNCT-NAC-WT42-ARRAY7",
      description:
        "Annual PM: nacelle drivetrain, yaw system, hydraulics, and blade root bolt audit",
      work_performed:
        "Torque check main bearing housing; replaced yaw brake pads; hydraulic pressure test 280 bar; IR thermography on junction box; borescope stub inspection",
      findings:
        "Blade B vibration 8% above fleet median; oil particle count ISO 18/16/13; one nacelle roof seal minor tear",
      recommendations:
        "Order blade balance within 45 days; monitor oil monthly; replace roof seal next outage; next PM 2027-03-24",
      technician_name: "Elena Vogt",
      technician_company: "OffshoreWind Service AS",
      hours_worked: 26.25,
      labor_cost: 6825.0,
      total_cost: 19840.5,
      next_scheduled_maintenance: "2027-03-24",
      equipment_number: "WT-OS-ARR7-042",
      equipment_type: "wind_turbine",
      serial_number: "SN-GE-R-2018-901144",
      manufacturer: "GE",
      model: "Cypress 5.3-158",
      site_location: "North Sea — Array 7",
      equipment_functional_location: "FUNCT-WT-042",
      equipment_installation_date: "2018-11-03",
      operations_json: JSON.stringify([
        {
          operation_number: 1,
          description: "Nacelle and hub mechanical inspection",
          work_center: "WT-MEC-TEAM-A",
          labor_hours: 9.5,
          scheduled_start: "2026-03-22T07:30:00Z",
          scheduled_end: "2026-03-22T18:00:00Z",
          actual_start: "2026-03-22T07:45:00Z",
          actual_end: "2026-03-22T17:30:00Z",
        },
        {
          operation_number: 2,
          description: "Hydraulics service — pitch and yaw circuits",
          work_center: "HYD-SVC",
          labor_hours: 8,
          scheduled_start: "2026-03-23T07:00:00Z",
          scheduled_end: "2026-03-23T16:00:00Z",
          actual_start: "2026-03-23T07:00:00Z",
          actual_end: "2026-03-23T15:40:00Z",
        },
        {
          operation_number: 3,
          description: "Electrical / SCADA verification and MET cross-check",
          work_center: "ELEC-SCADA",
          labor_hours: 8.75,
          scheduled_start: "2026-03-24T07:00:00Z",
          scheduled_end: "2026-03-24T16:00:00Z",
          actual_start: "2026-03-24T07:15:00Z",
          actual_end: "2026-03-24T17:15:00Z",
        },
      ]),
      components_json: JSON.stringify([
        {
          material_number: "MAT-FLT-HYD-ISO10",
          material_description: "High-pressure hydraulic filter insert",
          quantity: 4,
          unit: "EA",
          unit_cost: 124.5,
        },
        {
          material_number: "MAT-OIL-SYN-ISOVG220",
          material_description: "Synthetic gearbox oil ISO VG 220",
          quantity: 220,
          unit: "L",
          unit_cost: 3.95,
        },
        {
          material_number: "MAT-BOLT-TB-M30",
          material_description: "Blade root tension bolt kit M30 (partial set)",
          quantity: 12,
          unit: "EA",
          unit_cost: 89.0,
        },
      ]),
      warranty_expiry_date: "2030-12-31",
      purchase_order_reference: "PO-RPT-2026-77102",
      vibration_blade_b_mm_s: 4.2,
      insurance_policy_number: "POL-OFFSHORE-WT-441920",
      permit_to_work_id: "PTW-2026-ARR7-089",
      calibration_certificate_ref: "CERT-LAB-NO-8821",
      weather_downtime_hours: 3.5,
      customer_approval_contact: "Signe Nielsen — ops@array7.example",
      service_level_agreement: "SLA-Tier-2-4h-response",
    },
  },
  {
    file: "dummy-maintenance-report-reportsap-gearbox.xlsx",
    row: {
      reference_number: "WO-RPTSAP-2026-018",
      report_date: "2026-03-26",
      scheduled_start_date: "2026-03-25T06:00:00+00:00",
      scheduled_finish_date: "2026-03-27T20:00:00+00:00",
      actual_start_date: "2026-03-25T06:30:00+00:00",
      actual_finish_date: "2026-03-27T18:45:00+00:00",
      order_type: "BM",
      maintenance_type: "corrective",
      status: "pending_review",
      priority: "medium",
      plant_id: "IWERK-PAPER-KL5",
      work_center: "GBX-OVERHAUL",
      cost_center: "CC-55102",
      company_code: "2910",
      functional_location: "FL-LINE3-GBX-PRIMARY",
      description:
        "Corrective work: high-speed shaft bearing temperature excursion on paper machine primary gearbox",
      work_performed:
        "Drain and flush lube circuit; replace HS shaft drive-end bearing and seal pack; laser-align motor to gearbox; refill with OEM-approved synthetic; vibration baseline post-run",
      findings:
        "DE bearing BPFO damage on outer race; oil sample Fe elevated; no tooth contact distress on bull gear",
      recommendations:
        "Install online particle counter; shorten oil analysis interval to 6 weeks; review lube cooler fouling",
      technician_name: "Marcus Lindholm",
      technician_company: "Nordic Drive Systems AB",
      hours_worked: 31.5,
      labor_cost: 9450.0,
      total_cost: 28760.0,
      next_scheduled_maintenance: "2026-10-26",
      equipment_number: "GBX-PM-KL5-L3-P01",
      equipment_type: "gearbox",
      serial_number: "SN-FLENDER-2020-778812",
      manufacturer: "Flender",
      model: "PLANUREX P2DA-19",
      site_location: "Kauhajoki Mill — Line 3",
      equipment_functional_location: "FL-GBX-L3-P01",
      equipment_installation_date: "2020-04-18",
      operations_json: JSON.stringify([
        {
          operation_number: 1,
          description: "Lockout, drain, internal inspection port and endoscopy",
          work_center: "GBX-OVERHAUL",
          labor_hours: 6,
          scheduled_start: "2026-03-25T06:30:00Z",
          scheduled_end: "2026-03-25T14:00:00Z",
          actual_start: "2026-03-25T06:45:00Z",
          actual_end: "2026-03-25T14:20:00Z",
        },
        {
          operation_number: 2,
          description: "Bearing and seal replacement — HS shaft DE assembly",
          work_center: "GBX-OVERHAUL",
          labor_hours: 16,
          scheduled_start: "2026-03-26T05:00:00Z",
          scheduled_end: "2026-03-26T22:00:00Z",
          actual_start: "2026-03-26T05:15:00Z",
          actual_end: "2026-03-26T21:10:00Z",
        },
        {
          operation_number: 3,
          description: "Alignment, refill, no-load and loaded run-in with vibration sign-off",
          work_center: "GBX-OVERHAUL",
          labor_hours: 9.5,
          scheduled_start: "2026-03-27T06:00:00Z",
          scheduled_end: "2026-03-27T18:00:00Z",
          actual_start: "2026-03-27T06:00:00Z",
          actual_end: "2026-03-27T18:45:00Z",
        },
      ]),
      components_json: JSON.stringify([
        {
          material_number: "MAT-BRG-6314-2Z-C3",
          material_description: "Deep groove ball bearing 6314-2Z C3 (DE kit)",
          quantity: 1,
          unit: "EA",
          unit_cost: 412.0,
        },
        {
          material_number: "MAT-SEAL-LIP-HS85",
          material_description: "Labyrinth + lip seal set HS shaft",
          quantity: 1,
          unit: "KIT",
          unit_cost: 680.5,
        },
        {
          material_number: "MAT-OIL-SYN-PAG460",
          material_description: "PAG synthetic gear oil ISO VG 460",
          quantity: 480,
          unit: "L",
          unit_cost: 5.2,
        },
      ]),
      gear_ratio_design: "28.4:1",
      input_power_kw_rated: 4200,
      bearing_temperature_alarm_c: 88,
      lube_filter_micron_rating: 10,
      alignment_coupling_type: "Grid flex — Kop-Flex",
      vibration_post_job_mm_s_rms: 1.05,
      root_cause_code: "RC-LUBE-CONTAMINATION",
      storeroom_bin: "BIN-GBX-KL5-A12",
    },
  },
  {
    file: "dummy-maintenance-report-reportsap-generator.xlsx",
    row: {
      reference_number: "WO-RPTSAP-2026-024",
      report_date: "2026-03-28",
      scheduled_start_date: "2026-03-27T22:00:00+00:00",
      scheduled_finish_date: "2026-03-29T06:00:00+00:00",
      actual_start_date: "2026-03-27T22:30:00+00:00",
      actual_finish_date: "2026-03-29T05:10:00+00:00",
      order_type: "PM",
      maintenance_type: "inspection",
      status: "pending_review",
      priority: "low",
      plant_id: "IWERK-CC-HAVNE",
      work_center: "GEN-STATOR",
      cost_center: "CC-62007",
      company_code: "2910",
      functional_location: "FL-STG2-GEN-U1",
      description:
        "Major inspection window: generator U1 — wedge check, RTD verification, partial discharge survey",
      work_performed:
        "Borescope end-winding; Megger and PI sweep; cleaned cooler fins; verified RTD curves vs DCS; greased DE/NDE bearings per schedule",
      findings:
        "Two stator wedges slightly loose sector 7B; PD levels within OEM alert band; bearing grease condition acceptable",
      recommendations:
        "Retorque wedge set on next outage; continuous PD monitoring trial; next bearing re-grease in 18 months",
      technician_name: "Ingrid Foss",
      technician_company: "Statkraft Rotating Equipment",
      hours_worked: 18.75,
      labor_cost: 5625.0,
      total_cost: 9140.25,
      next_scheduled_maintenance: "2027-03-28",
      equipment_number: "GEN-HVN-STG2-U1",
      equipment_type: "generator",
      serial_number: "SN-SIEM-GEN-2016-2219004",
      manufacturer: "Siemens Energy",
      model: "SGen5-100A",
      site_location: "Havnevik Combined Cycle — STG2",
      equipment_functional_location: "FL-GEN-STG2-U1",
      equipment_installation_date: "2016-09-02",
      operations_json: JSON.stringify([
        {
          operation_number: 1,
          description: "Cooling system clean and flow verification",
          work_center: "GEN-AUX",
          labor_hours: 4,
          scheduled_start: "2026-03-27T22:30:00Z",
          scheduled_end: "2026-03-28T04:00:00Z",
          actual_start: "2026-03-27T23:00:00Z",
          actual_end: "2026-03-28T03:40:00Z",
        },
        {
          operation_number: 2,
          description: "Winding inspection, insulation tests, PD survey",
          work_center: "GEN-STATOR",
          labor_hours: 9.25,
          scheduled_start: "2026-03-28T04:30:00Z",
          scheduled_end: "2026-03-28T18:00:00Z",
          actual_start: "2026-03-28T04:45:00Z",
          actual_end: "2026-03-28T17:30:00Z",
        },
        {
          operation_number: 3,
          description: "Bearing maintenance — DE/NDE regrease and temperature check",
          work_center: "GEN-MECH",
          labor_hours: 5.5,
          scheduled_start: "2026-03-29T00:00:00Z",
          scheduled_end: "2026-03-29T06:00:00Z",
          actual_start: "2026-03-29T00:10:00Z",
          actual_end: "2026-03-29T05:10:00Z",
        },
      ]),
      components_json: JSON.stringify([
        {
          material_number: "MAT-GREASE-BRG-HT2",
          material_description: "High-speed bearing grease cartridge HT-2",
          quantity: 8,
          unit: "EA",
          unit_cost: 38.9,
        },
        {
          material_number: "MAT-COOLER-FIN-CLEAN",
          material_description: "Cooler fin cleaning compound",
          quantity: 2,
          unit: "EA",
          unit_cost: 56.0,
        },
        {
          material_number: "MAT-WEDGE-SHIM-KIT",
          material_description: "Stator wedge shim assortment",
          quantity: 1,
          unit: "KIT",
          unit_cost: 210.0,
        },
      ]),
      rated_mva: 234,
      rated_voltage_kv: 21,
      power_factor_design: 0.9,
      megger_test_kv: 5,
      polarization_index: 4.1,
      partial_discharge_nc_coulomb: 2.8,
      excitation_system_vendor: "ABB",
      grid_code_compliance_zone: "Nordic NC RfG",
    },
  },
];

function writeWorkbook(fileName, row) {
  const outPath = path.join(root, fileName);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet([row]);
  XLSX.utils.book_append_sheet(wb, ws, "MaintenanceReport");
  XLSX.writeFile(wb, outPath);
  console.log("Wrote", outPath);
}

for (const { file, row } of scenarios) {
  writeWorkbook(file, row);
}
