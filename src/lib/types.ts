export type EquipmentType =
  | "wind_turbine"
  | "gearbox"
  | "generator"
  | "hydraulic_system"
  | "blade"
  | "bearing"
  | "transformer"
  | "nacelle"
  | "tower"
  | "other";

export type MaintenanceType =
  | "preventive"
  | "corrective"
  | "predictive"
  | "inspection"
  | "emergency"
  | "modification";

export type ReportStatus = "draft" | "pending_review" | "approved" | "exported";

export interface Equipment {
  id: string;
  equipment_number: string;
  equipment_type: EquipmentType;
  serial_number?: string;
  manufacturer?: string;
  model?: string;
  site_location?: string;
  functional_location?: string;
  installation_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  storage_path: string;
  mime_type?: string;
  created_at: string;
}

export interface Report {
  id: string;
  reference_number?: string;
  source_file_id?: string;
  equipment_id?: string;
  report_date: string;
  scheduled_start_date?: string;
  scheduled_finish_date?: string;
  actual_start_date?: string;
  actual_finish_date?: string;
  order_type?: string;
  maintenance_type: MaintenanceType;
  status: ReportStatus;
  priority?: string;
  plant_id?: string;
  work_center?: string;
  cost_center?: string;
  company_code?: string;
  functional_location?: string;
  description?: string;
  work_performed?: string;
  findings?: string;
  recommendations?: string;
  technician_name?: string;
  technician_company?: string;
  hours_worked?: number;
  labor_cost?: number;
  total_cost?: number;
  next_scheduled_maintenance?: string;
  raw_extracted_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  equipment?: Equipment;
}

export interface ReportOperation {
  id: string;
  report_id: string;
  operation_number: number;
  description?: string;
  work_center?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  actual_start?: string;
  actual_end?: string;
  labor_hours?: number;
  created_at: string;
}

export interface ReportComponent {
  id: string;
  report_id: string;
  material_number?: string;
  material_description?: string;
  quantity: number;
  unit?: string;
  unit_cost?: number;
  created_at: string;
}

export interface GeminiExtractionResult {
  report: Partial<Report>;
  equipment?: Partial<Equipment>;
  operations?: Partial<ReportOperation>[];
  components?: Partial<ReportComponent>[];
}
