import { z } from "zod";

// Hierarchie typů kuchyně - mapování specifických typů na obecné kategorie
export const CUISINE_HIERARCHY: Record<string, string[]> = {
  "Italská": ["pizza", "pizzeria"],
  "Asijská": ["vietnamská", "indická", "thajská", "čínská", "japonská", "korejská"],
};

// Pomocná funkce pro kontrolu, jestli typ patří do kategorie
export function cuisineMatchesFilter(cuisineType: string, selectedFilter: string): boolean {
  const cuisineLower = cuisineType.toLowerCase();
  const filterLower = selectedFilter.toLowerCase();

  // Přímá shoda
  if (cuisineLower === filterLower) {
    return true;
  }

  // Kontrola hierarchie - pokud je vybrána kategorie, zkontroluj jestli typ patří pod ni
  const subcuisines = CUISINE_HIERARCHY[selectedFilter];
  if (subcuisines && subcuisines.some(sub => cuisineLower.includes(sub))) {
    return true;
  }

  return false;
}

// GPS coordinate type
export interface Coordinates {
  lat: number;
  lng: number;
}

// Database types
export interface Restaurant {
  id: number;
  name: string;
  location: string;
  addresses: Record<string, string> | null; // { "Anděl": "adresa1", "Letná": "adresa2" }
  coordinates: Record<string, Coordinates> | null; // { "Anděl": {"lat": 50.07, "lng": 14.40} }
  cuisine_type: string;
  specialty: string | null;
  price: number;
  rating: number;
  website_url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Zod validation schemas
export const restaurantSchema = z.object({
  name: z.string().min(1, "Název je povinný"),
  location: z.string().min(1, "Lokalita je povinná"),
  addresses: z.record(z.string(), z.string()).optional().nullable(),
  coordinates: z.record(z.string(), z.object({
    lat: z.number(),
    lng: z.number()
  })).optional().nullable(),
  cuisine_type: z.string().min(1, "Typ kuchyně je povinný"),
  specialty: z.string().optional().nullable(),
  price: z.number().min(0, "Cena musí být kladné číslo"),
  rating: z.number().min(1).max(10, "Hodnocení musí být mezi 1-10"),
  website_url: z.string().url("Neplatná URL").optional().nullable().or(z.literal("")),
  image_url: z.string().url("Neplatná URL obrázku").optional().nullable().or(z.literal("")),
});

export type RestaurantInput = z.infer<typeof restaurantSchema>;

// For CSV import
export interface CSVRestaurant {
  name: string;
  location: string;
  cuisine_type: string;
  specialty: string | null;
  price: number;
  rating: number;
}

// Trending places types
export interface Trending {
  id: number;
  name: string;
  address: string | null;
  website_url: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const trendingSchema = z.object({
  name: z.string().min(1, "Název je povinný"),
  address: z.string().optional().nullable().or(z.literal("")),
  website_url: z.string().url("Neplatná URL").optional().nullable().or(z.literal("")),
  image_url: z.string().url("Neplatná URL obrázku").optional().nullable().or(z.literal("")),
  display_order: z.number().min(0, "Pořadí musí být kladné číslo"),
});

export type TrendingInput = z.infer<typeof trendingSchema>;

// Bakery types
export interface Bakery {
  id: number;
  name: string;
  location: string;
  addresses: Record<string, string> | null; // { "Náměstí Republiky": "adresa1", "Florenc": "adresa2" }
  coordinates: Record<string, Coordinates> | null; // { "Náměstí Republiky": {"lat": 50.07, "lng": 14.40} }
  website_url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Zod validation schemas for bakery
export const bakerySchema = z.object({
  name: z.string().min(1, "Název je povinný"),
  location: z.string().min(1, "Lokalita je povinná"),
  addresses: z.record(z.string(), z.string()).optional().nullable(),
  coordinates: z.record(z.string(), z.object({
    lat: z.number(),
    lng: z.number()
  })).optional().nullable(),
  website_url: z.string().url("Neplatná URL").optional().nullable().or(z.literal("")),
  image_url: z.string().url("Neplatná URL obrázku").optional().nullable().or(z.literal("")),
});

export type BakeryInput = z.infer<typeof bakerySchema>;

// For CSV import
export interface CSVBakery {
  name: string;
  location: string;
}

// Cafe types
export interface Cafe {
  id: number;
  name: string;
  location: string;
  addresses: Record<string, string> | null; // { "Náměstí Republiky": "adresa1", "Florenc": "adresa2" }
  coordinates: Record<string, Coordinates> | null; // { "Náměstí Republiky": {"lat": 50.07, "lng": 14.40} }
  website_url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Zod validation schemas for cafe
export const cafeSchema = z.object({
  name: z.string().min(1, "Název je povinný"),
  location: z.string().min(1, "Lokalita je povinná"),
  addresses: z.record(z.string(), z.string()).optional().nullable(),
  coordinates: z.record(z.string(), z.object({
    lat: z.number(),
    lng: z.number()
  })).optional().nullable(),
  website_url: z.string().url("Neplatná URL").optional().nullable().or(z.literal("")),
  image_url: z.string().url("Neplatná URL obrázku").optional().nullable().or(z.literal("")),
});

export type CafeInput = z.infer<typeof cafeSchema>;

// For CSV import
export interface CSVCafe {
  name: string;
  location: string;
}

// Event types
export interface Event {
  id: number;
  name: string;
  location: string | null;
  date: string | null; // Legacy text field for display
  start_date: string | null; // ISO 8601 timestamp for event start
  end_date: string | null; // ISO 8601 timestamp for event end
  link: string | null;
  display_order: number;
  created_at: string;
}

// Zod validation schemas for event
export const eventSchema = z.object({
  name: z.string().min(1, "Název akce je povinný"),
  location: z.string().optional().nullable().or(z.literal("")),
  date: z.string().optional().nullable().or(z.literal("")), // Legacy text field
  start_date: z.string().optional().nullable().or(z.literal("")),
  end_date: z.string().optional().nullable().or(z.literal("")),
  link: z.string()
    .optional()
    .nullable()
    .or(z.literal(""))
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      { message: "Neplatná URL" }
    ),
  display_order: z.number().int().min(1, "Pořadí musí být kladné číslo").default(1),
});

export type EventInput = z.infer<typeof eventSchema>;

// Michelin restaurant types
export type MichelinAwardType = "2-stars" | "1-star" | "bib-gourmand";

export const MICHELIN_AWARD_LABELS: Record<MichelinAwardType, string> = {
  "2-stars": "⭐⭐ 2 Michelin hvězdy",
  "1-star": "⭐ 1 Michelin hvězda",
  "bib-gourmand": "🍽️ Bib Gourmand",
};

export interface MichelinRestaurant {
  id: number;
  name: string;
  award_type: MichelinAwardType;
  location: string;
  addresses: Record<string, string> | null;
  coordinates: Record<string, Coordinates> | null;
  cuisine_type: string | null;
  description: string | null;
  website_url: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const michelinRestaurantSchema = z.object({
  name: z.string().min(1, "Název je povinný"),
  award_type: z.enum(["2-stars", "1-star", "bib-gourmand"]),
  location: z.string().min(1, "Lokalita je povinná"),
  addresses: z.record(z.string(), z.string()).optional().nullable(),
  coordinates: z.record(z.string(), z.object({
    lat: z.number(),
    lng: z.number()
  })).optional().nullable(),
  cuisine_type: z.string().optional().nullable().or(z.literal("")),
  description: z.string().optional().nullable().or(z.literal("")),
  website_url: z.string().url("Neplatná URL").optional().nullable().or(z.literal("")),
  image_url: z.string().url("Neplatná URL obrázku").optional().nullable().or(z.literal("")),
  display_order: z.number().min(0, "Pořadí musí být kladné číslo"),
});

export type MichelinRestaurantInput = z.infer<typeof michelinRestaurantSchema>;
