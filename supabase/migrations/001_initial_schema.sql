-- Maintenance Report Schema for SAP PM Integration
-- Supports wind turbines, gearboxes, generators, and other heavy machinery

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Equipment types enum (common in industrial maintenance)
CREATE TYPE equipment_type_enum AS ENUM (
  'wind_turbine',
  'gearbox',
  'generator',
  'hydraulic_system',
  'blade',
  'bearing',
  'transformer',
  'nacelle',
  'tower',
  'other'
);

-- Maintenance type (aligns with SAP PM)
CREATE TYPE maintenance_type_enum AS ENUM (
  'preventive',
  'corrective',
  'predictive',
  'inspection',
  'emergency',
  'modification'
);

-- Report status
CREATE TYPE report_status_enum AS ENUM (
  'draft',
  'pending_review',
  'approved',
  'exported'
);

-- Equipment master (machinery being maintained)
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_number VARCHAR(50) UNIQUE NOT NULL,  -- SAP EQUNR
  equipment_type equipment_type_enum NOT NULL,
  serial_number VARCHAR(100),
  manufacturer VARCHAR(200),
  model VARCHAR(200),
  site_location VARCHAR(300),
  functional_location VARCHAR(100),  -- SAP FUNCT_LOC
  installation_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uploaded files (original documents before extraction)
CREATE TABLE report_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,  -- xlsx, csv, xml, pdf
  file_size INTEGER,
  storage_path TEXT NOT NULL,
  mime_type VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main maintenance reports (header - aligns with SAP PM order structure)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(50) UNIQUE,  -- SAP ORDERID
  source_file_id UUID REFERENCES report_files(id) ON DELETE SET NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
  
  -- Dates (SAP PM alignment)
  report_date DATE NOT NULL,
  scheduled_start_date TIMESTAMPTZ,
  scheduled_finish_date TIMESTAMPTZ,
  actual_start_date TIMESTAMPTZ,
  actual_finish_date TIMESTAMPTZ,
  
  -- Classification
  order_type VARCHAR(20),  -- BM, PM, etc.
  maintenance_type maintenance_type_enum NOT NULL DEFAULT 'inspection',
  status report_status_enum NOT NULL DEFAULT 'draft',
  priority VARCHAR(20) DEFAULT 'medium',
  
  -- Organizational (SAP PM)
  plant_id VARCHAR(50),  -- IWERK
  work_center VARCHAR(50),  -- VAPLZ
  cost_center VARCHAR(50),
  company_code VARCHAR(20),
  functional_location VARCHAR(100),
  
  -- Work details
  description TEXT,
  work_performed TEXT,
  findings TEXT,
  recommendations TEXT,
  
  -- Personnel
  technician_name VARCHAR(200),
  technician_company VARCHAR(200),
  
  -- Cost & time
  hours_worked DECIMAL(10, 2),
  labor_cost DECIMAL(15, 2),
  total_cost DECIMAL(15, 2),
  
  -- Planning
  next_scheduled_maintenance DATE,
  
  -- Raw extracted JSON (for unstructured data from AI extraction)
  raw_extracted_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Operations (SAP PM operations - work steps)
CREATE TABLE report_operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  operation_number INTEGER NOT NULL,
  description TEXT,
  work_center VARCHAR(50),
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  labor_hours DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, operation_number)
);

-- Components/Parts (materials used - SAP reservations)
CREATE TABLE report_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  material_number VARCHAR(50),  -- SAP MATNR
  material_description TEXT,
  quantity DECIMAL(15, 3) NOT NULL DEFAULT 1,
  unit VARCHAR(20) DEFAULT 'EA',
  unit_cost DECIMAL(15, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_reports_equipment ON reports(equipment_id);
CREATE INDEX idx_reports_date ON reports(report_date);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reference ON reports(reference_number);
CREATE INDEX idx_reports_functional_loc ON reports(functional_location);
CREATE INDEX idx_report_operations_report ON report_operations(report_id);
CREATE INDEX idx_report_components_report ON report_components(report_id);
CREATE INDEX idx_equipment_number ON equipment(equipment_number);
CREATE INDEX idx_equipment_type ON equipment(equipment_type);

-- Storage bucket for uploaded files (run via Supabase Dashboard or SQL)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('report-files', 'report-files', false);
-- CREATE POLICY "Allow uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'report-files');
