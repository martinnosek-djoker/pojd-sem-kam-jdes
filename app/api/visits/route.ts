import { NextRequest, NextResponse } from "next/server";
import { getRecentVisits, getAllVisits, createVisit } from "@/lib/db";
import { visitSchema } from "@/lib/types";
import { jsonWithCors, handleOptionsRequest } from "@/lib/cors";

// OPTIONS /api/visits - Handle CORS preflight
export async function OPTIONS() {
  return handleOptionsRequest();
}

// GET /api/visits - Get visits, optionally limited (?limit=10) for the homepage carousel
export async function GET(request: NextRequest) {
  try {
    const limitParam = request.nextUrl.searchParams.get("limit");
    const visits = limitParam
      ? await getRecentVisits(parseInt(limitParam, 10))
      : await getAllVisits();

    return jsonWithCors(visits);
  } catch (error: any) {
    console.error("Error in /api/visits:", error);
    return jsonWithCors(
      { error: "Nepodařilo se načíst návštěvy", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/visits - Log a new visit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = visitSchema.parse(body);

    const visit = await createVisit(validated);

    return NextResponse.json(visit, { status: 201 });
  } catch (error: any) {
    console.error("Error creating visit:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Nepodařilo se uložit návštěvu" },
      { status: 500 }
    );
  }
}
