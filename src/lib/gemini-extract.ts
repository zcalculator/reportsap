import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeminiExtractionResult } from "./types";

const EXTRACTION_PROMPT = `You are an expert at extracting maintenance and service report data from documents. 
Extract structured data for industrial machinery maintenance reports (wind turbines, gearboxes, generators, etc.).

Return a valid JSON object with this exact structure. Use null for unknown values. Dates should be ISO format (YYYY-MM-DD).

{
  "report": {
    "reference_number": "string or null",
    "report_date": "YYYY-MM-DD",
    "scheduled_start_date": "YYYY-MM-DD or null",
    "scheduled_finish_date": "YYYY-MM-DD or null",
    "actual_start_date": "YYYY-MM-DD or null",
    "actual_finish_date": "YYYY-MM-DD or null",
    "order_type": "string like BM, PM or null",
    "maintenance_type": "preventive|corrective|predictive|inspection|emergency|modification",
    "priority": "low|medium|high or null",
    "plant_id": "string or null",
    "work_center": "string or null",
    "cost_center": "string or null",
    "company_code": "string or null",
    "functional_location": "string or null",
    "description": "string or null",
    "work_performed": "string or null",
    "findings": "string or null",
    "recommendations": "string or null",
    "technician_name": "string or null",
    "technician_company": "string or null",
    "hours_worked": number or null,
    "labor_cost": number or null,
    "total_cost": number or null,
    "next_scheduled_maintenance": "YYYY-MM-DD or null"
  },
  "equipment": {
    "equipment_number": "string",
    "equipment_type": "wind_turbine|gearbox|generator|hydraulic_system|blade|bearing|transformer|nacelle|tower|other",
    "serial_number": "string or null",
    "manufacturer": "string or null",
    "model": "string or null",
    "site_location": "string or null",
    "functional_location": "string or null"
  },
  "operations": [
    {
      "operation_number": 1,
      "description": "string",
      "work_center": "string or null",
      "labor_hours": number or null
    }
  ],
  "components": [
    {
      "material_number": "string or null",
      "material_description": "string",
      "quantity": number,
      "unit": "string or null",
      "unit_cost": number or null
    }
  ],
  "additional_points": {}
}

IMPORTANT - additional_points: Any important data in the document that does NOT fit the fields above (report, equipment, operations, components) must go here. Use a flexible JSON object: keys are descriptive names (snake_case), values can be strings, numbers, dates, booleans, arrays, or nested objects. Examples: {"warranty_info": "2 years"}, {"custom_metrics": {"vibration_readings": [0.1, 0.2]}}, {"contract_details": {"po_number": "PO-123", "terms": "Net 30"}}. Use null or empty {} if nothing extra.
Extract all relevant data from the document. If equipment type is unclear, infer from context (e.g., blade inspection = wind_turbine).
Return ONLY valid JSON, no markdown or explanation.`;

export async function extractWithGemini(
  documentText: string,
  apiKey: string
): Promise<GeminiExtractionResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const result = await model.generateContent([
    EXTRACTION_PROMPT,
    "Document content:\n\n" + documentText.slice(0, 100000), // Limit context
  ]);

  const response = result.response;
  const text = response.text();

  // Strip markdown code blocks if present
  let jsonStr = text.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  // Extract only the first complete JSON object (Gemini may append explanation/text after)
  const firstBrace = jsonStr.indexOf("{");
  if (firstBrace === -1) {
    throw new Error("No JSON object found in model response");
  }
  let depth = 0;
  let end = -1;
  for (let i = firstBrace; i < jsonStr.length; i++) {
    if (jsonStr[i] === "{") depth++;
    else if (jsonStr[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  jsonStr = end > 0 ? jsonStr.slice(firstBrace, end) : jsonStr.slice(firstBrace);

  const parsed = JSON.parse(jsonStr) as GeminiExtractionResult;

  // Normalize maintenance_type
  if (parsed.report?.maintenance_type) {
    const valid = [
      "preventive",
      "corrective",
      "predictive",
      "inspection",
      "emergency",
      "modification",
    ];
    const val = String(parsed.report.maintenance_type).toLowerCase();
    parsed.report.maintenance_type = valid.includes(val)
      ? (val as GeminiExtractionResult["report"]["maintenance_type"])
      : "inspection";
  }

  return parsed;
}
