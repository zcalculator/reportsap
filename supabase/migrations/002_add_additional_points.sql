-- Additional points: important data from the document that does not map to
-- the defined schema. Supports nested objects and arrays (JSONB).
ALTER TABLE reports
  ADD COLUMN additional_points JSONB;

COMMENT ON COLUMN reports.additional_points IS 'Supplementary data extracted from the document that does not map to defined report fields. Supports nested objects and arrays.';
