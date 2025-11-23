import { NextRequest, NextResponse } from "next/server";
import {
  getChristmasTipById,
  updateChristmasTip,
  deleteChristmasTip,
} from "@/lib/db";
import { christmasTipSchema } from "@/lib/types";
import { jsonWithCors, handleOptionsRequest } from "@/lib/cors";

// OPTIONS /api/christmas-tips/[id] - Handle CORS preflight
export async function OPTIONS() {
  return handleOptionsRequest();
}

// GET /api/christmas-tips/[id] - Get a single Christmas tip
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const tip = await getChristmasTipById(id);
    return jsonWithCors(tip);
  } catch (error) {
    console.error("Error fetching Christmas tip:", error);
    return jsonWithCors(
      { error: "Nepodařilo se načíst vánoční tip" },
      { status: 404 }
    );
  }
}

// PUT /api/christmas-tips/[id] - Update a Christmas tip
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const validated = christmasTipSchema.parse(body);

    const updatedTip = await updateChristmasTip(id, validated);

    return jsonWithCors(updatedTip);
  } catch (error: any) {
    console.error("Error updating Christmas tip:", error);
    return jsonWithCors(
      { error: error.message || "Nepodařilo se aktualizovat vánoční tip" },
      { status: 400 }
    );
  }
}

// DELETE /api/christmas-tips/[id] - Delete a Christmas tip
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await deleteChristmasTip(id);
    return jsonWithCors({ message: "Vánoční tip byl úspěšně smazán" });
  } catch (error) {
    console.error("Error deleting Christmas tip:", error);
    return jsonWithCors(
      { error: "Nepodařilo se smazat vánoční tip" },
      { status: 500 }
    );
  }
}
