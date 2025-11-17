import { NextRequest, NextResponse } from "next/server";
import { getUniqueBakeryLocations } from "@/lib/db";
import { jsonWithCors, handleOptionsRequest } from "@/lib/cors";

// OPTIONS /api/bakeries/filters - Handle CORS preflight
export async function OPTIONS() {
  return handleOptionsRequest();
}

// GET /api/bakeries/filters - Get unique locations for bakeries
export async function GET(request: NextRequest) {
  try {
    const locations = await getUniqueBakeryLocations();

    return jsonWithCors({
      locations,
    });
  } catch (error) {
    console.error("Error fetching bakery filters:", error);
    return jsonWithCors(
      { error: "Nepodařilo se načíst filtry" },
      { status: 500 }
    );
  }
}
