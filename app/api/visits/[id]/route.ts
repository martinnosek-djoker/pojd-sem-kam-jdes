import { NextRequest, NextResponse } from "next/server";
import { updateVisit, deleteVisit } from "@/lib/db";
import { visitSchema } from "@/lib/types";

// Force dynamic rendering - API routes cannot be statically generated
export const dynamic = 'force-dynamic';

// PUT /api/visits/[id] - Update a visit (date/dishes)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const body = await request.json();
    const validated = visitSchema.partial().parse(body);

    const visit = await updateVisit(id, validated);

    if (!visit) {
      return NextResponse.json(
        { error: "Návštěva nenalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json(visit);
  } catch (error: any) {
    console.error("Error updating visit:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Nepodařilo se upravit návštěvu" },
      { status: 500 }
    );
  }
}

// DELETE /api/visits/[id] - Delete a visit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const id = parseInt(idString);
    const success = await deleteVisit(id);

    if (!success) {
      return NextResponse.json(
        { error: "Návštěva nenalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting visit:", error);
    return NextResponse.json(
      { error: "Nepodařilo se smazat návštěvu" },
      { status: 500 }
    );
  }
}
