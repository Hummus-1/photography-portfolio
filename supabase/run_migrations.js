const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

const projectRefMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
const projectRef = projectRefMatch ? projectRefMatch[1] : 'remote';

async function run() {
  console.log("\n=========================================================");
  console.log("AUTOMATED MIGRATIONS VIA SUPABASE EDGE FUNCTIONS");
  console.log("=========================================================\n");

  // Step 1: Deploy the migration edge function
  console.log(`Deploying migration edge function 'run-migrations' to project [${projectRef}]...`);
  try {
    execSync(`npx supabase functions deploy run-migrations --project-ref "${projectRef}"`, { stdio: 'inherit' });
    console.log("✓ Edge Function 'run-migrations' deployed successfully!");
  } catch (err) {
    console.error("\n✗ Failed to deploy Edge Function.");
    console.log("Please make sure you are logged in to Supabase CLI: npx supabase login");
    console.log("Then run this migration command again.\n");
    process.exit(1);
  }

  // Step 2: Read the SQL migration file
  const migrationFile = path.join(__dirname, 'migrations/20260706203100_locations.sql');
  if (!fs.existsSync(migrationFile)) {
    console.error(`Error: Migration file not found at ${migrationFile}`);
    process.exit(1);
  }
  const sqlContent = fs.readFileSync(migrationFile, 'utf8');

  // Step 3: Trigger the Edge Function over HTTPS (works over IPv4)
  const functionUrl = `${supabaseUrl}/functions/v1/run-migrations`;
  console.log(`\nInvoking migration edge function at ${functionUrl}...`);

  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseSecretKey}`,
        'apikey': supabaseSecretKey
      },
      body: JSON.stringify({ sql: sqlContent })
    });

    const result = await response.json();
    if (!response.ok || result.error) {
      throw new Error(result.error || `HTTP ${response.status}`);
    }

    console.log("✓ Database migrations applied successfully via Edge Function!");
  } catch (err) {
    console.error("\n✗ Failed to apply SQL migration via Edge Function:", err.message);
    process.exit(1);
  }

  // Step 4: Run the seed script
  console.log("\nRunning locations seeding script...");
  try {
    execSync(`node "${path.join(__dirname, 'seed_locations.js')}"`, { stdio: 'inherit' });
    console.log("✓ Seeding complete!");
    console.log("\nHierarchical locations setup is complete and ready to use.");
  } catch (err) {
    console.error("\n✗ Seeding failed:", err.message);
    process.exit(1);
  }
}

run().catch(err => {
  console.error("Migration process failed:", err);
  process.exit(1);
});
