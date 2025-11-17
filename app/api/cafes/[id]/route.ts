import { NextRequest, NextResponse } from "next/server";
import { getCafeById, updateCafe, deleteCafe } from "@/lib/db";
import { cafeSchema } from "@/lib/types";

// GET /api/cafes/[id] - Get single cafe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const cafe = await getCafeById(id);

    if (!cafe) {
      return NextResponse.json(
        { error: "Kavárna nenalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json(cafe);
  } catch (error) {
    console.error("Error fetching cafe:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst kavárnu" },
      { status: 500 }
    );
  }
}

// PUT /api/cafes/[id] - Update cafe
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const body = await request.json();
    const validated = cafeSchema.parse(body);

    const cafe = await updateCafe(id, validated);

    if (!cafe) {
      return NextResponse.json(
        { error: "Kavárna nenalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json(cafe);
  } catch (error: any) {
    console.error("Error updating cafe:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Nepodařilo se aktualizovat kavárnu" },
      { status: 500 }
    );
  }
}

// DELETE /api/cafes/[id] - Delete cafe
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const success = await deleteCafe(id);

    if (!success) {
      return NextResponse.json(
        { error: "Kavárna nenalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting cafe:", error);
    return NextResponse.json(
      { error: "Nepodařilo se smazat kavárnu" },
      { status: 500 }
    );
  }
}
