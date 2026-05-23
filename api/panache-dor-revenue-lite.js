import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const DASHBOARD_ACCESS_KEY = process.env.DASHBOARD_ACCESS_KEY || "";
const VOTE_PRICE_XAF = Number.parseInt(process.env.PANACHE_DOR_VOTE_PRICE_XAF || "100", 10);
const PROCESSING_FEE_PER_VOTE_XAF = Number.parseInt(
  process.env.PANACHE_DOR_PROCESSING_FEE_PER_VOTE_XAF ||
    process.env.PROCESSING_FEE_PER_VOTE_XAF ||
    "0",
  10
);
const CARD_FEE_RATE = Number(process.env.PANACHE_DOR_CARD_FEE_RATE || process.env.CARD_FEE_RATE || 0.05);
const MOMO_FEE_RATE = Number(process.env.PANACHE_DOR_MOMO_FEE_RATE || process.env.MOMO_FEE_RATE || 0.02);
const CURRENCY = (process.env.PANACHE_DOR_CURRENCY || process.env.CURRENCY || "XAF").toUpperCase();

const PAYMENT_COLUMNS =
  "id, tx_ref, campay_reference, provider, status, vote_count, amount_xaf, currency, provider_status, provider_payload, verified_at, created_at, nominee:panache_dor_award_nominees(name, slug), category:panache_dor_award_categories(name, slug)";

const cardWords = ["card", "visa", "mastercard", "master card"];
const momoWords = ["momo", "mobile money", "mtn", "orange money", "orange", "wallet"];
const methodKeys = new Set([
  "payment_method",
  "payment_type",
  "payment_mode",
  "payment_channel",
  "method",
  "mode",
  "channel",
  "operator",
  "network",
  "brand",
  "gateway",
  "service",
]);

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
};

const normalizeInteger = (value, fallback = 0) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const moneyAmount = (value) => Math.round(Number(value || 0));

const normalizeKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

const isDashboardRequest = (req) => {
  const key =
    req.headers["x-dashboard-key"] ||
    req.headers["x-dashboard-access-key"] ||
    req.query?.access_key;
  return Boolean(DASHBOARD_ACCESS_KEY && key === DASHBOARD_ACCESS_KEY);
};

const assertAdmin = (req) => {
  if (!isDashboardRequest(req)) {
    const error = new Error("Invalid dashboard access code.");
    error.statusCode = 401;
    throw error;
  }
};

const getSupabase = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service credentials are not configured.");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
};

const methodHintsFrom = (value, output = [], depth = 0) => {
  if (!value || depth > 5 || output.length > 80) {
    return output;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => methodHintsFrom(item, output, depth + 1));
    return output;
  }

  if (typeof value !== "object") {
    return output;
  }

  for (const [key, child] of Object.entries(value)) {
    const normalized = normalizeKey(key);
    if (
      normalized === "payment_options" ||
      normalized === "accepted_payment_options" ||
      normalized === "allowed_payment_options"
    ) {
      continue;
    }

    if (
      methodKeys.has(normalized) ||
      normalized.endsWith("_method") ||
      normalized.endsWith("_channel") ||
      normalized.endsWith("_type")
    ) {
      output.push(key);
      if (["string", "number", "boolean"].includes(typeof child)) {
        output.push(String(child));
      }
    }

    methodHintsFrom(child, output, depth + 1);
  }

  return output;
};

const detectPaymentMethod = (...sources) => {
  const haystack = sources.flatMap((source) => methodHintsFrom(source)).join(" ").toLowerCase();
  if (cardWords.some((word) => haystack.includes(word))) {
    return { method: "card", confidence: "detected" };
  }
  if (momoWords.some((word) => haystack.includes(word))) {
    return { method: "momo", confidence: "detected" };
  }
  return { method: "momo", confidence: "assumed" };
};

const maskReference = (value) => {
  const text = String(value || "").trim();
  if (!text || text.length <= 10) {
    return text;
  }
  return `${text.slice(0, 4)}...${text.slice(-6)}`;
};

const fetchCompletedPayments = async (supabase) => {
  const pageSize = 1000;
  const payments = [];

  for (let page = 0; page < 10; page += 1) {
    const { data = [], error } = await supabase
      .from("panache_dor_vote_payments")
      .select(PAYMENT_COLUMNS)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .range(page * pageSize, page * pageSize + pageSize - 1);

    if (error) {
      if (
        error.code === "42P01" ||
        error.code === "PGRST205" ||
        /does not exist|could not find/i.test(error.message || "")
      ) {
        return [];
      }
      throw error;
    }

    payments.push(...data);
    if (data.length < pageSize) {
      break;
    }
  }

  return payments;
};

const fetchTotalVotes = async (supabase, payments) => {
  const { data, error } = await supabase
    .from("panache_dor_nominee_vote_counts")
    .select("total_votes");

  if (!error) {
    return {
      totalVotes: (data || []).reduce(
        (total, row) => total + normalizeInteger(row.total_votes, 0),
        0
      ),
      source: "panache_dor_nominee_vote_counts",
      viewAvailable: true,
    };
  }

  if (
    error.code !== "42P01" &&
    error.code !== "PGRST205" &&
    !/does not exist|could not find/i.test(error.message || "")
  ) {
    throw error;
  }

  return {
    totalVotes: payments.reduce(
      (total, payment) => total + normalizeInteger(payment.vote_count, 0),
      0
    ),
    source: "completed_payment_rows_fallback",
    viewAvailable: false,
  };
};

const classifyPayment = (payment) => {
  const verifyPayload = payment.provider_payload?.verify_response || null;
  const historyPayload = payment.provider_payload?.history_reconciliation || null;
  const method = detectPaymentMethod(verifyPayload, historyPayload);

  return {
    tx_ref: payment.tx_ref,
    reference: payment.campay_reference,
    masked_reference: maskReference(payment.campay_reference),
    nominee: payment.nominee?.name || "Unknown nominee",
    category: payment.category?.name || "Unknown category",
    vote_count: normalizeInteger(payment.vote_count, 0),
    amount_xaf: moneyAmount(payment.amount_xaf),
    method: method.method,
    confidence: method.confidence,
    provider_status: String(
      verifyPayload?.status || payment.provider_status || ""
    ).toUpperCase() || null,
  };
};

const buildRevenueSummary = async (supabase) => {
  const payments = await fetchCompletedPayments(supabase);
  const voteInfo = await fetchTotalVotes(supabase, payments);
  const classified = payments.map(classifyPayment);
  const cardPayments = classified.filter((payment) => payment.method === "card");
  const momoDetected = classified.filter(
    (payment) => payment.method === "momo" && payment.confidence === "detected"
  );
  const momoAssumed = classified.filter(
    (payment) => payment.method === "momo" && payment.confidence === "assumed"
  );
  const cardVotes = cardPayments.reduce((total, payment) => total + payment.vote_count, 0);
  const completedPaymentVotes = classified.reduce((total, payment) => total + payment.vote_count, 0);
  const totalVotes = voteInfo.totalVotes;
  const momoVotes = Math.max(totalVotes - cardVotes, 0);
  const grossVoteRevenueXaf = moneyAmount(totalVotes * VOTE_PRICE_XAF);
  const cardGrossRevenueXaf = moneyAmount(cardVotes * VOTE_PRICE_XAF);
  const momoGrossRevenueXaf = moneyAmount(momoVotes * VOTE_PRICE_XAF);
  const processingFeeIgnoredXaf = moneyAmount(totalVotes * PROCESSING_FEE_PER_VOTE_XAF);
  const totalCollectedEstimateXaf = grossVoteRevenueXaf;
  const cardProviderFeeXaf = moneyAmount(cardGrossRevenueXaf * CARD_FEE_RATE);
  const momoProviderFeeXaf = moneyAmount(momoGrossRevenueXaf * MOMO_FEE_RATE);
  const providerFeesXaf = cardProviderFeeXaf + momoProviderFeeXaf;

  return {
    generated_at: new Date().toISOString(),
    currency: CURRENCY,
    vote_price_xaf: VOTE_PRICE_XAF,
    processing_fee_per_vote_xaf: PROCESSING_FEE_PER_VOTE_XAF,
    card_fee_rate: CARD_FEE_RATE,
    momo_fee_rate: MOMO_FEE_RATE,
    total_votes: totalVotes,
    total_votes_source: voteInfo.source,
    vote_count_view_available: voteInfo.viewAvailable,
    completed_payment_votes: completedPaymentVotes,
    vote_gap: totalVotes - completedPaymentVotes,
    completed_payment_count: payments.length,
    successful_payment_count: payments.length,
    gross_vote_revenue_xaf: grossVoteRevenueXaf,
    estimated_processing_fee_collected_xaf: 0,
    ignored_processing_fee_xaf: processingFeeIgnoredXaf,
    estimated_total_collected_xaf: totalCollectedEstimateXaf,
    card_payment_count: cardPayments.length,
    card_votes: cardVotes,
    card_gross_revenue_xaf: cardGrossRevenueXaf,
    estimated_card_provider_fee_xaf: cardProviderFeeXaf,
    momo_payment_count: momoDetected.length + momoAssumed.length,
    momo_detected_payment_count: momoDetected.length,
    momo_assumed_payment_count: momoAssumed.length,
    momo_votes: momoVotes,
    momo_gross_revenue_xaf: momoGrossRevenueXaf,
    estimated_momo_provider_fee_xaf: momoProviderFeeXaf,
    estimated_provider_fees_xaf: providerFeesXaf,
    estimated_net_revenue_xaf: moneyAmount(grossVoteRevenueXaf - providerFeesXaf),
    campay_checked_payment_count: payments.filter(
      (payment) => payment.provider_payload?.verify_response
    ).length,
    campay_failed_check_count: 0,
    recent_classifications: classified.slice(0, 25).map((payment) => ({
      tx_ref: maskReference(payment.tx_ref),
      reference: payment.masked_reference,
      nominee: payment.nominee,
      category: payment.category,
      votes: payment.vote_count,
      amount_xaf: payment.amount_xaf,
      method: payment.method,
      confidence: payment.confidence,
      provider_status: payment.provider_status,
      campay_checked: Boolean(payment.provider_status),
      campay_error: null,
    })),
    assumptions: [
      "Total votes come from Supabase nominee vote counts when available.",
      "Card votes are detected from stored Campay verification payload fields, not from the original payment_options request.",
      "All non-card votes are treated as MOMO for fee estimation.",
      "Estimated total collected ignores any extra per-vote processing fee and uses vote-price revenue only.",
      "Provider fee estimates are applied to vote-price revenue only.",
    ],
  };
};

export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      sendJson(res, 204, {});
      return;
    }
    if (req.method !== "GET") {
      sendJson(res, 405, { message: "Method not allowed." });
      return;
    }
    assertAdmin(req);
    const revenue = await buildRevenueSummary(getSupabase());
    sendJson(res, 200, { revenue });
  } catch (error) {
    sendJson(res, error.statusCode || 500, {
      message: error.message || "Could not calculate Panache D'or revenue analytics.",
      details: error.details || "",
      code: error.code || "",
    });
  }
}
