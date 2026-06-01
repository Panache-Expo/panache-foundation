import { createClient } from "\u0040supabase/supabase-js";

const SUPABASE_URL = "";
const SUPABASE_KEY = "";

export default function handler(req, res) {
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: Boolean(createClient), hasUrl: Boolean(SUPABASE_URL), hasKey: Boolean(SUPABASE_KEY) }));
}
