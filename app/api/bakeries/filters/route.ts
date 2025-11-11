import { NextRequest, NextResponse } from "next/server";
import { getUniqueBakeryLocations } from "@/lib/db";

// GET /api/bakeries/filters - Get unique locations for bakeries
export async function GET(request: NextRequest) {
  try {
    const locations = await getUniqueBakeryLocations();

    return NextResponse.json({
      locations,
    });
  } catch (error) {
    console.error("Error fetching bakery filters:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst filtry" },
      { status: 500 }
    );
  }
}
