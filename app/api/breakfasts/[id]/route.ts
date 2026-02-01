import { NextRequest, NextResponse } from "next/server";
import { getBreakfastById, updateBreakfast, deleteBreakfast } from "@/lib/db";
import { breakfastSchema } from "@/lib/types";

// GET /api/breakfasts/[id] - Get single breakfast
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const breakfast = await getBreakfastById(id);

    if (!breakfast) {
      return NextResponse.json(
        { error: "Snídaně nenalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json(breakfast);
  } catch (error) {
    console.error("Error fetching breakfast:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst snídani" },
      { status: 500 }
    );
  }
}

// PUT /api/breakfasts/[id] - Update breakfast
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const body = await request.json();
    const validated = breakfastSchema.parse(body);

    const breakfast = await updateBreakfast(id, validated);

    if (!breakfast) {
      return NextResponse.json(
        { error: "Snídaně nenalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json(breakfast);
  } catch (error: any) {
    console.error("Error updating breakfast:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Nepodařilo se aktualizovat snídani" },
      { status: 500 }
    );
  }
}

// DELETE /api/breakfasts/[id] - Delete breakfast
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const success = await deleteBreakfast(id);

    if (!success) {
      return NextResponse.json(
        { error: "Snídaně nenalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting breakfast:", error);
    return NextResponse.json(
      { error: "Nepodařilo se smazat snídani" },
      { status: 500 }
    );
  }
}
