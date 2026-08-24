import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geolocation";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");

  if (!address || !address.trim()) {
    return NextResponse.json({ error: "Chybí adresa" }, { status: 400 });
  }

  try {
    const result = await geocodeAddress(address);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Geokódování selhalo";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
