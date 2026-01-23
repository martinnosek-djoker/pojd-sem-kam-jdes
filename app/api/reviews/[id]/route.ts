import { NextRequest, NextResponse } from "next/server";
import { getReviewById, updateReview, deleteReview } from "@/lib/db";
import { reviewSchema } from "@/lib/types";

// GET /api/reviews/[id] - Get single review
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    console.log("=== GET /api/reviews/" + id + " ===");
    console.log("Review images:", review.images);
    console.log("Images type:", typeof review.images);
    console.log("Images is array?", Array.isArray(review.images));

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
  { params }: { params: { id: string } }
) {
  try {
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
  { params }: { params: { id: string } }
) {
  try {
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
