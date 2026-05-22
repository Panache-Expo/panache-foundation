import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const DASHBOARD_ACCESS_KEY = process.env.DASHBOARD_ACCESS_KEY || "";

const CAMPAY_BASE_URL = (
  process.env.PANACHE_DOR_CAMPAY_BASE_URL ||
  process.env.CAMPAY_BASE_URL ||
  "https://www.campay.net"
).replace(/\/+$/, "");
const CAMPAY_APP_USERNAME =
  process.env.PANACHE_DOR_CAMPAY_APP_USERNAME ||
  process.env.CAMPAY_APP_USERNAME ||
  process.env.CAMPAY_USERNAME ||
  "";
const CAMPAY_APP_PASSWORD =
  process.env.PANACHE_DOR_CAMPAY_APP_PASSWORD ||
  process.env.CAMPAY_APP_PASSWORD ||
  process.env.CAMPAY_PASSWORD ||
  "";
const CAMPAY_TOKEN_TTL_MS = Number.parseInt(
  process.env.PANACHE_DOR_CAMPAY_TOKEN_TTL_MS ||
    process.env.CAMPAY_TOKEN_TTL_MS ||
    String(45 * 60 * 1000),
  10
);

const VOTE_PRICE_XAF = Number.parseInt(
  process.env.PANACHE_DOR_VOTE_PRICE_XAF || "100",
  10
);
const PROCESSING_FEE_PER_VOTE_XAF = Number.parseInt(
  process.env.PANACHE_DOR_PROCESSING_FEE_PER_VOTE_XAF ||
    process.env.PROCESSING_FEE_PER_VOTE_XAF ||
    "0",
  10
);
const CARD_FEE_RATE = Number(
  process.env.PANACHE_DOR_CARD_FEE_RATE || process.env.CARD_FEE_RATE || 0.05
);
const MOMO_FEE_RATE = Number(
  process.env.PANACHE_DOR_MOMO_FEE_RATE || process.env.MOMO_FEE_RATE || 0.02
);
const CURRENCY = (
  process.env.PANACHE_DOR_CURRENCY || process.env.CURRENCY || "XAF"
).toUpperCase();

const PAYMENT_COLUMNS =
  "id, tx_ref, campay_reference, provider, status, vote_count, vote_price_xaf, processing_fee_per_vote_xaf, amount_xaf, currency, provider_status, provider_payload, verified_at, created_at, nominee:panache_dor_award_nominees(name, slug), category:panache_dor_award_categories(name, slug)";

const completedProviderStatuses = new Set(["SUCCESSFUL", "SUCCESS"]);
const cardKeywords = [
  "card",
  "visa",
  "mastercard",
  "master card",
  "credit",
  "debit",
];
const momoKeywords = [
  "momo",
  "mobile money",
  "mtn",
  "orange",
  "om",
  "wallet",
];

let campayTokenCache = {
  token: "",
  expiresAt: 0,
};

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

const normalizeInteger = (value, fallback = 0) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const moneyAmount = (value) => Math.round(Number(value || 0));

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
    auth: {
      persistSession: false,
    },
  });
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

const getCampayToken = async () => {
  if (!CAMPAY_APP_USERNAME || !CAMPAY_APP_PASSWORD) {
    const error = new Error("CamPay credentials are not configured.");
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
    const error = new Error(payload?.message || "CamPay authentication failed.");
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

const campayRequest = async (endpoint, retry = true) => {
  const token = await getCampayToken();
  const response = await fetch(`${CAMPAY_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      Accept: "application/json",
    },
  });
  const payload = await readJsonResponse(response);

  if (response.status === 401 && retry) {
    campayTokenCache = { token: "", expiresAt: 0 };
    return campayRequest(endpoint, false);
  }

  if (!response.ok) {
    const error = new Error(payload?.message || "CamPay request failed.");
    error.statusCode = response.status || 502;
    error.details = payload;
    throw error;
  }

  return payload;
};

const fetchCampayTransaction = async (reference) =>
  campayRequest(`/api/transaction/${encodeURIComponent(reference)}/`);

const collectSearchableStrings = (value, output = [], depth = 0) => {
  if (output.length > 80 || depth > 5 || value === undefined || value === null) {
    return output;
  }

  if (["string", "number", "boolean"].includes(typeof value)) {
    output.push(String(value));
    return output;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectSearchableStrings(item, output, depth + 1);
    }
    return output;
  }

  if (typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      output.push(key);
      collectSearchableStrings(child, output, depth + 1);
    }
  }

  return output;
};

const detectPaymentMethod = (...sources) => {
  const haystack = sources
    .flatMap((source) => collectSearchableStrings(source))
    .join(" ")
    .toLowerCase();

  if (cardKeywords.some((keyword) => haystack.includes(keyword))) {
    return {
      method: "card",
      confidence: "detected",
    };
  }

  if (momoKeywords.some((keyword) => haystack.includes(keyword))) {
    return {
      method: "momo",
      confidence: "detected",
    };
  }

  return {
    method: "momo",
    confidence: "assumed",
  };
};

const maskReference = (value) => {
  const text = normalizeText(value);
  if (!text) {
    return "";
  }
  if (text.length <= 10) {
    return text;
  }
  return `${text.slice(0, 4)}...${text.slice(-6)}`;
};

const fetchAllCompletedPayments = async (supabase) => {
  const pageSize = 1000;
  const payments = [];

  for (let page = 0; page < 10; page += 1) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data = [], error } = await supabase
      .from("panache_dor_vote_payments")
      .select(PAYMENT_COLUMNS)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .range(from, to);

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

const fetchTotalVotesFromSupabase = async (supabase, completedPayments) => {
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
    totalVotes: completedPayments.reduce(
      (total, payment) => total + normalizeInteger(payment.vote_count, 0),
      0
    ),
    source: "completed_payment_rows_fallback",
    viewAvailable: false,
  };
};

const classifyPayment = async (payment) => {
  const reference = normalizeText(payment.campay_reference);
  let transaction = null;
  let campayChecked = false;
  let campayError = "";

  if (reference) {
    try {
      transaction = await fetchCampayTransaction(reference);
      campayChecked = true;
    } catch (error) {
      campayError = error instanceof Error ? error.message : String(error);
    }
  }

  const providerStatus = String(
    transaction?.status || payment.provider_status || ""
  ).toUpperCase();
  const successful =
    !providerStatus || completedProviderStatuses.has(providerStatus) || payment.status === "completed";
  const method = detectPaymentMethod(transaction, payment.provider_payload, payment);

  return {
    id: payment.id,
    tx_ref: payment.tx_ref,
    reference,
    masked_reference: maskReference(reference),
    nominee: payment.nominee?.name || "Unknown nominee",
    category: payment.category?.name || "Unknown category",
    vote_count: normalizeInteger(payment.vote_count, 0),
    amount_xaf: moneyAmount(payment.amount_xaf),
    method: method.method,
    confidence: method.confidence,
    provider_status: providerStatus || null,
    successful,
    campay_checked: campayChecked,
    campay_error: campayError || null,
  };
};

const classifyPayments = async (payments) => {
  const results = [];
  const batchSize = 6;

  for (let index = 0; index < payments.length; index += batchSize) {
    const batch = payments.slice(index, index + batchSize);
    results.push(...(await Promise.all(batch.map(classifyPayment))));
  }

  return results;
};

const buildRevenueSummary = async (supabase) => {
  const completedPayments = await fetchAllCompletedPayments(supabase);
  const totalVotesInfo = await fetchTotalVotesFromSupabase(supabase, completedPayments);
  const classifiedPayments = await classifyPayments(completedPayments);

  const successfulClassifications = classifiedPayments.filter(
    (payment) => payment.successful
  );
  const cardClassifications = successfulClassifications.filter(
    (payment) => payment.method === "card"
  );
  const detectedMomoClassifications = successfulClassifications.filter(
    (payment) => payment.method === "momo" && payment.confidence === "detected"
  );
  const assumedMomoClassifications = successfulClassifications.filter(
    (payment) => payment.method === "momo" && payment.confidence === "assumed"
  );

  const cardVotes = cardClassifications.reduce(
    (total, payment) => total + payment.vote_count,
    0
  );
  const completedPaymentVotes = successfulClassifications.reduce(
    (total, payment) => total + payment.vote_count,
    0
  );
  const totalVotes = totalVotesInfo.totalVotes;
  const momoVotes = Math.max(totalVotes - cardVotes, 0);
  const grossVoteRevenueXaf = moneyAmount(totalVotes * VOTE_PRICE_XAF);
  const cardGrossRevenueXaf = moneyAmount(cardVotes * VOTE_PRICE_XAF);
  const momoGrossRevenueXaf = moneyAmount(momoVotes * VOTE_PRICE_XAF);
  const processingFeeCollectedXaf = moneyAmount(
    totalVotes * PROCESSING_FEE_PER_VOTE_XAF
  );
  const totalCollectedEstimateXaf = moneyAmount(
    totalVotes * (VOTE_PRICE_XAF + PROCESSING_FEE_PER_VOTE_XAF)
  );
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
    total_votes_source: totalVotesInfo.source,
    vote_count_view_available: totalVotesInfo.viewAvailable,
    completed_payment_votes: completedPaymentVotes,
    vote_gap: totalVotes - completedPaymentVotes,
    completed_payment_count: completedPayments.length,
    successful_payment_count: successfulClassifications.length,
    gross_vote_revenue_xaf: grossVoteRevenueXaf,
    estimated_processing_fee_collected_xaf: processingFeeCollectedXaf,
    estimated_total_collected_xaf: totalCollectedEstimateXaf,
    card_payment_count: cardClassifications.length,
    card_votes: cardVotes,
    card_gross_revenue_xaf: cardGrossRevenueXaf,
    estimated_card_provider_fee_xaf: cardProviderFeeXaf,
    momo_payment_count:
      detectedMomoClassifications.length + assumedMomoClassifications.length,
    momo_detected_payment_count: detectedMomoClassifications.length,
    momo_assumed_payment_count: assumedMomoClassifications.length,
    momo_votes: momoVotes,
    momo_gross_revenue_xaf: momoGrossRevenueXaf,
    estimated_momo_provider_fee_xaf: momoProviderFeeXaf,
    estimated_provider_fees_xaf: providerFeesXaf,
    estimated_net_revenue_xaf: moneyAmount(
      grossVoteRevenueXaf + processingFeeCollectedXaf - providerFeesXaf
    ),
    campay_checked_payment_count: classifiedPayments.filter(
      (payment) => payment.campay_checked
    ).length,
    campay_failed_check_count: classifiedPayments.filter(
      (payment) => payment.campay_error
    ).length,
    recent_classifications: classifiedPayments.slice(0, 25).map((payment) => ({
      tx_ref: maskReference(payment.tx_ref),
      reference: payment.masked_reference,
      nominee: payment.nominee,
      category: payment.category,
      votes: payment.vote_count,
      amount_xaf: payment.amount_xaf,
      method: payment.method,
      confidence: payment.confidence,
      provider_status: payment.provider_status,
      campay_checked: payment.campay_checked,
      campay_error: payment.campay_error,
    })),
    assumptions: [
      "Total votes come from Supabase nominee vote counts when available.",
      "Card votes are detected from successful Campay transaction/payment metadata.",
      "All non-card votes are treated as MOMO for fee estimation.",
      "Provider fee estimates are applied to vote-price revenue only, not to any extra processing fee collected.",
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
    const supabase = getSupabase();
    const revenue = await buildRevenueSummary(supabase);
    sendJson(res, 200, { revenue });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    console.error("Panache D'or revenue API error", {
      message: error.message,
      details: error.details || error.stack,
      code: error.code || "",
    });
    sendJson(res, statusCode, {
      message:
        error.message || "Could not calculate Panache D'or revenue analytics.",
      details: error.details || "",
      code: error.code || "",
    });
  }
}
