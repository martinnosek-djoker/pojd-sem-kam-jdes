import { NextRequest, NextResponse } from "next/server";
import { getAllBakeries, updateBakery } from "@/lib/db";

// Helper function to fetch place data for a single location
// OPTIMIZED: Using Find Place + Details ($17/1000 each) instead of Text Search ($32/1000)
async function fetchPlaceData(name: string, location: string, apiKey: string) {
  const query = `${name}, ${location}`;

  // Step 1: Find Place - gets place_id
  const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${apiKey}`;

  const findResponse = await fetch(findPlaceUrl);
  const findData = await findResponse.json();

  if (findData.status !== "OK" || !findData.candidates || findData.candidates.length === 0) {
    return null;
  }

  const placeId = findData.candidates[0].place_id;

  // Step 2: Place Details - get only formatted_address (pay per field!)
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address&key=${apiKey}`;

  const detailsResponse = await fetch(detailsUrl);
  const detailsData = await detailsResponse.json();

  if (detailsData.status !== "OK" || !detailsData.result) {
    return null;
  }

  return detailsData.result;
}

// Helper function to fetch addresses for all locations of a bakery
async function fetchAddressesForBakery(
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

// POST /api/admin/fetch-all-bakery-addresses - Fetch addresses for all bakeries without addresses
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

    // Filter bakeries without addresses
    const bakeriesWithoutAddresses = bakeries.filter(b => !b.addresses || Object.keys(b.addresses).length === 0);

    console.log(`Found ${bakeriesWithoutAddresses.length} bakeries without addresses`);

    const results = {
      total: bakeriesWithoutAddresses.length,
      success: 0,
      failed: 0,
      skipped: 0,
      details: [] as Array<{ name: string; status: string; message?: string }>
    };

    // Process each bakery
    for (const bakery of bakeriesWithoutAddresses) {
      console.log(`Processing: ${bakery.name}`);

      try {
        const addresses = await fetchAddressesForBakery(bakery.name, bakery.location, apiKey);

        if (addresses) {
          // Update bakery with addresses
          await updateBakery(bakery.id, {
            name: bakery.name,
            location: bakery.location,
            addresses: addresses,
            website_url: bakery.website_url,
            image_url: bakery.image_url,
          });

          results.success++;
          results.details.push({
            name: bakery.name,
            status: "success",
            message: `Načteno ${Object.keys(addresses).length} adres`
          });

          console.log(`✓ Addresses fetched for: ${bakery.name} (${Object.keys(addresses).length} locations)`);
        } else {
          results.skipped++;
          results.details.push({
            name: bakery.name,
            status: "skipped",
            message: "Adresy nenalezeny"
          });

          console.log(`⊘ No addresses found for: ${bakery.name}`);
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
    console.error("Error in fetch-all-bakery-addresses:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst adresy", details: error.message },
      { status: 500 }
    );
  }
}
