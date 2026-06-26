import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const DASHBOARD_ACCESS_KEY =
  process.env.DASHBOARD_ACCESS_KEY || process.env.PANACHE_DASHBOARD_ACCESS_KEY || "";
const SITE_BASE_URL = (
  process.env.CYES_BASE_URL ||
  process.env.PANACHE_FRONTEND_BASE_URL ||
  process.env.EVENT_TICKETS_BASE_URL ||
  "https://panache-foundation.org"
).replace(/\/+$/, "");
const CYES_RESULTS_PUBLISH_AT =
  process.env.CYES_RESULTS_PUBLISH_AT || "2026-07-09T00:00:00+01:00";
const CYES_RESULTS_PUBLISH_LABEL =
  process.env.CYES_RESULTS_PUBLISH_LABEL || "9 July 2026";

const NOMINEE_COLUMNS =
  "id, slug, name, organization, bio, photo_url, status, contestant_password_hash, category:cyes_award_categories(name, slug, status)";

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
};

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeText = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const parseBody = (req) => {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
};

const getDashboardKey = (req, body = {}) =>
  normalizeText(
    req.headers["x-dashboard-key"] ||
      req.headers["x-dashboard-access-key"] ||
      body.accessKey ||
      body.access_key
  );

const assertAdmin = (req, body = {}) => {
  if (!DASHBOARD_ACCESS_KEY || getDashboardKey(req, body) !== DASHBOARD_ACCESS_KEY) {
    throw createHttpError("Invalid dashboard access code.", 401);
  }
};

const isAdminRequest = (req, body = {}) =>
  Boolean(DASHBOARD_ACCESS_KEY && getDashboardKey(req, body) === DASHBOARD_ACCESS_KEY);

const isCyesBlindVotingActive = (now = Date.now()) => {
  const timestamp = Date.parse(CYES_RESULTS_PUBLISH_AT);
  return Number.isFinite(timestamp) && now < timestamp;
};

const getCyesRevealMetadata = ({ admin = false } = {}) => {
  const blindVoting = !admin && isCyesBlindVotingActive();
  return {
    blind_voting: blindVoting,
    counts_available: !blindVoting,
    results_publish_at: CYES_RESULTS_PUBLISH_AT,
    results_publish_label: CYES_RESULTS_PUBLISH_LABEL,
  };
};

const getSupabase = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw createHttpError("CYES vote-count access is not configured yet.", 503);
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        "x-client-info": "cyes-contestant-votes-api",
      },
    },
  });
};

const generatePrivatePassword = () =>
  `CYES-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

const buildAccessPassUrl = (slug) =>
  `${SITE_BASE_URL}/cyes/nominees/${encodeURIComponent(slug)}/access-pass`;

const serializeContestant = (contestant, slugFallback = "", { countsAvailable = true } = {}) => ({
  id: contestant.id,
  slug: contestant.slug || slugFallback,
  name: contestant.name,
  organization: contestant.organization || null,
  bio: contestant.bio || null,
  photo_url: contestant.photo_url || null,
  category_name: contestant.category_name || contestant.category?.name || null,
  category_slug: contestant.category_slug || contestant.category?.slug || null,
  total_votes: countsAvailable ? contestant.total_votes || 0 : 0,
  verified_at: contestant.verified_at || new Date().toISOString(),
});

const verifyContestantPassword = async (supabase, body, req) => {
  const slug = normalizeText(body.slug || body.contestantSlug || body.contestant_slug);
  const password = normalizeText(body.password || body.accessCode || body.access_code);

  if (!slug) throw createHttpError("Contestant link is missing.", 400);
  if (!password) throw createHttpError("Enter your private password.", 400);

  const { data, error } = await supabase.rpc(
    "public_verify_cyes_contestant_password",
    {
      p_slug: slug,
      p_password: password,
    }
  );

  if (error) throw error;

  const contestant = Array.isArray(data) ? data[0] : data;
  if (!contestant?.id) {
    throw createHttpError("Invalid contestant password.", 401);
  }

  const revealMetadata = getCyesRevealMetadata({ admin: isAdminRequest(req, body) });

  return {
    contestant: serializeContestant(contestant, slug, {
      countsAvailable: revealMetadata.counts_available,
    }),
    ...revealMetadata,
  };
};

const loadNomineeForPasswordAction = async (supabase, body) => {
  const id = normalizeText(body.id || body.nomineeId || body.nominee_id);
  const slug = normalizeText(body.slug || body.contestantSlug || body.contestant_slug);

  if (!id && !slug) {
    throw createHttpError("Nominee id or slug is required.", 400);
  }

  let query = supabase
    .from("cyes_award_nominees")
    .select(NOMINEE_COLUMNS)
    .limit(1);

  query = id ? query.eq("id", id) : query.eq("slug", slug);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (!data) throw createHttpError("CYES nominee not found.", 404);
  return data;
};

const setNomineePassword = async (supabase, nomineeId, password) => {
  const { error } = await supabase.rpc("set_cyes_contestant_password", {
    p_nominee_id: nomineeId,
    p_password: password,
  });

  if (error) throw error;
};

const resetPassword = async (supabase, body) => {
  const nominee = await loadNomineeForPasswordAction(supabase, body);
  const password = normalizeText(body.password) || generatePrivatePassword();
  await setNomineePassword(supabase, nominee.id, password);

  return {
    nominee: {
      id: nominee.id,
      slug: nominee.slug,
      name: nominee.name,
      organization: nominee.organization || null,
      category_name: nominee.category?.name || null,
      category_slug: nominee.category?.slug || null,
      access_pass_url: buildAccessPassUrl(nominee.slug),
      password,
    },
  };
};

const generateMissingPasswords = async (supabase, body) => {
  const includeExisting = Boolean(body.includeExisting || body.include_existing);

  const { data, error } = await supabase
    .from("cyes_award_nominees")
    .select(NOMINEE_COLUMNS)
    .eq("status", "active")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  const nominees = (data || []).filter(
    (nominee) => includeExisting || !nominee.contestant_password_hash
  );
  const generated = [];

  for (const nominee of nominees) {
    const password = generatePrivatePassword();
    await setNomineePassword(supabase, nominee.id, password);
    generated.push({
      id: nominee.id,
      slug: nominee.slug,
      name: nominee.name,
      organization: nominee.organization || null,
      category_name: nominee.category?.name || null,
      category_slug: nominee.category?.slug || null,
      access_pass_url: buildAccessPassUrl(nominee.slug),
      password,
    });
  }

  return {
    generated_count: generated.length,
    generated,
  };
};

const listAccessLinks = async (supabase) => {
  const { data, error } = await supabase
    .from("cyes_award_nominees")
    .select(NOMINEE_COLUMNS)
    .eq("status", "active")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  return {
    nominees: (data || []).map((nominee) => ({
      id: nominee.id,
      slug: nominee.slug,
      name: nominee.name,
      organization: nominee.organization || null,
      category_name: nominee.category?.name || null,
      category_slug: nominee.category?.slug || null,
      access_pass_url: buildAccessPassUrl(nominee.slug),
      password_configured: Boolean(nominee.contestant_password_hash),
    })),
  };
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      sendJson(res, 405, { message: "Method not allowed." });
      return;
    }

    const supabase = getSupabase();
    const body = parseBody(req);
    const action = normalizeText(body.action || "verifyContestantPassword");

    if (action === "verifyContestantPassword") {
      sendJson(res, 200, await verifyContestantPassword(supabase, body, req));
      return;
    }

    if (action === "resetPassword") {
      assertAdmin(req, body);
      sendJson(res, 200, await resetPassword(supabase, body));
      return;
    }

    if (action === "generateMissingPasswords") {
      assertAdmin(req, body);
      sendJson(res, 200, await generateMissingPasswords(supabase, body));
      return;
    }

    if (action === "listAccessLinks") {
      assertAdmin(req, body);
      sendJson(res, 200, await listAccessLinks(supabase));
      return;
    }

    throw createHttpError("Unknown CYES contestant vote-count action.", 400);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    console.error("CYES contestant vote-count API error", {
      message: error.message,
      details: error.details || "",
      hint: error.hint || "",
      code: error.code || "",
    });
    sendJson(res, statusCode, {
      message: error.message || "Could not load CYES contestant vote count.",
      details: error.details || "",
      hint: error.hint || "",
      code: error.code || "",
    });
  }
}
