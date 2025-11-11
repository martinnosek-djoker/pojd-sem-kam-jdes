import { RestaurantInput, TrendingInput, BakeryInput } from "./types";

export interface CSVParseResult {
  restaurants: Restaurant[];
  trendings: Trending[];
  bakeries: Bakery[];
  errors: { row: number; error: string }[];
}

interface Restaurant extends Omit<RestaurantInput, 'website_url'> {
  website_url?: string | null;
}

interface Trending extends Omit<TrendingInput, 'website_url' | 'display_order'> {
  website_url?: string | null;
  display_order: number;
}

interface Bakery extends Omit<BakeryInput, 'website_url'> {
  website_url?: string | null;
}

export function parseRestaurantCSV(csvContent: string): CSVParseResult {
  const lines = csvContent.split("\n");
  const restaurants: Restaurant[] = [];
  const trendings: Trending[] = [];
  const bakeries: Bakery[] = [];
  const trendingNames = new Set<string>();
  const bakeryNames = new Set<string>();
  const errors: { row: number; error: string }[] = [];

  // Parse TOP 10 trendings from rows 2-11 (Excel D2:D11, array indices 1-10)
  for (let i = 1; i <= 10 && i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const columns = parseCSVLine(line);
      const trendingName = columns[3]?.trim();

      if (trendingName && !trendingNames.has(trendingName)) {
        trendingNames.add(trendingName);
        trendings.push({
          name: trendingName,
          website_url: null,
          display_order: trendings.length,
        });
      }
    } catch (error) {
      // Ignore errors in trending parsing
    }
  }

  // Parse bakeries from columns P and Q (indices 15 and 16)
  // Start from row 4 (index 3) same as restaurants
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const columns = parseCSVLine(line);

      // Column P (index 15): bakery name
      // Column Q (index 16): bakery location
      const bakeryName = columns[15]?.trim();
      const bakeryLocation = columns[16]?.trim();

      if (bakeryName && bakeryLocation && !bakeryNames.has(bakeryName)) {
        bakeryNames.add(bakeryName);
        bakeries.push({
          name: bakeryName,
          location: bakeryLocation,
          website_url: null,
        });
      }
    } catch (error) {
      // Don't add errors for bakery parsing failures - they're optional
    }
  }

  // Parse restaurants - skip first 3 rows (headers) and start from row 4 (index 3)
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const columns = parseCSVLine(line);

      // Sloupce podle CSV struktury:
      // E (index 4): název restaurace
      // F (index 5): lokalita
      // G (index 6): kuchyně
      // H (index 7): nás nezajímá
      // I (index 8): cena za osobu za večer
      // J (index 9): úroveň

      const name = columns[4]?.trim();

      // Skip if name is empty (empty row or only trending data)
      if (!name) continue;

      const location = columns[5]?.trim();
      const cuisineType = columns[6]?.trim();
      const specialty = null; // Už není v datech
      const priceStr = columns[8]?.trim();
      const ratingStr = columns[9]?.trim();

      // Validate required fields
      if (!location || !cuisineType) {
        errors.push({
          row: i + 1,
          error: `Chybí povinná data: ${name}`,
        });
        continue;
      }

      // Parse price
      const price = parseInt(priceStr || "0", 10);
      if (isNaN(price) || price < 0) {
        errors.push({
          row: i + 1,
          error: `Neplatná cena pro ${name}: ${priceStr}`,
        });
        continue;
      }

      // Parse rating (format: "9/10" or just "9")
      let rating = 0;
      if (ratingStr) {
        if (ratingStr.includes("/")) {
          const parts = ratingStr.split("/");
          rating = parseInt(parts[0], 10);
        } else {
          rating = parseFloat(ratingStr);
        }
      }

      if (isNaN(rating) || rating < 1 || rating > 10) {
        errors.push({
          row: i + 1,
          error: `Neplatné hodnocení pro ${name}: ${ratingStr}`,
        });
        continue;
      }

      restaurants.push({
        name,
        location,
        cuisine_type: cuisineType,
        specialty: specialty || null,
        price,
        rating,
        website_url: null, // URL budou přidány později ručně
      });
    } catch (error) {
      errors.push({
        row: i + 1,
        error: `Chyba při parsování: ${error instanceof Error ? error.message : "Neznámá chyba"}`,
      });
    }
  }

  return { restaurants, trendings, bakeries, errors };
}

// Helper function to parse CSV line (handles commas in quotes)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}
