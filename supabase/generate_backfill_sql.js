const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load environment variables manually from .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseSecretKey = getEnvVar('SUPABASE_SECRET_KEY');

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function run() {
  const { data: locations, error } = await supabase
    .from('locations')
    .select('id, name, lat, lng')
    .not('lat', 'is', null);

  if (error) {
    console.error("Error fetching locations:", error);
    process.exit(1);
  }

  let sql = `-- One-time SQL migration to set GPS coordinates for existing locations in production\n\n`;

  locations.forEach((loc) => {
    sql += `UPDATE public.locations SET lat = ${loc.lat}, lng = ${loc.lng} WHERE name = '${loc.name.replace(/'/g, "''")}' AND (lat IS NULL OR lng IS NULL);\n`;
  });

  const targetPath = path.join(__dirname, 'migrations/20260727214000_backfill_location_coords.sql');
  fs.writeFileSync(targetPath, sql);
  console.log(`Generated migration file: ${targetPath} with ${locations.length} updates.`);
}

run();
