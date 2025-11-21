import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { eventSchema } from "@/lib/types";

// GET /api/admin/events - Get all events
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("events")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst akce" },
      { status: 500 }
    );
  }
}

// POST /api/admin/events - Create new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[POST /api/admin/events] Request body:", body);

    const validated = eventSchema.parse(body);
    console.log("[POST /api/admin/events] Validated data:", validated);

    const insertData = {
      name: validated.name,
      location: validated.location || null,
      date: validated.date || null,
      start_date: validated.start_date || null,
      end_date: validated.end_date || null,
      link: validated.link || null,
      display_order: validated.display_order,
    };

    const { data, error } = await supabaseAdmin
      .from("events")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/admin/events] Error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      );
    }

    // Supabase error
    if (error.message || error.details || error.code) {
      return NextResponse.json(
        {
          error: error.message || "Nepodařilo se vytvořit akci",
          details: error.details,
          hint: error.hint,
          code: error.code
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Nepodařilo se vytvořit akci" },
      { status: 500 }
    );
  }
}
