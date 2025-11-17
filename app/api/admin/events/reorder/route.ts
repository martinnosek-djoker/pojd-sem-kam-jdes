import { NextRequest, NextResponse } from "next/server";
import { updateEventOrder } from "@/lib/db";

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

    await updateEventOrder(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating event order:", error);
    return NextResponse.json(
      { error: "Nepodařilo se aktualizovat pořadí akcí" },
      { status: 500 }
    );
  }
}
