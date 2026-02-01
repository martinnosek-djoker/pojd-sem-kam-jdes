import { NextRequest, NextResponse } from "next/server";
import { copyCafeToBreakfast } from "@/lib/db";

// POST /api/breakfasts/copy-from-cafe/[id] - Copy cafe to breakfasts
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const cafeId = parseInt(idString);

    const breakfast = await copyCafeToBreakfast(cafeId);

    return NextResponse.json(breakfast, { status: 201 });
  } catch (error: any) {
    console.error("Error copying cafe to breakfast:", error);

    // Check if it's a "not found" error
    if (error.message?.includes("nenalezena")) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    // Check if it's a duplicate error
    if (error.message?.includes("duplicate") || error.code === "23505") {
      return NextResponse.json(
        { error: "Podnik s tímto názvem již existuje v sekci Snídaně" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Nepodařilo se zkopírovat kavárnu" },
      { status: 500 }
    );
  }
}
