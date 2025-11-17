import { NextResponse } from "next/server";
import { getUniqueCafeLocations } from "@/lib/db";

// GET /api/cafes/filters - Get unique filter values
export async function GET() {
  try {
    const locations = await getUniqueCafeLocations();

    return NextResponse.json({
      locations,
    });
  } catch (error: any) {
    console.error("Error in /api/cafes/filters:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst filtry", details: error.message },
      { status: 500 }
    );
  }
}
