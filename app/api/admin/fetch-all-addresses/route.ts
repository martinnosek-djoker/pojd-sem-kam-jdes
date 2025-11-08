import { NextRequest, NextResponse } from "next/server";
import { getAllRestaurants, updateRestaurant } from "@/lib/db";

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

// Helper function to fetch addresses for all locations of a restaurant
async function fetchAddressesForRestaurant(
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

// POST /api/admin/fetch-all-addresses - Fetch addresses for all restaurants without addresses
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

    // Get all restaurants
    const restaurants = await getAllRestaurants();

    // Filter restaurants without addresses
    const restaurantsWithoutAddresses = restaurants.filter(r => !r.addresses || Object.keys(r.addresses).length === 0);

    console.log(`Found ${restaurantsWithoutAddresses.length} restaurants without addresses`);

    const results = {
      total: restaurantsWithoutAddresses.length,
      success: 0,
      failed: 0,
      skipped: 0,
      details: [] as Array<{ name: string; status: string; message?: string }>
    };

    // Process each restaurant
    for (const restaurant of restaurantsWithoutAddresses) {
      console.log(`Processing: ${restaurant.name}`);

      try {
        const addresses = await fetchAddressesForRestaurant(restaurant.name, restaurant.location, apiKey);

        if (addresses) {
          // Update restaurant with addresses
          await updateRestaurant(restaurant.id, {
            name: restaurant.name,
            location: restaurant.location,
            addresses: addresses,
            cuisine_type: restaurant.cuisine_type,
            specialty: restaurant.specialty,
            price: restaurant.price,
            rating: restaurant.rating,
            website_url: restaurant.website_url,
            image_url: restaurant.image_url,
          });

          results.success++;
          results.details.push({
            name: restaurant.name,
            status: "success",
            message: `Načteno ${Object.keys(addresses).length} adres`
          });

          console.log(`✓ Addresses fetched for: ${restaurant.name} (${Object.keys(addresses).length} locations)`);
        } else {
          results.skipped++;
          results.details.push({
            name: restaurant.name,
            status: "skipped",
            message: "Adresy nenalezeny"
          });

          console.log(`⊘ No addresses found for: ${restaurant.name}`);
        }
      } catch (error: any) {
        results.failed++;
        results.details.push({
          name: restaurant.name,
          status: "failed",
          message: error.message || "Neznámá chyba"
        });

        console.error(`✗ Error processing ${restaurant.name}:`, error);
      }

      // Delay between restaurants to avoid rate limiting (1 second)
      await delay(1000);
    }

    console.log(`Finished processing. Success: ${results.success}, Failed: ${results.failed}, Skipped: ${results.skipped}`);

    return NextResponse.json(results);

  } catch (error: any) {
    console.error("Error in fetch-all-addresses:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst adresy", details: error.message },
      { status: 500 }
    );
  }
}
