import { NextRequest, NextResponse } from "next/server";
import { getAllBakeries, createBakery } from "@/lib/db";
import { bakerySchema } from "@/lib/types";

// GET /api/bakeries - Get all bakeries
export async function GET(request: NextRequest) {
  try {
    const bakeries = await getAllBakeries();
    return NextResponse.json(bakeries);
  } catch (error) {
    console.error("Error fetching bakeries:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst cukrárny" },
      { status: 500 }
    );
  }
}

// POST /api/bakeries - Create new bakery
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = bakerySchema.parse(body);

    const bakery = await createBakery(validated);

    return NextResponse.json(bakery, { status: 201 });
  } catch (error: any) {
    console.error("Error creating bakery:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Nepodařilo se vytvořit cukrárnu" },
      { status: 500 }
    );
  }
}
