import { NextResponse } from "next/server";
import { getAllCafes } from "@/lib/db";

// GET /api/cafes - Get all cafes
export async function GET() {
  try {
    const cafes = await getAllCafes();
    return NextResponse.json(cafes);
  } catch (error: any) {
    console.error("Error in /api/cafes:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst kavárny", details: error.message },
      { status: 500 }
    );
  }
}
