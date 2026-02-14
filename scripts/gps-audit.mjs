import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const SUPABASE_URL = 'https://kkqrumygyxuefrwbpyiy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrcXJ1bXlneXh1ZWZyd2JweWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTY5MjQsImV4cCI6MjA3ODA5MjkyNH0.FpbEeNkp_LqQSJlymXzFBSfWFzVvkLiRlbOVz-70gW8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Calculate distance between two GPS coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Geocode address using Nominatim
async function geocodeAddress(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GastroTips/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }

    return null;
  } catch (error) {
    console.error(`Error geocoding address "${address}":`, error.message);
    return null;
  }
}

// Delay function to respect rate limits
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Extract GPS coordinates from coordinates field
function extractGPS(coordinates) {
  if (!coordinates || typeof coordinates !== 'object') return [];

  const results = [];

  // Iterate through all location keys (e.g., "Anděl", "Letná")
  for (const [locationName, coords] of Object.entries(coordinates)) {
    if (coords && typeof coords === 'object') {
      // Handle both lat/lng and lat/lon formats
      if (coords.lat && (coords.lng || coords.lon)) {
        results.push({
          locationName,
          lat: coords.lat,
          lon: coords.lng || coords.lon
        });
      }
    }
  }

  return results;
}

// Fetch all places from a table
async function fetchPlaces(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error(`Error fetching ${tableName}:`, error.message);
    return [];
  }
}

// Audit a single place location
async function auditPlaceLocation(place, tableName, locationName, coords, address) {
  const result = {
    name: place.name,
    table: tableName,
    id: place.id,
    locationName: locationName,
    currentLocation: place.location,
    currentGPS: coords,
    expectedGPS: null,
    distance: null,
    status: 'OK',
    issues: [],
    address: address
  };

  if (!address || typeof address !== 'string' || !address.trim()) {
    result.status = 'NO_ADDRESS';
    result.issues.push(`No address for location "${locationName}"`);
    return result;
  }

  console.log(`  Geocoding: ${address.substring(0, 60)}...`);

  const geocoded = await geocodeAddress(address);
  await delay(1000); // Respect rate limit

  if (!geocoded) {
    result.status = 'GEOCODE_FAILED';
    result.issues.push('Failed to geocode address');
    return result;
  }

  result.expectedGPS = geocoded;

  // Calculate distance
  const distance = calculateDistance(
    coords.lat,
    coords.lon,
    geocoded.lat,
    geocoded.lon
  );

  result.distance = Math.round(distance);

  // Categorize the issue
  if (distance > 2000) {
    result.status = 'CRITICAL';
    result.issues.push(`GPS coordinates differ by ${result.distance}m (>2km)`);
  } else if (distance > 500) {
    result.status = 'MAJOR';
    result.issues.push(`GPS coordinates differ by ${result.distance}m (500m-2km)`);
  } else if (distance > 100) {
    result.status = 'MINOR';
    result.issues.push(`GPS coordinates differ by ${result.distance}m (100m-500m)`);
  } else {
    result.status = 'OK';
    result.issues.push(`GPS coordinates accurate within ${result.distance}m`);
  }

  return result;
}

// Audit a single place (which may have multiple locations)
async function auditPlace(place, tableName) {
  const results = [];

  // Extract all GPS coordinates from the coordinates field
  const gpsLocations = extractGPS(place.coordinates);

  if (gpsLocations.length === 0) {
    results.push({
      name: place.name,
      table: tableName,
      id: place.id,
      currentLocation: place.location,
      locationName: null,
      currentGPS: null,
      expectedGPS: null,
      distance: null,
      status: 'NO_GPS',
      issues: ['No GPS coordinates found in coordinates field'],
      address: null
    });
    return results;
  }

  // Check if there's an addresses field
  if (!place.addresses || typeof place.addresses !== 'object') {
    for (const gps of gpsLocations) {
      results.push({
        name: place.name,
        table: tableName,
        id: place.id,
        currentLocation: place.location,
        locationName: gps.locationName,
        currentGPS: gps,
        expectedGPS: null,
        distance: null,
        status: 'NO_ADDRESS',
        issues: ['No addresses field found for verification'],
        address: null
      });
    }
    return results;
  }

  // Audit each location
  for (const gps of gpsLocations) {
    const address = place.addresses[gps.locationName];
    const result = await auditPlaceLocation(place, tableName, gps.locationName, gps, address);
    results.push(result);
  }

  return results;
}

// Main audit function
async function performAudit() {
  console.log('='.repeat(80));
  console.log('GPS AUDIT REPORT - GASTRO TIPS DATABASE');
  console.log('='.repeat(80));
  console.log(`Date: ${new Date().toISOString()}`);
  console.log('');

  const tables = ['restaurants', 'cafes', 'bakeries'];
  const allResults = {
    CRITICAL: [],
    MAJOR: [],
    MINOR: [],
    NO_GPS: [],
    NO_ADDRESS: [],
    GEOCODE_FAILED: [],
    OK: []
  };

  let totalPlaces = 0;
  let totalLocations = 0;
  let processedPlaces = 0;

  for (const tableName of tables) {
    console.log(`\nFetching ${tableName}...`);
    const places = await fetchPlaces(tableName);
    console.log(`Found ${places.length} ${tableName}`);
    totalPlaces += places.length;

    for (const place of places) {
      processedPlaces++;
      console.log(`\n[${processedPlaces}/${totalPlaces}] Auditing ${tableName}: ${place.name || place.id}`);

      const results = await auditPlace(place, tableName);

      // Each place can have multiple locations
      for (const result of results) {
        totalLocations++;
        allResults[result.status].push(result);
      }
    }
  }

  // Generate report
  console.log('\n\n');
  console.log('='.repeat(80));
  console.log('AUDIT SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total places audited: ${totalPlaces}`);
  console.log(`Total locations audited: ${totalLocations}`);
  console.log('');
  console.log(`CRITICAL issues (>2km):       ${allResults.CRITICAL.length}`);
  console.log(`MAJOR issues (500m-2km):      ${allResults.MAJOR.length}`);
  console.log(`MINOR issues (100m-500m):     ${allResults.MINOR.length}`);
  console.log(`OK (<100m):                   ${allResults.OK.length}`);
  console.log(`No GPS coordinates:           ${allResults.NO_GPS.length}`);
  console.log(`No address data:              ${allResults.NO_ADDRESS.length}`);
  console.log(`Geocoding failed:             ${allResults.GEOCODE_FAILED.length}`);
  console.log('');

  // Detailed reports
  if (allResults.CRITICAL.length > 0) {
    console.log('\n');
    console.log('='.repeat(80));
    console.log('CRITICAL ISSUES (>2km difference)');
    console.log('='.repeat(80));

    for (const item of allResults.CRITICAL) {
      console.log(`\nName: ${item.name}`);
      console.log(`Table: ${item.table}`);
      console.log(`ID: ${item.id}`);
      console.log(`Location: ${item.locationName}`);
      console.log(`Address: ${item.address}`);
      console.log(`Current GPS: ${item.currentGPS.lat}, ${item.currentGPS.lon}`);
      console.log(`Expected GPS: ${item.expectedGPS.lat}, ${item.expectedGPS.lon}`);
      console.log(`Distance: ${item.distance}m`);
      console.log(`Geocoded address: ${item.expectedGPS.display_name}`);
      console.log(`Issues: ${item.issues.join(', ')}`);
    }
  }

  if (allResults.MAJOR.length > 0) {
    console.log('\n');
    console.log('='.repeat(80));
    console.log('MAJOR ISSUES (500m-2km difference)');
    console.log('='.repeat(80));

    for (const item of allResults.MAJOR) {
      console.log(`\nName: ${item.name}`);
      console.log(`Table: ${item.table}`);
      console.log(`ID: ${item.id}`);
      console.log(`Location: ${item.locationName}`);
      console.log(`Address: ${item.address}`);
      console.log(`Current GPS: ${item.currentGPS.lat}, ${item.currentGPS.lon}`);
      console.log(`Expected GPS: ${item.expectedGPS.lat}, ${item.expectedGPS.lon}`);
      console.log(`Distance: ${item.distance}m`);
      console.log(`Geocoded address: ${item.expectedGPS.display_name}`);
      console.log(`Issues: ${item.issues.join(', ')}`);
    }
  }

  if (allResults.MINOR.length > 0) {
    console.log('\n');
    console.log('='.repeat(80));
    console.log('MINOR ISSUES (100m-500m difference)');
    console.log('='.repeat(80));

    for (const item of allResults.MINOR) {
      console.log(`\nName: ${item.name}`);
      console.log(`Table: ${item.table}`);
      console.log(`ID: ${item.id}`);
      console.log(`Location: ${item.locationName}`);
      console.log(`Address: ${item.address}`);
      console.log(`Current GPS: ${item.currentGPS.lat}, ${item.currentGPS.lon}`);
      console.log(`Expected GPS: ${item.expectedGPS.lat}, ${item.expectedGPS.lon}`);
      console.log(`Distance: ${item.distance}m`);
      console.log(`Geocoded address: ${item.expectedGPS.display_name}`);
    }
  }

  if (allResults.NO_GPS.length > 0) {
    console.log('\n');
    console.log('='.repeat(80));
    console.log('PLACES WITHOUT GPS COORDINATES');
    console.log('='.repeat(80));

    for (const item of allResults.NO_GPS) {
      console.log(`\nName: ${item.name}`);
      console.log(`Table: ${item.table}`);
      console.log(`ID: ${item.id}`);
      console.log(`Location field: ${JSON.stringify(item.currentLocation)}`);
    }
  }

  if (allResults.NO_ADDRESS.length > 0) {
    console.log('\n');
    console.log('='.repeat(80));
    console.log('LOCATIONS WITHOUT ADDRESS DATA (cannot verify)');
    console.log('='.repeat(80));

    for (const item of allResults.NO_ADDRESS) {
      console.log(`\nName: ${item.name}`);
      console.log(`Table: ${item.table}`);
      console.log(`ID: ${item.id}`);
      console.log(`Location: ${item.locationName}`);
      console.log(`Current GPS: ${item.currentGPS.lat}, ${item.currentGPS.lon}`);
    }
  }

  if (allResults.GEOCODE_FAILED.length > 0) {
    console.log('\n');
    console.log('='.repeat(80));
    console.log('LOCATIONS WHERE GEOCODING FAILED');
    console.log('='.repeat(80));

    for (const item of allResults.GEOCODE_FAILED) {
      console.log(`\nName: ${item.name}`);
      console.log(`Table: ${item.table}`);
      console.log(`ID: ${item.id}`);
      console.log(`Location: ${item.locationName}`);
      console.log(`Address: ${item.address}`);
      console.log(`Current GPS: ${item.currentGPS.lat}, ${item.currentGPS.lon}`);
    }
  }

  // Save detailed JSON report
  const reportPath = '/Users/martin.nosek/claude-projects/gastro-tips/gps-audit-report.json';
  const fs = await import('fs/promises');
  await fs.writeFile(reportPath, JSON.stringify(allResults, null, 2));
  console.log('\n');
  console.log('='.repeat(80));
  console.log(`Detailed JSON report saved to: ${reportPath}`);
  console.log('='.repeat(80));
}

// Run the audit
performAudit().catch(console.error);
