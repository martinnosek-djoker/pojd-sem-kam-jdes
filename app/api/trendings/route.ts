import { NextRequest, NextResponse } from "next/server";
import { getAllTrendings, createTrending } from "@/lib/db";
import { trendingSchema } from "@/lib/types";
import { jsonWithCors, handleOptionsRequest } from "@/lib/cors";

// OPTIONS /api/trendings - Handle CORS preflight
export async function OPTIONS() {
  return handleOptionsRequest();
}

// GET /api/trendings - Get all trendings
export async function GET() {
  try {
    const trendings = await getAllTrendings();
    return jsonWithCors(trendings);
  } catch (error) {
    console.error("Error fetching trendings:", error);
    return jsonWithCors(
      { error: "Nepodařilo se načíst trending podniky" },
      { status: 500 }
    );
  }
}

// POST /api/trendings - Create new trending
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = trendingSchema.parse(body);

    const trending = await createTrending(validated);

    return NextResponse.json(trending, { status: 201 });
  } catch (error: any) {
    console.error("Error creating trending:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Nepodařilo se vytvořit trending podnik" },
      { status: 500 }
    );
  }
}
