import { NextRequest, NextResponse } from "next/server";
import { getAllCafes, updateCafe } from "@/lib/db";

// Helper function to fetch place data for a single location
async function fetchPlaceData(name: string, location: string, apiKey: string) {
  const query = `${name}, ${location}`;
  const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;

  const searchResponse = await fetch(searchUrl);
  const searchData = await searchResponse.json();

  if (searchData.status !== "OK" || !searchData.results || searchData.results.length === 0) {
    return null;
  }

  return searchData.results[0];
}

// Helper function to fetch addresses for all locations of a cafe
async function fetchAddressesForCafe(
  name: string,
  locationString: string,
  apiKey: string
): Promise<Record<string, string> | null> {
  // Parse locations (comma-separated)
  const locations = locationString.split(',').map(l => l.trim()).filter(l => l);

  const addresses: Record<string, string> = {};

  for (const location of locations) {
    const place = await fetchPlaceData(name, location, apiKey);

    if (place && place.formatted_address) {
      addresses[location] = place.formatted_address;
    }

    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return Object.keys(addresses).length > 0 ? addresses : null;
}

// Add delay to avoid rate limiting
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// POST /api/admin/fetch-all-cafe-addresses - Fetch addresses for all cafes without addresses
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

    // Filter cafes without addresses
    const cafesWithoutAddresses = cafes.filter(c => !c.addresses || Object.keys(c.addresses).length === 0);

    console.log(`Found ${cafesWithoutAddresses.length} cafes without addresses`);

    const results = {
      total: cafesWithoutAddresses.length,
      success: 0,
      failed: 0,
      skipped: 0,
      details: [] as Array<{ name: string; status: string; message?: string }>
    };

    // Process each cafe
    for (const cafe of cafesWithoutAddresses) {
      console.log(`Processing: ${cafe.name}`);

      try {
        const addresses = await fetchAddressesForCafe(cafe.name, cafe.location, apiKey);

        if (addresses) {
          // Update cafe with addresses
          await updateCafe(cafe.id, {
            name: cafe.name,
            location: cafe.location,
            addresses: addresses,
            website_url: cafe.website_url,
            image_url: cafe.image_url,
          });

          results.success++;
          results.details.push({
            name: cafe.name,
            status: "success",
            message: `Načteno ${Object.keys(addresses).length} adres`
          });

          console.log(`✓ Addresses fetched for: ${cafe.name} (${Object.keys(addresses).length} locations)`);
        } else {
          results.skipped++;
          results.details.push({
            name: cafe.name,
            status: "skipped",
            message: "Adresy nenalezeny"
          });

          console.log(`⊘ No addresses found for: ${cafe.name}`);
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
    console.error("Error in fetch-all-cafe-addresses:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst adresy", details: error.message },
      { status: 500 }
    );
  }
}
