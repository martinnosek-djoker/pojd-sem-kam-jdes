import { NextRequest, NextResponse } from "next/server";
import { parseRestaurantCSV } from "@/lib/csv-parser";
import { bulkInsertRestaurants } from "@/lib/db";

// POST /api/import - Import restaurants from CSV
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nebyl nahrán žádný soubor" },
        { status: 400 }
      );
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Pouze CSV soubory jsou podporovány" },
        { status: 400 }
      );
    }

    const csvContent = await file.text();

    // Debug: Log first few lines
    const lines = csvContent.split("\n").slice(0, 5);
    console.log("=== CSV Debug ===");
    console.log("First 5 lines:", lines);

    const { success, errors } = parseRestaurantCSV(csvContent);

    console.log(`Parsed ${success.length} successful records, ${errors.length} errors`);
    if (errors.length > 0) {
      console.log("First 5 errors:", errors.slice(0, 5));
    }

    if (success.length === 0) {
      return NextResponse.json(
        {
          error: "Žádné platné záznamy k importu",
          errors: errors.slice(0, 20), // Return first 20 errors for debugging
          debug: {
            totalLines: csvContent.split("\n").length,
            firstLines: lines,
          }
        },
        { status: 400 }
      );
    }

    const imported = bulkInsertRestaurants(success);

    return NextResponse.json({
      success: true,
      imported,
      total: success.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error importing CSV:", error);
    return NextResponse.json(
      { error: "Nepodařilo se importovat CSV soubor" },
      { status: 500 }
    );
  }
}
