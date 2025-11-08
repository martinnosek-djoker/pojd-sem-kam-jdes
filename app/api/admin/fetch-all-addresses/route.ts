import { NextRequest, NextResponse } from "next/server";
import { getAllRestaurants, updateRestaurant } from "@/lib/db";

// Helper function to fetch address for a single restaurant
async function fetchAddressForRestaurant(name: string, location: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.error("Google Places API key not set");
    return null;
  }

  try {
    const query = `${name}, ${location}`;
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.status !== "OK" || !searchData.results || searchData.results.length === 0) {
      console.log(`No place found for: ${name}`);
      return null;
    }

    const place = searchData.results[0];

    if (!place.formatted_address) {
      console.log(`No address available for: ${name}`);
      return null;
    }

    return place.formatted_address;
  } catch (error) {
    console.error(`Error fetching address for ${name}:`, error);
    return null;
  }
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
    const restaurantsWithoutAddresses = restaurants.filter(r => !r.address);

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
        const address = await fetchAddressForRestaurant(restaurant.name, restaurant.location);

        if (address) {
          // Update restaurant with address
          await updateRestaurant(restaurant.id, {
            name: restaurant.name,
            location: restaurant.location,
            address: address,
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
            message: "Adresa úspěšně načtena"
          });

          console.log(`✓ Address fetched for: ${restaurant.name}`);
        } else {
          results.skipped++;
          results.details.push({
            name: restaurant.name,
            status: "skipped",
            message: "Adresa nenalezena"
          });

          console.log(`⊘ No address found for: ${restaurant.name}`);
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

      // Delay between requests to avoid rate limiting (1 second)
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
