import { NextRequest, NextResponse } from "next/server";
import { getAllCafes, updateCafe } from "@/lib/db";

// POST /api/admin/fetch-all-cafe-photos - Fetch photos for all cafes without images
export async function POST(request: NextRequest) {
  try {
    const cafes = await getAllCafes();

    // Filter cafes without image_url
    const cafesWithoutPhotos = cafes.filter(c => !c.image_url);

    console.log(`Found ${cafesWithoutPhotos.length} cafes without photos`);

    let success = 0;
    let skipped = 0;
    let failed = 0;

    // Process each cafe
    for (const cafe of cafesWithoutPhotos) {
      try {
        console.log(`Fetching photo for: ${cafe.name}`);

        const params = new URLSearchParams({
          name: cafe.name,
          location: cafe.location.split(',')[0].trim(), // Use first location
        });

        const response = await fetch(`${request.nextUrl.origin}/api/places/photo?${params.toString()}`);
        const data = await response.json();

        if (response.ok && data.photoUrl) {
          // Update cafe with first photo
          await updateCafe(cafe.id, {
            ...cafe,
            image_url: data.photoUrl,
          });
          success++;
          console.log(`✓ Photo found for ${cafe.name}`);
        } else {
          skipped++;
          console.log(`✗ No photo found for ${cafe.name}`, data);
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error fetching photo for ${cafe.name}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      success,
      skipped,
      failed,
      total: cafesWithoutPhotos.length,
    });
  } catch (error) {
    console.error("Error in fetch-all-cafe-photos:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst fotky" },
      { status: 500 }
    );
  }
}
