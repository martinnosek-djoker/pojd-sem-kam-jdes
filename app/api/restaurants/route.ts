import { NextRequest, NextResponse } from "next/server";
import { getAllRestaurants, createRestaurant, filterRestaurants } from "@/lib/db";
import { restaurantSchema } from "@/lib/types";
import { jsonWithCors, handleOptionsRequest } from "@/lib/cors";

// OPTIONS /api/restaurants - Handle CORS preflight
export async function OPTIONS() {
  return handleOptionsRequest();
}

// GET /api/restaurants - Get all restaurants or filter by location/cuisine
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get("location");
    const cuisineType = searchParams.get("cuisine_type");

    console.log("=== API /restaurants ===");
    console.log("Location filter:", location);
    console.log("Cuisine type filter:", cuisineType);

    const restaurants =
      location || cuisineType
        ? await filterRestaurants(location || undefined, cuisineType || undefined)
        : await getAllRestaurants();

    console.log("Found restaurants:", restaurants.length);
    console.log("First restaurant:", restaurants[0]);

    return jsonWithCors(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return jsonWithCors(
      { error: "Nepodařilo se načíst restaurace" },
      { status: 500 }
    );
  }
}

// POST /api/restaurants - Create new restaurant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = restaurantSchema.parse(body);

    const restaurant = await createRestaurant(validated);

    return NextResponse.json(restaurant, { status: 201 });
  } catch (error: any) {
    console.error("Error creating restaurant:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Nepodařilo se vytvořit restauraci" },
      { status: 500 }
    );
  }
}
