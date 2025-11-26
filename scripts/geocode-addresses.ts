/**
 * Geocoding script to add coordinates to all venues
 * Uses Nominatim (OpenStreetMap) - free, no API key needed
 * Rate limit: 1 request/second
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Coordinates {
  lat: number;
  lng: number;
}

// Geocode address using multiple services
// Tries Photon first, then Nominatim as fallback
async function geocodeAddress(address: string, venueName?: string, location?: string): Promise<Coordinates | null> {
  // Try multiple address formats
  const queries = [
    // 1. Original full address
    `${address}, Praha, Czech Republic`,
    // 2. Remove "Czechia" suffix if present and try with Czech Republic
    address.replace(/, Czechia$/, ', Praha, Czech Republic'),
    // 3. Just street name (remove building numbers) + Praha
    address.replace(/\s+\d+\/?\d*,?\s*\d{0,3}\s*\d{0,2}/, '') + ', Praha, Czech Republic',
  ];

  // 4. If venue name and location provided, try simplified format
  if (venueName && location) {
    queries.push(`${venueName}, ${location}, Praha, Czech Republic`);
  }

  // Try Photon first (often better for European addresses)
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];

    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`;

      const response = await fetch(url);

      if (!response.ok) {
        continue;
      }

      const data = await response.json();

      if (data?.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates;
        console.log(`  ℹ️  Found with Photon (format ${i + 1})`);
        return {
          lat: coords[1], // Photon returns [lng, lat]
          lng: coords[0],
        };
      }

      await sleep(200);
    } catch (error) {
      continue;
    }
  }

  // Fallback to Nominatim
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'GastroTips/1.0 (pojdsemkamjdes.cz)',
        },
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();

      if (data && data.length > 0) {
        console.log(`  ℹ️  Found with Nominatim (format ${i + 1})`);
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }

      await sleep(300);
    } catch (error) {
      continue;
    }
  }

  return null;
}

// Sleep function for rate limiting
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocodeRestaurants() {
  console.log('📍 Starting geocoding for restaurants...\n');

  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, addresses, coordinates');

  if (error || !restaurants) {
    console.error('Error fetching restaurants:', error);
    return;
  }

  console.log(`Found ${restaurants.length} restaurants`);

  let updated = 0;
  let skipped = 0;

  for (const restaurant of restaurants) {
    if (!restaurant.addresses) {
      console.log(`⏭️  Skipping ${restaurant.name} - no addresses`);
      skipped++;
      continue;
    }

    const addresses = restaurant.addresses as Record<string, string>;
    const currentCoords = (restaurant.coordinates || {}) as Record<string, Coordinates>;
    const newCoords: Record<string, Coordinates> = { ...currentCoords };

    let needsUpdate = false;

    for (const [location, address] of Object.entries(addresses)) {
      // Skip if we already have coordinates for this location
      if (currentCoords[location]) {
        console.log(`✓ ${restaurant.name} (${location}) - already has coordinates`);
        continue;
      }

      console.log(`🔍 Geocoding ${restaurant.name} (${location}): ${address}`);

      const coords = await geocodeAddress(address, restaurant.name, location);

      if (coords) {
        newCoords[location] = coords;
        needsUpdate = true;
        console.log(`  ✓ Found: ${coords.lat}, ${coords.lng}`);
      } else {
        console.log(`  ✗ Not found`);
      }

      // Rate limit: 1 request/second
      await sleep(1000);
    }

    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ coordinates: newCoords })
        .eq('id', restaurant.id);

      if (updateError) {
        console.error(`Error updating ${restaurant.name}:`, updateError);
      } else {
        console.log(`💾 Updated ${restaurant.name}\n`);
        updated++;
      }
    }
  }

  console.log(`\n✅ Restaurants done: ${updated} updated, ${skipped} skipped`);
}

async function geocodeCafes() {
  console.log('\n📍 Starting geocoding for cafes...\n');

  const { data: cafes, error } = await supabase
    .from('cafes')
    .select('id, name, addresses, coordinates');

  if (error || !cafes) {
    console.error('Error fetching cafes:', error);
    return;
  }

  console.log(`Found ${cafes.length} cafes`);

  let updated = 0;
  let skipped = 0;

  for (const cafe of cafes) {
    if (!cafe.addresses) {
      console.log(`⏭️  Skipping ${cafe.name} - no addresses`);
      skipped++;
      continue;
    }

    const addresses = cafe.addresses as Record<string, string>;
    const currentCoords = (cafe.coordinates || {}) as Record<string, Coordinates>;
    const newCoords: Record<string, Coordinates> = { ...currentCoords };

    let needsUpdate = false;

    for (const [location, address] of Object.entries(addresses)) {
      if (currentCoords[location]) {
        console.log(`✓ ${cafe.name} (${location}) - already has coordinates`);
        continue;
      }

      console.log(`🔍 Geocoding ${cafe.name} (${location}): ${address}`);

      const coords = await geocodeAddress(address, cafe.name, location);

      if (coords) {
        newCoords[location] = coords;
        needsUpdate = true;
        console.log(`  ✓ Found: ${coords.lat}, ${coords.lng}`);
      } else {
        console.log(`  ✗ Not found`);
      }

      await sleep(1000);
    }

    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('cafes')
        .update({ coordinates: newCoords })
        .eq('id', cafe.id);

      if (updateError) {
        console.error(`Error updating ${cafe.name}:`, updateError);
      } else {
        console.log(`💾 Updated ${cafe.name}\n`);
        updated++;
      }
    }
  }

  console.log(`\n✅ Cafes done: ${updated} updated, ${skipped} skipped`);
}

async function geocodeBakeries() {
  console.log('\n📍 Starting geocoding for bakeries...\n');

  const { data: bakeries, error } = await supabase
    .from('bakeries')
    .select('id, name, addresses, coordinates');

  if (error || !bakeries) {
    console.error('Error fetching bakeries:', error);
    return;
  }

  console.log(`Found ${bakeries.length} bakeries`);

  let updated = 0;
  let skipped = 0;

  for (const bakery of bakeries) {
    if (!bakery.addresses) {
      console.log(`⏭️  Skipping ${bakery.name} - no addresses`);
      skipped++;
      continue;
    }

    const addresses = bakery.addresses as Record<string, string>;
    const currentCoords = (bakery.coordinates || {}) as Record<string, Coordinates>;
    const newCoords: Record<string, Coordinates> = { ...currentCoords };

    let needsUpdate = false;

    for (const [location, address] of Object.entries(addresses)) {
      if (currentCoords[location]) {
        console.log(`✓ ${bakery.name} (${location}) - already has coordinates`);
        continue;
      }

      console.log(`🔍 Geocoding ${bakery.name} (${location}): ${address}`);

      const coords = await geocodeAddress(address, bakery.name, location);

      if (coords) {
        newCoords[location] = coords;
        needsUpdate = true;
        console.log(`  ✓ Found: ${coords.lat}, ${coords.lng}`);
      } else {
        console.log(`  ✗ Not found`);
      }

      await sleep(1000);
    }

    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('bakeries')
        .update({ coordinates: newCoords })
        .eq('id', bakery.id);

      if (updateError) {
        console.error(`Error updating ${bakery.name}:`, updateError);
      } else {
        console.log(`💾 Updated ${bakery.name}\n`);
        updated++;
      }
    }
  }

  console.log(`\n✅ Bakeries done: ${updated} updated, ${skipped} skipped`);
}

// Main execution
async function main() {
  console.log('🚀 Starting geocoding process...\n');
  console.log('Using Photon + Nominatim (OpenStreetMap) - free geocoding services');
  console.log('Trying multiple address formats for better results\n');

  await geocodeRestaurants();
  await geocodeCafes();
  await geocodeBakeries();

  console.log('\n🎉 All done!');
}

main().catch(console.error);
