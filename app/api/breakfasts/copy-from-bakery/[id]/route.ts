import { NextRequest, NextResponse } from "next/server";
import { copyBakeryToBreakfast } from "@/lib/db";

// POST /api/breakfasts/copy-from-bakery/[id] - Copy bakery to breakfasts
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params;
    const bakeryId = parseInt(idString);

    const breakfast = await copyBakeryToBreakfast(bakeryId);

    return NextResponse.json(breakfast, { status: 201 });
  } catch (error: any) {
    console.error("Error copying bakery to breakfast:", error);

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
      { error: "Nepodařilo se zkopírovat cukrárnu" },
      { status: 500 }
    );
  }
}
