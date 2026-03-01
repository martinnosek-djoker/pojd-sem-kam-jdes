import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY!;

interface Restaurant {
  id: number;
  name: string;
  location: string;
  cuisine_type: string;
  rating: number;
  price: number;
  website_url?: string;
  image_url?: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query je povinný parametr" },
        { status: 400 }
      );
    }

    if (!anthropicApiKey) {
      return NextResponse.json(
        { error: "AI služba není dostupná - chybí API klíč" },
        { status: 500 }
      );
    }

    // Načíst všechny restaurace ze Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: restaurants, error: dbError } = await supabase
      .from("restaurants")
      .select("*")
      .order("rating", { ascending: false });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Nepodařilo se načíst restaurace" },
        { status: 500 }
      );
    }

    if (!restaurants || restaurants.length === 0) {
      return NextResponse.json({
        restaurants: [],
        explanation: "V databázi nejsou žádné restaurace.",
      });
    }

    // Připravit data pro AI
    const restaurantsData = restaurants.map((r: Restaurant) => ({
      id: r.id,
      name: r.name,
      location: r.location,
      cuisine_type: r.cuisine_type,
      rating: r.rating,
      price: r.price,
      description: r.description || "",
    }));

    // Zavolat Claude AI
    const anthropic = new Anthropic({
      apiKey: anthropicApiKey,
    });

    const systemPrompt = `Jsi expertní gastronomický průvodce Prahou. Pomáháš lidem najít nejlepší restaurace podle jejich přání.

Máš k dispozici databázi restaurací v Praze. Tvým úkolem je:
1. Analyzovat dotaz uživatele (může být v přirozeném jazyce)
2. Najít nejlepší restaurace, které odpovídají kritériím
3. Seřadit je podle relevance (nejdříve nejlepší shoda)
4. Vrátit max 6 nejlepších restaurací
5. Vysvětlit, proč jsi tyto restaurace vybral

Kritéria mohou zahrnovat:
- Typ jídla/kuchyně (např. "řízek", "sushi", "italská", "česká", "vegan")
- Lokalita (např. "Anděl", "centrum", "Vinohrady", "Žižkov")
- Cenová kategorie (např. "levné", "do 500 Kč", "fine dining")
- Hodnocení (vždy preferuj vyšší hodnocení při stejné shodě)

DŮLEŽITÉ:
- Cena (price) je průměrná cena za osobu v Kč
- Rating je hodnocení 1-10
- Lokace může obsahovat více hodnot oddělených čárkou
- Cuisine_type může obsahovat více typů oddělených čárkou
- Vždy vysvětli své rozhodnutí stručně a přátelsky
- Pokud nejsou žádné perfektní shody, nabídni nejbližší alternativy

Odpověz POUZE ve formátu JSON:
{
  "restaurant_ids": [1, 5, 3],  // pole ID vybraných restaurací (max 6, seřazeno podle relevance)
  "explanation": "Váš vysvětlující text v češtině..."
}`;

    const userPrompt = `Uživatel hledá: "${query}"

Dostupné restaurace:
${JSON.stringify(restaurantsData, null, 2)}

Vyber nejlepší restaurace podle kritérií a vrať odpověď ve formátu JSON.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    // Extrahovat odpověď z AI
    const responseText = message.content[0].type === "text"
      ? message.content[0].text
      : "";

    // Parsovat JSON odpověď
    let aiResponse;
    try {
      // Pokusit se najít JSON v odpovědi
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON not found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      return NextResponse.json(
        { error: "Nepodařilo se zpracovat odpověď AI" },
        { status: 500 }
      );
    }

    // Vybrat restaurace podle ID z AI odpovědi
    const selectedRestaurants = aiResponse.restaurant_ids
      .map((id: number) => restaurants.find((r: Restaurant) => r.id === id))
      .filter((r: Restaurant | undefined) => r !== undefined);

    return NextResponse.json({
      restaurants: selectedRestaurants,
      explanation: aiResponse.explanation,
    });
  } catch (error) {
    console.error("AI search error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "Nastala chyba při zpracování dotazu"
      },
      { status: 500 }
    );
  }
}
