const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load environment variables manually from .env.local
const envPath = path.join(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local file not found.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseSecretKey = getEnvVar('SUPABASE_SECRET_KEY');

if (!supabaseUrl || !supabaseSecretKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY is missing in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

// OpenStreetMap Nominatim geocoder helper with delay
async function geocode(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "PhotographyPortfolioApp/1.0 (daniel-garcia-portfolio)",
        "Accept-Language": "en,es",
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;

    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);

    if (isNaN(lat) || isNaN(lng)) return null;

    return {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      displayName: data[0].display_name,
    };
  } catch (err) {
    console.error(`Geocoding failed for "${query}":`, err.message);
    return null;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("\n=========================================================");
  console.log("BACKFILLING LOCATION GPS COORDINATES (INCLUDING COUNTRIES)");
  console.log("=========================================================\n");

  // 1. Fetch all locations
  const { data: allLocations, error } = await supabase
    .from('locations')
    .select('id, name, type, parent_id, lat, lng');

  if (error) {
    console.error("Failed to fetch locations from Supabase:", error.message);
    process.exit(1);
  }

  console.log(`Fetched ${allLocations.length} total location nodes from database.`);

  // Filter out only continents. Include countries, islands, cities, spots, regions.
  const pendingLocations = allLocations.filter((loc) => {
    const isExcludedType = ['continent'].includes(loc.type.toLowerCase());
    return !isExcludedType && (loc.lat == null || loc.lng == null);
  });

  console.log(`Found ${pendingLocations.length} locations (including countries) needing GPS coordinate backfill.\n`);

  if (pendingLocations.length === 0) {
    console.log("✓ All eligible country/region/spot/city/island locations already have GPS coordinates!");
    return;
  }

  // Helper to compute full path context (e.g., "Spain" or "Anaga, Tenerife, Spain")
  function buildPathContext(loc) {
    if (loc.type === 'country') return loc.name;
    const parts = [loc.name];
    let currentId = loc.parent_id;
    while (currentId) {
      const parent = allLocations.find((l) => l.id === currentId);
      if (parent) {
        if (!['continent', 'sub-region'].includes(parent.type.toLowerCase())) {
          parts.push(parent.name);
        }
        currentId = parent.parent_id;
      } else {
        break;
      }
    }
    return parts.join(', ');
  }

  let updatedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < pendingLocations.length; i++) {
    const loc = pendingLocations[i];
    const pathQuery = buildPathContext(loc);

    console.log(`[${i + 1}/${pendingLocations.length}] Geocoding [${loc.type.toUpperCase()}] "${loc.name}" (Query: "${pathQuery}")...`);

    let geoResult = await geocode(pathQuery);
    
    // Fallback: try searching only by primary name if path query returned no hits
    if (!geoResult && loc.name !== pathQuery) {
      console.log(`  └─ Retrying with primary name "${loc.name}"...`);
      geoResult = await geocode(loc.name);
    }

    if (geoResult) {
      const { error: updateErr } = await supabase
        .from('locations')
        .update({
          lat: geoResult.lat,
          lng: geoResult.lng,
        })
        .eq('id', loc.id);

      if (updateErr) {
        console.error(`  ✗ Failed to update DB for "${loc.name}":`, updateErr.message);
        skippedCount++;
      } else {
        console.log(`  ✓ Updated GPS: (${geoResult.lat}°, ${geoResult.lng}°) [${geoResult.displayName}]`);
        updatedCount++;
      }
    } else {
      console.log(`  ⚠ Could not resolve GPS coordinates for "${loc.name}".`);
      skippedCount++;
    }

    // Rate-limiting pause to respect OpenStreetMap usage terms
    await sleep(1000);
  }

  console.log("\n=========================================================");
  console.log(`✓ BACKFILL COMPLETE! Updated: ${updatedCount} | Skipped/Failed: ${skippedCount}`);
  console.log("=========================================================\n");
}

run().catch(err => {
  console.error("Backfill execution error:", err);
  process.exit(1);
});
