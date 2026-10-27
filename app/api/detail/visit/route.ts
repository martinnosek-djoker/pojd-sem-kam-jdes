import { NextRequest } from "next/server";
import { getVisitById } from "@/lib/db";
import { jsonWithCors, handleOptionsRequest } from "@/lib/cors";

// Always live: the native app reads this when a "new review" notification is tapped
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handleOptionsRequest();
}

// GET /api/detail/visit?id=123 - a public visit (with its place), or 404 while it has no comment yet
export async function GET(request: NextRequest) {
  try {
    const id = Number(request.nextUrl.searchParams.get("id"));
    if (!Number.isInteger(id) || id < 1) {
      return jsonWithCors({ error: "Neplatný požadavek" }, { status: 400 });
    }

    const visit = await getVisitById(id);
    if (!visit || !(visit.restaurant || visit.cafe)) {
      return jsonWithCors({ error: "Návštěva nenalezena" }, { status: 404 });
    }

    return jsonWithCors({ visit });
  } catch (error: any) {
    console.error("Error in /api/detail/visit:", error);
    return jsonWithCors({ error: "Nepodařilo se načíst detail" }, { status: 500 });
  }
}
