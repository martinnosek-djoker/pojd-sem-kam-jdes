import { NextRequest, NextResponse } from "next/server";
import { getAllMichelinRestaurants, createMichelinRestaurant } from "@/lib/db";
import { michelinRestaurantSchema } from "@/lib/types";
import { jsonWithCors, handleOptionsRequest } from "@/lib/cors";

// OPTIONS /api/michelin - Handle CORS preflight
export async function OPTIONS() {
  return handleOptionsRequest();
}

// GET /api/michelin - Get all Michelin restaurants
export async function GET() {
  try {
    const restaurants = await getAllMichelinRestaurants();
    return jsonWithCors(restaurants);
  } catch (error) {
    console.error("Error fetching Michelin restaurants:", error);
    return jsonWithCors(
      { error: "Nepodařilo se načíst Michelinské restaurace" },
      { status: 500 }
    );
  }
}

// POST /api/michelin - Create new Michelin restaurant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = michelinRestaurantSchema.parse(body);

    const newRestaurant = await createMichelinRestaurant(validated);

    return jsonWithCors(newRestaurant, { status: 201 });
  } catch (error: any) {
    console.error("Error creating Michelin restaurant:", error);
    return jsonWithCors(
      { error: error.message || "Nepodařilo se vytvořit Michelinskou restauraci" },
      { status: 400 }
    );
  }
}
