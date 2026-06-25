import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const DASHBOARD_ACCESS_KEY = process.env.DASHBOARD_ACCESS_KEY || "";
const CYES_AGENT_KEY =
  process.env.CYES_VOTING_AGENT_KEY ||
  process.env.PANACHE_CYES_VOTING_AGENT_KEY ||
  process.env.CYES_ACCESS_PASS_AGENT_KEY ||
  "";
const SITE_BASE_URL =
  process.env.PANACHE_SITE_URL ||
  process.env.VITE_SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` ||
  "https://panache-foundation.org";

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
};

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

const normalizeText = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const createAdminClient = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-client-info": "panache-cyes-access-pass-agent" } },
  });
};

const getAgentKeyFromRequest = (req) =>
  req.headers["x-cyes-agent-key"] ||
  req.headers["X-CYES-Agent-Key"] ||
  req.headers["x-dashboard-key"] ||
  req.headers["x-dashboard-access-key"];

const isAuthorizedAgentRequest = (req) => {
  const supplied = getAgentKeyFromRequest(req);
  return Boolean(
    (CYES_AGENT_KEY && supplied === CYES_AGENT_KEY) ||
      (DASHBOARD_ACCESS_KEY && supplied === DASHBOARD_ACCESS_KEY)
  );
};

const accessLinkForSlug = (slug) =>
  `${SITE_BASE_URL.replace(/\/$/, "")}/cyes/nominees/${slug}/access-pass`;

const generateAccessCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let token = "";
  for (let index = 0; index < 10; index += 1) {
    token += alphabet[crypto.randomInt(0, alphabet.length)];
  }
  return `CYES-${token.slice(0, 5)}-${token.slice(5)}`;
};

const serializeNominee = (row) => {
  const categoryName = row.category?.name || row.category_name || "";
  const categorySlug = row.category?.slug || row.category_slug || "";
  return {
    id: row.id,
    name: row.name,
    organization: row.organization || null,
    slug: row.slug,
    status: row.status,
    category: { name: categoryName, slug: categorySlug },
    category_name: categoryName,
    category_slug: categorySlug,
    access_link: accessLinkForSlug(row.slug),
  };
};

const listNominees = async (supabase) => {
  const { data, error } = await supabase
    .from("cyes_award_nominees")
    .select("id,name,organization,slug,status,category:cyes_award_categories(name,slug,status)")
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) throw error;

  const nominees = (data || [])
    .filter((row) => !row.category || row.category.status === "active")
    .map(serializeNominee);

  return nominees;
};

const issueAccessCode = async (supabase, body) => {
  const nomineeId = normalizeText(body.nominee_id || body.nomineeId || body.id);
  if (!nomineeId) {
    return { statusCode: 400, payload: { message: "Nominee id is required." } };
  }

  const accessCode = normalizeText(body.access_code || body.accessCode) || generateAccessCode();
  const { data, error } = await supabase.rpc("admin_issue_cyes_access_code", {
    p_nominee_id: nomineeId,
    p_access_code: accessCode,
  });

  if (error) throw error;

  const nominee = Array.isArray(data) ? data[0] : data;
  if (!nominee?.id) {
    return { statusCode: 404, payload: { message: "Active CYES nominee not found." } };
  }

  const serialized = serializeNominee({
    ...nominee,
    category_name: nominee.category_name,
    category_slug: nominee.category_slug,
  });

  return {
    statusCode: 200,
    payload: {
      status: "ok",
      participant: serialized,
      access_link: serialized.access_link,
      access_code: accessCode,
      message: "Access code issued.",
    },
  };
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-cyes-agent-key, x-dashboard-key, x-dashboard-access-key");

  if (req.method === "OPTIONS") {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { message: "Use POST." });
  }

  if (!isAuthorizedAgentRequest(req)) {
    return sendJson(res, 401, { message: "Invalid CYES agent key." });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return sendJson(res, 500, { message: "CYES access-pass API is not configured on the Panache server." });
  }

  try {
    const body = parseBody(req);
    const action = normalizeText(body.action);

    if (action === "listAccessPassNominees") {
      const nominees = await listNominees(supabase);
      return sendJson(res, 200, {
        status: "ok",
        nominees,
        count: nominees.length,
      });
    }

    if (action === "issueAccessPassCode") {
      const result = await issueAccessCode(supabase, body);
      return sendJson(res, result.statusCode, result.payload);
    }

    return sendJson(res, 400, { message: "Unknown CYES access-pass action." });
  } catch (error) {
    console.error("CYES access-pass agent API error", error);
    return sendJson(res, 500, {
      message: error instanceof Error ? error.message : error?.message || "Could not complete the access-pass request.",
    });
  }
}
