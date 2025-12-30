// API endpoint for config (JSON) - for Supabase credentials
export default function handler(req, res) {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || process.env.supabase_url,
    supabaseKey: process.env.SUPABASE_ANON_KEY || process.env.supabase_key,
  });
}
