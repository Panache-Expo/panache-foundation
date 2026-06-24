import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const DASHBOARD_ACCESS_KEY = process.env.DASHBOARD_ACCESS_KEY || "";
const MISS_PANACHE_PHOTO_BUCKET =
  process.env.MISS_PANACHE_NOMINEE_PHOTO_BUCKET ||
  "miss-panache-nominee-photos";
const MISS_PANACHE_PHOTO_MAX_BYTES = Number.parseInt(
  process.env.MISS_PANACHE_NOMINEE_PHOTO_MAX_BYTES || String(3 * 1024 * 1024),
  10
);

const PAYMENT_PROVIDER = process.env.MISS_PANACHE_PAYMENT_PROVIDER || "campay";
const VOTE_PROVIDER_NAME = "Secure payment";
const CAMPAY_BASE_URL = (
  process.env.MISS_PANACHE_CAMPAY_BASE_URL ||
  process.env.CAMPAY_BASE_URL ||
  "https://www.campay.net"
).replace(/\/+$/, "");
const CAMPAY_APP_USERNAME =
  process.env.MISS_PANACHE_CAMPAY_APP_USERNAME ||
  process.env.CAMPAY_APP_USERNAME ||
  process.env.CAMPAY_USERNAME ||
  "";
const CAMPAY_APP_PASSWORD =
  process.env.MISS_PANACHE_CAMPAY_APP_PASSWORD ||
  process.env.CAMPAY_APP_PASSWORD ||
  process.env.CAMPAY_PASSWORD ||
  "";
const CAMPAY_PAYMENT_OPTIONS =
  process.env.MISS_PANACHE_CAMPAY_PAYMENT_OPTIONS ||
  process.env.CAMPAY_PAYMENT_OPTIONS ||
  "MOMO,CARD";
const CAMPAY_TOKEN_TTL_MS = Number.parseInt(
  process.env.MISS_PANACHE_CAMPAY_TOKEN_TTL_MS ||
    process.env.CAMPAY_TOKEN_TTL_MS ||
    String(45 * 60 * 1000),
  10
);
const VOTE_PRICE_XAF = Number.parseInt(
  process.env.MISS_PANACHE_VOTE_PRICE_XAF || "100",
  10
);
const PROCESSING_FEE_PER_VOTE_XAF = Number.parseInt(
  "0",
  10
);
const COMPETITION_VOTE_WEIGHT_PERCENT = Number.parseInt(
  process.env.MISS_PANACHE_VOTE_WEIGHT_PERCENT || "25",
  10
);
const CURRENCY = (
  process.env.MISS_PANACHE_CURRENCY ||
  process.env.CURRENCY ||
  "XAF"
).toUpperCase();
const MISS_PANACHE_BASE_URL = (
  process.env.MISS_PANACHE_BASE_URL ||
  process.env.PANACHE_FRONTEND_BASE_URL ||
  ""
).replace(/\/+$/, "");
const RESULTS_PUBLISH_AT =
  process.env.MISS_PANACHE_RESULTS_PUBLISH_AT ||
  "2026-07-12T02:00:00+01:00";
const RESULTS_PUBLISH_LABEL =
  process.env.MISS_PANACHE_RESULTS_PUBLISH_LABEL ||
  "12 July 2026 at 2:00 AM WAT";
const AUTO_VERIFY_ENABLED =
  String(process.env.MISS_PANACHE_AUTO_VERIFY_ENABLED ?? "true")
    .trim()
    .toLowerCase() !== "false";
const AUTO_VERIFY_STARTED_AT =
  process.env.MISS_PANACHE_AUTO_VERIFY_STARTED_AT ||
  "2026-05-30T02:43:13.900Z";
const AUTO_VERIFY_LIMIT = Number.parseInt(
  process.env.MISS_PANACHE_AUTO_VERIFY_LIMIT || "10",
  10
);
const AUTO_VERIFY_COOLDOWN_MS = 10 * 60 * 1000;
const AUTO_HISTORY_RECONCILE_ENABLED =
  String(process.env.MISS_PANACHE_AUTO_HISTORY_RECONCILE_ENABLED ?? "true")
    .trim()
    .toLowerCase() !== "false";
const AUTO_HISTORY_RECONCILE_COOLDOWN_MS = Number.parseInt(
  process.env.MISS_PANACHE_AUTO_HISTORY_RECONCILE_COOLDOWN_MS || "86400000",
  10
);
const AUTO_HISTORY_RECONCILE_LOOKBACK_DAYS = Number.parseInt(
  process.env.MISS_PANACHE_AUTO_HISTORY_RECONCILE_LOOKBACK_DAYS || "7",
  10
);
const paymentsConfigured = Boolean(
  PAYMENT_PROVIDER === "campay" && CAMPAY_APP_USERNAME && CAMPAY_APP_PASSWORD
);

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE =
  String(process.env.SMTP_SECURE || "true").toLowerCase() !== "false";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || "";

const CATEGORY_COLUMNS =
  "id, slug, name, description, status, sort_order, created_at, updated_at";
const NOMINEE_COLUMNS =
  "id, category_id, slug, name, organization, bio, photo_url, status, sort_order, ayati_vote_url, ayati_sync_id, ayati_vote_count, ayati_last_synced_at, created_at, updated_at";
const PAYMENT_COLUMNS =
  "id, nominee_id, category_id, tx_ref, campay_reference, payment_link, provider, status, voter_email, voter_whatsapp, vote_count, vote_price_xaf, processing_fee_per_vote_xaf, amount_xaf, currency, provider_status, provider_payload, verified_at, failure_reason, receipt_email_sent_at, receipt_email_error, created_at, updated_at";

const allowedStatuses = new Set(["active", "draft", "archived"]);
const allowedPhotoTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const completedProviderStatuses = new Set(["SUCCESSFUL", "SUCCESS"]);
const failedProviderStatuses = new Set(["FAILED", "CANCELLED", "CANCELED"]);

let campayTokenCache = {
  token: "",
  expiresAt: 0,
};
let lastAutoVerifyAt = 0;
let autoVerifyInFlight = null;
let lastAutoHistoryReconcileAt = 0;
let autoHistoryReconcileInFlight = null;

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

const setPublicCacheHeaders = (res) => {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=20, stale-while-revalidate=60"
  );
};

const normalizeText = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  const normalized = String(value).trim();
  return normalized || null;
};

const normalizeEmail = (value) => {
  const email = String(value || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
};

const normalizePhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) {
    return null;
  }
  if (digits.startsWith("237")) {
    return digits;
  }
  if (digits.length === 9) {
    return `237${digits}`;
  }
  return digits;
};

const normalizeStatus = (value, fallback = "active") => {
  const status = normalizeText(value) || fallback;
  return allowedStatuses.has(status) ? status : fallback;
};

const normalizeInteger = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clampInteger = (value, fallback, min, max) => {
  const parsed = normalizeInteger(value, fallback);
  return Math.min(Math.max(parsed, min), max);
};

const normalizeIsoTimestamp = (value) => {
  const raw = normalizeText(value);
  if (!raw) {
    return null;
  }

  const timestamp = Date.parse(raw);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
};

const normalizeUrl = (value) => {
  const url = normalizeText(value);
  if (!url) {
    return null;
  }

  try {
    return new URL(url).toString();
  } catch {
    return null;
  }
};

const slugify = (value) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || crypto.randomUUID();

const moneyAmount = (amount) => Math.round(Number(amount));

const resolveBaseUrl = (req) => {
  if (MISS_PANACHE_BASE_URL) {
    return MISS_PANACHE_BASE_URL;
  }

  const host = normalizeText(req.headers.host);
  if (!host) {
    return "https://panache-foundation.org";
  }
  const protocol =
    normalizeText(req.headers["x-forwarded-proto"]).includes("https")
      ? "https"
      : "http";
  return `${protocol}://${host}`.replace(/\/+$/, "");
};

const splitReceiptName = (email) => {
  const localPart = String(email || "panache voter").split("@")[0];
  const parts = localPart
    .replace(/[._-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  return {
    firstName: parts[0] || "Panache",
    lastName: parts.slice(1).join(" ") || "Voter",
  };
};

const readJsonResponse = async (response) => {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const isDashboardRequest = (req) => {
  const key =
    req.headers["x-dashboard-key"] ||
    req.headers["x-dashboard-access-key"] ||
    req.query?.access_key;

  return Boolean(DASHBOARD_ACCESS_KEY && key === DASHBOARD_ACCESS_KEY);
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

const assertAdmin = (req) => {
  if (!isDashboardRequest(req)) {
    const error = new Error("Invalid dashboard access code.");
    error.statusCode = 401;
    throw error;
  }
};

const getCampayToken = async () => {
  if (!paymentsConfigured) {
    const error = new Error("CamPay payment credentials are not configured.");
    error.statusCode = 503;
    throw error;
  }

  if (campayTokenCache.token && campayTokenCache.expiresAt > Date.now()) {
    return campayTokenCache.token;
  }

  const response = await fetch(`${CAMPAY_BASE_URL}/api/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: CAMPAY_APP_USERNAME,
      password: CAMPAY_APP_PASSWORD,
    }),
  });
  const payload = await readJsonResponse(response);

  if (!response.ok || !payload.token) {
    const error = new Error(
      payload?.message || "CamPay authentication failed."
    );
    error.statusCode = response.status || 502;
    error.details = payload;
    throw error;
  }

  campayTokenCache = {
    token: payload.token,
    expiresAt: Date.now() + CAMPAY_TOKEN_TTL_MS,
  };
  return payload.token;
};

const campayRequest = async (endpoint, options = {}, retry = true) => {
  const token = await getCampayToken();
  const response = await fetch(`${CAMPAY_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await readJsonResponse(response);

  if (response.status === 401 && retry) {
    campayTokenCache = { token: "", expiresAt: 0 };
    return campayRequest(endpoint, options, false);
  }

  if (!response.ok) {
    const error = new Error(payload?.message || "CamPay request failed.");
    error.statusCode = response.status || 502;
    error.details = payload;
    throw error;
  }

  return payload;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const campayRequestWithRetry = async (endpoint, options = {}, attempts = 3) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await campayRequest(endpoint, options);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(350 * attempt);
      }
    }
  }
  throw lastError;
};

const normalizeDate = (value, fallback) => {
  const raw = normalizeText(value);
  if (!raw) {
    return fallback;
  }
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw createHttpError("Use dates in YYYY-MM-DD format.");
  }
  return raw;
};

const addDays = (date, days) => {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
};

const getDateRange = (startDate, endDate) => {
  const dates = [];
  let current = startDate;
  while (current <= endDate) {
    dates.push(current);
    if (dates.length > 14) {
      throw createHttpError("Reconcile at most 14 days at a time.");
    }
    current = addDays(current, 1);
  }
  return dates;
};

const extractCampayHistoryRows = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (Array.isArray(payload?.results)) {
    return payload.results;
  }
  if (Array.isArray(payload?.transactions)) {
    return payload.transactions;
  }
  return [];
};

const fetchCampayHistoryRows = async (date) => {
  const payload = await campayRequestWithRetry("/api/history/", {
    method: "POST",
    body: JSON.stringify({
      start_date: date,
      end_date: date,
    }),
  });
  return extractCampayHistoryRows(payload);
};

const getCampayHistoryReference = (row) =>
  normalizeText(row?.reference_uuid || row?.reference || row?.transaction_reference || row?.ref);

const normalizeCampayAmount = (transaction) =>
  Math.abs(
    Math.round(
      Number(
        transaction?.amount ||
          transaction?.amount_paid ||
          transaction?.value ||
          transaction?.total_amount ||
          transaction?.app_amount ||
          0
      )
    )
  );

const classifyCampayTransaction = (transaction) => {
  const text = [
    transaction?.type,
    transaction?.transaction_type,
    transaction?.payment_type,
    transaction?.operation,
    transaction?.reason,
    transaction?.description,
    transaction?.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const amount = Number(
    transaction?.amount || transaction?.amount_paid || transaction?.value || 0
  );

  if (Number(transaction?.debit || 0) > 0) {
    return "withdrawal";
  }
  if (Number(transaction?.credit || 0) > 0) {
    return "deposit";
  }
  if (
    text.includes("disburse") ||
    text.includes("withdraw") ||
    text.includes("payout") ||
    text.includes("cashout") ||
    text.includes("debit")
  ) {
    return "withdrawal";
  }
  if (
    text.includes("collect") ||
    text.includes("collection") ||
    text.includes("payment") ||
    text.includes("deposit") ||
    text.includes("cashin") ||
    text.includes("credit")
  ) {
    return "deposit";
  }
  if (transaction?.to && !transaction?.from) {
    return "withdrawal";
  }
  if (transaction?.from && !transaction?.to) {
    return "deposit";
  }
  if (amount < 0) {
    return "withdrawal";
  }
  if (amount > 0) {
    return "deposit";
  }
  return "unknown";
};

const normalizeCampayHistoryTransaction = (transaction) => ({
  campay_reference: getCampayHistoryReference(transaction),
  external_reference: normalizeText(
    transaction?.external_reference ||
      transaction?.external_ref ||
      transaction?.externalReference
  ),
  direction: classifyCampayTransaction(transaction),
  amount_xaf: normalizeCampayAmount(transaction),
  currency: String(transaction?.currency || CURRENCY).toUpperCase(),
  status: String(
    transaction?.status || transaction?.transaction_status || "UNKNOWN"
  ).toUpperCase(),
  phone:
    normalizeText(transaction?.from) ||
    normalizeText(transaction?.to) ||
    normalizeText(transaction?.phone_number) ||
    normalizeText(transaction?.msisdn),
  operator: normalizeText(transaction?.operator || transaction?.network),
  description: normalizeText(transaction?.description || transaction?.reason),
  transaction_date:
    normalizeIsoTimestamp(
      transaction?.created_at ||
        transaction?.date ||
        transaction?.datetime ||
        transaction?.timestamp
    ) || null,
  raw: transaction || {},
  updated_at: new Date().toISOString(),
});

const syncCampayHistoryTransactions = async (supabase, historyRows = []) => {
  const rows = historyRows
    .map(normalizeCampayHistoryTransaction)
    .filter((transaction) => transaction.campay_reference);

  if (!rows.length) {
    return { available: true, synced: 0 };
  }

  const { error } = await supabase
    .from("miss_panache_campay_transactions")
    .upsert(rows, { onConflict: "campay_reference" });

  if (error) {
    if (
      error.code === "42P01" ||
      error.code === "PGRST205" ||
      /does not exist|could not find/i.test(error.message || "")
    ) {
      return {
        available: false,
        synced: 0,
        error: "CamPay transaction sync table is not available yet.",
      };
    }
    throw error;
  }

  return { available: true, synced: rows.length };
};

const fetchCampayTransaction = async (reference) =>
  campayRequestWithRetry(`/api/transaction/${encodeURIComponent(reference)}/`);

const sanitizeCategory = (category = {}) => {
  const name = normalizeText(category.name);
  if (!name) {
    throw new Error("Category name is required.");
  }

  return {
    name,
    slug: slugify(category.slug || name),
    description: normalizeText(category.description),
    status: normalizeStatus(category.status),
    sort_order: normalizeInteger(category.sort_order),
  };
};

const sanitizeNominee = (nominee = {}, fallback = {}) => {
  const name = normalizeText(nominee.name ?? fallback.name);
  const categoryId = normalizeText(nominee.category_id ?? fallback.category_id);
  const status = normalizeStatus(nominee.status ?? fallback.status);

  if (!name) {
    throw new Error("Nominee name is required.");
  }
  if (!categoryId) {
    throw new Error("Nominee category is required.");
  }

  return {
    category_id: categoryId,
    name,
    slug: slugify(nominee.slug || fallback.slug || name),
    organization: normalizeText(nominee.organization ?? fallback.organization),
    bio: normalizeText(nominee.bio ?? fallback.bio),
    photo_url: normalizeText(nominee.photo_url ?? fallback.photo_url),
    status,
    sort_order: normalizeInteger(nominee.sort_order ?? fallback.sort_order),
    ayati_vote_url: normalizeUrl(
      nominee.vote_url ?? nominee.ayati_vote_url ?? fallback.ayati_vote_url
    ),
    ayati_sync_id: normalizeText(
      nominee.vote_provider_sync_id ??
        nominee.ayati_sync_id ??
        fallback.ayati_sync_id
    ),
  };
};

const withUpdatedAt = (payload) => ({
  ...payload,
  updated_at: new Date().toISOString(),
});

const resultsPublishTimestamp = Date.parse(RESULTS_PUBLISH_AT);

const isBlindVotingActive = () =>
  Number.isFinite(resultsPublishTimestamp) && Date.now() < resultsPublishTimestamp;

const getBlindVotingMetadata = (includeDrafts = false) => ({
  blind_voting: !includeDrafts && isBlindVotingActive(),
  results_publish_at: RESULTS_PUBLISH_AT,
  results_publish_label: RESULTS_PUBLISH_LABEL,
});

const decorateNominee = (nominee, { exposeCounts = true } = {}) => ({
  ...nominee,
  ayati_vote_url: null,
  ayati_sync_id: null,
  ayati_vote_count: exposeCounts
    ? normalizeInteger(nominee.local_vote_count, 0)
    : 0,
  ayati_last_synced_at: null,
  vote_url: null,
  vote_count: exposeCounts ? normalizeInteger(nominee.local_vote_count, 0) : 0,
  vote_provider_sync_id: null,
  vote_last_synced_at: null,
});

const paymentSettings = () => ({
  provider: PAYMENT_PROVIDER,
  provider_name: VOTE_PROVIDER_NAME,
  payments_configured: paymentsConfigured,
  vote_price_xaf: VOTE_PRICE_XAF,
  processing_fee_per_vote_xaf: PROCESSING_FEE_PER_VOTE_XAF,
  amount_per_vote_xaf: VOTE_PRICE_XAF + PROCESSING_FEE_PER_VOTE_XAF,
  currency: CURRENCY,
});

const buildVotingPayload = (
  categories,
  nominees,
  includeDrafts = false,
  payments = [],
  paymentSummary = null,
  paidPending = null
) => {
  const blindVoting = !includeDrafts && isBlindVotingActive();
  const exposeCounts = !blindVoting;
  const nomineesByCategory = nominees.reduce((accumulator, nominee) => {
    if (!accumulator[nominee.category_id]) {
      accumulator[nominee.category_id] = [];
    }
    accumulator[nominee.category_id].push(decorateNominee(nominee, { exposeCounts }));
    return accumulator;
  }, {});
  const totalVotes = nominees.reduce(
    (sum, nominee) => sum + normalizeInteger(nominee.local_vote_count, 0),
    0
  );

  return {
    categories: categories.map((category) => ({
      ...category,
      vote_count: nominees
        .filter((nominee) => nominee.category_id === category.id)
        .reduce(
          (sum, nominee) =>
            sum + (exposeCounts ? normalizeInteger(nominee.local_vote_count, 0) : 0),
          0
        ),
      nominees: nomineesByCategory[category.id] || [],
    })),
    total_nominees: nominees.length,
    total_votes: exposeCounts ? totalVotes : 0,
    counts_available: exposeCounts,
    ...getBlindVotingMetadata(includeDrafts),
    vote_provider: PAYMENT_PROVIDER,
    vote_provider_name: VOTE_PROVIDER_NAME,
    vote_provider_sync_configured: paymentsConfigured,
    vote_provider_leaderboard_url: null,
    ayati_sync_configured: false,
    ayati_leaderboard_url: null,
    last_synced_at: null,
    competition_weight_percent: COMPETITION_VOTE_WEIGHT_PERCENT,
    payment: paymentSettings(),
    admin: includeDrafts,
    ...(includeDrafts
      ? {
          payments,
          payment_summary:
            paymentSummary || {
              pending: 0,
              completed: 0,
              failed: 0,
              cancelled: 0,
              total_votes: totalVotes,
              total_amount_xaf: 0,
            },
          paid_pending_payments: paidPending?.payments || [],
          paid_pending_summary:
            paidPending?.summary || {
              count: 0,
              total_votes: 0,
              total_amount_xaf: 0,
              sync_available: true,
            },
        }
      : {}),
  };
};

const fetchVoteCounts = async (supabase) => {
  const { data, error } = await supabase
    .from("miss_panache_nominee_vote_counts")
    .select("nominee_id,total_votes");

  if (error) {
    if (
      error.code === "42P01" ||
      error.code === "PGRST205" ||
      /does not exist|could not find/i.test(error.message || "")
    ) {
      return new Map();
    }
    throw error;
  }

  return new Map(
    (data || []).map((row) => [row.nominee_id, normalizeInteger(row.total_votes)])
  );
};

const fetchPaymentAdminData = async (supabase, includeDrafts) => {
  if (!includeDrafts) {
    return { payments: [], summary: null };
  }

  const { data: payments = [], error } = await supabase
    .from("miss_panache_vote_payments")
    .select(
      `${PAYMENT_COLUMNS}, nominee:miss_panache_award_nominees(name, slug), category:miss_panache_award_categories(name, slug)`
    )
    .order("created_at", { ascending: false })
    .limit(120);

  if (error) {
    if (
      error.code === "42P01" ||
      error.code === "PGRST205" ||
      /does not exist|could not find/i.test(error.message || "")
    ) {
      return { payments: [], summary: null };
    }
    throw error;
  }

  const summary = payments.reduce(
    (accumulator, payment) => {
      const status = payment.status || "pending";
      accumulator[status] = normalizeInteger(accumulator[status], 0) + 1;
      if (status === "completed") {
        accumulator.total_votes += normalizeInteger(payment.vote_count, 0);
        accumulator.total_amount_xaf += normalizeInteger(payment.amount_xaf, 0);
      }
      return accumulator;
    },
    {
      pending: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      total_votes: 0,
      total_amount_xaf: 0,
    }
  );

  return { payments, summary };
};

const emptyPaidPendingResult = (syncAvailable = true, syncError = null) => ({
  payments: [],
  summary: {
    count: 0,
    total_votes: 0,
    total_amount_xaf: 0,
    sync_available: syncAvailable,
    sync_error: syncError,
  },
});

const fetchPaidPendingCampayVotes = async (supabase, { limit = 50 } = {}) => {
  const cutoffIso = normalizeIsoTimestamp(AUTO_VERIFY_STARTED_AT);
  const safeLimit = clampInteger(limit, 50, 1, 200);
  let paymentQuery = supabase
    .from("miss_panache_vote_payments")
    .select(
      `${PAYMENT_COLUMNS}, nominee:miss_panache_award_nominees(name, slug), category:miss_panache_award_categories(name, slug)`
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (cutoffIso) {
    paymentQuery = paymentQuery.gte("created_at", cutoffIso);
  }

  const { data: pendingPayments = [], error: paymentError } = await paymentQuery;
  if (paymentError) {
    throw paymentError;
  }
  if (!pendingPayments.length) {
    return emptyPaidPendingResult();
  }

  const { data: transactions = [], error: transactionError } = await supabase
    .from("miss_panache_campay_transactions")
    .select(
      "campay_reference, external_reference, amount_xaf, currency, status, transaction_date, updated_at"
    )
    .in("status", Array.from(completedProviderStatuses))
    .order("transaction_date", { ascending: false, nullsFirst: false })
    .limit(5000);

  if (transactionError) {
    if (
      transactionError.code === "42P01" ||
      transactionError.code === "PGRST205" ||
      /does not exist|could not find/i.test(transactionError.message || "")
    ) {
      return emptyPaidPendingResult(
        false,
        "CamPay transaction sync table is not available yet."
      );
    }
    throw transactionError;
  }

  const transactionsByReference = new Map();
  for (const transaction of transactions) {
    const campayReference = normalizeText(transaction.campay_reference);
    const externalReference = normalizeText(transaction.external_reference);
    if (campayReference) {
      transactionsByReference.set(campayReference, transaction);
    }
    if (externalReference && !transactionsByReference.has(externalReference)) {
      transactionsByReference.set(externalReference, transaction);
    }
  }

  const paidPendingPayments = [];
  for (const payment of pendingPayments) {
    const transaction =
      transactionsByReference.get(normalizeText(payment.campay_reference)) ||
      transactionsByReference.get(normalizeText(payment.tx_ref));

    if (!transaction) {
      continue;
    }

    const paidAmount = normalizeInteger(transaction.amount_xaf, 0);
    const expectedAmount = normalizeInteger(payment.amount_xaf, 0);
    const expectedCurrency = String(payment.currency || CURRENCY).toUpperCase();
    const sameCurrency =
      String(transaction.currency || payment.currency).toUpperCase() ===
      expectedCurrency;
    const enoughPaid = paidAmount >= expectedAmount;
    const existingReference = normalizeText(payment.campay_reference);
    const transactionReference = normalizeText(transaction.campay_reference);
    const referenceMatches =
      !existingReference || existingReference === transactionReference;

    if (!sameCurrency || !enoughPaid || !referenceMatches) {
      continue;
    }

    paidPendingPayments.push({
      ...payment,
      matched_reference: transactionReference,
      matched_external_reference: normalizeText(transaction.external_reference),
      matched_status: String(transaction.status || "").toUpperCase(),
      matched_amount_xaf: paidAmount,
      matched_currency: String(transaction.currency || CURRENCY).toUpperCase(),
      matched_transaction_date: transaction.transaction_date || null,
      matched_updated_at: transaction.updated_at || null,
    });
  }

  const visiblePayments = paidPendingPayments.slice(0, safeLimit);
  return {
    payments: visiblePayments,
    summary: {
      count: paidPendingPayments.length,
      visible_count: visiblePayments.length,
      total_votes: paidPendingPayments.reduce(
        (sum, payment) => sum + normalizeInteger(payment.vote_count, 0),
        0
      ),
      total_amount_xaf: paidPendingPayments.reduce(
        (sum, payment) => sum + normalizeInteger(payment.amount_xaf, 0),
        0
      ),
      sync_available: true,
      sync_error: null,
      cutoff: cutoffIso,
    },
  };
};

const fetchVotingPayload = async (supabase, includeDrafts = false) => {
  let categoryQuery = supabase
    .from("miss_panache_award_categories")
    .select(CATEGORY_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (!includeDrafts) {
    categoryQuery = categoryQuery.eq("status", "active");
  }

  const { data: categories = [], error: categoriesError } = await categoryQuery;
  if (categoriesError) {
    throw categoriesError;
  }

  let nomineeQuery = supabase
    .from("miss_panache_award_nominees")
    .select(NOMINEE_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (!includeDrafts) {
    nomineeQuery = nomineeQuery.eq("status", "active");
  }

  const { data: rawNominees = [], error: nomineesError } = await nomineeQuery;
  if (nomineesError) {
    throw nomineesError;
  }

  const voteCounts = await fetchVoteCounts(supabase);
  const categoryIds = new Set(categories.map((category) => category.id));
  const nominees = rawNominees
    .filter((nominee) => categoryIds.has(nominee.category_id))
    .map((nominee) => ({
      ...nominee,
      local_vote_count: voteCounts.get(nominee.id) || 0,
    }));
  const { payments, summary } = await fetchPaymentAdminData(
    supabase,
    includeDrafts
  );
  const paidPending = includeDrafts
    ? await fetchPaidPendingCampayVotes(supabase)
    : null;

  return buildVotingPayload(
    categories,
    nominees,
    includeDrafts,
    payments,
    summary,
    paidPending
  );
};

const mutateAndReturnVoting = async (supabase, mutation) => {
  const result = await mutation();
  const voting = await fetchVotingPayload(supabase, true);
  return {
    ...result,
    voting,
  };
};

const decodeUpload = ({ fileName, contentType, base64 }) => {
  const fileType = normalizeText(contentType);
  if (!fileName || !fileType || !allowedPhotoTypes.has(fileType)) {
    throw new Error("Upload a JPG, PNG, WEBP, or GIF image.");
  }

  const buffer = Buffer.from(String(base64 || ""), "base64");
  if (!buffer.length) {
    throw new Error("Image upload is empty.");
  }
  if (buffer.length > MISS_PANACHE_PHOTO_MAX_BYTES) {
    throw new Error("Nominee photo must be under 3 MB.");
  }

  const extension =
    fileType === "image/png"
      ? "png"
      : fileType === "image/webp"
      ? "webp"
      : fileType === "image/gif"
      ? "gif"
      : "jpg";

  return {
    buffer,
    contentType: fileType,
    path: `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${slugify(
      fileName
    )}.${extension}`,
  };
};

const parseCsvRows = (csvText) => {
  const rows = [];
  let row = [];
  let field = "";
  let insideQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index];
    const nextCharacter = csvText[index + 1];

    if (character === '"' && insideQuotes && nextCharacter === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (character === "," && !insideQuotes) {
      row.push(field.trim());
      field = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      row.push(field.trim());
      if (row.some((value) => value)) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += character;
  }

  row.push(field.trim());
  if (row.some((value) => value)) {
    rows.push(row);
  }

  return rows;
};

const normalizeCsvHeader = (value) =>
  slugify(value).replace(/-/g, "_").replace(/^nominee$/, "name");

const rowsToObjects = (csvText) => {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) {
    throw new Error("CSV needs a header row and at least one nominee row.");
  }

  const headers = rows[0].map(normalizeCsvHeader);
  return rows.slice(1).map((row) =>
    headers.reduce((object, header, index) => {
      object[header] = row[index] || "";
      return object;
    }, {})
  );
};

const findOrUpsertCategory = async (supabase, categoryCache, row) => {
  const categoryName =
    normalizeText(row.category) ||
    normalizeText(row.category_name) ||
    normalizeText(row.award_category);
  if (!categoryName) {
    throw new Error("Each CSV row needs a category.");
  }

  const categorySlug = slugify(row.category_slug || categoryName);
  const cachedCategory = categoryCache.get(categorySlug);
  if (cachedCategory) {
    return cachedCategory;
  }

  const payload = {
    slug: categorySlug,
    name: categoryName,
    description: normalizeText(row.category_description),
    status: normalizeStatus(row.category_status),
    sort_order: normalizeInteger(row.category_sort_order),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("miss_panache_award_categories")
    .upsert(payload, { onConflict: "slug" })
    .select(CATEGORY_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  categoryCache.set(categorySlug, data);
  return data;
};

const importCsv = async (supabase, csvText) => {
  const rows = rowsToObjects(csvText);
  const { data: existingCategories = [], error: categoriesError } = await supabase
    .from("miss_panache_award_categories")
    .select(CATEGORY_COLUMNS);

  if (categoriesError) {
    throw categoriesError;
  }

  const categoryCache = new Map(
    existingCategories.map((category) => [category.slug, category])
  );
  const errors = [];
  let imported = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const rowNumber = index + 2;

    try {
      const category = await findOrUpsertCategory(supabase, categoryCache, row);
      const name =
        normalizeText(row.name) ||
        normalizeText(row.nominee_name) ||
        normalizeText(row.nominee);
      if (!name) {
        throw new Error("Nominee name is required.");
      }

      const status = normalizeStatus(row.status, "active");
      const payload = {
        category_id: category.id,
        slug: slugify(row.slug || name),
        name,
        organization: normalizeText(row.organization || row.business),
        bio: normalizeText(row.bio),
        photo_url: normalizeText(row.photo_url || row.image_url),
        status,
        sort_order: normalizeInteger(row.sort_order),
        ayati_vote_url: normalizeUrl(row.vote_url || row.vote_link),
        ayati_sync_id: normalizeText(row.vote_provider_sync_id),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("miss_panache_award_nominees")
        .upsert(payload, { onConflict: "slug" });

      if (error) {
        throw error;
      }

      imported += 1;
    } catch (error) {
      errors.push({
        row: rowNumber,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    imported,
    failed: errors.length,
    errors,
  };
};

const loadActiveNominee = async (supabase, identifier) => {
  const normalizedIdentifier = normalizeText(identifier);
  if (!normalizedIdentifier) {
    throw createHttpError("Nominee is required.");
  }

  const query = supabase
    .from("miss_panache_award_nominees")
    .select(NOMINEE_COLUMNS)
    .eq("status", "active");
  const { data: nominee, error } = await (/^[0-9a-f-]{30,}$/i.test(
    normalizedIdentifier
  )
    ? query.eq("id", normalizedIdentifier)
    : query.eq("slug", normalizedIdentifier)
  ).single();

  if (error || !nominee) {
    const notFound = new Error("Nominee is not available for voting.");
    notFound.statusCode = 404;
    throw notFound;
  }

  const { data: category, error: categoryError } = await supabase
    .from("miss_panache_award_categories")
    .select(CATEGORY_COLUMNS)
    .eq("id", nominee.category_id)
    .eq("status", "active")
    .single();

  if (categoryError || !category) {
    const notFound = new Error("Nominee category is not available for voting.");
    notFound.statusCode = 404;
    throw notFound;
  }

  return { nominee, category };
};

const buildReceipt = (payment, nominee, category) => ({
  id: payment.id,
  tx_ref: payment.tx_ref,
  reference: payment.campay_reference,
  nominee_id: payment.nominee_id,
  nominee_name: nominee?.name || payment.nominee?.name || "Panache nominee",
  nominee_slug: nominee?.slug || payment.nominee?.slug || null,
  category_id: payment.category_id,
  category_name: category?.name || payment.category?.name || "Miss Panache",
  category_slug: category?.slug || payment.category?.slug || null,
  voter_email: payment.voter_email,
  voter_whatsapp: payment.voter_whatsapp,
  vote_count: payment.vote_count,
  amount_xaf: payment.amount_xaf,
  currency: payment.currency,
  status: payment.status,
  verified_at: payment.verified_at,
});

const sendReceiptEmail = async ({ payment, nominee, category }) => {
  if (!SMTP_USER || !SMTP_PASS || !SMTP_FROM || !payment.voter_email) {
    return {
      attempted: false,
      skipped: true,
      message: "SMTP is not configured or voter email is missing.",
    };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  const nomineeName = nominee?.name || payment.nominee?.name || "your nominee";
  const categoryName = category?.name || payment.category?.name || "Miss Panache";

  await transporter.sendMail({
    from: SMTP_FROM,
    to: payment.voter_email,
    subject: `Miss Panache vote receipt - ${nomineeName}`,
    text: `
Thank you for voting in Miss Panache.

Nominee: ${nomineeName}
Category: ${categoryName}
Votes: ${payment.vote_count}
Amount paid: ${payment.amount_xaf} ${payment.currency}
Transaction reference: ${payment.campay_reference || payment.tx_ref}

Only verified payments are counted on the leaderboard.
`.trim(),
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#171411;">
        <h2 style="margin:0 0 16px;">Miss Panache vote receipt</h2>
        <p style="margin:0 0 12px;">Thank you for voting in Miss Panache.</p>
        <p style="margin:0 0 8px;">Nominee: <strong>${nomineeName}</strong></p>
        <p style="margin:0 0 8px;">Category: <strong>${categoryName}</strong></p>
        <p style="margin:0 0 8px;">Votes: <strong>${payment.vote_count}</strong></p>
        <p style="margin:0 0 8px;">Amount paid: <strong>${payment.amount_xaf} ${payment.currency}</strong></p>
        <p style="margin:0 0 16px;">Transaction reference: <strong>${payment.campay_reference || payment.tx_ref}</strong></p>
        <p style="margin:0;">Only verified payments are counted on the leaderboard.</p>
      </div>
    `,
  });

  return { attempted: true, ok: true };
};

const updatePaymentReceiptStatus = async (supabase, paymentId, result) => {
  const { error } = await supabase
    .from("miss_panache_vote_payments")
    .update({
      receipt_email_sent_at: result.ok ? new Date().toISOString() : null,
      receipt_email_error: result.ok
        ? null
        : result.message || result.error || "Receipt email could not be sent.",
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId);

  if (error) {
    console.error("Could not update Miss Panache receipt email status", error);
  }
};

const maybeSendReceiptEmail = async (supabase, payment, nominee, category) => {
  if (payment.receipt_email_sent_at) {
    return { attempted: false, skipped: true, message: "Receipt already sent." };
  }

  try {
    const result = await sendReceiptEmail({ payment, nominee, category });
    if (result.attempted) {
      await updatePaymentReceiptStatus(supabase, payment.id, result);
    }
    return result;
  } catch (error) {
    const result = {
      attempted: true,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
    await updatePaymentReceiptStatus(supabase, payment.id, result);
    return result;
  }
};

const initializeCampayVote = async (req, supabase, body) => {
  const nomineeIdentifier =
    body.nomineeId || body.nominee_id || body.nomineeSlug || body.nominee_slug;
  const rawVoterEmail = normalizeText(
    body.voterEmail || body.voter_email || body.email
  );
  const voterEmail = normalizeEmail(rawVoterEmail);
  const voteCount = normalizeInteger(body.voteCount || body.vote_count || body.votes);

  if (rawVoterEmail && !voterEmail) {
    throw createHttpError("Enter a valid email address, or leave it blank.");
  }
  if (!Number.isSafeInteger(voteCount) || voteCount < 1) {
    throw createHttpError("Choose at least 1 vote.");
  }
  if (voteCount > 10000) {
    throw createHttpError("Vote quantity is too high for one payment.");
  }
  if (!paymentsConfigured) {
    const error = new Error("Secure payment is not configured yet.");
    error.statusCode = 503;
    throw error;
  }

  const { nominee, category } = await loadActiveNominee(supabase, nomineeIdentifier);
  const amount = moneyAmount(
    (VOTE_PRICE_XAF + PROCESSING_FEE_PER_VOTE_XAF) * voteCount
  );
  const txRef = `miss-panache-${Date.now()}-${crypto
    .randomBytes(6)
    .toString("hex")}`;
  const redirectUrl = `${resolveBaseUrl(
    req
  )}/panache-expo/miss-panache/payment/verify?tx_ref=${encodeURIComponent(txRef)}`;
  const description = `${voteCount} Miss Panache vote${
    voteCount === 1 ? "" : "s"
  } for ${nominee.name}`;
  const paymentLinkRequest = {
    amount: String(amount),
    currency: CURRENCY,
    description,
    payment_options: CAMPAY_PAYMENT_OPTIONS,
    external_reference: txRef,
    redirect_url: redirectUrl,
    failure_redirect_url: redirectUrl,
    ...(voterEmail ? { email: voterEmail } : {}),
  };

  const campayPayment = await campayRequest("/api/get_payment_link/", {
    method: "POST",
    body: JSON.stringify(paymentLinkRequest),
  });
  const paymentLink = normalizeUrl(
    campayPayment.link || campayPayment.payment_link || campayPayment.url
  );
  const campayReference = normalizeText(
    campayPayment.reference ||
      campayPayment.transId ||
      campayPayment.transaction_id ||
      campayPayment.transactionId
  );

  if (!paymentLink || !campayReference) {
    throw createHttpError(
      "Secure payment could not return a payment link. Please try again.",
      502
    );
  }

  const { data: pendingPayment, error: insertError } = await supabase
    .from("miss_panache_vote_payments")
    .insert({
      nominee_id: nominee.id,
      category_id: category.id,
      tx_ref: txRef,
      campay_reference: campayReference,
      payment_link: paymentLink,
      provider: PAYMENT_PROVIDER,
      status: "pending",
      voter_email: voterEmail,
      voter_whatsapp: null,
      vote_count: voteCount,
      vote_price_xaf: VOTE_PRICE_XAF,
      processing_fee_per_vote_xaf: PROCESSING_FEE_PER_VOTE_XAF,
      amount_xaf: amount,
      currency: CURRENCY,
      provider_payload: {
        initialize_request: {
          nominee_id: nominee.id,
          category_id: category.id,
          vote_count: voteCount,
          amount,
          currency: CURRENCY,
        },
        payment_link_request: paymentLinkRequest,
        payment_link_response: campayPayment,
      },
    })
    .select(PAYMENT_COLUMNS)
    .single();

  if (insertError) {
    if (
      insertError.code === "42P01" ||
      insertError.code === "PGRST205" ||
      /does not exist|could not find/i.test(insertError.message || "")
    ) {
      throw createHttpError(
        "Miss Panache payment tables are not migrated yet.",
        503
      );
    }
    throw insertError;
  }

  return {
    payment: {
      id: pendingPayment.id,
      tx_ref: pendingPayment.tx_ref,
      amount_xaf: pendingPayment.amount_xaf,
      currency: pendingPayment.currency,
      vote_count: pendingPayment.vote_count,
      nominee_name: nominee.name,
      category_name: category.name,
      reference: pendingPayment.campay_reference,
      payment_link: pendingPayment.payment_link,
      redirect_url: redirectUrl,
    },
  };
};

const loadPaymentForVerification = async (supabase, body) => {
  const txRef = normalizeText(body.tx_ref || body.txRef);
  const reference = normalizeText(
    body.reference || body.transId || body.transaction_id || body.transactionId
  );

  if (!txRef && !reference) {
    throw createHttpError("Payment reference is missing.");
  }

  let query = supabase
    .from("miss_panache_vote_payments")
    .select(
      `${PAYMENT_COLUMNS}, nominee:miss_panache_award_nominees(${NOMINEE_COLUMNS}), category:miss_panache_award_categories(${CATEGORY_COLUMNS})`
    );

  query = txRef ? query.eq("tx_ref", txRef) : query.eq("campay_reference", reference);
  const { data: payment, error } = await query.single();

  if (error || !payment) {
    const notFound = new Error("This Miss Panache payment could not be found.");
    notFound.statusCode = 404;
    throw notFound;
  }

  return payment;
};

const attachPaymentReference = async (supabase, payment, body) => {
  const reference = normalizeText(
    body.reference || body.transId || body.transaction_id || body.transactionId
  );

  if (!reference || payment.campay_reference === reference) {
    return payment;
  }

  if (payment.campay_reference && payment.campay_reference !== reference) {
    throw createHttpError("Payment reference does not match this vote.", 409);
  }

  const now = new Date().toISOString();
  const { data: updatedPayment, error } = await supabase
    .from("miss_panache_vote_payments")
    .update({
      campay_reference: reference,
      provider_payload: {
        ...(payment.provider_payload || {}),
        widget_callback: {
          reference,
          received_at: now,
        },
      },
      updated_at: now,
    })
    .eq("id", payment.id)
    .select(
      `${PAYMENT_COLUMNS}, nominee:miss_panache_award_nominees(${NOMINEE_COLUMNS}), category:miss_panache_award_categories(${CATEGORY_COLUMNS})`
    )
    .single();

  if (error) {
    throw error;
  }

  return updatedPayment;
};

const verifyPaymentRow = async (supabase, payment) => {
  if (payment.status === "completed") {
    const receipt = buildReceipt(payment, payment.nominee, payment.category);
    return {
      status: "already-counted",
      message: "This payment has already been verified and counted.",
      receipt,
      payment,
    };
  }

  const reference = normalizeText(payment.campay_reference);
  if (!reference) {
    throw createHttpError("Payment reference is missing for this payment.");
  }

  const transaction = await campayRequest(
    `/api/transaction/${encodeURIComponent(reference)}/`
  );
  const providerStatus = String(transaction.status || "").toUpperCase();
  const paidAmount = Number(transaction.amount);
  const externalReference =
    transaction.external_reference || transaction.externalReference;
  const sameReference = externalReference === payment.tx_ref;
  const successful = completedProviderStatuses.has(providerStatus);
  const enoughPaid = paidAmount >= Number(payment.amount_xaf);
  const sameCurrency =
    String(transaction.currency || payment.currency).toUpperCase() ===
    payment.currency;
  const now = new Date().toISOString();

  if (successful && sameReference && enoughPaid && sameCurrency) {
    const { data: completedPayment, error } = await supabase
      .from("miss_panache_vote_payments")
      .update({
        status: "completed",
        provider_status: providerStatus,
        provider_payload: {
          ...(payment.provider_payload || {}),
          verify_response: transaction,
        },
        verified_at: now,
        failure_reason: null,
        updated_at: now,
      })
      .eq("id", payment.id)
      .select(
        `${PAYMENT_COLUMNS}, nominee:miss_panache_award_nominees(${NOMINEE_COLUMNS}), category:miss_panache_award_categories(${CATEGORY_COLUMNS})`
      )
      .single();

    if (error) {
      throw error;
    }

    const receiptEmail = await maybeSendReceiptEmail(
      supabase,
      completedPayment,
      completedPayment.nominee,
      completedPayment.category
    );
    const receipt = buildReceipt(
      completedPayment,
      completedPayment.nominee,
      completedPayment.category
    );

    return {
      status: "success",
      message: "Payment verified and votes counted.",
      receipt,
      receiptEmail,
      payment: completedPayment,
    };
  }

  const shouldFail =
    failedProviderStatuses.has(providerStatus) ||
    (successful && (!sameReference || !enoughPaid || !sameCurrency));
  const nextStatus = shouldFail ? "failed" : "pending";
  const failureReason = successful
    ? "Payment did not match the expected vote transaction."
    : `Payment status is ${providerStatus || "pending"}.`;

  const { data: updatedPayment, error } = await supabase
    .from("miss_panache_vote_payments")
    .update({
      status: nextStatus,
      provider_status: providerStatus || null,
      provider_payload: {
        ...(payment.provider_payload || {}),
        verify_response: transaction,
      },
      failure_reason: nextStatus === "failed" ? failureReason : null,
      updated_at: now,
    })
    .eq("id", payment.id)
    .select(
      `${PAYMENT_COLUMNS}, nominee:miss_panache_award_nominees(${NOMINEE_COLUMNS}), category:miss_panache_award_categories(${CATEGORY_COLUMNS})`
    )
    .single();

  if (error) {
    throw error;
  }

  return {
    status: nextStatus,
    message:
      nextStatus === "failed"
        ? "Payment could not be verified for this vote."
        : "Payment is still pending.",
    payment: updatedPayment,
  };
};

const verifyCampayVote = async (supabase, body) => {
  const payment = await loadPaymentForVerification(supabase, body);
  const paymentWithReference = await attachPaymentReference(
    supabase,
    payment,
    body
  );
  const result = await verifyPaymentRow(supabase, paymentWithReference);
  const voting = await fetchVotingPayload(supabase, false);
  return { ...result, voting };
};

const verifyPendingCampayVotes = async (supabase, limit = 25) => {
  const safeLimit = Math.min(Math.max(normalizeInteger(limit, 25), 1), 100);
  const { data: payments = [], error } = await supabase
    .from("miss_panache_vote_payments")
    .select(
      `${PAYMENT_COLUMNS}, nominee:miss_panache_award_nominees(${NOMINEE_COLUMNS}), category:miss_panache_award_categories(${CATEGORY_COLUMNS})`
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(safeLimit);

  if (error) {
    throw error;
  }

  const results = [];
  for (const payment of payments) {
    try {
      results.push(await verifyPaymentRow(supabase, payment));
    } catch (error) {
      results.push({
        status: "error",
        tx_ref: payment.tx_ref,
        reference: payment.campay_reference,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    checked: payments.length,
    completed: results.filter((result) => result.status === "success").length,
    pending: results.filter((result) => result.status === "pending").length,
    failed: results.filter((result) => result.status === "failed").length,
    errors: results.filter((result) => result.status === "error").length,
    results,
  };
};

const recordAutoVerifyError = async (supabase, payment, error) => {
  const now = new Date().toISOString();
  const message = error instanceof Error ? error.message : String(error);
  const providerStatus =
    error?.statusCode === 404
      ? "REFERENCE_NOT_FOUND"
      : payment.provider_status || "VERIFY_ERROR";

  try {
    await supabase
      .from("miss_panache_vote_payments")
      .update({
        provider_status: providerStatus,
        provider_payload: {
          ...(payment.provider_payload || {}),
          auto_verify_error: {
            message,
            status_code: error?.statusCode || null,
            code: error?.code || null,
            recorded_at: now,
          },
        },
        updated_at: now,
      })
      .eq("id", payment.id);
  } catch (updateError) {
    console.error("Could not record Miss Panache auto verification error", {
      payment_id: payment.id,
      message:
        updateError instanceof Error ? updateError.message : String(updateError),
    });
  }
};

const autoVerifyRecentCampayVotes = async (
  supabase,
  { force = false, limit = AUTO_VERIFY_LIMIT } = {}
) => {
  const cutoffIso = normalizeIsoTimestamp(AUTO_VERIFY_STARTED_AT);
  if (!AUTO_VERIFY_ENABLED) {
    return { skipped: true, reason: "Auto verification is disabled." };
  }
  if (!paymentsConfigured) {
    return { skipped: true, reason: "CamPay credentials are not configured." };
  }
  if (!cutoffIso) {
    return { skipped: true, reason: "Auto verification cutoff is invalid." };
  }

  const now = Date.now();
  const defaultLimit = Number.isFinite(AUTO_VERIFY_LIMIT)
    ? AUTO_VERIFY_LIMIT
    : 10;
  const configuredCooldownMs = Number.isFinite(AUTO_VERIFY_COOLDOWN_MS)
    ? AUTO_VERIFY_COOLDOWN_MS
    : 3600000;
  const cooldownMs = Math.max(normalizeInteger(configuredCooldownMs, 0), 0);
  if (!force && cooldownMs > 0 && now - lastAutoVerifyAt < cooldownMs) {
    return {
      skipped: true,
      reason: "Auto verification cooldown is active.",
      cutoff: cutoffIso,
    };
  }
  if (autoVerifyInFlight) {
    return {
      skipped: true,
      reason: "Auto verification is already running.",
      cutoff: cutoffIso,
    };
  }

  const safeLimit = Math.min(
    Math.max(normalizeInteger(limit, defaultLimit), 1),
    100
  );
  lastAutoVerifyAt = now;
  autoVerifyInFlight = (async () => {
    const { data: payments = [], error } = await supabase
      .from("miss_panache_vote_payments")
      .select(
        `${PAYMENT_COLUMNS}, nominee:miss_panache_award_nominees(${NOMINEE_COLUMNS}), category:miss_panache_award_categories(${CATEGORY_COLUMNS})`
      )
      .eq("status", "pending")
      .gte("created_at", cutoffIso)
      .order("updated_at", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(safeLimit);

    if (error) {
      throw error;
    }

    const results = [];
    for (const payment of payments) {
      try {
        results.push(await verifyPaymentRow(supabase, payment));
      } catch (error) {
        await recordAutoVerifyError(supabase, payment, error);
        results.push({
          status: "error",
          tx_ref: payment.tx_ref,
          reference: payment.campay_reference,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const completed = results.filter(
      (result) => result.status === "success"
    );
    return {
      skipped: false,
      cutoff: cutoffIso,
      checked: payments.length,
      completed: completed.length,
      completed_votes: completed.reduce(
        (sum, result) => sum + normalizeInteger(result.payment?.vote_count, 0),
        0
      ),
      pending: results.filter((result) => result.status === "pending").length,
      failed: results.filter((result) => result.status === "failed").length,
      errors: results.filter((result) => result.status === "error").length,
      results: results.slice(0, 20).map((result) => ({
        status: result.status,
        message: result.message,
        tx_ref: result.payment?.tx_ref || result.tx_ref || null,
        reference: result.payment?.campay_reference || result.reference || null,
        vote_count: result.payment?.vote_count || null,
      })),
    };
  })();

  try {
    return await autoVerifyInFlight;
  } finally {
    autoVerifyInFlight = null;
  }
};

const reconcileCampayHistory = async (supabase, body = {}) => {
  const today = new Date().toISOString().slice(0, 10);
  const startDate = normalizeDate(
    body.startDate || body.start_date,
    addDays(today, -1)
  );
  const endDate = normalizeDate(body.endDate || body.end_date, today);
  const createdAfter = normalizeIsoTimestamp(
    body.createdAfter || body.created_after
  );
  if (startDate > endDate) {
    throw createHttpError("Start date must be before end date.");
  }

  const dryRun = body.dryRun !== false && body.dry_run !== false;
  const dates = getDateRange(startDate, endDate);
  const historyRows = (
    await Promise.all(dates.map((date) => fetchCampayHistoryRows(date)))
  ).flat();
  const uniqueHistoryRows = [
    ...new Map(
      historyRows
        .filter((row) => getCampayHistoryReference(row))
        .map((row) => [getCampayHistoryReference(row), row])
    ).values(),
  ];
  const syncSummary = await syncCampayHistoryTransactions(
    supabase,
    uniqueHistoryRows
  );

  let paymentQuery = supabase
    .from("miss_panache_vote_payments")
    .select(
      `${PAYMENT_COLUMNS}, nominee:miss_panache_award_nominees(${NOMINEE_COLUMNS}), category:miss_panache_award_categories(${CATEGORY_COLUMNS})`
    )
    .eq("status", "pending")
    .gte("created_at", `${startDate}T00:00:00+01:00`)
    .lt("created_at", `${addDays(endDate, 1)}T00:00:00+01:00`)
    .order("created_at", { ascending: true })
    .limit(3000);

  if (createdAfter) {
    paymentQuery = paymentQuery.gte("created_at", createdAfter);
  }

  const { data: payments = [], error: paymentError } = await paymentQuery;

  if (paymentError) {
    throw paymentError;
  }

  const pendingByTxRef = new Map(payments.map((payment) => [payment.tx_ref, payment]));
  const matchedTxRefs = new Set();
  const results = [];
  let recovered = 0;
  let recoverable = 0;
  let failed = 0;
  let skipped = 0;
  let errors = 0;
  let votesRecoverable = 0;
  let amountRecoverableXaf = 0;
  let votesRecovered = 0;
  let amountRecoveredXaf = 0;

  for (const historyRow of uniqueHistoryRows) {
    const historyReference = getCampayHistoryReference(historyRow);
    if (!historyReference) {
      continue;
    }
    const historyExternalReference = normalizeText(
      historyRow.external_reference ||
        historyRow.external_ref ||
        historyRow.externalReference
    );
    if (historyExternalReference && !pendingByTxRef.has(historyExternalReference)) {
      continue;
    }

    try {
      const transaction = await fetchCampayTransaction(historyReference);
      const externalReference = normalizeText(
        transaction.external_reference ||
          transaction.externalReference ||
          historyExternalReference
      );
      const payment = externalReference
        ? pendingByTxRef.get(externalReference)
        : null;

      if (!payment) {
        continue;
      }

      matchedTxRefs.add(payment.tx_ref);
      const providerStatus = String(transaction.status || "").toUpperCase();
      const paidAmount = Number(transaction.amount);
      const sameCurrency =
        String(transaction.currency || payment.currency).toUpperCase() ===
        payment.currency;
      const enoughPaid = paidAmount >= Number(payment.amount_xaf);
      const successful = completedProviderStatuses.has(providerStatus);
      const existingReference = normalizeText(payment.campay_reference);
      const referenceMatches =
        !existingReference || existingReference === historyReference;
      const baseResult = {
        tx_ref: payment.tx_ref,
        reference: historyReference,
        status: providerStatus || null,
        nominee: payment.nominee?.name || payment.nominee_id,
        category: payment.category?.name || payment.category_id,
        vote_count: payment.vote_count,
        amount_xaf: payment.amount_xaf,
      };

      if (!successful) {
        failed += 1;
        results.push({
          ...baseResult,
          result: "not-counted",
          reason: `Provider status is ${providerStatus || "unknown"}.`,
        });
        continue;
      }

      if (!sameCurrency || !enoughPaid || !referenceMatches) {
        skipped += 1;
        results.push({
          ...baseResult,
          result: "skipped",
          reason: "Transaction did not match expected amount, currency, or reference.",
        });
        continue;
      }

      recoverable += 1;
      votesRecoverable += normalizeInteger(payment.vote_count, 0);
      amountRecoverableXaf += normalizeInteger(payment.amount_xaf, 0);
      if (dryRun) {
        results.push({
          ...baseResult,
          result: "recoverable",
          reason: "Dry run only.",
        });
        continue;
      }

      let paymentForVerification = payment;
      if (!existingReference) {
        const now = new Date().toISOString();
        const { data: updatedPayment, error: updateError } = await supabase
          .from("miss_panache_vote_payments")
          .update({
            campay_reference: historyReference,
            provider_payload: {
              ...(payment.provider_payload || {}),
              history_reconciliation: {
                reference: historyReference,
                code: transaction.code || historyRow.code || null,
                reconciled_at: now,
              },
            },
            updated_at: now,
          })
          .eq("id", payment.id)
          .select(
            `${PAYMENT_COLUMNS}, nominee:miss_panache_award_nominees(${NOMINEE_COLUMNS}), category:miss_panache_award_categories(${CATEGORY_COLUMNS})`
          )
          .single();

        if (updateError) {
          throw updateError;
        }
        paymentForVerification = updatedPayment;
      }

      const verification = await verifyPaymentRow(supabase, paymentForVerification);
      if (verification.status === "success") {
        recovered += 1;
        votesRecovered += normalizeInteger(payment.vote_count, 0);
        amountRecoveredXaf += normalizeInteger(payment.amount_xaf, 0);
      }
      results.push({
        ...baseResult,
        result: verification.status,
        reason: verification.message,
      });
    } catch (error) {
      errors += 1;
      results.push({
        reference: getCampayHistoryReference(historyRow),
        result: "error",
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const noMatch = payments.length - matchedTxRefs.size;

  return {
    start_date: startDate,
    end_date: endDate,
    dry_run: dryRun,
    created_after: createdAfter,
    sync: syncSummary,
    pending_checked: payments.length,
    history_rows_checked: uniqueHistoryRows.length,
    matched: matchedTxRefs.size,
    recoverable,
    recovered,
    failed,
    skipped,
    no_match: noMatch,
    errors,
    votes_recoverable: votesRecoverable,
    amount_recoverable_xaf: amountRecoverableXaf,
    votes_recovered: votesRecovered,
    amount_recovered_xaf: amountRecoveredXaf,
    results: results.slice(0, 200),
  };
};

const autoReconcileCampayHistory = async (
  supabase,
  { force = false, dryRun = false } = {}
) => {
  const cutoffIso = normalizeIsoTimestamp(AUTO_VERIFY_STARTED_AT);
  if (!AUTO_HISTORY_RECONCILE_ENABLED) {
    return { skipped: true, reason: "Automatic history reconciliation is disabled." };
  }
  if (!paymentsConfigured) {
    return { skipped: true, reason: "CamPay credentials are not configured." };
  }
  if (!cutoffIso) {
    return {
      skipped: true,
      reason: "Automatic history reconciliation cutoff is invalid.",
    };
  }

  const now = Date.now();
  const cooldownMs = Math.max(
    normalizeInteger(AUTO_HISTORY_RECONCILE_COOLDOWN_MS, 86400000),
    0
  );
  if (!force && cooldownMs > 0 && now - lastAutoHistoryReconcileAt < cooldownMs) {
    return {
      skipped: true,
      reason: "Automatic history reconciliation cooldown is active.",
      cutoff: cutoffIso,
    };
  }
  if (autoHistoryReconcileInFlight) {
    return {
      skipped: true,
      reason: "Automatic history reconciliation is already running.",
      cutoff: cutoffIso,
    };
  }

  const today = new Date().toISOString().slice(0, 10);
  const lookbackDays = clampInteger(
    AUTO_HISTORY_RECONCILE_LOOKBACK_DAYS,
    7,
    0,
    13
  );
  const cutoffDate = cutoffIso.slice(0, 10);
  const startDate = [addDays(today, -lookbackDays), cutoffDate]
    .filter(Boolean)
    .sort()
    .at(-1);

  lastAutoHistoryReconcileAt = now;
  autoHistoryReconcileInFlight = (async () => {
    const summary = await reconcileCampayHistory(supabase, {
      startDate,
      endDate: today,
      dryRun,
      createdAfter: cutoffIso,
    });
    return {
      ...summary,
      skipped: false,
      automatic: true,
      cooldown_ms: cooldownMs,
    };
  })();

  try {
    return await autoHistoryReconcileInFlight;
  } finally {
    autoHistoryReconcileInFlight = null;
  }
};

const scanPaidPendingCampayVotes = async (supabase) => {
  const historySummary = await autoReconcileCampayHistory(supabase, {
    force: true,
    dryRun: true,
  });
  const paidPending = await fetchPaidPendingCampayVotes(supabase);
  return {
    historySummary,
    paidPendingSummary: paidPending.summary,
    paidPendingPayments: paidPending.payments,
  };
};

const recoverPaidPendingCampayVotes = async (supabase, { limit = 100 } = {}) => {
  const scanSummary = await scanPaidPendingCampayVotes(supabase);
  const paidPending = await fetchPaidPendingCampayVotes(supabase, { limit });
  const results = [];
  let recovered = 0;
  let pending = 0;
  let failed = 0;
  let errors = 0;
  let votesRecovered = 0;
  let amountRecoveredXaf = 0;

  for (const payment of paidPending.payments) {
    try {
      let paymentForVerification = payment;
      const matchedReference = normalizeText(payment.matched_reference);
      const existingReference = normalizeText(payment.campay_reference);
      if (!existingReference && matchedReference) {
        const now = new Date().toISOString();
        const { data: updatedPayment, error: updateError } = await supabase
          .from("miss_panache_vote_payments")
          .update({
            campay_reference: matchedReference,
            provider_payload: {
              ...(payment.provider_payload || {}),
              paid_pending_recovery: {
                reference: matchedReference,
                external_reference:
                  normalizeText(payment.matched_external_reference) ||
                  payment.tx_ref,
                recovered_at: now,
              },
            },
            updated_at: now,
          })
          .eq("id", payment.id)
          .select(
            `${PAYMENT_COLUMNS}, nominee:miss_panache_award_nominees(${NOMINEE_COLUMNS}), category:miss_panache_award_categories(${CATEGORY_COLUMNS})`
          )
          .single();

        if (updateError) {
          throw updateError;
        }
        paymentForVerification = updatedPayment;
      }

      const verification = await verifyPaymentRow(
        supabase,
        paymentForVerification
      );
      if (verification.status === "success") {
        recovered += 1;
        votesRecovered += normalizeInteger(payment.vote_count, 0);
        amountRecoveredXaf += normalizeInteger(payment.amount_xaf, 0);
      } else if (verification.status === "pending") {
        pending += 1;
      } else if (verification.status === "failed") {
        failed += 1;
      }

      results.push({
        tx_ref: payment.tx_ref,
        reference:
          verification.payment?.campay_reference || matchedReference || null,
        status: verification.status,
        message: verification.message,
        nominee: payment.nominee?.name || payment.nominee_id,
        vote_count: payment.vote_count,
        amount_xaf: payment.amount_xaf,
      });
    } catch (error) {
      errors += 1;
      results.push({
        tx_ref: payment.tx_ref,
        reference: payment.campay_reference || payment.matched_reference || null,
        status: "error",
        message: error instanceof Error ? error.message : String(error),
        nominee: payment.nominee?.name || payment.nominee_id,
        vote_count: payment.vote_count,
        amount_xaf: payment.amount_xaf,
      });
    }
  }

  return {
    scanSummary,
    checked: paidPending.payments.length,
    recoverable: paidPending.summary.count,
    recovered,
    pending,
    failed,
    errors,
    votes_recovered: votesRecovered,
    amount_recovered_xaf: amountRecoveredXaf,
    results: results.slice(0, 200),
  };
};

const handleGet = async (req, res, supabase) => {
  const includeDrafts = isDashboardRequest(req);
  let autoHistoryReconcileSummary = null;
  try {
    autoHistoryReconcileSummary = await autoReconcileCampayHistory(supabase);
  } catch (error) {
    console.error("Miss Panache automatic history reconciliation failed", {
      message: error instanceof Error ? error.message : String(error),
      code: error?.code || "",
    });
    autoHistoryReconcileSummary = {
      skipped: true,
      reason: "Automatic history reconciliation failed.",
      message: error instanceof Error ? error.message : String(error),
    };
  }
  let autoVerifySummary = null;
  try {
    autoVerifySummary = await autoVerifyRecentCampayVotes(supabase);
  } catch (error) {
    console.error("Miss Panache auto verification failed", {
      message: error instanceof Error ? error.message : String(error),
      code: error?.code || "",
    });
    autoVerifySummary = {
      skipped: true,
      reason: "Auto verification failed.",
      message: error instanceof Error ? error.message : String(error),
    };
  }
  const voting = await fetchVotingPayload(supabase, includeDrafts);

  if (!includeDrafts) {
    setPublicCacheHeaders(res);
  }

  sendJson(res, 200, {
    voting,
    ...(includeDrafts ? { autoHistoryReconcileSummary, autoVerifySummary } : {}),
  });
};

const handlePost = async (req, res, supabase) => {
  const body = parseBody(req);
  const action = normalizeText(body.action);

  if (action === "initializeCampayVote") {
    const result = await initializeCampayVote(req, supabase, body);
    sendJson(res, 200, result);
    return;
  }

  if (action === "verifyCampayVote") {
    const result = await verifyCampayVote(supabase, body);
    sendJson(res, 200, result);
    return;
  }

  assertAdmin(req);

  if (action === "verifyPendingCampayVotes") {
    const verifySummary = await verifyPendingCampayVotes(supabase, body.limit);
    const voting = await fetchVotingPayload(supabase, true);
    sendJson(res, 200, { verifySummary, voting });
    return;
  }

  if (action === "autoVerifyRecentCampayVotes") {
    const autoVerifySummary = await autoVerifyRecentCampayVotes(supabase, {
      force: true,
      limit: body.limit,
    });
    const voting = await fetchVotingPayload(supabase, true);
    sendJson(res, 200, { autoVerifySummary, voting });
    return;
  }

  if (action === "reconcileCampayHistory") {
    const reconcileSummary = await reconcileCampayHistory(supabase, body);
    const voting = await fetchVotingPayload(supabase, true);
    sendJson(res, 200, { reconcileSummary, voting });
    return;
  }

  if (action === "scanPaidPendingCampayVotes") {
    const paidPendingScanSummary = await scanPaidPendingCampayVotes(supabase);
    const voting = await fetchVotingPayload(supabase, true);
    sendJson(res, 200, { paidPendingScanSummary, voting });
    return;
  }

  if (action === "recoverPaidPendingCampayVotes") {
    const recoverPaidPendingSummary = await recoverPaidPendingCampayVotes(
      supabase,
      { limit: body.limit }
    );
    const voting = await fetchVotingPayload(supabase, true);
    sendJson(res, 200, { recoverPaidPendingSummary, voting });
    return;
  }

  if (action === "createCategory") {
    const category = sanitizeCategory(body.category);
    const result = await mutateAndReturnVoting(supabase, async () => {
      const { data, error } = await supabase
        .from("miss_panache_award_categories")
        .insert(category)
        .select(CATEGORY_COLUMNS)
        .single();
      if (error) {
        throw error;
      }
      return { category: data };
    });
    sendJson(res, 200, result);
    return;
  }

  if (action === "updateCategory") {
    const id = normalizeText(body.id);
    if (!id) {
      throw new Error("Category id is required.");
    }

    const updates = sanitizeCategory(body.updates);
    const result = await mutateAndReturnVoting(supabase, async () => {
      const { data, error } = await supabase
        .from("miss_panache_award_categories")
        .update(withUpdatedAt(updates))
        .eq("id", id)
        .select(CATEGORY_COLUMNS)
        .single();
      if (error) {
        throw error;
      }
      return { category: data };
    });
    sendJson(res, 200, result);
    return;
  }

  if (action === "deleteCategory") {
    const id = normalizeText(body.id);
    if (!id) {
      throw new Error("Category id is required.");
    }

    const result = await mutateAndReturnVoting(supabase, async () => {
      const { error } = await supabase
        .from("miss_panache_award_categories")
        .delete()
        .eq("id", id);
      if (error) {
        throw error;
      }
      return {};
    });
    sendJson(res, 200, result);
    return;
  }

  if (action === "createNominee") {
    const nominee = sanitizeNominee(body.nominee);
    const result = await mutateAndReturnVoting(supabase, async () => {
      const { data, error } = await supabase
        .from("miss_panache_award_nominees")
        .insert(nominee)
        .select(NOMINEE_COLUMNS)
        .single();
      if (error) {
        throw error;
      }
      return { nominee: data };
    });
    sendJson(res, 200, result);
    return;
  }

  if (action === "updateNominee") {
    const id = normalizeText(body.id);
    if (!id) {
      throw new Error("Nominee id is required.");
    }

    const updates = sanitizeNominee(body.updates);
    const result = await mutateAndReturnVoting(supabase, async () => {
      const { data, error } = await supabase
        .from("miss_panache_award_nominees")
        .update(withUpdatedAt(updates))
        .eq("id", id)
        .select(NOMINEE_COLUMNS)
        .single();
      if (error) {
        throw error;
      }
      return { nominee: data };
    });
    sendJson(res, 200, result);
    return;
  }

  if (action === "deleteNominee") {
    const id = normalizeText(body.id);
    if (!id) {
      throw new Error("Nominee id is required.");
    }

    const result = await mutateAndReturnVoting(supabase, async () => {
      const { error } = await supabase
        .from("miss_panache_award_nominees")
        .delete()
        .eq("id", id);
      if (error) {
        throw error;
      }
      return {};
    });
    sendJson(res, 200, result);
    return;
  }

  if (action === "uploadNomineePhoto") {
    const upload = decodeUpload(body);
    const { error } = await supabase.storage
      .from(MISS_PANACHE_PHOTO_BUCKET)
      .upload(upload.path, upload.buffer, {
        contentType: upload.contentType,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from(MISS_PANACHE_PHOTO_BUCKET)
      .getPublicUrl(upload.path);

    sendJson(res, 200, {
      photoUrl: data.publicUrl,
      photo_url: data.publicUrl,
      path: upload.path,
    });
    return;
  }

  if (action === "importNomineesCsv") {
    const csv = normalizeText(body.csv || body.csvText);
    if (!csv) {
      throw new Error("CSV content is required.");
    }

    const importSummary = await importCsv(supabase, csv);
    const voting = await fetchVotingPayload(supabase, true);
    sendJson(res, 200, { importSummary, voting });
    return;
  }

  sendJson(res, 400, { message: "Unsupported Miss Panache voting action." });
};

export default async function handler(req, res) {
  try {
    
    // 1. Get the Authorization header from cron-job.org
    const authHeader = req.headers['authorization'];

    // 2. Validate the secret token against your Vercel Environment Variable
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // If missing or wrong, block the request immediately
      sendJson(res, 401, { message: "Unauthorized request. Missing or invalid security token." });
      return;
    }

    const supabase = getSupabase();

    if (req.method === "GET") {
      await handleGet(req, res, supabase);
      return;
    }

    if (req.method === "POST") {
      await handlePost(req, res, supabase);
      return;
    }

    sendJson(res, 405, { message: "Method not allowed." });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    console.error("Miss Panache voting API error", {
      message: error.message,
      details: error.details || error.stack,
      hint: error.hint || "",
      code: error.code || "",
    });
    sendJson(res, statusCode, {
      message:
        error.message ||
        "Could not process the Miss Panache voting request.",
      details: error.details || "",
      hint: error.hint || "",
      code: error.code || "",
    });
  }
}

