import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";
import { DEFAULT_WIDTH, resolveSource, serveResizedImage } from "@/lib/serve-image";

export const runtime = "nodejs";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// GET /api/legacy-img/restaurants/x.webp - what /images/restaurants/x.webp is rewritten to for
// versions of the Android app that were released before the resizer existed (see next.config.mjs).
// The width is fixed because a rewrite can't pass one through reliably.
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const source = resolveSource(`/images/${params.path.join("/")}`, request.nextUrl.origin);
  if (!source) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400, headers: corsHeaders() });
  }
  return serveResizedImage(source, DEFAULT_WIDTH);
}
