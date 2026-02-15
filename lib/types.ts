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
  type?: string; // Optional - added client-side for categorization (e.g., 'restaurace', 'kavárna', 'restaurant', 'bakery', 'cafe')
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
  tags: string[]; // ["dezert", "matcha", "snídaně"]
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
  tags: z.array(z.string()),
});

export type CafeInput = z.infer<typeof cafeSchema>;

// For CSV import
export interface CSVCafe {
  name: string;
  location: string;
}

// Breakfast types
export interface Breakfast {
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

// Zod validation schemas for breakfast
export const breakfastSchema = z.object({
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

export type BreakfastInput = z.infer<typeof breakfastSchema>;

// For CSV import
export interface CSVBreakfast {
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

// Dish type for reviews
export interface Dish {
  name: string;
  rating: number; // 1-10
}

// Review types
export interface Review {
  id: number;
  restaurant_id: number;
  restaurant?: Restaurant; // Optional joined restaurant data
  title: string;
  content: string; // Markdown/HTML content with formatting
  visit_date: string;
  images: string[]; // Array of image URLs
  is_featured: boolean; // Show on homepage
  display_order: number;
  overall_rating?: number | null; // Overall rating 1-10
  rating_interior?: number | null; // Interior rating 1-10
  rating_service?: number | null; // Service rating 1-10
  rating_food?: number | null; // Food rating 1-10
  total_spent?: number | null; // Total amount spent in CZK
  dishes?: Dish[] | null; // Dishes with ratings
  similar_restaurant_ids?: number[] | null; // Manually selected similar restaurants
  created_at: string;
  updated_at: string;
}

const dishSchema = z.object({
  name: z.string().min(1, "Název jídla je povinný"),
  rating: z.number().min(1).max(10),
});

export const reviewSchema = z.object({
  restaurant_id: z.number().min(1, "Restaurace je povinná"),
  title: z.string().min(1, "Název recenze je povinný"),
  content: z.string().min(10, "Obsah recenze musí mít alespoň 10 znaků"),
  visit_date: z.string().min(1, "Datum návštěvy je povinné"),
  images: z.array(z.string()).optional().default([]),
  is_featured: z.boolean().optional().default(false),
  display_order: z.number().min(0, "Pořadí musí být kladné číslo").optional().default(0),
  overall_rating: z.number().min(1).max(10).optional().nullable(),
  rating_interior: z.number().min(1).max(10).optional().nullable(),
  rating_service: z.number().min(1).max(10).optional().nullable(),
  rating_food: z.number().min(1).max(10).optional().nullable(),
  total_spent: z.number().min(0).optional().nullable(),
  dishes: z.array(dishSchema).optional().nullable(),
  similar_restaurant_ids: z.array(z.number()).optional().nullable(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
