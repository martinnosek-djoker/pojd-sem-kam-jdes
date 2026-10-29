import { NextResponse } from "next/server";
import sharp from "sharp";
import { corsHeaders } from "@/lib/cors";

// Place photos are stored at full size (often 1000+ px wide, 100-300 kB), but a card shows them
// at 72 px. This serves a right-sized WebP instead, with a long cache so a photo that was seen
// once is not downloaded (or even re-validated) again - which is what matters on a bad connection.
// Only the widths below are served, so the CDN keeps a handful of copies per photo, not thousands.
export const WIDTHS = [192, 384, 640, 960];
export const DEFAULT_WIDTH = 640;
const QUALITY = 72;

// Browser: a week, no questions asked. CDN: a month, and it may serve an older copy while it
// refreshes in the background, so replacing a photo shows up within days.
const CACHE_CONTROL = "public, max-age=604800, s-maxage=2592000, stale-while-revalidate=2592000";

export function pickWidth(requested: number): number {
  if (!Number.isFinite(requested) || requested <= 0) return DEFAULT_WIDTH;
  return WIDTHS.find((w) => w >= requested) ?? WIDTHS[WIDTHS.length - 1];
}

// Where the original may come from: a file of this site, or our own Supabase Storage.
// (Anything else would turn the route into an open proxy.)
export function resolveSource(src: string, origin: string): string | null {
  if (src.startsWith("/images/") && !src.includes("..") && !src.includes("//")) {
    return `${origin}${src}`;
  }
  try {
    const url = new URL(src);
    if (url.protocol === "https:" && url.hostname.endsWith(".supabase.co") && url.pathname.startsWith("/storage/v1/object/public/")) {
      return url.toString();
    }
  } catch {
    // not an absolute URL
  }
  return null;
}

export async function serveResizedImage(source: string, width: number): Promise<NextResponse> {
  try {
    const upstream = await fetch(source, { signal: AbortSignal.timeout(10_000) });
    if (!upstream.ok) {
      return NextResponse.json({ error: "Image not found" }, { status: upstream.status === 404 ? 404 : 502, headers: corsHeaders() });
    }
    const original = Buffer.from(await upstream.arrayBuffer());

    const resized = await sharp(original)
      .rotate() // honour the phone's EXIF orientation before the metadata is dropped
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();

    return new NextResponse(resized, {
      status: 200,
      headers: {
        ...corsHeaders(),
        "Content-Type": "image/webp",
        "Cache-Control": CACHE_CONTROL,
      },
    });
  } catch (error) {
    console.error("Image resize failed:", source, error);
    return NextResponse.json({ error: "Could not process image" }, { status: 502, headers: corsHeaders() });
  }
}
