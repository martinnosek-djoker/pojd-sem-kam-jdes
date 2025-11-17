import { NextResponse } from "next/server";
import { getUniqueLocations, getUniqueCuisineTypes } from "@/lib/db";
import { jsonWithCors, handleOptionsRequest } from "@/lib/cors";

// OPTIONS /api/restaurants/filters - Handle CORS preflight
export async function OPTIONS() {
  return handleOptionsRequest();
}

// GET /api/restaurants/filters - Get unique locations and cuisine types
export async function GET() {
  try {
    const [locations, cuisineTypes] = await Promise.all([
      getUniqueLocations(),
      getUniqueCuisineTypes(),
    ]);

    return jsonWithCors({
      locations,
      cuisineTypes,
    });
  } catch (error) {
    console.error("Error fetching filters:", error);
    return jsonWithCors(
      { error: "Nepodařilo se načíst filtry" },
      { status: 500 }
    );
  }
}
