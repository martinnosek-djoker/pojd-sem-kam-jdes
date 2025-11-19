import { NextRequest, NextResponse } from "next/server";

// Helper function to fetch place data for a single location
// OPTIMIZED: Using Find Place ($17/1000) instead of Text Search ($32/1000)
// Returns place data + place_id for caching
async function fetchPlaceData(name: string, location: string, apiKey: string, cachedPlaceId?: string) {
  let placeId = cachedPlaceId;

  // Step 1: Find Place - only if we don't have cached place_id (SAVES API CALLS!)
  if (!placeId) {
    const query = `${name}, ${location}`;
    const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${apiKey}`;

    const findResponse = await fetch(findPlaceUrl);
    const findData = await findResponse.json();

    if (findData.status !== "OK" || !findData.candidates || findData.candidates.length === 0) {
      return null;
    }

    placeId = findData.candidates[0].place_id;
  }

  // Step 2: Place Details - get only the fields we need (pay per field!)
  // Only request: formatted_address, photos (just 1!)
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,photos&key=${apiKey}`;

  const detailsResponse = await fetch(detailsUrl);
  const detailsData = await detailsResponse.json();

  if (detailsData.status !== "OK" || !detailsData.result) {
    return null;
  }

  // Return result with place_id for caching
  return {
    ...detailsData.result,
    place_id: placeId,
  };
}

// GET /api/places/photo?name=Restaurant&location=Anděl,Letná,Vinohrady
// Fetches restaurant photo and addresses from Google Places API
// Supports multiple locations separated by comma
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name");
    const locationParam = searchParams.get("location");

    if (!name) {
      return NextResponse.json(
        { error: "Název restaurace je povinný" },
        { status: 400 }
      );
    }

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

    // Parse locations (comma-separated)
    const locations = locationParam
      ? locationParam.split(',').map(l => l.trim()).filter(l => l)
      : ['Praha'];

    console.log("Searching for:", name, "in locations:", locations);

    // Fetch data for all locations
    const addresses: Record<string, string> = {};
    const placeIds: Record<string, string> = {};
    const photoUrls: string[] = [];

    for (const location of locations) {
      const place = await fetchPlaceData(name, location, apiKey);

      if (place) {
        // Save place_id for this location (for caching!)
        if (place.place_id) {
          placeIds[location] = place.place_id;
        }

        // Save address for this location
        if (place.formatted_address) {
          addresses[location] = place.formatted_address;
        }

        // OPTIMIZED: Get only 1 photo instead of 10 (saves bandwidth and processing)
        if (photoUrls.length === 0 && place.photos && place.photos.length > 0) {
          console.log(`Found ${place.photos.length} photos for ${name} in ${location}`);
          // Get only the first photo
          const photoReference = place.photos[0].photo_reference;
          photoUrls.push(
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${apiKey}`
          );
          console.log(`Returning 1 photo URL`);
        }
      }

      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Check if we found anything
    if (photoUrls.length === 0 && Object.keys(addresses).length === 0) {
      return NextResponse.json(
        { error: "Restaurace nenalezena v žádné z lokalit" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      photoUrl: photoUrls[0] || undefined, // Single photo
      addresses: Object.keys(addresses).length > 0 ? addresses : undefined,
      placeIds: Object.keys(placeIds).length > 0 ? placeIds : undefined, // For caching!
      placeName: name,
    });

  } catch (error: any) {
    console.error("Error fetching place data:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst data", details: error.message },
      { status: 500 }
    );
  }
}
