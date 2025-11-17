import { NextResponse } from "next/server";
import { getUniqueCafeLocations } from "@/lib/db";
import { jsonWithCors, handleOptionsRequest } from "@/lib/cors";

// OPTIONS /api/cafes/filters - Handle CORS preflight
export async function OPTIONS() {
  return handleOptionsRequest();
}

// GET /api/cafes/filters - Get unique filter values
export async function GET() {
  try {
    const locations = await getUniqueCafeLocations();

    return jsonWithCors({
      locations,
    });
  } catch (error: any) {
    console.error("Error in /api/cafes/filters:", error);
    return jsonWithCors(
      { error: "Nepodařilo se načíst filtry", details: error.message },
      { status: 500 }
    );
  }
}
