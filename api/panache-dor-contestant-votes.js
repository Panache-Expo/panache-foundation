import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
};

const normalizeText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value).trim();
};

const parseBody = (req) => {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
};

const getSupabase = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    const error = new Error("Vote-count access is not configured yet.");
    error.statusCode = 503;
    throw error;
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
    },
  });
};

const verifyContestantPassword = async (supabase, body) => {
  const slug = normalizeText(body.slug || body.nomineeSlug || body.nominee_slug);
  const password = normalizeText(body.password || body.accessCode || body.access_code);

  if (!slug) {
    const error = new Error("Nominee link is missing.");
    error.statusCode = 400;
    throw error;
  }

  if (!password) {
    const error = new Error("Enter your private password.");
    error.statusCode = 400;
    throw error;
  }

  const { data, error } = await supabase.rpc(
    "verify_panache_dor_contestant_password",
    {
      p_slug: slug,
      p_password: password,
    }
  );

  if (error) {
    throw error;
  }

  const contestant = Array.isArray(data) ? data[0] : null;

  if (!contestant) {
    const invalid = new Error("Invalid nominee password.");
    invalid.statusCode = 401;
    throw invalid;
  }

  return {
    contestant: {
      id: contestant.id,
      slug: contestant.slug,
      name: contestant.name,
      organization: contestant.organization,
      bio: contestant.bio,
      photo_url: contestant.photo_url,
      category_name: contestant.category_name,
      category_slug: contestant.category_slug,
      total_votes: contestant.total_votes || 0,
      verified_at: contestant.verified_at,
    },
  };
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      sendJson(res, 405, { message: "Method not allowed." });
      return;
    }

    const supabase = getSupabase();
    const body = parseBody(req);
    const result = await verifyContestantPassword(supabase, body);

    sendJson(res, 200, result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    console.error("Panache Dor nominee vote-count API error", {
      message: error.message,
      details: error.details || error.stack,
      hint: error.hint || "",
      code: error.code || "",
    });
    sendJson(res, statusCode, {
      message: error.message || "Could not load nominee vote count.",
      details: error.details || "",
      hint: error.hint || "",
      code: error.code || "",
    });
  }
}
