import { NextRequest, NextResponse } from "next/server";
import { getAllBreakfasts, createBreakfast } from "@/lib/db";
import { breakfastSchema } from "@/lib/types";
import { jsonWithCors, handleOptionsRequest } from "@/lib/cors";

// OPTIONS /api/breakfasts - Handle CORS preflight
export async function OPTIONS() {
  return handleOptionsRequest();
}

// GET /api/breakfasts - Get all breakfasts
export async function GET() {
  try {
    const breakfasts = await getAllBreakfasts();
    return jsonWithCors(breakfasts);
  } catch (error: any) {
    console.error("Error in /api/breakfasts:", error);
    return jsonWithCors(
      { error: "Nepodařilo se načíst snídaně", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/breakfasts - Create new breakfast
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = breakfastSchema.parse(body);

    const breakfast = await createBreakfast(validated);

    return NextResponse.json(breakfast, { status: 201 });
  } catch (error: any) {
    console.error("Error creating breakfast:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Nepodařilo se vytvořit snídani" },
      { status: 500 }
    );
  }
}
