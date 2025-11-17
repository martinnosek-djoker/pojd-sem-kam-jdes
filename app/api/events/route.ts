import { NextResponse } from "next/server";
import { getAllEvents } from "@/lib/db";
import { jsonWithCors, handleOptionsRequest } from "@/lib/cors";

// OPTIONS /api/events - Handle CORS preflight
export async function OPTIONS() {
  return handleOptionsRequest();
}

// GET /api/events - Get all events
export async function GET() {
  try {
    const events = await getAllEvents();
    return jsonWithCors(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return jsonWithCors(
      { error: "Nepodařilo se načíst akce" },
      { status: 500 }
    );
  }
}
