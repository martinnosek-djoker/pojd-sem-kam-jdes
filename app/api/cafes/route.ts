import { NextRequest, NextResponse } from "next/server";
import { getAllCafes, createCafe } from "@/lib/db";
import { cafeSchema } from "@/lib/types";

// GET /api/cafes - Get all cafes
export async function GET() {
  try {
    const cafes = await getAllCafes();
    return NextResponse.json(cafes);
  } catch (error: any) {
    console.error("Error in /api/cafes:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst kavárny", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/cafes - Create new cafe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = cafeSchema.parse(body);

    const cafe = await createCafe(validated);

    return NextResponse.json(cafe, { status: 201 });
  } catch (error: any) {
    console.error("Error creating cafe:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Nepodařilo se vytvořit kavárnu" },
      { status: 500 }
    );
  }
}
