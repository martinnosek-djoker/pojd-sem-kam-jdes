import { supabase, supabaseAdmin } from "./supabase";
import { Restaurant, RestaurantInput, Trending, TrendingInput, Bakery, BakeryInput, Cafe, CafeInput, Breakfast, BreakfastInput, Event, EventInput, ReviewInput } from "./types";
import { normalizeLocationName } from "./location-utils";

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
      addresses: input.addresses || null,
      coordinates: input.coordinates || null,
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
      addresses: input.addresses || null,
      coordinates: input.coordinates || null,
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
      // Split by comma and normalize with proper Czech capitalization
      const parts = row.location.split(',').map((part: string) => part.trim());
      parts.forEach((part: string) => {
        if (part) {
          const normalized = normalizeLocationName(part);
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
  // Get existing restaurants to preserve their URLs, images, addresses and coordinates
  const { data: existingRestaurants } = await supabase
    .from("restaurants")
    .select("name, website_url, image_url, addresses, coordinates");

  const existingDataMap = new Map(
    (existingRestaurants || []).map(r => [r.name, {
      website_url: r.website_url,
      image_url: r.image_url,
      addresses: r.addresses,
      coordinates: r.coordinates
    }])
  );

  const insertData = restaurants.map((restaurant) => {
    const existing = existingDataMap.get(restaurant.name);
    return {
      name: restaurant.name,
      location: restaurant.location,
      addresses: restaurant.addresses || existing?.addresses || null,
      coordinates: restaurant.coordinates || existing?.coordinates || null,
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
      address: input.address || null,
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
      address: input.address || null,
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
  // Get existing trendings to preserve their URLs, images and addresses
  const { data: existingTrendings } = await supabase
    .from("trendings")
    .select("name, address, website_url, image_url");

  const existingDataMap = new Map(
    (existingTrendings || []).map(t => [t.name, { address: t.address, website_url: t.website_url, image_url: t.image_url }])
  );

  const insertData = trendings.map((trending) => {
    const existing = existingDataMap.get(trending.name);
    return {
      name: trending.name,
      // Preserve existing data if CSV doesn't have them
      address: trending.address || existing?.address || null,
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

// ============================================
// BAKERY OPERATIONS
// ============================================

export async function getAllBakeries(): Promise<Bakery[]> {
  const { data, error } = await supabase
    .from("bakeries")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching bakeries:", error);
    throw error;
  }

  return data || [];
}

export async function getBakeryById(id: number): Promise<Bakery | null> {
  const { data, error } = await supabase
    .from("bakeries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching bakery:", error);
    return null;
  }

  return data;
}

export async function createBakery(input: BakeryInput): Promise<Bakery> {
  const { data, error } = await supabase
    .from("bakeries")
    .insert({
      name: input.name,
      location: input.location,
      addresses: input.addresses || null,
      coordinates: input.coordinates || null,
      website_url: input.website_url || null,
      image_url: input.image_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating bakery:", error);
    throw error;
  }

  return data;
}

export async function updateBakery(
  id: number,
  input: BakeryInput
): Promise<Bakery | null> {
  const { data, error } = await supabase
    .from("bakeries")
    .update({
      name: input.name,
      location: input.location,
      addresses: input.addresses || null,
      coordinates: input.coordinates || null,
      website_url: input.website_url || null,
      image_url: input.image_url || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating bakery:", error);
    return null;
  }

  return data;
}

export async function deleteBakery(id: number): Promise<boolean> {
  const { error } = await supabase
    .from("bakeries")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting bakery:", error);
    return false;
  }

  return true;
}

// Get unique locations for bakeries
export async function getUniqueBakeryLocations(): Promise<string[]> {
  const { data, error } = await supabase
    .from("bakeries")
    .select("location")
    .order("location", { ascending: true});

  if (error) {
    console.error("Error fetching bakery locations:", error);
    return [];
  }

  // Split locations by comma, normalize, and deduplicate
  const allLocations: string[] = [];

  data.forEach((row) => {
    if (row.location) {
      // Split by comma and normalize with proper Czech capitalization
      const parts = row.location.split(',').map((part: string) => part.trim());
      parts.forEach((part: string) => {
        if (part) {
          const normalized = normalizeLocationName(part);
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

// Bulk insert/update for CSV import (upsert based on name, preserve existing URLs, images and addresses)
export async function bulkInsertBakeries(
  bakeries: BakeryInput[]
): Promise<number> {
  // Get existing bakeries to preserve their URLs, images, addresses and coordinates
  const { data: existingBakeries } = await supabase
    .from("bakeries")
    .select("name, website_url, image_url, addresses, coordinates");

  const existingDataMap = new Map(
    (existingBakeries || []).map(b => [b.name, {
      website_url: b.website_url,
      image_url: b.image_url,
      addresses: b.addresses,
      coordinates: b.coordinates
    }])
  );

  const insertData = bakeries.map((bakery) => {
    const existing = existingDataMap.get(bakery.name);
    return {
      name: bakery.name,
      location: bakery.location,
      addresses: bakery.addresses || existing?.addresses || null,
      coordinates: bakery.coordinates || existing?.coordinates || null,
      // Preserve existing URLs if CSV doesn't have them
      website_url: bakery.website_url || existing?.website_url || null,
      image_url: bakery.image_url || existing?.image_url || null,
    };
  });

  const { data, error } = await supabase
    .from("bakeries")
    .upsert(insertData, {
      onConflict: 'name',
      ignoreDuplicates: false
    })
    .select();

  if (error) {
    console.error("Error bulk inserting bakeries:", error);
    throw error;
  }

  return data?.length || 0;
}

// ============================================
// CAFE OPERATIONS
// ============================================

export async function getAllCafes(): Promise<Cafe[]> {
  const { data, error } = await supabase
    .from("cafes")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching cafes:", error);
    throw error;
  }

  return data || [];
}

export async function getCafeById(id: number): Promise<Cafe | null> {
  const { data, error } = await supabase
    .from("cafes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching cafe:", error);
    return null;
  }

  return data;
}

export async function createCafe(input: CafeInput): Promise<Cafe> {
  const { data, error } = await supabase
    .from("cafes")
    .insert({
      name: input.name,
      location: input.location,
      addresses: input.addresses || null,
      coordinates: input.coordinates || null,
      website_url: input.website_url || null,
      image_url: input.image_url || null,
      tags: input.tags || [],
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating cafe:", error);
    throw error;
  }

  return data;
}

export async function updateCafe(
  id: number,
  input: CafeInput
): Promise<Cafe | null> {
  const { data, error } = await supabase
    .from("cafes")
    .update({
      name: input.name,
      location: input.location,
      addresses: input.addresses || null,
      coordinates: input.coordinates || null,
      website_url: input.website_url || null,
      image_url: input.image_url || null,
      tags: input.tags || [],
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating cafe:", error);
    return null;
  }

  return data;
}

export async function deleteCafe(id: number): Promise<boolean> {
  const { error } = await supabase
    .from("cafes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting cafe:", error);
    return false;
  }

  return true;
}

// Get unique locations for cafes
export async function getUniqueCafeLocations(): Promise<string[]> {
  const { data, error } = await supabase
    .from("cafes")
    .select("location")
    .order("location", { ascending: true});

  if (error) {
    console.error("Error fetching cafe locations:", error);
    return [];
  }

  // Split locations by comma, normalize, and deduplicate
  const allLocations: string[] = [];

  data.forEach((row) => {
    if (row.location) {
      // Split by comma and normalize with proper Czech capitalization
      const parts = row.location.split(',').map((part: string) => part.trim());
      parts.forEach((part: string) => {
        if (part) {
          const normalized = normalizeLocationName(part);
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

// Bulk insert/update for CSV import (upsert based on name, preserve existing URLs, images and addresses)
export async function bulkInsertCafes(
  cafes: CafeInput[]
): Promise<number> {
  // Get existing cafes to preserve their URLs, images, addresses and coordinates
  const { data: existingCafes } = await supabase
    .from("cafes")
    .select("name, website_url, image_url, addresses, coordinates");

  const existingDataMap = new Map(
    (existingCafes || []).map(c => [c.name, {
      website_url: c.website_url,
      image_url: c.image_url,
      addresses: c.addresses,
      coordinates: c.coordinates
    }])
  );

  const insertData = cafes.map((cafe) => {
    const existing = existingDataMap.get(cafe.name);
    return {
      name: cafe.name,
      location: cafe.location,
      addresses: cafe.addresses || existing?.addresses || null,
      coordinates: cafe.coordinates || existing?.coordinates || null,
      // Preserve existing URLs if CSV doesn't have them
      website_url: cafe.website_url || existing?.website_url || null,
      image_url: cafe.image_url || existing?.image_url || null,
    };
  });

  const { data, error } = await supabase
    .from("cafes")
    .upsert(insertData, {
      onConflict: 'name',
      ignoreDuplicates: false
    })
    .select();

  if (error) {
    console.error("Error bulk inserting cafes:", error);
    throw error;
  }

  return data?.length || 0;
}

// ============================================
// BREAKFAST OPERATIONS
// ============================================

export async function getAllBreakfasts(): Promise<Breakfast[]> {
  const { data, error } = await supabase
    .from("breakfasts")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching breakfasts:", error);
    throw error;
  }

  return data || [];
}

export async function getBreakfastById(id: number): Promise<Breakfast | null> {
  const { data, error } = await supabase
    .from("breakfasts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching breakfast:", error);
    return null;
  }

  return data;
}

export async function createBreakfast(input: BreakfastInput): Promise<Breakfast> {
  const { data, error } = await supabase
    .from("breakfasts")
    .insert({
      name: input.name,
      location: input.location,
      addresses: input.addresses || null,
      coordinates: input.coordinates || null,
      website_url: input.website_url || null,
      image_url: input.image_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating breakfast:", error);
    throw error;
  }

  return data;
}

export async function updateBreakfast(
  id: number,
  input: BreakfastInput
): Promise<Breakfast | null> {
  const { data, error } = await supabase
    .from("breakfasts")
    .update({
      name: input.name,
      location: input.location,
      addresses: input.addresses || null,
      coordinates: input.coordinates || null,
      website_url: input.website_url || null,
      image_url: input.image_url || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating breakfast:", error);
    return null;
  }

  return data;
}

export async function deleteBreakfast(id: number): Promise<boolean> {
  const { error } = await supabase
    .from("breakfasts")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting breakfast:", error);
    return false;
  }

  return true;
}

// Get unique locations for breakfasts
export async function getUniqueBreakfastLocations(): Promise<string[]> {
  const { data, error } = await supabase
    .from("breakfasts")
    .select("location")
    .order("location", { ascending: true});

  if (error) {
    console.error("Error fetching breakfast locations:", error);
    return [];
  }

  // Split locations by comma, normalize, and deduplicate
  const allLocations: string[] = [];

  data.forEach((row) => {
    if (row.location) {
      // Split by comma and normalize with proper Czech capitalization
      const parts = row.location.split(',').map((part: string) => part.trim());
      parts.forEach((part: string) => {
        if (part) {
          const normalized = normalizeLocationName(part);
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

// Bulk insert/update for CSV import (upsert based on name, preserve existing URLs, images and addresses)
export async function bulkInsertBreakfasts(
  breakfasts: BreakfastInput[]
): Promise<number> {
  // Get existing breakfasts to preserve their URLs, images, addresses and coordinates
  const { data: existingBreakfasts } = await supabase
    .from("breakfasts")
    .select("name, website_url, image_url, addresses, coordinates");

  const existingDataMap = new Map(
    (existingBreakfasts || []).map(b => [b.name, {
      website_url: b.website_url,
      image_url: b.image_url,
      addresses: b.addresses,
      coordinates: b.coordinates
    }])
  );

  const insertData = breakfasts.map((breakfast) => {
    const existing = existingDataMap.get(breakfast.name);
    return {
      name: breakfast.name,
      location: breakfast.location,
      addresses: breakfast.addresses || existing?.addresses || null,
      coordinates: breakfast.coordinates || existing?.coordinates || null,
      // Preserve existing URLs if CSV doesn't have them
      website_url: breakfast.website_url || existing?.website_url || null,
      image_url: breakfast.image_url || existing?.image_url || null,
    };
  });

  const { data, error } = await supabase
    .from("breakfasts")
    .upsert(insertData, {
      onConflict: 'name',
      ignoreDuplicates: false
    })
    .select();

  if (error) {
    console.error("Error bulk inserting breakfasts:", error);
    throw error;
  }

  return data?.length || 0;
}

// Copy a cafe to breakfasts table
export async function copyCafeToBreakfast(cafeId: number): Promise<Breakfast> {
  const cafe = await getCafeById(cafeId);
  if (!cafe) {
    throw new Error("Kavárna nenalezena");
  }

  const breakfastInput: BreakfastInput = {
    name: cafe.name,
    location: cafe.location,
    addresses: cafe.addresses,
    coordinates: cafe.coordinates,
    website_url: cafe.website_url,
    image_url: cafe.image_url,
  };

  return createBreakfast(breakfastInput);
}

// Copy a bakery to breakfasts table
export async function copyBakeryToBreakfast(bakeryId: number): Promise<Breakfast> {
  const bakery = await getBakeryById(bakeryId);
  if (!bakery) {
    throw new Error("Cukrárna nenalezena");
  }

  const breakfastInput: BreakfastInput = {
    name: bakery.name,
    location: bakery.location,
    addresses: bakery.addresses,
    coordinates: bakery.coordinates,
    website_url: bakery.website_url,
    image_url: bakery.image_url,
  };

  return createBreakfast(breakfastInput);
}

// ====================
// EVENT CRUD OPERATIONS
// ====================

export async function getAllEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    throw error;
  }

  return data || [];
}

export async function getHappeningNowEvents(): Promise<Event[]> {
  // Get current and upcoming events:
  // 1. Events currently happening (start_date <= now AND end_date >= now)
  // 2. Events starting within the next 3 days
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Create "naive" ISO strings (without timezone conversion)
  const formatNaiveISO = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
  };

  const naiveNow = formatNaiveISO(now);
  const naiveThreeDays = formatNaiveISO(threeDaysFromNow);

  // Get events that:
  // - Haven't ended yet (end_date >= now OR end_date is null)
  // - Start within next 3 days (start_date <= now + 3 days)
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .lte("start_date", naiveThreeDays)
    .or(`end_date.gte.${naiveNow},end_date.is.null`)
    .not("start_date", "is", null)
    .order("start_date", { ascending: true })
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching upcoming events:", error);
    throw error;
  }

  return data || [];
}

export async function getEventById(id: number): Promise<Event | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching event:", error);
    return null;
  }

  return data;
}

export async function createEvent(input: EventInput): Promise<Event> {
  console.log("[createEvent] Input data:", JSON.stringify(input, null, 2));

  const insertData = {
    name: input.name,
    location: input.location || null,
    date: input.date || null,
    start_date: input.start_date || null,
    end_date: input.end_date || null,
    link: input.link || null,
    display_order: input.display_order,
  };

  console.log("[createEvent] Inserting into database:", JSON.stringify(insertData, null, 2));

  const { data, error } = await supabase
    .from("events")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("[createEvent] Supabase error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }

  console.log("[createEvent] Success:", data);
  return data;
}

export async function updateEvent(id: number, input: EventInput): Promise<Event> {
  const { data, error } = await supabase
    .from("events")
    .update({
      name: input.name,
      location: input.location || null,
      date: input.date || null,
      start_date: input.start_date || null,
      end_date: input.end_date || null,
      link: input.link || null,
      display_order: input.display_order,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating event:", error);
    throw error;
  }

  return data;
}

export async function deleteEvent(id: number): Promise<void> {
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
}

export async function updateEventOrder(updates: { id: number; display_order: number }[]): Promise<void> {
  // Update one by one
  for (const update of updates) {
    const { error: updateError } = await supabase
      .from("events")
      .update({ display_order: update.display_order })
      .eq("id", update.id);

    if (updateError) {
      console.error("Error updating event order:", updateError);
      throw updateError;
    }
  }
}

// Michelin restaurants functions
export async function getAllMichelinRestaurants() {
  const { data, error } = await supabase
    .from("michelin_restaurants")
    .select("*")
    .order("award_type")
    .order("display_order");

  if (error) {
    console.error("Error fetching Michelin restaurants:", error);
    throw error;
  }

  return data;
}

export async function getMichelinRestaurantById(id: number) {
  const { data, error } = await supabase
    .from("michelin_restaurants")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching Michelin restaurant:", error);
    throw error;
  }

  return data;
}

export async function createMichelinRestaurant(restaurant: any) {
  const { data, error } = await supabase
    .from("michelin_restaurants")
    .insert(restaurant)
    .select()
    .single();

  if (error) {
    console.error("Error creating Michelin restaurant:", error);
    throw error;
  }

  return data;
}

export async function updateMichelinRestaurant(id: number, restaurant: any) {
  const { data, error } = await supabase
    .from("michelin_restaurants")
    .update(restaurant)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating Michelin restaurant:", error);
    throw error;
  }

  return data;
}

export async function deleteMichelinRestaurant(id: number) {
  const { error } = await supabase
    .from("michelin_restaurants")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting Michelin restaurant:", error);
    throw error;
  }
}

export async function updateMichelinRestaurantOrder(updates: { id: number; display_order: number }[]): Promise<void> {
  for (const update of updates) {
    const { error: updateError } = await supabase
      .from("michelin_restaurants")
      .update({ display_order: update.display_order })
      .eq("id", update.id);

    if (updateError) {
      console.error("Error updating Michelin restaurant order:", updateError);
      throw updateError;
    }
  }
}

// ==================== REVIEWS ====================

export async function getAllReviews() {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      restaurant:restaurants(*),
      cafe:cafes(*)
    `)
    .order("display_order", { ascending: true })
    .order("visit_date", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }

  return data;
}

export async function getFeaturedReviews() {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      restaurant:restaurants(*),
      cafe:cafes(*)
    `)
    .eq("is_featured", true)
    .order("display_order", { ascending: true })
    .order("visit_date", { ascending: false });

  if (error) {
    console.error("Error fetching featured reviews:", error);
    throw error;
  }

  return data;
}

export async function getReviewById(id: number) {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      restaurant:restaurants(*),
      cafe:cafes(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching review:", error);
    throw error;
  }

  return data;
}

export async function getReviewsByRestaurant(restaurantId: number) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("visit_date", { ascending: false });

  if (error) {
    console.error("Error fetching reviews by restaurant:", error);
    throw error;
  }

  return data;
}

export async function createReview(review: ReviewInput) {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .insert([review])
    .select()
    .single();

  if (error) {
    console.error("Error creating review:", error);
    throw error;
  }

  return data;
}

export async function updateReview(id: number, review: Partial<ReviewInput>) {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .update(review)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating review:", error);
    throw error;
  }

  return data;
}

export async function deleteReview(id: number) {
  const { error } = await supabaseAdmin
    .from("reviews")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
}

export async function updateReviewOrder(updates: { id: number; display_order: number }[]): Promise<void> {
  for (const update of updates) {
    const { error: updateError } = await supabaseAdmin
      .from("reviews")
      .update({ display_order: update.display_order })
      .eq("id", update.id);

    if (updateError) {
      console.error("Error updating review order:", updateError);
      throw updateError;
    }
  }
}

export async function getSimilarRestaurants(restaurantId: number) {
  // First get the current restaurant
  const { data: currentRestaurant, error: currentError } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .single();

  if (currentError || !currentRestaurant) {
    console.error("Error fetching current restaurant:", currentError);
    return [];
  }

  // Get all restaurants
  const { data: allRestaurants, error: allError } = await supabase
    .from("restaurants")
    .select("*")
    .neq("id", restaurantId); // Exclude current restaurant

  if (allError || !allRestaurants) {
    console.error("Error fetching restaurants:", allError);
    return [];
  }

  // Score each restaurant by similarity
  const scoredRestaurants = allRestaurants.map((restaurant) => {
    let score = 0;

    // Same cuisine type = +10 points
    if (restaurant.cuisine_type.toLowerCase() === currentRestaurant.cuisine_type.toLowerCase()) {
      score += 10;
    } else {
      // Check cuisine hierarchy
      const { cuisineMatchesFilter } = require("./types");
      if (cuisineMatchesFilter(restaurant.cuisine_type, currentRestaurant.cuisine_type) ||
          cuisineMatchesFilter(currentRestaurant.cuisine_type, restaurant.cuisine_type)) {
        score += 5;
      }
    }

    // Same location = +8 points
    if (restaurant.location.toLowerCase() === currentRestaurant.location.toLowerCase()) {
      score += 8;
    }

    // Similar price (within 1 level) = +5 points
    const priceDiff = Math.abs(restaurant.price - currentRestaurant.price);
    if (priceDiff === 0) {
      score += 5;
    } else if (priceDiff === 1) {
      score += 3;
    }

    // Similar rating (within 2 points) = +3 points
    const ratingDiff = Math.abs(restaurant.rating - currentRestaurant.rating);
    if (ratingDiff <= 2) {
      score += 3;
    }

    return { ...restaurant, similarityScore: score };
  });

  // Sort by score (descending) and return top 4
  const similarRestaurants = scoredRestaurants
    .filter((r) => r.similarityScore > 0) // Only include restaurants with some similarity
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 4);

  return similarRestaurants;
}
