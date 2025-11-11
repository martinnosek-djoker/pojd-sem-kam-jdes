import { NextRequest, NextResponse } from "next/server";
import { getAllBakeries, updateBakery } from "@/lib/db";

// POST /api/admin/fetch-all-bakery-photos - Fetch photos for all bakeries without images
export async function POST(request: NextRequest) {
  try {
    const bakeries = await getAllBakeries();

    // Filter bakeries without image_url
    const bakeriesWithoutPhotos = bakeries.filter(b => !b.image_url);

    console.log(`Found ${bakeriesWithoutPhotos.length} bakeries without photos`);

    let success = 0;
    let skipped = 0;
    let failed = 0;

    // Process each bakery
    for (const bakery of bakeriesWithoutPhotos) {
      try {
        console.log(`Fetching photo for: ${bakery.name}`);

        const params = new URLSearchParams({
          name: bakery.name,
          location: bakery.location.split(',')[0].trim(), // Use first location
        });

        const response = await fetch(`${request.nextUrl.origin}/api/places/photo?${params.toString()}`);
        const data = await response.json();

        if (response.ok && data.photoUrl) {
          // Update bakery with first photo
          await updateBakery(bakery.id, {
            ...bakery,
            image_url: data.photoUrl,
          });
          success++;
          console.log(`✓ Photo found for ${bakery.name}`);
        } else {
          skipped++;
          console.log(`✗ No photo found for ${bakery.name}`, data);
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error fetching photo for ${bakery.name}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      success,
      skipped,
      failed,
      total: bakeriesWithoutPhotos.length,
    });
  } catch (error) {
    console.error("Error in fetch-all-bakery-photos:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst fotky" },
      { status: 500 }
    );
  }
}
