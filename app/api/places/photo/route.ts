import { NextRequest, NextResponse } from "next/server";

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
    const photoUrls: string[] = [];

    for (const location of locations) {
      const place = await fetchPlaceData(name, location, apiKey);

      if (place) {
        // Save address for this location
        if (place.formatted_address) {
          addresses[location] = place.formatted_address;
        }

        // Collect all photos from first found place
        if (photoUrls.length === 0 && place.photos && place.photos.length > 0) {
          console.log(`Found ${place.photos.length} photos for ${name} in ${location}`);
          // Get up to 10 photos
          const photosToGet = Math.min(place.photos.length, 10);
          for (let i = 0; i < photosToGet; i++) {
            const photoReference = place.photos[i].photo_reference;
            photoUrls.push(
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${apiKey}`
            );
          }
          console.log(`Returning ${photoUrls.length} photo URLs`);
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
      photoUrl: photoUrls[0] || undefined, // First photo as default
      photoUrls: photoUrls.length > 0 ? photoUrls : undefined, // All photos for selection
      addresses: Object.keys(addresses).length > 0 ? addresses : undefined,
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
