import { NextRequest, NextResponse } from "next/server";

// GET /api/places/photo?name=Restaurant&location=Prague
// Fetches restaurant photo from Google Places API
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name");
    const location = searchParams.get("location");

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

    // Step 1: Find the place using Text Search
    const query = location ? `${name}, ${location}` : name;
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;

    console.log("Searching for:", query);

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.status !== "OK" || !searchData.results || searchData.results.length === 0) {
      return NextResponse.json(
        { error: "Restaurace nenalezena", details: searchData.status },
        { status: 404 }
      );
    }

    const place = searchData.results[0];

    // Step 2: Get photo reference if available
    if (!place.photos || place.photos.length === 0) {
      return NextResponse.json(
        { error: "Pro tuto restauraci nejsou dostupné fotografie" },
        { status: 404 }
      );
    }

    const photoReference = place.photos[0].photo_reference;

    // Step 3: Construct photo URL and return address
    // Max width 400px for optimal loading performance
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${apiKey}`;

    return NextResponse.json({
      photoUrl,
      address: place.formatted_address,
      placeName: place.name,
    });

  } catch (error: any) {
    console.error("Error fetching place photo:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst fotografii", details: error.message },
      { status: 500 }
    );
  }
}
