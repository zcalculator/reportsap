import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const { data: report, error } = await supabase
        .from("reports")
        .select(
          `
          *,
          equipment (*),
          report_operations (*),
          report_components (*)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      return NextResponse.json(report);
    }

    const { data: reports, error } = await supabase
      .from("reports")
      .select(
        `
        id,
        reference_number,
        report_date,
        maintenance_type,
        status,
        description,
        equipment_id,
        created_at,
        equipment (equipment_number, equipment_type, site_location)
      `
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(reports);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch" },
      { status: 500 }
    );
  }
}
