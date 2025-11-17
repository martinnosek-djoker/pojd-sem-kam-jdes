import { NextRequest, NextResponse } from "next/server";
import { getAllCafes, updateCafe } from "@/lib/db";
import { geocodeAddress } from "@/lib/geolocation";
import { Coordinates } from "@/lib/types";

// Helper function to geocode all addresses for a cafe
async function geocodeAddressesForCafe(
  addresses: Record<string, string>,
  apiKey: string
): Promise<Record<string, Coordinates> | null> {
  const coordinates: Record<string, Coordinates> = {};

  for (const [location, address] of Object.entries(addresses)) {
    const coords = await geocodeAddress(address, apiKey);

    if (coords) {
      coordinates[location] = coords;
    }

    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return Object.keys(coordinates).length > 0 ? coordinates : null;
}

// Add delay to avoid rate limiting
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// POST /api/admin/fetch-all-cafe-coordinates - Geocode addresses for all cafes
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Google Places API klíč není nastaven",
          details: "Přidej GOOGLE_PLACES_API_KEY do .env.local"
        },
        { status: 500 }
      );
    }

    // Get all cafes
    const cafes = await getAllCafes();

    // Filter cafes with addresses but without coordinates
    const cafesToGeocode = cafes.filter(
      c => c.addresses && Object.keys(c.addresses).length > 0 && (!c.coordinates || Object.keys(c.coordinates).length === 0)
    );

    console.log(`Found ${cafesToGeocode.length} cafes to geocode`);

    const results = {
      total: cafesToGeocode.length,
      success: 0,
      failed: 0,
      skipped: 0,
      details: [] as Array<{ name: string; status: string; message?: string }>
    };

    // Process each cafe
    for (const cafe of cafesToGeocode) {
      console.log(`Processing: ${cafe.name}`);

      try {
        if (!cafe.addresses) {
          results.skipped++;
          results.details.push({
            name: cafe.name,
            status: "skipped",
            message: "Žádné adresy k geocodování"
          });
          continue;
        }

        const coordinates = await geocodeAddressesForCafe(cafe.addresses, apiKey);

        if (coordinates) {
          // Update cafe with coordinates
          await updateCafe(cafe.id, {
            name: cafe.name,
            location: cafe.location,
            addresses: cafe.addresses,
            coordinates: coordinates,
            website_url: cafe.website_url,
            image_url: cafe.image_url,
          });

          results.success++;
          results.details.push({
            name: cafe.name,
            status: "success",
            message: `Geocodováno ${Object.keys(coordinates).length} poboček`
          });

          console.log(`✓ Coordinates fetched for: ${cafe.name} (${Object.keys(coordinates).length} locations)`);
        } else {
          results.skipped++;
          results.details.push({
            name: cafe.name,
            status: "skipped",
            message: "Souřadnice nenalezeny"
          });

          console.log(`⊘ No coordinates found for: ${cafe.name}`);
        }
      } catch (error: any) {
        results.failed++;
        results.details.push({
          name: cafe.name,
          status: "failed",
          message: error.message || "Neznámá chyba"
        });

        console.error(`✗ Error processing ${cafe.name}:`, error);
      }

      // Delay between cafes to avoid rate limiting (1 second)
      await delay(1000);
    }

    console.log(`Finished processing. Success: ${results.success}, Failed: ${results.failed}, Skipped: ${results.skipped}`);

    return NextResponse.json(results);

  } catch (error: any) {
    console.error("Error in fetch-all-cafe-coordinates:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst souřadnice", details: error.message },
      { status: 500 }
    );
  }
}
