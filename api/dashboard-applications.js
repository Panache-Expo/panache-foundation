import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DASHBOARD_ACCESS_KEY = process.env.DASHBOARD_ACCESS_KEY;

const parseRequestBody = (body) => {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }

  return body;
};

const createAdminClient = () =>
  createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

const getDashboardKeyFromRequest = (req) =>
  req.headers["x-dashboard-key"] ||
  req.headers["X-Dashboard-Key"] ||
  req.headers["x-dashboard-access-key"];

const assertServerConfiguration = (res) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !DASHBOARD_ACCESS_KEY) {
    res.status(500).json({
      message: "Dashboard server environment variables are incomplete.",
    });
    return false;
  }

  return true;
};

const assertAuthorized = (req, res) => {
  const providedKey = getDashboardKeyFromRequest(req);

  if (!providedKey || providedKey !== DASHBOARD_ACCESS_KEY) {
    res.status(401).json({ message: "Invalid dashboard access code." });
    return false;
  }

  return true;
};

const sanitizeUpdatePayload = (updates) => {
  const nextUpdates = {};

  if (typeof updates.payment_status === "string") {
    nextUpdates.payment_status = updates.payment_status;
    nextUpdates.paid_at =
      updates.payment_status === "paid" ? new Date().toISOString() : null;
  }

  if ("payment_reference" in updates) {
    nextUpdates.payment_reference = updates.payment_reference || null;
  }

  if ("payment_amount" in updates) {
    nextUpdates.payment_amount =
      updates.payment_amount === null ||
      updates.payment_amount === undefined ||
      updates.payment_amount === ""
        ? null
        : Number(updates.payment_amount);
  }

  if (typeof updates.review_status === "string") {
    nextUpdates.review_status = updates.review_status;
  }

  if ("review_notes" in updates) {
    nextUpdates.review_notes = updates.review_notes || null;
  }

  nextUpdates.updated_at = new Date().toISOString();

  return nextUpdates;
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (!assertServerConfiguration(res) || !assertAuthorized(req, res)) {
    return;
  }

  const admin = createAdminClient();

  if (req.method === "GET") {
    const { data, error } = await admin
      .from("competition_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch competition applications", error);
      return res.status(500).json({ message: "Could not load applications." });
    }

    return res.status(200).json({ applications: data });
  }

  if (req.method === "PATCH") {
    const body = parseRequestBody(req.body);
    const { id, updates } = body;

    if (!id || !updates || typeof updates !== "object") {
      return res.status(400).json({ message: "Invalid update payload." });
    }

    const safeUpdates = sanitizeUpdatePayload(updates);

    const { data, error } = await admin
      .from("competition_applications")
      .update(safeUpdates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Failed to update competition application", error);
      return res.status(500).json({ message: "Could not update application." });
    }

    return res.status(200).json({ application: data });
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ message: "Method not allowed." });
}
