import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";

// OPTIONS - Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

// GET - Proxy images from external sources (mainly Google Maps)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing 'url' parameter" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Validate that it's a Google URL (Maps API or Google Photos)
    const isGoogleMapsUrl = imageUrl.startsWith('https://maps.googleapis.com/');
    const isGooglePhotosUrl = imageUrl.startsWith('https://lh3.googleusercontent.com/') ||
                              imageUrl.startsWith('https://lh4.googleusercontent.com/') ||
                              imageUrl.startsWith('https://lh5.googleusercontent.com/');

    if (!isGoogleMapsUrl && !isGooglePhotosUrl) {
      return NextResponse.json(
        { error: "Only Google Maps and Google Photos URLs are allowed" },
        { status: 403, headers: corsHeaders() }
      );
    }

    // 🚨 COST OPTIMIZATION: During build (static export), return placeholder instead of calling Google API
    // This prevents hundreds of expensive Google Places Photo API calls ($7/1000) during mobile builds
    if (process.env.MOBILE_BUILD === 'true' || process.env.NEXT_PHASE === 'phase-production-build') {
      // Return a 1x1 transparent PNG placeholder
      const transparentPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      return new NextResponse(transparentPng, {
        status: 200,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        },
      });
    }

    // Fetch the image
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      console.error(`Failed to fetch image from ${imageUrl}: ${imageResponse.status}`);
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: imageResponse.status, headers: corsHeaders() }
      );
    }

    // Get the image data
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Return the image with CORS headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error: any) {
    console.error("Error proxying image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
