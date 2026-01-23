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

    console.log("=== API /reviews ===");
    console.log("Featured filter:", featured);

    const reviews = featured === "true"
      ? await getFeaturedReviews()
      : await getAllReviews();

    console.log("Found reviews:", reviews.length);

    // Debug first review's images
    if (reviews.length > 0) {
      console.log("First review images:", reviews[0].images);
      console.log("First review images type:", typeof reviews[0].images);
      console.log("First review images is array?", Array.isArray(reviews[0].images));
    }

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
    console.log("=== POST /api/reviews ===");
    console.log("Request body:", JSON.stringify(body, null, 2));

    const validated = reviewSchema.parse(body);
    console.log("Validated data:", JSON.stringify(validated, null, 2));

    const review = await createReview(validated);
    console.log("Created review:", review);

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error("=== ERROR creating review ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);

    if (error.name === "ZodError") {
      console.error("Zod validation errors:", error.errors);
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
