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
    console.log("[API /api/reviews/[id]] Starting request, context:", typeof context, "params:", typeof context.params);
    const params = await context.params;
    console.log("[API /api/reviews/[id]] Params resolved:", params);
    const id = parseInt(params.id);
    console.log("[API /api/reviews/[id]] Parsed ID:", id);

    if (isNaN(id)) {
      console.error("[API /api/reviews/[id]] Invalid ID:", params.id);
      return NextResponse.json(
        { error: "Neplatné ID recenze" },
        { status: 400 }
      );
    }

    console.log("[API /api/reviews/[id]] Calling getReviewById with ID:", id);
    const review = await getReviewById(id);
    console.log("[API /api/reviews/[id]] getReviewById returned:", review ? "Review found" : "null");

    if (!review) {
      console.error("[API /api/reviews/[id]] Review not found for ID:", id);
      return NextResponse.json(
        { error: "Recenze nenalezena" },
        { status: 404 }
      );
    }

    console.log("[API /api/reviews/[id]] Returning review successfully");
    return NextResponse.json(review);
  } catch (error) {
    console.error("[API /api/reviews/[id]] Error fetching review:", error);
    console.error("[API /api/reviews/[id]] Error stack:", error instanceof Error ? error.stack : "No stack");
    console.error("[API /api/reviews/[id]] Error message:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Nepodařilo se načíst recenzi", details: error instanceof Error ? error.message : String(error) },
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
