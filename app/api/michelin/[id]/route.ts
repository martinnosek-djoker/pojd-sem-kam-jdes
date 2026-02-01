import { NextRequest, NextResponse } from "next/server";
import {
  getMichelinRestaurantById,
  updateMichelinRestaurant,
  deleteMichelinRestaurant,
} from "@/lib/db";
import { michelinRestaurantSchema } from "@/lib/types";
import { jsonWithCors, handleOptionsRequest } from "@/lib/cors";

// Required for static export - no static params to generate
export async function generateStaticParams() {
  return [];
}

// OPTIONS /api/michelin/[id] - Handle CORS preflight
export async function OPTIONS() {
  return handleOptionsRequest();
}

// GET /api/michelin/[id] - Get a single Michelin restaurant
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const restaurant = await getMichelinRestaurantById(id);
    return jsonWithCors(restaurant);
  } catch (error) {
    console.error("Error fetching Michelin restaurant:", error);
    return jsonWithCors(
      { error: "Nepodařilo se načíst Michelinskou restauraci" },
      { status: 404 }
    );
  }
}

// PUT /api/michelin/[id] - Update a Michelin restaurant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const validated = michelinRestaurantSchema.parse(body);

    const updatedRestaurant = await updateMichelinRestaurant(id, validated);

    return jsonWithCors(updatedRestaurant);
  } catch (error: any) {
    console.error("Error updating Michelin restaurant:", error);
    return jsonWithCors(
      { error: error.message || "Nepodařilo se aktualizovat Michelinskou restauraci" },
      { status: 400 }
    );
  }
}

// DELETE /api/michelin/[id] - Delete a Michelin restaurant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await deleteMichelinRestaurant(id);
    return jsonWithCors({ message: "Michelinská restaurace byla úspěšně smazána" });
  } catch (error) {
    console.error("Error deleting Michelin restaurant:", error);
    return jsonWithCors(
      { error: "Nepodařilo se smazat Michelinskou restauraci" },
      { status: 500 }
    );
  }
}
