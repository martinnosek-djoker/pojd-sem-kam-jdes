import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// POST /api/admin/events/reorder - Update event order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Neplatný formát dat" },
        { status: 400 }
      );
    }

    // Update one by one
    for (const update of updates) {
      const { error } = await supabaseAdmin
        .from("events")
        .update({ display_order: update.display_order })
        .eq("id", update.id);

      if (error) {
        console.error("Error updating event order:", error);
        throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating event order:", error);
    return NextResponse.json(
      { error: "Nepodařilo se aktualizovat pořadí akcí" },
      { status: 500 }
    );
  }
}
