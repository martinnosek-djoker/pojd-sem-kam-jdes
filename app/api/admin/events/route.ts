import { NextRequest, NextResponse } from "next/server";
import { getAllEvents, createEvent } from "@/lib/db";
import { eventSchema } from "@/lib/types";

// GET /api/admin/events - Get all events
export async function GET() {
  try {
    const events = await getAllEvents();
    return NextResponse.json(events);
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

    const event = await createEvent(validated);

    return NextResponse.json(event, { status: 201 });
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
