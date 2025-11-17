const fs = require('fs');
const path = require('path');

function parseEnv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    env[key] = val;
  }
  return env;
}

(async () => {
  try {
    const repoRoot = path.resolve(__dirname, '..');
    const envPath = path.join(repoRoot, '.env');
    if (!fs.existsSync(envPath)) {
      console.error('.env not found at', envPath);
      process.exit(2);
    }
    const env = parseEnv(envPath);
    const url = env.VITE_SUPABASE_URL;
    const key = env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) {
      console.error('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing in .env');
      process.exit(3);
    }

    console.log('Testing Supabase connection to', url);

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(url, key, {
      auth: { persistSession: false }
    });

    // try a simple RPC or select from product_2v
    const table = 'product_2v';
    console.log('Querying table', table, 'limit 1');
    const { data, error, status } = await supabase.from(table).select('*').limit(1);

    console.log('status:', status);
    if (error) {
      console.error('Supabase error:', error);
      process.exit(4);
    }
    console.log('data:', data);
    console.log('Connection test succeeded');
  } catch (err) {
    console.error('Exception:', err);
    process.exit(1);
  }
})();
