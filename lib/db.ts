import { supabase } from "./supabase";
import { Restaurant, RestaurantInput, Trending, TrendingInput } from "./types";

// CRUD operations

export async function getAllRestaurants(): Promise<Restaurant[]> {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .order("rating", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching restaurants:", error);
    throw error;
  }

  return data || [];
}

export async function getRestaurantById(id: number): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching restaurant:", error);
    return null;
  }

  return data;
}

export async function createRestaurant(input: RestaurantInput): Promise<Restaurant> {
  const { data, error } = await supabase
    .from("restaurants")
    .insert({
      name: input.name,
      location: input.location,
      address: input.address || null,
      cuisine_type: input.cuisine_type,
      specialty: input.specialty || null,
      price: input.price,
      rating: input.rating,
      website_url: input.website_url || null,
      image_url: input.image_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating restaurant:", error);
    throw error;
  }

  return data;
}

export async function updateRestaurant(
  id: number,
  input: RestaurantInput
): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from("restaurants")
    .update({
      name: input.name,
      location: input.location,
      address: input.address || null,
      cuisine_type: input.cuisine_type,
      specialty: input.specialty || null,
      price: input.price,
      rating: input.rating,
      website_url: input.website_url || null,
      image_url: input.image_url || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating restaurant:", error);
    return null;
  }

  return data;
}

export async function deleteRestaurant(id: number): Promise<boolean> {
  const { error } = await supabase
    .from("restaurants")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting restaurant:", error);
    return false;
  }

  return true;
}

// Filter operations
export async function filterRestaurants(
  location?: string,
  cuisineType?: string
): Promise<Restaurant[]> {
  let query = supabase
    .from("restaurants")
    .select("*");

  if (location) {
    query = query.eq("location", location);
  }

  if (cuisineType) {
    query = query.eq("cuisine_type", cuisineType);
  }

  query = query
    .order("rating", { ascending: false })
    .order("name", { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error("Error filtering restaurants:", error);
    throw error;
  }

  return data || [];
}

// Get unique values for filters
export async function getUniqueLocations(): Promise<string[]> {
  const { data, error } = await supabase
    .from("restaurants")
    .select("location")
    .order("location", { ascending: true });

  if (error) {
    console.error("Error fetching locations:", error);
    return [];
  }

  // Split locations by comma, normalize, and deduplicate
  const allLocations: string[] = [];

  data.forEach((row) => {
    if (row.location) {
      // Split by comma and process each part
      const parts = row.location.split(',').map((part: string) => part.trim());
      parts.forEach((part: string) => {
        if (part) {
          // Capitalize first letter, rest lowercase for consistency
          const normalized = part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          allLocations.push(normalized);
        }
      });
    }
  });

  // Get unique locations (case-insensitive)
  const uniqueMap = new Map<string, string>();
  allLocations.forEach((loc: string) => {
    const key = loc.toLowerCase();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, loc);
    }
  });

  return Array.from(uniqueMap.values()).sort((a, b) => a.localeCompare(b, 'cs'));
}

export async function getUniqueCuisineTypes(): Promise<string[]> {
  const { data, error } = await supabase
    .from("restaurants")
    .select("cuisine_type")
    .order("cuisine_type", { ascending: true });

  if (error) {
    console.error("Error fetching cuisine types:", error);
    return [];
  }

  // Split cuisine types by comma, normalize, and deduplicate
  const allCuisineTypes: string[] = [];

  data.forEach((row) => {
    if (row.cuisine_type) {
      // Split by comma and process each part
      const parts = row.cuisine_type.split(',').map((part: string) => part.trim());
      parts.forEach((part: string) => {
        if (part) {
          // Capitalize first letter, rest lowercase for consistency
          const normalized = part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          allCuisineTypes.push(normalized);
        }
      });
    }
  });

  // Get unique cuisine types (case-insensitive)
  const uniqueMap = new Map<string, string>();
  allCuisineTypes.forEach((type: string) => {
    const key = type.toLowerCase();
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, type);
    }
  });

  return Array.from(uniqueMap.values()).sort((a, b) => a.localeCompare(b, 'cs'));
}

// Bulk insert/update for CSV import (upsert based on name, preserve existing URLs, images and addresses)
export async function bulkInsertRestaurants(
  restaurants: RestaurantInput[]
): Promise<number> {
  // Get existing restaurants to preserve their URLs, images and addresses
  const { data: existingRestaurants } = await supabase
    .from("restaurants")
    .select("name, website_url, image_url, address");

  const existingDataMap = new Map(
    (existingRestaurants || []).map(r => [r.name, { website_url: r.website_url, image_url: r.image_url, address: r.address }])
  );

  const insertData = restaurants.map((restaurant) => {
    const existing = existingDataMap.get(restaurant.name);
    return {
      name: restaurant.name,
      location: restaurant.location,
      address: restaurant.address || existing?.address || null,
      cuisine_type: restaurant.cuisine_type,
      specialty: restaurant.specialty || null,
      price: restaurant.price,
      rating: restaurant.rating,
      // Preserve existing URLs if CSV doesn't have them
      website_url: restaurant.website_url || existing?.website_url || null,
      image_url: restaurant.image_url || existing?.image_url || null,
    };
  });

  const { data, error } = await supabase
    .from("restaurants")
    .upsert(insertData, {
      onConflict: 'name',
      ignoreDuplicates: false
    })
    .select();

  if (error) {
    console.error("Error bulk inserting restaurants:", error);
    throw error;
  }

  return data?.length || 0;
}

// ============================================
// TRENDING OPERATIONS
// ============================================

export async function getAllTrendings(): Promise<Trending[]> {
  const { data, error } = await supabase
    .from("trendings")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching trendings:", error);
    throw error;
  }

  return data || [];
}

export async function getTrendingById(id: number): Promise<Trending | null> {
  const { data, error } = await supabase
    .from("trendings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching trending:", error);
    return null;
  }

  return data;
}

export async function createTrending(input: TrendingInput): Promise<Trending> {
  const { data, error } = await supabase
    .from("trendings")
    .insert({
      name: input.name,
      website_url: input.website_url || null,
      image_url: input.image_url || null,
      display_order: input.display_order || 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating trending:", error);
    throw error;
  }

  return data;
}

export async function updateTrending(
  id: number,
  input: TrendingInput
): Promise<Trending | null> {
  const { data, error } = await supabase
    .from("trendings")
    .update({
      name: input.name,
      website_url: input.website_url || null,
      image_url: input.image_url || null,
      display_order: input.display_order || 0,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating trending:", error);
    return null;
  }

  return data;
}

export async function deleteTrending(id: number): Promise<boolean> {
  const { error } = await supabase
    .from("trendings")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting trending:", error);
    return false;
  }

  return true;
}

export async function bulkInsertTrendings(
  trendings: TrendingInput[]
): Promise<number> {
  // Get existing trendings to preserve their URLs and images
  const { data: existingTrendings } = await supabase
    .from("trendings")
    .select("name, website_url, image_url");

  const existingDataMap = new Map(
    (existingTrendings || []).map(t => [t.name, { website_url: t.website_url, image_url: t.image_url }])
  );

  const insertData = trendings.map((trending) => {
    const existing = existingDataMap.get(trending.name);
    return {
      name: trending.name,
      // Preserve existing URLs if CSV doesn't have them
      website_url: trending.website_url || existing?.website_url || null,
      image_url: trending.image_url || existing?.image_url || null,
      display_order: trending.display_order || 0,
    };
  });

  const { data, error } = await supabase
    .from("trendings")
    .upsert(insertData, {
      onConflict: 'name',
      ignoreDuplicates: false
    })
    .select();

  if (error) {
    console.error("Error bulk inserting trendings:", error);
    throw error;
  }

  return data?.length || 0;
}
