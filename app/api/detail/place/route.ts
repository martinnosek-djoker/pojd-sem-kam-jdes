import { NextRequest } from "next/server";
import { getAllCafes, getAllRestaurants, getCafeById, getRestaurantById, getVisitsForPlace } from "@/lib/db";
import { similarCafes, similarRestaurants } from "@/lib/similar";
import { jsonWithCors, handleOptionsRequest } from "@/lib/cors";

// Always live: the native app reads this when a card is opened
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handleOptionsRequest();
}

// GET /api/detail/place?kind=restaurant|cafe&id=123
// Everything the detail dialog needs next to the place itself: its public visits and similar places.
// Same data the web detail pages load (see lib/detail-pages.tsx).
export async function GET(request: NextRequest) {
  try {
    const kind = request.nextUrl.searchParams.get("kind");
    const id = Number(request.nextUrl.searchParams.get("id"));
    if ((kind !== "restaurant" && kind !== "cafe") || !Number.isInteger(id) || id < 1) {
      return jsonWithCors({ error: "Neplatný požadavek" }, { status: 400 });
    }

    const place = kind === "restaurant" ? await getRestaurantById(id) : await getCafeById(id);
    if (!place) return jsonWithCors({ error: "Podnik nenalezen" }, { status: 404 });

    const [visits, similar] = await Promise.all([
      getVisitsForPlace(kind, id),
      kind === "restaurant"
        ? getAllRestaurants().then((all) => similarRestaurants(place as any, all))
        : getAllCafes().then((all) => similarCafes(place as any, all)),
    ]);

    return jsonWithCors({ place, visits, similar });
  } catch (error: any) {
    console.error("Error in /api/detail/place:", error);
    return jsonWithCors({ error: "Nepodařilo se načíst detail" }, { status: 500 });
  }
}
