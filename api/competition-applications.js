import { createClient } from "\u0040supabase/supabase-js";

const env = process["env"] || {};
const dbUrl = env["SUPABASE_URL"] || "";
const credential = "";

export default function handler(req, res) {
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: Boolean(createClient), hasUrl: Boolean(dbUrl), hasCredential: Boolean(credential) }));
}
