import { NextRequest, NextResponse } from "next/server";
import { getBakeryById, updateBakery, deleteBakery } from "@/lib/db";
import { bakerySchema } from "@/lib/types";

// GET /api/bakeries/[id] - Get single bakery
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const bakery = await getBakeryById(id);

    if (!bakery) {
      return NextResponse.json(
        { error: "Cukrárna nenalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json(bakery);
  } catch (error) {
    console.error("Error fetching bakery:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst cukrárnu" },
      { status: 500 }
    );
  }
}

// PUT /api/bakeries/[id] - Update bakery
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const body = await request.json();
    const validated = bakerySchema.parse(body);

    const bakery = await updateBakery(id, validated);

    if (!bakery) {
      return NextResponse.json(
        { error: "Cukrárna nenalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json(bakery);
  } catch (error: any) {
    console.error("Error updating bakery:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Nepodařilo se aktualizovat cukrárnu" },
      { status: 500 }
    );
  }
}

// DELETE /api/bakeries/[id] - Delete bakery
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const success = await deleteBakery(id);

    if (!success) {
      return NextResponse.json(
        { error: "Cukrárna nenalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bakery:", error);
    return NextResponse.json(
      { error: "Nepodařilo se smazat cukrárnu" },
      { status: 500 }
    );
  }
}
