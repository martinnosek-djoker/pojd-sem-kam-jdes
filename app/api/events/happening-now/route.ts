import { NextResponse } from "next/server";
import { getHappeningNowEvents } from "@/lib/db";

export async function GET() {
  try {
    const events = await getHappeningNowEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error in /api/events/happening-now:", error);
    return NextResponse.json(
      { error: "Failed to fetch happening now events" },
      { status: 500 }
    );
  }
}
