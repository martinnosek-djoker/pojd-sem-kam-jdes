import { NextRequest, NextResponse } from "next/server";
import { getAllRestaurants, updateRestaurant } from "@/lib/db";
import { geocodeAddress } from "@/lib/geolocation";
import { Coordinates } from "@/lib/types";

// Helper function to geocode all addresses for a restaurant
async function geocodeAddressesForRestaurant(
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

// POST /api/admin/fetch-all-coordinates - Geocode addresses for all restaurants
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

    // Filter restaurants with addresses but without coordinates
    const restaurantsToGeocode = restaurants.filter(
      r => r.addresses && Object.keys(r.addresses).length > 0 && (!r.coordinates || Object.keys(r.coordinates).length === 0)
    );

    console.log(`Found ${restaurantsToGeocode.length} restaurants to geocode`);

    const results = {
      total: restaurantsToGeocode.length,
      success: 0,
      failed: 0,
      skipped: 0,
      details: [] as Array<{ name: string; status: string; message?: string }>
    };

    // Process each restaurant
    for (const restaurant of restaurantsToGeocode) {
      console.log(`Processing: ${restaurant.name}`);

      try {
        if (!restaurant.addresses) {
          results.skipped++;
          results.details.push({
            name: restaurant.name,
            status: "skipped",
            message: "Žádné adresy k geocodování"
          });
          continue;
        }

        const coordinates = await geocodeAddressesForRestaurant(restaurant.addresses, apiKey);

        if (coordinates) {
          // Update restaurant with coordinates
          await updateRestaurant(restaurant.id, {
            name: restaurant.name,
            location: restaurant.location,
            addresses: restaurant.addresses,
            coordinates: coordinates,
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
            message: `Geocodováno ${Object.keys(coordinates).length} poboček`
          });

          console.log(`✓ Coordinates fetched for: ${restaurant.name} (${Object.keys(coordinates).length} locations)`);
        } else {
          results.skipped++;
          results.details.push({
            name: restaurant.name,
            status: "skipped",
            message: "Souřadnice nenalezeny"
          });

          console.log(`⊘ No coordinates found for: ${restaurant.name}`);
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
    console.error("Error in fetch-all-coordinates:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst souřadnice", details: error.message },
      { status: 500 }
    );
  }
}
