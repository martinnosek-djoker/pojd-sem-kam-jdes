import { NextResponse } from "next/server";
import { getUniqueLocations, getUniqueCuisineTypes } from "@/lib/db";

// GET /api/restaurants/filters - Get unique locations and cuisine types
export async function GET() {
  try {
    const [locations, cuisineTypes] = await Promise.all([
      getUniqueLocations(),
      getUniqueCuisineTypes(),
    ]);

    return NextResponse.json({
      locations,
      cuisineTypes,
    });
  } catch (error) {
    console.error("Error fetching filters:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst filtry" },
      { status: 500 }
    );
  }
}
