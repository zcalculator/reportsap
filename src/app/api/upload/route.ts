import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseDocument } from "@/lib/parse-document";
import { extractWithGemini } from "@/lib/gemini-extract";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const geminiApiKey = process.env.GEMINI_API_KEY!;

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local" },
        { status: 500 }
      );
    }
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "AI API key not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "text/csv",
      "application/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/xml",
      "text/xml",
      "text/plain",
    ];

    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowedExt = ["csv", "xlsx", "xls", "xml", "txt"];

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExt.includes(ext || "")
    ) {
      return NextResponse.json(
        { error: "Invalid file type. Use CSV, XLSX, XLS, XML, or TXT." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { text } = parseDocument(buffer, file.type, file.name);

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "Document appears empty or could not be parsed" },
        { status: 400 }
      );
    }

    // Extract with AI
    const extracted = await extractWithGemini(text, geminiApiKey);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upload file to Supabase Storage
    const storagePath = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { error: uploadError } = await supabase.storage
      .from("report-files")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      // Continue without storage - we can still save the report
    }

    // Insert file record
    const { data: fileRecord, error: fileError } = await supabase
      .from("report_files")
      .insert({
        file_name: file.name,
        file_type: ext || "unknown",
        file_size: file.size,
        storage_path: uploadError ? "" : storagePath,
        mime_type: file.type,
      })
      .select("id")
      .single();

    if (fileError) {
      console.error("File record error:", fileError);
    }

    // Upsert equipment if present
    let equipmentId: string | null = null;
    const validEquipmentTypes = [
      "wind_turbine", "gearbox", "generator", "hydraulic_system",
      "blade", "bearing", "transformer", "nacelle", "tower", "other",
    ];
    if (extracted.equipment?.equipment_number) {
      const eqType = String(extracted.equipment.equipment_type ?? "other")
        .toLowerCase()
        .replace(/\s+/g, "_");
      const equipmentType = validEquipmentTypes.includes(eqType)
        ? eqType
        : "other";

      const { data: eq } = await supabase
        .from("equipment")
        .upsert(
          {
            equipment_number: extracted.equipment.equipment_number,
            equipment_type: equipmentType,
            serial_number: extracted.equipment.serial_number ?? null,
            manufacturer: extracted.equipment.manufacturer ?? null,
            model: extracted.equipment.model ?? null,
            site_location: extracted.equipment.site_location ?? null,
            functional_location: extracted.equipment.functional_location ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "equipment_number" }
        )
        .select("id")
        .single();

      equipmentId = eq?.id ?? null;
    }

    // Ensure unique reference_number (avoid duplicate key on re-upload)
    let referenceNumber = extracted.report?.reference_number ?? null;
    if (referenceNumber) {
      const { data: existing } = await supabase
        .from("reports")
        .select("id")
        .eq("reference_number", referenceNumber)
        .maybeSingle();
      if (existing) {
        referenceNumber = `${referenceNumber}-${Date.now().toString(36)}`;
      }
    }

    // Insert report
    const reportData = {
      reference_number: referenceNumber,
      source_file_id: fileRecord?.id ?? null,
      equipment_id: equipmentId,
      report_date: extracted.report?.report_date ?? new Date().toISOString().slice(0, 10),
      scheduled_start_date: extracted.report?.scheduled_start_date ?? null,
      scheduled_finish_date: extracted.report?.scheduled_finish_date ?? null,
      actual_start_date: extracted.report?.actual_start_date ?? null,
      actual_finish_date: extracted.report?.actual_finish_date ?? null,
      order_type: extracted.report?.order_type ?? null,
      maintenance_type: extracted.report?.maintenance_type ?? "inspection",
      status: "draft",
      priority: extracted.report?.priority ?? "medium",
      plant_id: extracted.report?.plant_id ?? null,
      work_center: extracted.report?.work_center ?? null,
      cost_center: extracted.report?.cost_center ?? null,
      company_code: extracted.report?.company_code ?? null,
      functional_location: extracted.report?.functional_location ?? null,
      description: extracted.report?.description ?? null,
      work_performed: extracted.report?.work_performed ?? null,
      findings: extracted.report?.findings ?? null,
      recommendations: extracted.report?.recommendations ?? null,
      technician_name: extracted.report?.technician_name ?? null,
      technician_company: extracted.report?.technician_company ?? null,
      hours_worked: extracted.report?.hours_worked ?? null,
      labor_cost: extracted.report?.labor_cost ?? null,
      total_cost: extracted.report?.total_cost ?? null,
      next_scheduled_maintenance: extracted.report?.next_scheduled_maintenance ?? null,
      raw_extracted_data: extracted as unknown as Record<string, unknown>,
      additional_points:
        extracted.additional_points &&
        Object.keys(extracted.additional_points).length > 0
          ? (extracted.additional_points as Record<string, unknown>)
          : null,
    };

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert(reportData)
      .select("id")
      .single();

    if (reportError) {
      return NextResponse.json(
        { error: "Failed to save report: " + reportError.message },
        { status: 500 }
      );
    }

    // Insert operations
    if (extracted.operations?.length && report?.id) {
      await supabase.from("report_operations").insert(
        extracted.operations.map((op, i) => ({
          report_id: report.id,
          operation_number: op.operation_number ?? i + 1,
          description: op.description ?? null,
          work_center: op.work_center ?? null,
          labor_hours: op.labor_hours ?? null,
        }))
      );
    }

    // Insert components
    if (extracted.components?.length && report?.id) {
      await supabase.from("report_components").insert(
        extracted.components.map((comp) => ({
          report_id: report.id,
          material_number: comp.material_number ?? null,
          material_description: comp.material_description ?? null,
          quantity: comp.quantity ?? 1,
          unit: comp.unit ?? "EA",
          unit_cost: comp.unit_cost ?? null,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      reportId: report?.id,
      message: "Document processed and saved successfully",
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
