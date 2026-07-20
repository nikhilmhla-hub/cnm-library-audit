const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const envPath = path.join(__dirname, '../.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.substring(1, val.length - 1);
      env[key] = val;
    }
  });
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

async function verify() {
  console.log("Querying Supabase for verification of source standardization...");
  
  const { data, error } = await supabase
    .from('leads')
    .select('id, name, phone, source, queue_number, created_at')
    .eq('phone', '9824681357')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error querying Supabase:", error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log("No record found with phone 9824681357.");
    process.exit(1);
  }

  const record = data[0];
  console.log("\n=================================");
  console.log("SUPABASE LEAD RECORD VERIFICATION");
  console.log("=================================");
  console.log("ID:", record.id);
  console.log("Name:", record.name);
  console.log("Phone:", record.phone);
  console.log("Source:", record.source);
  console.log("Queue Number:", record.queue_number);
  console.log("Created At:", record.created_at);
  console.log("=================================\n");
  
  if (record.source === "Kiosk") {
    console.log("\x1b[32mVERIFICATION PASSED: Source is successfully set to 'Kiosk' in database.\x1b[0m");
  } else {
    console.log("\x1b[31mVERIFICATION FAILED: Source is '" + record.source + "', expected 'Kiosk'\x1b[0m");
  }
}

verify();
