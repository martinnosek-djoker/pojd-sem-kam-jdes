import { RestaurantInput } from "./types";

export interface CSVParseResult {
  success: Restaurant[];
  errors: { row: number; error: string }[];
}

interface Restaurant extends Omit<RestaurantInput, 'website_url'> {
  website_url?: string | null;
}

export function parseRestaurantCSV(csvContent: string): CSVParseResult {
  const lines = csvContent.split("\n");
  const success: Restaurant[] = [];
  const errors: { row: number; error: string }[] = [];

  // Skip first 3 rows (headers) and start from row 4 (index 3)
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
      const location = columns[5]?.trim();
      const cuisineType = columns[6]?.trim();
      const specialty = null; // Už není v datech
      const priceStr = columns[8]?.trim();
      const ratingStr = columns[9]?.trim();

      // Skip if name is empty (empty row or invalid data)
      if (!name) continue;

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

      success.push({
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

  return { success, errors };
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
