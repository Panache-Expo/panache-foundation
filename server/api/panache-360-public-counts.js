import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SETTINGS_ID = "vote-counts";

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
};

const getSupabase = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service credentials are not configured.");
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
    },
  });
};

const readVisibility = async (supabase) => {
  const { data, error } = await supabase
    .from("panache_360_public_settings")
    .select("vote_counts_visible, updated_at")
    .eq("id", SETTINGS_ID)
    .maybeSingle();

  if (error) {
    if (
      error.code === "42P01" ||
      error.code === "PGRST205" ||
      /does not exist|could not find/i.test(error.message || "")
    ) {
      return { visible: false, updated_at: null };
    }

    throw error;
  }

  return {
    visible: Boolean(data?.vote_counts_visible),
    updated_at: data?.updated_at || null,
  };
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { message: "Method not allowed." });
    return;
  }

  try {
    const supabase = getSupabase();
    const visibility = await readVisibility(supabase);
    let counts = [];

    if (visibility.visible) {
      const { data, error } = await supabase
        .from("panache_360_nominee_vote_counts")
        .select("nominee_id, total_votes")
        .order("total_votes", { ascending: false });

      if (error) {
        throw error;
      }

      counts = (data || []).map((row) => ({
        nominee_id: row.nominee_id,
        total_votes: Number(row.total_votes || 0),
      }));
    }

    res.setHeader("Cache-Control", "public, s-maxage=5, stale-while-revalidate=10");
    sendJson(res, 200, {
      ...visibility,
      counts,
    });
  } catch (error) {
    console.error("Panache 360 public count visibility error", error);
    sendJson(res, 500, {
      message: "Could not load Panache 360 vote count visibility.",
    });
  }
}
