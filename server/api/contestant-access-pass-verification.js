import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const TICKET_ACCESS_KEY =
  process.env.EVENT_TICKETS_ACCESS_KEY ||
  process.env.DASHBOARD_ACCESS_KEY ||
  process.env.PANACHE_DASHBOARD_ACCESS_KEY ||
  "";

const CONTESTANT_BASE_PASS_PROVIDER = "contestant-pass";

const sourceConfigs = {
  cyes: {
    label: "CYES Awards",
    nomineeTable: "cyes_award_nominees",
    categoryTable: "cyes_award_categories",
  },
  "panache-dor": {
    label: "Panache D'or",
    nomineeTable: "panache_dor_award_nominees",
    categoryTable: "panache_dor_award_categories",
  },
  "panache-360": {
    label: "Panache 360",
    nomineeTable: "panache_360_award_nominees",
    categoryTable: "panache_360_award_categories",
  },
  "miss-panache": {
    label: "Miss Panache",
    nomineeTable: "miss_panache_award_nominees",
    categoryTable: "miss_panache_award_categories",
  },
};

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
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

const normalizeText = (value) => {
  const normalized = String(value || "").trim();
  return normalized || null;
};

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getSupabase = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service credentials are not configured.");
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const requireStaffAccess = (req) => {
  const providedKey =
    req.headers["x-dashboard-key"] ||
    req.headers["x-dashboard-access-key"] ||
    req.query?.access_key;

  if (!TICKET_ACCESS_KEY || providedKey !== TICKET_ACCESS_KEY) {
    throw createHttpError("Invalid staff access key.", 401);
  }
};

const loadTicket = async (supabase, ticketCode, token) => {
  let query = supabase
    .from("event_tickets")
    .select(
      "id, ticket_code, qr_token, buyer_name, buyer_email, buyer_whatsapp, order:event_ticket_orders(provider, provider_payload, status)"
    )
    .eq("ticket_code", ticketCode);

  if (token) {
    query = query.eq("qr_token", token);
  }

  const { data, error } = await query.single();
  if (error || !data) {
    throw createHttpError("Ticket not found.", 404);
  }

  return data;
};

const loadContestantProfile = async (supabase, source, contestantId) => {
  const config = sourceConfigs[source];
  if (!config || !contestantId) {
    return null;
  }

  const { data: nominee, error } = await supabase
    .from(config.nomineeTable)
    .select("id, category_id, slug, name, organization, bio, photo_url, status")
    .eq("id", contestantId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!nominee) {
    return null;
  }

  let category = null;
  if (nominee.category_id) {
    const { data: categoryData, error: categoryError } = await supabase
      .from(config.categoryTable)
      .select("id, slug, name")
      .eq("id", nominee.category_id)
      .maybeSingle();

    if (categoryError) {
      throw categoryError;
    }
    category = categoryData || null;
  }

  return {
    source,
    source_label: config.label,
    id: nominee.id,
    slug: nominee.slug,
    name: nominee.name,
    organization: nominee.organization || null,
    bio: nominee.bio || null,
    photo_url: nominee.photo_url || null,
    status: nominee.status,
    category_name: category?.name || null,
    category_slug: category?.slug || null,
  };
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { message: "Method not allowed." });
    return;
  }

  try {
    requireStaffAccess(req);
    const body = parseBody(req);
    const ticketCode = normalizeText(body.ticketCode || body.ticket_code);
    const token = normalizeText(body.token);

    if (!ticketCode) {
      throw createHttpError("Ticket code is required.");
    }

    const supabase = getSupabase();
    const ticket = await loadTicket(supabase, ticketCode, token);
    const basePass = ticket.order?.provider_payload?.contestant_base_pass || null;
    const isContestantAccessPass = Boolean(
      ticket.order?.provider === CONTESTANT_BASE_PASS_PROVIDER && basePass
    );

    if (!isContestantAccessPass) {
      sendJson(res, 200, {
        is_contestant_access_pass: false,
        contestant: null,
      });
      return;
    }

    const contestant = await loadContestantProfile(
      supabase,
      normalizeText(basePass.source),
      normalizeText(basePass.contestant_id)
    );

    sendJson(res, 200, {
      is_contestant_access_pass: true,
      contestant: contestant || {
        source: normalizeText(basePass.source),
        source_label: normalizeText(basePass.source_label),
        id: normalizeText(basePass.contestant_id),
        slug: normalizeText(basePass.contestant_slug),
        name: normalizeText(basePass.contestant_name) || ticket.buyer_name,
        organization: null,
        bio: null,
        photo_url: null,
        status: null,
        category_name: normalizeText(basePass.category_name),
        category_slug: normalizeText(basePass.category_slug),
      },
    });
  } catch (error) {
    console.error("Contestant access pass verification error", error);
    sendJson(res, error.statusCode || 500, {
      message:
        error.statusCode && error.statusCode < 500
          ? error.message
          : "Could not load contestant verification details.",
    });
  }
}
