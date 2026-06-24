import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const DASHBOARD_ACCESS_KEY =
  process.env.DASHBOARD_ACCESS_KEY || process.env.PANACHE_DASHBOARD_ACCESS_KEY || "";
const CURRENCY = (
  process.env.PANACHE_REVENUE_CURRENCY ||
  process.env.CURRENCY ||
  "XAF"
).toUpperCase();
const GLOBAL_WITHDRAWAL_FEE_RATE = Number(
  process.env.PANACHE_REVENUE_CAMPAY_DISBURSEMENT_FEE_RATE ||
    process.env.PANACHE_DOR_CAMPAY_DISBURSEMENT_FEE_RATE ||
    "0.02"
);

const completedStatuses = new Set(["completed"]);
const pendingStatuses = new Set(["pending"]);
const failedStatuses = new Set(["failed", "cancelled", "canceled"]);
const successfulProviderStatuses = new Set(["SUCCESS", "SUCCESSFUL", "COMPLETED"]);

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

const voteSources = [
  {
    key: "panache_dor",
    label: "Panache D'or votes",
    table: "panache_dor_vote_payments",
    nomineeRelation: "panache_dor_award_nominees",
    categoryRelation: "panache_dor_award_categories",
    cardFeeRate: Number(
      process.env.PANACHE_DOR_CARD_FEE_RATE || process.env.CARD_FEE_RATE || 0.05
    ),
    momoFeeRate: Number(
      process.env.PANACHE_DOR_MOMO_FEE_RATE || process.env.MOMO_FEE_RATE || 0.02
    ),
  },
  {
    key: "panache_360",
    label: "Panache 360 votes",
    table: "panache_360_vote_payments",
    nomineeRelation: "panache_360_award_nominees",
    categoryRelation: "panache_360_award_categories",
    cardFeeRate: Number(
      process.env.PANACHE_360_CARD_FEE_RATE ||
        process.env.CARD_FEE_RATE ||
        0.05
    ),
    momoFeeRate: Number(
      process.env.PANACHE_360_MOMO_FEE_RATE ||
      process.env.MOMO_FEE_RATE ||
        0.02
    ),
  },
  {
    key: "miss_panache",
    label: "Miss Panache votes",
    table: "miss_panache_vote_payments",
    nomineeRelation: "miss_panache_award_nominees",
    categoryRelation: "miss_panache_award_categories",
    cardFeeRate: Number(
      process.env.MISS_PANACHE_CARD_FEE_RATE ||
        process.env.CARD_FEE_RATE ||
        0.05
    ),
    momoFeeRate: Number(
      process.env.MISS_PANACHE_MOMO_FEE_RATE ||
        process.env.MOMO_FEE_RATE ||
        0.02
    ),
  },
];

const ticketFeeRates = {
  card: Number(
    process.env.EVENT_TICKETS_CARD_FEE_RATE || process.env.CARD_FEE_RATE || 0.05
  ),
  momo: Number(
    process.env.EVENT_TICKETS_MOMO_FEE_RATE || process.env.MOMO_FEE_RATE || 0.02
  ),
};

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
};

const normalizeText = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

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

const maskReference = (value) => {
  const text = normalizeText(value);
  if (!text || text.length <= 10) {
    return text;
  }
  return `${text.slice(0, 4)}...${text.slice(-6)}`;
};

const getAccessKey = (req) =>
  normalizeText(
    req.headers["x-dashboard-key"] ||
      req.headers["x-dashboard-access-key"] ||
      req.query?.access_key
  );

const assertAdmin = (req) => {
  if (!DASHBOARD_ACCESS_KEY || getAccessKey(req) !== DASHBOARD_ACCESS_KEY) {
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
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-client-info": "panache-revenue-api" } },
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

const classifyStatus = (status) => {
  const normalized = normalizeText(status).toLowerCase();
  if (completedStatuses.has(normalized)) return "completed";
  if (pendingStatuses.has(normalized)) return "pending";
  if (failedStatuses.has(normalized)) return "failed";
  return normalized || "unknown";
};

const getRevenueDate = (row) =>
  String(row.verified_at || row.transaction_date || row.created_at || "")
    .slice(0, 10) || "unknown";

const addMoney = (map, key, amount) => {
  map.set(key, moneyAmount((map.get(key) || 0) + amount));
};

const addMetric = (map, key, updates) => {
  const current = map.get(key) || {};
  map.set(key, {
    ...current,
    ...Object.fromEntries(
      Object.entries(updates).map(([field, value]) => [
        field,
        moneyAmount((current[field] || 0) + value),
      ])
    ),
  });
};

const fetchAll = async (supabase, table, select, orderColumn = "created_at") => {
  const pageSize = 1000;
  const rows = [];

  for (let page = 0; page < 20; page += 1) {
    const { data = [], error } = await supabase
      .from(table)
      .select(select)
      .order(orderColumn, { ascending: false, nullsFirst: false })
      .range(page * pageSize, page * pageSize + pageSize - 1);

    if (error) {
      if (
        error.code === "42P01" ||
        error.code === "PGRST205" ||
        /does not exist|could not find/i.test(error.message || "")
      ) {
        return { rows: [], unavailable: true, error: error.message };
      }
      throw error;
    }

    rows.push(...data);
    if (data.length < pageSize) {
      break;
    }
  }

  return { rows, unavailable: false, error: null };
};

const emptySourceSummary = (source) => ({
  key: source.key,
  label: source.label,
  gross_revenue_xaf: 0,
  estimated_provider_fees_xaf: 0,
  estimated_net_revenue_xaf: 0,
  completed_payment_count: 0,
  pending_payment_count: 0,
  failed_payment_count: 0,
  total_votes: 0,
  total_tickets: 0,
  total_admits: 0,
  unavailable: false,
  error: null,
});

const summarizeVoteSource = async (supabase, source) => {
  const select = [
    "id",
    "tx_ref",
    "campay_reference",
    "status",
    "vote_count",
    "amount_xaf",
    "currency",
    "provider_status",
    "provider_payload",
    "verified_at",
    "created_at",
    `nominee:${source.nomineeRelation}(name, slug)`,
    `category:${source.categoryRelation}(name, slug)`,
  ].join(", ");
  const { rows, unavailable, error } = await fetchAll(supabase, source.table, select);
  const summary = emptySourceSummary(source);
  summary.unavailable = unavailable;
  summary.error = error;

  const methodSplit = new Map();
  const daily = new Map();
  const categoryBreakdown = new Map();
  const recent = [];

  for (const payment of rows) {
    const status = classifyStatus(payment.status);
    if (status === "completed") summary.completed_payment_count += 1;
    else if (status === "pending") summary.pending_payment_count += 1;
    else if (status === "failed") summary.failed_payment_count += 1;

    if (status !== "completed") {
      continue;
    }

    const amount = moneyAmount(payment.amount_xaf);
    const votes = normalizeInteger(payment.vote_count, 0);
    const method = detectPaymentMethod(
      payment.provider_payload?.verify_response,
      payment.provider_payload?.history_reconciliation,
      payment.provider_payload
    );
    const feeRate = method.method === "card" ? source.cardFeeRate : source.momoFeeRate;
    const fee = moneyAmount(amount * feeRate);
    const date = getRevenueDate(payment);
    const categoryName = payment.category?.name || "Uncategorized";

    summary.gross_revenue_xaf += amount;
    summary.estimated_provider_fees_xaf += fee;
    summary.total_votes += votes;

    addMetric(methodSplit, method.method, {
      gross_revenue_xaf: amount,
      estimated_provider_fees_xaf: fee,
      payment_count: 1,
      votes,
    });
    addMetric(daily, date, {
      gross_revenue_xaf: amount,
      estimated_provider_fees_xaf: fee,
    });
    addMetric(categoryBreakdown, categoryName, {
      gross_revenue_xaf: amount,
      votes,
      payment_count: 1,
    });

    recent.push({
      source_key: source.key,
      source_label: source.label,
      kind: "vote",
      name: payment.nominee?.name || "Unknown nominee",
      group: categoryName,
      method: method.method,
      method_confidence: method.confidence,
      status,
      amount_xaf: amount,
      units: votes,
      unit_label: "votes",
      reference: maskReference(payment.campay_reference || payment.tx_ref),
      transaction_date: payment.verified_at || payment.created_at,
    });
  }

  summary.estimated_net_revenue_xaf = moneyAmount(
    summary.gross_revenue_xaf - summary.estimated_provider_fees_xaf
  );

  return {
    summary,
    methodSplit,
    daily,
    categoryBreakdown,
    recent,
  };
};

const summarizeTickets = async (supabase) => {
  const source = {
    key: "tickets",
    label: "Ticket revenue",
  };
  const select = [
    "id",
    "tx_ref",
    "campay_reference",
    "status",
    "provider",
    "amount_xaf",
    "currency",
    "provider_status",
    "provider_payload",
    "verified_at",
    "created_at",
    "event:event_ticket_events(slug, title, short_title, brand)",
    "package:event_ticket_packages(slug, name, price_xaf, admit_count)",
  ].join(", ");
  const { rows, unavailable, error } = await fetchAll(
    supabase,
    "event_ticket_orders",
    select
  );
  const summary = emptySourceSummary(source);
  summary.unavailable = unavailable;
  summary.error = error;

  const methodSplit = new Map();
  const daily = new Map();
  const packageBreakdown = new Map();
  const eventBreakdown = new Map();
  const recent = [];

  for (const order of rows) {
    const isComplimentaryPass =
      normalizeText(order.provider).toLowerCase() === "contestant-pass" ||
      normalizeText(order.provider).toLowerCase() === "contestant-access-pass" ||
      Boolean(order.provider_payload?.contestant_base_pass) ||
      Boolean(order.provider_payload?.contestant_access_pass) ||
      Boolean(order.provider_payload?.excluded_from_revenue);
    if (isComplimentaryPass) {
      continue;
    }

    const status = classifyStatus(order.status);
    if (status === "completed") summary.completed_payment_count += 1;
    else if (status === "pending") summary.pending_payment_count += 1;
    else if (status === "failed") summary.failed_payment_count += 1;

    if (status !== "completed") {
      continue;
    }

    const amount = moneyAmount(order.amount_xaf);
    const method = detectPaymentMethod(
      order.provider_payload?.verify_response,
      order.provider_payload
    );
    const feeRate =
      method.method === "card" ? ticketFeeRates.card : ticketFeeRates.momo;
    const fee = moneyAmount(amount * feeRate);
    const admits = normalizeInteger(order.package?.admit_count, 1);
    const date = getRevenueDate(order);
    const eventName =
      order.event?.short_title || order.event?.title || "Unknown ticket event";
    const packageName = order.package?.name || "Unknown package";
    const packageKey = `${eventName} - ${packageName}`;

    summary.gross_revenue_xaf += amount;
    summary.estimated_provider_fees_xaf += fee;
    summary.total_tickets += 1;
    summary.total_admits += admits;

    addMetric(methodSplit, method.method, {
      gross_revenue_xaf: amount,
      estimated_provider_fees_xaf: fee,
      payment_count: 1,
      tickets: 1,
      admits,
    });
    addMetric(daily, date, {
      gross_revenue_xaf: amount,
      estimated_provider_fees_xaf: fee,
    });
    addMetric(packageBreakdown, packageKey, {
      gross_revenue_xaf: amount,
      tickets: 1,
      admits,
    });
    addMetric(eventBreakdown, eventName, {
      gross_revenue_xaf: amount,
      tickets: 1,
      admits,
    });

    recent.push({
      source_key: "tickets",
      source_label: "Ticket revenue",
      kind: "ticket",
      name: packageName,
      group: eventName,
      method: method.method,
      method_confidence: method.confidence,
      status,
      amount_xaf: amount,
      units: admits,
      unit_label: "admits",
      reference: maskReference(order.campay_reference || order.tx_ref),
      transaction_date: order.verified_at || order.created_at,
    });
  }

  summary.estimated_net_revenue_xaf = moneyAmount(
    summary.gross_revenue_xaf - summary.estimated_provider_fees_xaf
  );

  return {
    summary,
    methodSplit,
    daily,
    packageBreakdown,
    eventBreakdown,
    recent,
  };
};

const fetchGlobalWithdrawals = async (supabase) => {
  const { rows, unavailable, error } = await fetchAll(
    supabase,
    "panache_dor_campay_transactions",
    "campay_reference, external_reference, direction, amount_xaf, currency, status, transaction_date, created_at, excluded_from_revenue",
    "transaction_date"
  );

  if (unavailable) {
    return {
      available: false,
      error,
      successful_withdrawals_xaf: 0,
      successful_withdrawal_fees_xaf: 0,
      successful_withdrawals_with_fees_xaf: 0,
      pending_withdrawals_xaf: 0,
      failed_withdrawals_xaf: 0,
      successful_withdrawal_count: 0,
      pending_withdrawal_count: 0,
      failed_withdrawal_count: 0,
    };
  }

  const summary = {
    available: true,
    error: null,
    successful_withdrawals_xaf: 0,
    successful_withdrawal_fees_xaf: 0,
    successful_withdrawals_with_fees_xaf: 0,
    pending_withdrawals_xaf: 0,
    failed_withdrawals_xaf: 0,
    successful_withdrawal_count: 0,
    pending_withdrawal_count: 0,
    failed_withdrawal_count: 0,
  };

  for (const row of rows) {
    if (
      normalizeText(row.direction).toLowerCase() !== "withdrawal" ||
      row.excluded_from_revenue
    ) {
      continue;
    }

    const amount = moneyAmount(row.amount_xaf);
    const status = normalizeText(row.status).toUpperCase();

    if (successfulProviderStatuses.has(status)) {
      const fee = moneyAmount(amount * GLOBAL_WITHDRAWAL_FEE_RATE);
      summary.successful_withdrawal_count += 1;
      summary.successful_withdrawals_xaf += amount;
      summary.successful_withdrawal_fees_xaf += fee;
      summary.successful_withdrawals_with_fees_xaf += amount + fee;
    } else if (["PENDING", "INITIATED", "PROCESSING"].includes(status)) {
      summary.pending_withdrawal_count += 1;
      summary.pending_withdrawals_xaf += amount;
    } else if (["FAILED", "CANCELLED", "CANCELED", "ERROR"].includes(status)) {
      summary.failed_withdrawal_count += 1;
      summary.failed_withdrawals_xaf += amount;
    }
  }

  return summary;
};

const mapToRows = (map, labelField = "name") =>
  Array.from(map.entries())
    .map(([key, value]) => ({
      [labelField]: key,
      ...value,
    }))
    .sort(
      (left, right) =>
        moneyAmount(right.gross_revenue_xaf) - moneyAmount(left.gross_revenue_xaf)
    );

const combineDaily = (sourceResults) => {
  const rowsByDate = new Map();

  for (const { summary, daily } of sourceResults) {
    for (const [date, row] of daily.entries()) {
      const current = rowsByDate.get(date) || {
        date,
        panache_dor_xaf: 0,
        panache_360_xaf: 0,
        miss_panache_xaf: 0,
        tickets_xaf: 0,
        total_xaf: 0,
      };
      const amount = moneyAmount(row.gross_revenue_xaf);
      if (summary.key === "panache_dor") current.panache_dor_xaf += amount;
      else if (summary.key === "panache_360") current.panache_360_xaf += amount;
      else if (summary.key === "miss_panache") current.miss_panache_xaf += amount;
      else if (summary.key === "tickets") current.tickets_xaf += amount;
      current.total_xaf += amount;
      rowsByDate.set(date, current);
    }
  }

  return Array.from(rowsByDate.values()).sort((left, right) =>
    left.date.localeCompare(right.date)
  );
};

const combineMethodSplit = (sourceResults) => {
  const combined = new Map();

  for (const { methodSplit } of sourceResults) {
    for (const [method, row] of methodSplit.entries()) {
      addMetric(combined, method, row);
    }
  }

  return mapToRows(combined, "method");
};

const buildRevenue = async (supabase) => {
  const voteResults = await Promise.all(
    voteSources.map((source) => summarizeVoteSource(supabase, source))
  );
  const ticketResult = await summarizeTickets(supabase);
  const sourceResults = [...voteResults, ticketResult];
  const withdrawals = await fetchGlobalWithdrawals(supabase);
  const sourceBreakdown = sourceResults.map((result) => result.summary);
  const grossRevenueXaf = sourceBreakdown.reduce(
    (sum, source) => sum + moneyAmount(source.gross_revenue_xaf),
    0
  );
  const providerFeesXaf = sourceBreakdown.reduce(
    (sum, source) => sum + moneyAmount(source.estimated_provider_fees_xaf),
    0
  );
  const netBeforeWithdrawalsXaf = moneyAmount(grossRevenueXaf - providerFeesXaf);
  const cashAfterWithdrawalsXaf = moneyAmount(
    netBeforeWithdrawalsXaf - withdrawals.successful_withdrawals_with_fees_xaf
  );
  const recentTransactions = sourceResults
    .flatMap((result) => result.recent)
    .sort((left, right) =>
      String(right.transaction_date || "").localeCompare(
        String(left.transaction_date || "")
      )
    )
    .slice(0, 50);

  return {
    generated_at: new Date().toISOString(),
    currency: CURRENCY,
    gross_revenue_xaf: grossRevenueXaf,
    estimated_provider_fees_xaf: providerFeesXaf,
    estimated_net_before_withdrawals_xaf: netBeforeWithdrawalsXaf,
    estimated_cash_after_withdrawals_xaf: cashAfterWithdrawalsXaf,
    completed_payment_count: sourceBreakdown.reduce(
      (sum, source) => sum + source.completed_payment_count,
      0
    ),
    pending_payment_count: sourceBreakdown.reduce(
      (sum, source) => sum + source.pending_payment_count,
      0
    ),
    failed_payment_count: sourceBreakdown.reduce(
      (sum, source) => sum + source.failed_payment_count,
      0
    ),
    total_votes: sourceBreakdown.reduce(
      (sum, source) => sum + source.total_votes,
      0
    ),
    total_tickets: ticketResult.summary.total_tickets,
    total_admits: ticketResult.summary.total_admits,
    source_breakdown: sourceBreakdown,
    payment_method_breakdown: combineMethodSplit(sourceResults),
    daily_revenue: combineDaily(sourceResults),
    vote_category_breakdown: {
      panache_dor: mapToRows(voteResults[0].categoryBreakdown, "category"),
      panache_360: mapToRows(voteResults[1].categoryBreakdown, "category"),
      miss_panache: mapToRows(voteResults[2].categoryBreakdown, "category"),
    },
    ticket_package_breakdown: mapToRows(ticketResult.packageBreakdown, "package"),
    ticket_event_breakdown: mapToRows(ticketResult.eventBreakdown, "event"),
    withdrawals,
    recent_transactions: recentTransactions,
    assumptions: [
      "Revenue uses completed Supabase payment/order rows.",
      "Card/MOMO split is detected from stored provider payload metadata; unknown methods are treated as MOMO.",
      "Provider fee values are estimates, not settlement statements.",
      "Withdrawals are treated as global cash movement because the synced CamPay history does not reliably assign them to one source.",
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
    const revenue = await buildRevenue(getSupabase());
    sendJson(res, 200, { revenue });
  } catch (error) {
    sendJson(res, error.statusCode || 500, {
      message: error.message || "Could not calculate Panache revenue analytics.",
      details: error.details || "",
      code: error.code || "",
    });
  }
}
