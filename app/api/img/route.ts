import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";
import { pickWidth, resolveSource, serveResizedImage } from "@/lib/serve-image";

export const runtime = "nodejs";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// GET /api/img?src=/images/restaurants/x.webp&w=192 - a right-sized, long-cached copy of a photo
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const src = params.get("src");
  const source = src ? resolveSource(src, request.nextUrl.origin) : null;
  if (!source) {
    return NextResponse.json({ error: "Invalid 'src'" }, { status: 400, headers: corsHeaders() });
  }
  return serveResizedImage(source, pickWidth(Number(params.get("w"))));
}
