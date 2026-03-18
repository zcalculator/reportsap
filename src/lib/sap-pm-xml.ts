import type { Report, ReportOperation, ReportComponent, Equipment } from "./types";

/**
 * Generate SAP PM compatible XML for maintenance order upload
 * Structure aligns with common SAP PM BAPI/IDoc patterns
 */
export function generateSAPPMXml(
  report: Report,
  operations: ReportOperation[] = [],
  components: ReportComponent[] = [],
  equipment?: Equipment | null
): string {
  const escape = (val: string | number | undefined | null): string => {
    if (val == null) return "";
    const s = String(val);
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const tag = (
    name: string,
    value: string | number | undefined | null,
    indent: string
  ) => {
    if (value == null || value === "") return "";
    return `${indent}<${name}>${escape(value)}</${name}>\n`;
  };

  const nl = "\n";
  const i1 = "  ";
  const i2 = "    ";
  const i3 = "      ";

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<MaintenanceOrder xmlns="http://sap.com/pm/order">\n';

  // Header
  xml += `${i1}<Header>\n`;
  xml += tag("ORDERID", report.reference_number, i2);
  xml += tag("ORDER_TYPE", report.order_type, i2);
  xml += tag("FUNCT_LOC", report.functional_location ?? equipment?.functional_location, i2);
  xml += tag("EQUNR", equipment?.equipment_number, i2);
  xml += tag("IWERK", report.plant_id, i2);
  xml += tag("VAPLZ", report.work_center, i2);
  xml += tag("COSTCENTER", report.cost_center, i2);
  xml += tag("COMP_CODE", report.company_code, i2);
  xml += tag("START_DATE", report.scheduled_start_date?.slice(0, 10), i2);
  xml += tag("FINISH_DATE", report.scheduled_finish_date?.slice(0, 10), i2);
  xml += tag("ACTUAL_START_DATE", report.actual_start_date?.slice(0, 10), i2);
  xml += tag("ACTUAL_FINISH_DATE", report.actual_finish_date?.slice(0, 10), i2);
  xml += tag("PRIORITY", report.priority, i2);
  xml += tag("MAINTENANCE_TYPE", report.maintenance_type, i2);
  xml += tag("DESCRIPTION", report.description, i2);
  xml += tag("WORK_PERFORMED", report.work_performed, i2);
  xml += tag("FINDINGS", report.findings, i2);
  xml += tag("RECOMMENDATIONS", report.recommendations, i2);
  xml += tag("TECHNICIAN_NAME", report.technician_name, i2);
  xml += tag("TECHNICIAN_COMPANY", report.technician_company, i2);
  xml += tag("HOURS_WORKED", report.hours_worked, i2);
  xml += tag("LABOR_COST", report.labor_cost, i2);
  xml += tag("TOTAL_COST", report.total_cost, i2);
  xml += tag("NEXT_SCHEDULED", report.next_scheduled_maintenance, i2);
  xml += `${i1}</Header>\n`;

  // Equipment (if present)
  if (equipment) {
    xml += `${i1}<Equipment>\n`;
    xml += tag("EQUNR", equipment.equipment_number, i2);
    xml += tag("EQART", equipment.equipment_type, i2);
    xml += tag("SERIAL_NO", equipment.serial_number, i2);
    xml += tag("MANUFACTURER", equipment.manufacturer, i2);
    xml += tag("MODEL", equipment.model, i2);
    xml += tag("LOCATION", equipment.site_location, i2);
    xml += tag("FUNCT_LOC", equipment.functional_location, i2);
    xml += `${i1}</Equipment>\n`;
  }

  // Operations
  if (operations.length > 0) {
    xml += `${i1}<Operations>\n`;
    for (const op of operations) {
      xml += `${i2}<Operation>\n`;
      xml += tag("OPERATION_NUMBER", op.operation_number, i3);
      xml += tag("DESCRIPTION", op.description, i3);
      xml += tag("WORK_CENTER", op.work_center, i3);
      xml += tag("LABOR_HOURS", op.labor_hours, i3);
      xml += tag("SCHEDULED_START", op.scheduled_start?.slice(0, 19), i3);
      xml += tag("SCHEDULED_END", op.scheduled_end?.slice(0, 19), i3);
      xml += tag("ACTUAL_START", op.actual_start?.slice(0, 19), i3);
      xml += tag("ACTUAL_END", op.actual_end?.slice(0, 19), i3);
      xml += `${i2}</Operation>\n`;
    }
    xml += `${i1}</Operations>\n`;
  }

  // Components (materials)
  if (components.length > 0) {
    xml += `${i1}<Components>\n`;
    for (const comp of components) {
      xml += `${i2}<Component>\n`;
      xml += tag("MATNR", comp.material_number, i3);
      xml += tag("MAKTX", comp.material_description, i3);
      xml += tag("MENGE", comp.quantity, i3);
      xml += tag("MEINS", comp.unit, i3);
      xml += tag("UNIT_COST", comp.unit_cost, i3);
      xml += `${i2}</Component>\n`;
    }
    xml += `${i1}</Components>\n`;
  }

  xml += "</MaintenanceOrder>";

  return xml;
}
