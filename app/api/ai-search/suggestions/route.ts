import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { jsonWithCors, handleOptionsRequest } from "@/lib/cors";
import { hasVisitText } from "@/lib/db";
import { translateCuisineType } from "@/lib/i18n/dictionaries";
import { normalizeText, type SuggestionKind, type SuggestionTerm } from "@/lib/ai-suggest";
import type { Visit } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type Locale = "cs" | "en";

// POST only (like the search itself): a GET with a query would make the static app export fail
export async function OPTIONS() {
  return handleOptionsRequest();
}

// Everyday words people type that the data alone would not offer ("řízek", "káva", ...)
const KEYWORDS: Record<Locale, string[]> = {
  cs: [
    "řízek", "tatarák", "svíčková", "guláš", "burger", "pizza", "sushi", "ramen", "steak", "těstoviny",
    "snídaně", "brunch", "oběd", "večeře", "káva", "matcha", "dezert", "croissant", "koláč", "zmrzlina",
    "vegan", "vegetariánské", "degustační menu", "levné", "do 500 Kč", "do 1000 Kč", "pro dva", "s dětmi",
  ],
  en: [
    "schnitzel", "steak tartare", "goulash", "burger", "pizza", "sushi", "ramen", "steak", "pasta",
    "breakfast", "brunch", "lunch", "dinner", "coffee", "matcha", "dessert", "croissant", "pastry", "ice cream",
    "vegan", "vegetarian", "tasting menu", "cheap", "under 500 CZK", "under 1000 CZK", "for two", "with kids",
  ],
};

const TAG_LABELS: Record<Locale, Record<string, string>> = {
  cs: { dezert: "dezert", matcha: "matcha", "snídaně": "snídaně", "top-kava": "top káva" },
  en: { dezert: "dessert", matcha: "matcha", "snídaně": "breakfast", "top-kava": "top coffee" },
};

// Neighbourhood names are typed by hand, so "Národní Třída" and "Národní třída" both exist:
// keep one entry per spelling-insensitive name, using the spelling that occurs most often.
class TermBag {
  private entries = new Map<string, { kind: SuggestionKind; spellings: Map<string, number> }>();

  add(kind: SuggestionKind, text: string | null | undefined) {
    const clean = text?.trim();
    if (!clean || clean.length < 2) return;
    const key = normalizeText(clean);
    const entry = this.entries.get(key) ?? { kind, spellings: new Map() };
    entry.spellings.set(clean, (entry.spellings.get(clean) ?? 0) + 1);
    this.entries.set(key, entry);
  }

  toTerms(): SuggestionTerm[] {
    return [...this.entries.values()].map(({ kind, spellings }) => ({
      kind,
      text: [...spellings.entries()].sort((a, b) => b[1] - a[1])[0][0],
    }));
  }
}

const CACHE_MS = 30 * 60 * 1000;
const cache = new Map<Locale, { at: number; terms: SuggestionTerm[] }>();

async function buildTerms(locale: Locale): Promise<SuggestionTerm[]> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
  const [restaurants, cafes, bakeries, visits] = await Promise.all([
    supabase.from("restaurants").select("name, location, cuisine_type"),
    supabase.from("cafes").select("name, location, tags"),
    supabase.from("bakeries").select("name, location"),
    supabase.from("visits").select("comment, dishes, dishes_en"),
  ]);
  const failed = restaurants.error || cafes.error || bakeries.error || visits.error;
  if (failed) throw failed;

  const bag = new TermBag();
  const splitAreas = (location: string | null) => (location ?? "").split(/[,/]/);

  for (const r of restaurants.data ?? []) {
    bag.add("place", r.name);
    splitAreas(r.location).forEach((a) => bag.add("area", a));
    (r.cuisine_type ?? "").split(",").forEach((c: string) => {
      const cuisine = c.trim();
      if (cuisine) bag.add("cuisine", locale === "en" ? translateCuisineType(cuisine, "en") : cuisine);
    });
  }
  for (const c of cafes.data ?? []) {
    bag.add("place", c.name);
    splitAreas(c.location).forEach((a) => bag.add("area", a));
    (c.tags ?? []).forEach((tag: string) => bag.add("tag", TAG_LABELS[locale][tag] ?? tag));
  }
  for (const b of bakeries.data ?? []) {
    bag.add("place", b.name);
    splitAreas(b.location).forEach((a) => bag.add("area", a));
  }
  for (const v of ((visits.data ?? []) as Pick<Visit, "comment" | "dishes" | "dishes_en">[]).filter(hasVisitText)) {
    const dishes = (locale === "en" ? v.dishes_en || v.dishes : v.dishes) ?? [];
    dishes.forEach((d) => bag.add("dish", d.name));
  }
  KEYWORDS[locale].forEach((word) => bag.add("keyword", word));

  return bag.toTerms();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const locale: Locale = body?.locale === "en" ? "en" : "cs";

    const hit = cache.get(locale);
    if (hit && Date.now() - hit.at < CACHE_MS) return jsonWithCors({ terms: hit.terms });

    const terms = await buildTerms(locale);
    cache.set(locale, { at: Date.now(), terms });
    return jsonWithCors({ terms });
  } catch (error) {
    console.error("AI suggestions error:", error);
    return jsonWithCors({ terms: [] }, { status: 500 });
  }
}
