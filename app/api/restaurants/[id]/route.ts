import { NextRequest, NextResponse } from "next/server";
import { getRestaurantById, updateRestaurant, deleteRestaurant } from "@/lib/db";
import { restaurantSchema } from "@/lib/types";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/restaurants/[id] - Get single restaurant
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const restaurant = getRestaurantById(parseInt(id, 10));

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurace nenalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst restauraci" },
      { status: 500 }
    );
  }
}

// PATCH /api/restaurants/[id] - Update restaurant
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = restaurantSchema.parse(body);

    const restaurant = updateRestaurant(parseInt(id, 10), validated);

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurace nenalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurant);
  } catch (error: any) {
    console.error("Error updating restaurant:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Nepodařilo se aktualizovat restauraci" },
      { status: 500 }
    );
  }
}

// DELETE /api/restaurants/[id] - Delete restaurant
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const success = deleteRestaurant(parseInt(id, 10));

    if (!success) {
      return NextResponse.json(
        { error: "Restaurace nenalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    return NextResponse.json(
      { error: "Nepodařilo se smazat restauraci" },
      { status: 500 }
    );
  }
}
