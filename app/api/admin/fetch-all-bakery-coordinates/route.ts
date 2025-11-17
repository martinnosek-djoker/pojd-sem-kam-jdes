import { NextRequest, NextResponse } from "next/server";
import { getAllBakeries, updateBakery } from "@/lib/db";
import { geocodeAddress } from "@/lib/geolocation";
import { Coordinates } from "@/lib/types";

// Helper function to geocode all addresses for a bakery
async function geocodeAddressesForBakery(
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

// POST /api/admin/fetch-all-bakery-coordinates - Geocode addresses for all bakeries
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

    // Get all bakeries
    const bakeries = await getAllBakeries();

    // Filter bakeries with addresses but without coordinates
    const bakeriesToGeocode = bakeries.filter(
      b => b.addresses && Object.keys(b.addresses).length > 0 && (!b.coordinates || Object.keys(b.coordinates).length === 0)
    );

    console.log(`Found ${bakeriesToGeocode.length} bakeries to geocode`);

    const results = {
      total: bakeriesToGeocode.length,
      success: 0,
      failed: 0,
      skipped: 0,
      details: [] as Array<{ name: string; status: string; message?: string }>
    };

    // Process each bakery
    for (const bakery of bakeriesToGeocode) {
      console.log(`Processing: ${bakery.name}`);

      try {
        if (!bakery.addresses) {
          results.skipped++;
          results.details.push({
            name: bakery.name,
            status: "skipped",
            message: "Žádné adresy k geocodování"
          });
          continue;
        }

        const coordinates = await geocodeAddressesForBakery(bakery.addresses, apiKey);

        if (coordinates) {
          // Update bakery with coordinates
          await updateBakery(bakery.id, {
            name: bakery.name,
            location: bakery.location,
            addresses: bakery.addresses,
            coordinates: coordinates,
            website_url: bakery.website_url,
            image_url: bakery.image_url,
          });

          results.success++;
          results.details.push({
            name: bakery.name,
            status: "success",
            message: `Geocodováno ${Object.keys(coordinates).length} poboček`
          });

          console.log(`✓ Coordinates fetched for: ${bakery.name} (${Object.keys(coordinates).length} locations)`);
        } else {
          results.skipped++;
          results.details.push({
            name: bakery.name,
            status: "skipped",
            message: "Souřadnice nenalezeny"
          });

          console.log(`⊘ No coordinates found for: ${bakery.name}`);
        }
      } catch (error: any) {
        results.failed++;
        results.details.push({
          name: bakery.name,
          status: "failed",
          message: error.message || "Neznámá chyba"
        });

        console.error(`✗ Error processing ${bakery.name}:`, error);
      }

      // Delay between bakeries to avoid rate limiting (1 second)
      await delay(1000);
    }

    console.log(`Finished processing. Success: ${results.success}, Failed: ${results.failed}, Skipped: ${results.skipped}`);

    return NextResponse.json(results);

  } catch (error: any) {
    console.error("Error in fetch-all-bakery-coordinates:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst souřadnice", details: error.message },
      { status: 500 }
    );
  }
}
