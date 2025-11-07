import { z } from "zod";

// Database types
export interface Restaurant {
  id: number;
  name: string;
  location: string;
  cuisine_type: string;
  specialty: string | null;
  price: number;
  rating: number;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

// Zod validation schemas
export const restaurantSchema = z.object({
  name: z.string().min(1, "Název je povinný"),
  location: z.string().min(1, "Lokalita je povinná"),
  cuisine_type: z.string().min(1, "Typ kuchyně je povinný"),
  specialty: z.string().optional().nullable(),
  price: z.number().min(0, "Cena musí být kladné číslo"),
  rating: z.number().min(1).max(10, "Hodnocení musí být mezi 1-10"),
  website_url: z.string().url("Neplatná URL").optional().nullable().or(z.literal("")),
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
