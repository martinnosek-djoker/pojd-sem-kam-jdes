import { NextRequest, NextResponse } from "next/server";
import { getAllChristmasTips, createChristmasTip } from "@/lib/db";
import { christmasTipSchema } from "@/lib/types";
import { jsonWithCors, handleOptionsRequest } from "@/lib/cors";

// OPTIONS /api/christmas-tips - Handle CORS preflight
export async function OPTIONS() {
  return handleOptionsRequest();
}

// GET /api/christmas-tips - Get all Christmas tips
export async function GET() {
  try {
    const tips = await getAllChristmasTips();
    return jsonWithCors(tips);
  } catch (error) {
    console.error("Error fetching Christmas tips:", error);
    return jsonWithCors(
      { error: "Nepodařilo se načíst vánoční tipy" },
      { status: 500 }
    );
  }
}

// POST /api/christmas-tips - Create new Christmas tip
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = christmasTipSchema.parse(body);

    const newTip = await createChristmasTip(validated);

    return jsonWithCors(newTip, { status: 201 });
  } catch (error: any) {
    console.error("Error creating Christmas tip:", error);
    return jsonWithCors(
      { error: error.message || "Nepodařilo se vytvořit vánoční tip" },
      { status: 400 }
    );
  }
}
