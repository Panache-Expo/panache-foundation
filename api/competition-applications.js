import { createClient } from "\u0040supabase/supabase-js";

export default function handler(req, res) {
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true, hasClient: Boolean(createClient) }));
}
