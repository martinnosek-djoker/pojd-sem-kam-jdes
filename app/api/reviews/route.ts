import { NextRequest, NextResponse } from "next/server";
import { getAllReviews, getFeaturedReviews, createReview } from "@/lib/db";
import { reviewSchema } from "@/lib/types";
import { jsonWithCors, handleOptionsRequest } from "@/lib/cors";

// OPTIONS /api/reviews - Handle CORS preflight
export async function OPTIONS() {
  return handleOptionsRequest();
}

// GET /api/reviews - Get all reviews or only featured reviews
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const featured = searchParams.get("featured");

    const reviews = featured === "true"
      ? await getFeaturedReviews()
      : await getAllReviews();

    return jsonWithCors(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return jsonWithCors(
      { error: "Nepodařilo se načíst recenze" },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = reviewSchema.parse(body);
    const review = await createReview(validated);

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error("Error creating review:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Nepodařilo se vytvořit recenzi", details: error.message },
      { status: 500 }
    );
  }
}
