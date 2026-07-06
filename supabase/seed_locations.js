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

if (!supabaseUrl || !supabaseSecretKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseSecretKey);

// 2. Parse CSV
const csvPath = path.join(__dirname, '../src/data/iso_countries.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n').filter(line => line.trim().length > 0);

// Helper to parse CSV line keeping commas in quotes intact
function parseCSVLine(text) {
  let p = '', c = '', r = [];
  let q = false;
  for (let i = 0; i < text.length; i++) {
    c = text[i];
    if (c === '"') {
      q = !q;
    } else if (c === ',' && !q) {
      r.push(p.trim());
      p = '';
    } else {
      p += c;
    }
  }
  r.push(p.trim());
  return r;
}

const headers = parseCSVLine(lines[0]);
const nameIdx = headers.indexOf('name');
const alpha2Idx = headers.indexOf('alpha-2');
const alpha3Idx = headers.indexOf('alpha-3');
const regionIdx = headers.indexOf('region');
const subRegionIdx = headers.indexOf('sub-region');

const rows = lines.slice(1).map(parseCSVLine);

async function seed() {
  console.log("Starting locations seeding...");

  // Get unique continents (regions)
  const uniqueContinents = [...new Set(rows.map(r => r[regionIdx]).filter(Boolean))];
  console.log(`Found ${uniqueContinents.length} continents:`, uniqueContinents);

  const continentMap = {};
  for (const continent of uniqueContinents) {
    const { data, error } = await supabase
      .from('locations')
      .insert({ name: continent, type: 'continent' })
      .select('id, name')
      .maybeSingle();

    if (error) {
      console.error(`Error inserting continent ${continent}:`, error);
    }

    if (data) {
      continentMap[continent] = data.id;
    } else {
      // If duplicate or not returned, fetch existing ID
      const { data: existing, error: fetchErr } = await supabase
        .from('locations')
        .select('id')
        .eq('name', continent)
        .is('parent_id', null)
        .maybeSingle();

      if (fetchErr) {
        console.error(`Error fetching existing continent ${continent}:`, fetchErr);
      } else if (existing) {
        continentMap[continent] = existing.id;
      }
    }
  }

  // Get unique sub-regions linked to continents
  const subRegions = [];
  const seenSubRegions = new Set();
  for (const r of rows) {
    const subReg = r[subRegionIdx];
    const reg = r[regionIdx];
    if (subReg && reg) {
      const key = `${subReg}||${reg}`;
      if (!seenSubRegions.has(key)) {
        seenSubRegions.add(key);
        subRegions.push({ name: subReg, continent: reg });
      }
    }
  }
  console.log(`Found ${subRegions.length} sub-regions.`);

  const subRegionMap = {};
  for (const subReg of subRegions) {
    const parentId = continentMap[subReg.continent];
    if (!parentId) continue;

    const { data, error } = await supabase
      .from('locations')
      .insert({ name: subReg.name, type: 'sub-region', parent_id: parentId })
      .select('id')
      .maybeSingle();

    if (error) {
      console.error(`Error inserting sub-region ${subReg.name}:`, error);
    }

    if (data) {
      subRegionMap[`${subReg.name}||${subReg.continent}`] = data.id;
    } else {
      const { data: existing, error: fetchErr } = await supabase
        .from('locations')
        .select('id')
        .eq('name', subReg.name)
        .eq('parent_id', parentId)
        .maybeSingle();

      if (fetchErr) {
        console.error(`Error fetching existing sub-region ${subReg.name}:`, fetchErr);
      } else if (existing) {
        subRegionMap[`${subReg.name}||${subReg.continent}`] = existing.id;
      }
    }
  }

  // Insert countries
  console.log(`Inserting countries...`);
  let count = 0;
  for (const r of rows) {
    const countryName = r[nameIdx];
    const alpha2 = r[alpha2Idx];
    const alpha3 = r[alpha3Idx];
    const subReg = r[subRegionIdx];
    const reg = r[regionIdx];

    if (!countryName) continue;

    let parentId = null;
    if (subReg && reg) {
      parentId = subRegionMap[`${subReg}||${reg}`];
    } else if (reg) {
      parentId = continentMap[reg];
    }

    const { error } = await supabase
      .from('locations')
      .insert({
        name: countryName,
        type: 'country',
        parent_id: parentId,
        iso_code: alpha2 || null,
        alpha_3: alpha3 || null
      });

    if (error) {
      // Check if duplicate key violation (23505), ignore if so, else log
      if (error.code !== '23505') {
        console.error(`Error inserting country ${countryName}:`, error);
      }
    } else {
      count++;
    }
  }

  console.log(`Seeding complete. Successfully inserted new records.`);
}

seed().catch(err => console.error("Seeding failed:", err));
