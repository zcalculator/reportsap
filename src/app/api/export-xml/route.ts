import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateSAPPMXml } from "@/lib/sap-pm-xml";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Report ID required" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("*, equipment (*)")
      .eq("id", id)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    const { data: operations } = await supabase
      .from("report_operations")
      .select("*")
      .eq("report_id", id)
      .order("operation_number");

    const { data: components } = await supabase
      .from("report_components")
      .select("*")
      .eq("report_id", id);

    const xml = generateSAPPMXml(
      report,
      operations ?? [],
      components ?? [],
      Array.isArray(report.equipment) ? report.equipment[0] : report.equipment
    );

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": `attachment; filename="maintenance-order-${report.reference_number || id}.xml"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Export failed" },
      { status: 500 }
    );
  }
}
