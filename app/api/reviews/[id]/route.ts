import { NextRequest, NextResponse } from "next/server";
import { getReviewById, updateReview, deleteReview } from "@/lib/db";
import { reviewSchema } from "@/lib/types";

// Required for static export - no static params to generate
export async function generateStaticParams() {
  return [];
}

// GET /api/reviews/[id] - Get single review
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 14.2+, params must be awaited
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Neplatné ID recenze" },
        { status: 400 }
      );
    }

    const review = await getReviewById(id);

    if (!review) {
      return NextResponse.json(
        { error: "Recenze nenalezena" },
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst recenzi" },
      { status: 500 }
    );
  }
}

// PUT /api/reviews/[id] - Update review
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Neplatné ID recenze" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = reviewSchema.partial().parse(body);

    const review = await updateReview(id, validated);

    return NextResponse.json(review);
  } catch (error: any) {
    console.error("Error updating review:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Nepodařilo se aktualizovat recenzi" },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Delete review
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Neplatné ID recenze" },
        { status: 400 }
      );
    }

    await deleteReview(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Nepodařilo se smazat recenzi" },
      { status: 500 }
    );
  }
}
