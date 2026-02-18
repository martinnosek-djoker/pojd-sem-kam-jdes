import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getReviewIdFromSlug } from "@/lib/slug";

export const runtime = "nodejs";

const HANDLE = "@pojdsemkamjdes_prague";
const SITE = "pojdsemkamjdes.cz";

// Purple accent color
const PURPLE = "#a855f7";
const PURPLE_DARK = "#7c3aed";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const reviewId = getReviewIdFromSlug(slug);

  if (!reviewId) {
    return new Response("Neplatný slug", { status: 400 });
  }

  const { data: review, error } = await supabase
    .from("reviews")
    .select(`*, restaurant:restaurants(*), cafe:cafes(*)`)
    .eq("id", reviewId)
    .single();

  if (error || !review) {
    return new Response("Recenze nenalezena", { status: 404 });
  }

  const placeName: string = review.restaurant?.name ?? review.cafe?.name ?? "";
  const location: string =
    review.restaurant?.location ?? review.cafe?.location ?? "";
  const isCafe = !review.restaurant && !!review.cafe;

  // Use first review image, fall back to place image
  const rawImageUrl: string | null =
    review.images?.[0] ??
    review.restaurant?.image_url ??
    review.cafe?.image_url ??
    null;

  // Fetch image as base64 so ImageResponse can render it reliably
  let imageData: string | null = null;
  if (rawImageUrl) {
    try {
      const imgRes = await fetch(rawImageUrl, { signal: AbortSignal.timeout(5000) });
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mimeType = imgRes.headers.get("content-type") ?? "image/jpeg";
        imageData = `data:${mimeType};base64,${base64}`;
      }
    } catch {
      // No image — will render gradient placeholder
    }
  }

  // Load Inter font for cleaner typography
  let fontData: ArrayBuffer | null = null;
  try {
    fontData = await fetch(
      "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2",
      { signal: AbortSignal.timeout(4000) }
    ).then((r) => r.arrayBuffer());
  } catch {
    // Fall back to system sans-serif
  }

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1920px",
          background: "linear-gradient(160deg, #1e0a35 0%, #120820 45%, #090910 100%)",
          display: "flex",
          flexDirection: "column",
          padding: "72px",
          fontFamily: fontData ? "Inter" : "sans-serif",
          position: "relative",
        }}
      >
        {/* Top: handle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "56px",
          }}
        >
          {/* Dot logo */}
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "white",
              }}
            />
          </div>
          <span
            style={{
              color: PURPLE,
              fontSize: "32px",
              letterSpacing: "0.01em",
            }}
          >
            {HANDLE}
          </span>
        </div>

        {/* Photo area */}
        <div
          style={{
            width: "936px",
            height: "860px",
            borderRadius: "24px",
            overflow: "hidden",
            marginBottom: "56px",
            background: imageData
              ? "transparent"
              : `linear-gradient(135deg, ${PURPLE_DARK}, #1e0a35)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            flexShrink: 0,
          }}
        >
          {imageData ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageData}
              alt={placeName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <span style={{ fontSize: "120px" }}>🍽️</span>
          )}
          {/* Subtle bottom gradient on photo */}
          {imageData && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "200px",
                background:
                  "linear-gradient(to top, rgba(9,9,16,0.7), transparent)",
              }}
            />
          )}
        </div>

        {/* Label */}
        <div
          style={{
            color: PURPLE,
            fontSize: "26px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "18px",
          }}
        >
          {isCafe ? "☕ byl jsem tady" : "🍴 byl jsem tady"}
        </div>

        {/* Place name */}
        <div
          style={{
            color: "white",
            fontSize: placeName.length > 20 ? "60px" : "72px",
            fontWeight: "bold",
            lineHeight: "1.1",
            marginBottom: "12px",
          }}
        >
          {placeName}
        </div>

        {/* Location */}
        <div
          style={{
            color: "#9ca3af",
            fontSize: "32px",
            marginBottom: "32px",
          }}
        >
          {location}
        </div>

        {/* Review title as quote */}
        <div
          style={{
            color: "#e5e7eb",
            fontSize: review.title.length > 60 ? "36px" : "42px",
            fontStyle: "italic",
            lineHeight: "1.45",
            flex: 1,
          }}
        >
          „{review.title}"
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            borderTop: "1px solid #2d2d4a",
            paddingTop: "40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span
              style={{
                color: PURPLE,
                fontSize: "32px",
                fontWeight: "bold",
              }}
            >
              {SITE}
            </span>
            <span style={{ color: "#6b7280", fontSize: "26px" }}>
              celá recenze na webu →
            </span>
          </div>
          {/* Decorative purple pill */}
          <div
            style={{
              background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`,
              borderRadius: "50px",
              padding: "16px 36px",
              color: "white",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            číst
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      ...(fontData
        ? {
            fonts: [
              {
                name: "Inter",
                data: fontData,
                style: "normal",
                weight: 400,
              },
            ],
          }
        : {}),
    }
  );

  return image;
}
