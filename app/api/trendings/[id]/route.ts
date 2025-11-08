import { NextRequest, NextResponse } from "next/server";
import { getTrendingById, updateTrending, deleteTrending } from "@/lib/db";
import { trendingSchema } from "@/lib/types";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/trendings/[id] - Get single trending
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const trending = await getTrendingById(parseInt(id, 10));

    if (!trending) {
      return NextResponse.json(
        { error: "Trending podnik nenalezen" },
        { status: 404 }
      );
    }

    return NextResponse.json(trending);
  } catch (error) {
    console.error("Error fetching trending:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst trending podnik" },
      { status: 500 }
    );
  }
}

// PATCH /api/trendings/[id] - Update trending
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = trendingSchema.parse(body);

    const trending = await updateTrending(parseInt(id, 10), validated);

    if (!trending) {
      return NextResponse.json(
        { error: "Trending podnik nenalezen" },
        { status: 404 }
      );
    }

    return NextResponse.json(trending);
  } catch (error: any) {
    console.error("Error updating trending:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Neplatná data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Nepodařilo se aktualizovat trending podnik" },
      { status: 500 }
    );
  }
}

// DELETE /api/trendings/[id] - Delete trending
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const success = await deleteTrending(parseInt(id, 10));

    if (!success) {
      return NextResponse.json(
        { error: "Trending podnik nenalezen" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting trending:", error);
    return NextResponse.json(
      { error: "Nepodařilo se smazat trending podnik" },
      { status: 500 }
    );
  }
}
