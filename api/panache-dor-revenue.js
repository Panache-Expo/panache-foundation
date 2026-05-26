import { createClient } from "@supabase/supabase-js";
import handler from "./panache-dor-revenue-lite.js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const CURRENCY = (process.env.PANACHE_DOR_CURRENCY || process.env.CURRENCY || "XAF").toUpperCase();
const CAMPAY_BASE_URL = (
  process.env.PANACHE_DOR_CAMPAY_BASE_URL || "https://www.campay.net"
).replace(/\/+$/, "");
const CAMPAY_USERNAME =
  process.env.PANACHE_DOR_CAMPAY_APP_USERNAME || process.env.CAMPAY_APP_USERNAME || "";
const CAMPAY_PASSWORD =
  process.env.PANACHE_DOR_CAMPAY_APP_PASSWORD || process.env.CAMPAY_APP_PASSWORD || "";
const CAMPAY_REVENUE_SYNC_START_DATE =
  process.env.PANACHE_DOR_CAMPAY_REVENUE_SYNC_START_DATE || "2026-05-01";
const CAMPAY_REVENUE_SYNC_COOLDOWN_MS = Number.parseInt(
  process.env.PANACHE_DOR_CAMPAY_REVENUE_SYNC_COOLDOWN_MS || "120000",
  10
);
const CAMPAY_DISBURSEMENT_FEE_RATE = Number(
  process.env.PANACHE_DOR_CAMPAY_DISBURSEMENT_FEE_RATE || "0.02"
);
const successfulStatuses = new Set(["SUCCESS", "SUCCESSFUL", "COMPLETED"]);
const pendingStatuses = new Set(["PENDING", "INITIATED", "PROCESSING"]);
const failedStatuses = new Set(["FAILED", "CANCELLED", "CANCELED", "ERROR"]);
const ignoredDisbursementReferences = new Set();

const moneyAmount = (value) => Math.round(Number(value || 0));
let campayAuthHeader = process.env.PANACHE_DOR_CAMPAY_AUTH_HEADER || "";
let lastRevenueSyncAt = 0;
let lastRevenueSyncResult = null;

const getSupabase = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
};

const maskReference = (value) => {
  const text = String(value || "").trim();
  if (!text || text.length <= 10) {
    return text;
  }
  return `${text.slice(0, 4)}...${text.slice(-6)}`;
};

const readJson = async (response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const getCampayAuthHeader = async () => {
  if (campayAuthHeader) {
    return campayAuthHeader;
  }

  if (!CAMPAY_USERNAME || !CAMPAY_PASSWORD) {
    throw new Error("CamPay credentials are not configured for revenue sync.");
  }

  const response = await fetch(`${CAMPAY_BASE_URL}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: CAMPAY_USERNAME,
      password: CAMPAY_PASSWORD,
    }),
  });
  const data = await readJson(response);

  if (!response.ok || !data?.token) {
    throw new Error(`CamPay auth failed: ${response.status}`);
  }

  campayAuthHeader = `Token ${data.token}`;
  return campayAuthHeader;
};

const extractTransactions = (historyResponse) => {
  if (Array.isArray(historyResponse)) {
    return historyResponse;
  }

  return (
    historyResponse?.transactions ||
    historyResponse?.results ||
    historyResponse?.data ||
    historyResponse?.history ||
    []
  );
};

const classifyCampayTransaction = (tx) => {
  const text = [
    tx.type,
    tx.transaction_type,
    tx.payment_type,
    tx.operation,
    tx.reason,
    tx.description,
    tx.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const amount = Number(tx.amount || tx.amount_paid || tx.value || 0);

  if (Number(tx.debit || 0) > 0) return "withdrawal";
  if (Number(tx.credit || 0) > 0) return "deposit";
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
  if (tx.to && !tx.from) return "withdrawal";
  if (tx.from && !tx.to) return "deposit";
  if (amount < 0) return "withdrawal";
  if (amount > 0) return "deposit";
  return "unknown";
};

const normalizeCampayAmount = (tx) =>
  Math.abs(
    Math.round(
      Number(
        tx.amount ||
          tx.amount_paid ||
          tx.value ||
          tx.total_amount ||
          tx.app_amount ||
          0
      )
    )
  );

const normalizeCampayTransaction = (tx) => ({
  campay_reference:
    tx.reference_uuid || tx.reference || tx.transaction_reference || tx.ref || null,
  external_reference:
    tx.external_reference || tx.external_ref || tx.externalReference || null,
  direction: classifyCampayTransaction(tx),
  amount_xaf: normalizeCampayAmount(tx),
  currency: tx.currency || CURRENCY,
  status: String(tx.status || tx.transaction_status || "UNKNOWN").toUpperCase(),
  phone: tx.from || tx.to || tx.phone_number || tx.msisdn || null,
  operator: tx.operator || tx.network || null,
  description: tx.description || tx.reason || null,
  transaction_date: tx.created_at || tx.date || tx.datetime || tx.timestamp || null,
  raw: tx,
  updated_at: new Date().toISOString(),
});

const syncCampayTransactionsForRevenue = async () => {
  const now = Date.now();
  if (
    lastRevenueSyncResult &&
    CAMPAY_REVENUE_SYNC_COOLDOWN_MS > 0 &&
    now - lastRevenueSyncAt < CAMPAY_REVENUE_SYNC_COOLDOWN_MS
  ) {
    return { ...lastRevenueSyncResult, skipped: true };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return {
      available: false,
      error: "Supabase service credentials are not configured.",
      synced: 0,
    };
  }

  const startDate = CAMPAY_REVENUE_SYNC_START_DATE;
  const endDate = getTodayDate();

  try {
    const response = await fetch(`${CAMPAY_BASE_URL}/api/history/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: await getCampayAuthHeader(),
      },
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
      }),
    });
    const data = await readJson(response);

    if (!response.ok) {
      throw new Error(`CamPay history failed: ${response.status}`);
    }

    const rows = extractTransactions(data)
      .map(normalizeCampayTransaction)
      .filter((tx) => tx.campay_reference);

    if (rows.length) {
      const { error } = await supabase
        .from("panache_dor_campay_transactions")
        .upsert(rows, { onConflict: "campay_reference" });

      if (error) {
        throw error;
      }
    }

    lastRevenueSyncAt = now;
    lastRevenueSyncResult = {
      available: true,
      error: null,
      synced: rows.length,
      start_date: startDate,
      end_date: endDate,
      synced_at: new Date(now).toISOString(),
    };
    return lastRevenueSyncResult;
  } catch (error) {
    lastRevenueSyncAt = now;
    lastRevenueSyncResult = {
      available: false,
      error: error.message || "Could not sync CamPay transactions.",
      synced: 0,
      start_date: startDate,
      end_date: endDate,
      synced_at: new Date(now).toISOString(),
    };
    return lastRevenueSyncResult;
  }
};

const emptyDisbursementSummary = (available = false, error = null) => ({
  available,
  error,
  transaction_count: 0,
  withdrawal_count: 0,
  successful_withdrawal_count: 0,
  pending_withdrawal_count: 0,
  failed_withdrawal_count: 0,
  total_withdrawals_xaf: 0,
  successful_withdrawals_xaf: 0,
  successful_withdrawal_fees_xaf: 0,
  successful_withdrawals_with_fees_xaf: 0,
  pending_withdrawals_xaf: 0,
  failed_withdrawals_xaf: 0,
  recent_disbursements: [],
});

const fetchSyncedDisbursements = async () => {
  const supabase = getSupabase();
  if (!supabase) {
    return emptyDisbursementSummary(false, "Supabase service credentials are not configured.");
  }

  const { data = [], error } = await supabase
    .from("panache_dor_campay_transactions")
    .select(
      "campay_reference, external_reference, direction, amount_xaf, currency, status, phone, operator, description, transaction_date, created_at, excluded_from_revenue"
    )
    .eq("direction", "withdrawal")
    .order("transaction_date", { ascending: false, nullsFirst: false })
    .limit(500);

  if (error) {
    if (
      error.code === "42P01" ||
      error.code === "PGRST205" ||
      /does not exist|could not find/i.test(error.message || "")
    ) {
      return emptyDisbursementSummary(false, "Disbursement sync table is not available yet.");
    }
    return emptyDisbursementSummary(false, error.message || "Could not read disbursements.");
  }

  const includedWithdrawals = data.filter(
    (row) =>
      !row.excluded_from_revenue &&
      !ignoredDisbursementReferences.has(String(row.campay_reference || ""))
  );

  const summary = emptyDisbursementSummary(true, null);
  summary.transaction_count = includedWithdrawals.length;
  summary.withdrawal_count = includedWithdrawals.length;

  for (const row of includedWithdrawals) {
    const amount = moneyAmount(row.amount_xaf);
    const status = String(row.status || "UNKNOWN").toUpperCase();

    summary.total_withdrawals_xaf += amount;

    if (successfulStatuses.has(status)) {
      summary.successful_withdrawal_count += 1;
      summary.successful_withdrawals_xaf += amount;
      const fee = moneyAmount(amount * CAMPAY_DISBURSEMENT_FEE_RATE);
      summary.successful_withdrawal_fees_xaf += fee;
      summary.successful_withdrawals_with_fees_xaf += amount + fee;
    } else if (pendingStatuses.has(status)) {
      summary.pending_withdrawal_count += 1;
      summary.pending_withdrawals_xaf += amount;
    } else if (failedStatuses.has(status)) {
      summary.failed_withdrawal_count += 1;
      summary.failed_withdrawals_xaf += amount;
    }
  }

  summary.recent_disbursements = includedWithdrawals.slice(0, 25).map((row) => ({
    reference: maskReference(row.campay_reference),
    external_reference: maskReference(row.external_reference),
    amount_xaf: moneyAmount(row.amount_xaf),
    currency: row.currency || CURRENCY,
    status: String(row.status || "UNKNOWN").toUpperCase(),
    phone: row.phone || null,
    operator: row.operator || null,
    description: row.description || null,
    transaction_date: row.transaction_date || row.created_at || null,
  }));

  return summary;
};

const normalizeRevenue = async (payload) => {
  const revenue = payload?.revenue;
  if (!revenue) {
    return payload;
  }

  const syncResult = await syncCampayTransactionsForRevenue();
  const disbursements = await fetchSyncedDisbursements();
  const grossVoteRevenueXaf = moneyAmount(revenue.gross_vote_revenue_xaf);
  const providerFeesXaf = moneyAmount(revenue.estimated_provider_fees_xaf);
  const estimatedTotalCollectedXaf = moneyAmount(
    grossVoteRevenueXaf - providerFeesXaf
  );
  const successfulDisbursementsXaf = moneyAmount(
    disbursements.successful_withdrawals_with_fees_xaf
  );
  const successfulDisbursementFeesXaf = moneyAmount(
    disbursements.successful_withdrawal_fees_xaf
  );
  const cashAfterDisbursementsXaf = moneyAmount(
    estimatedTotalCollectedXaf - successfulDisbursementsXaf
  );

  return {
    ...payload,
    revenue: {
      ...revenue,
      processing_fee_per_vote_xaf: 0,
      estimated_processing_fee_collected_xaf: 0,
      estimated_total_collected_xaf: estimatedTotalCollectedXaf,
      estimated_net_before_disbursements_xaf: estimatedTotalCollectedXaf,
      successful_disbursements_xaf: successfulDisbursementsXaf,
      successful_disbursement_withdrawals_xaf: moneyAmount(
        disbursements.successful_withdrawals_xaf
      ),
      successful_disbursement_fees_xaf: successfulDisbursementFeesXaf,
      campay_disbursement_fee_rate: CAMPAY_DISBURSEMENT_FEE_RATE,
      pending_disbursements_xaf: moneyAmount(disbursements.pending_withdrawals_xaf),
      failed_disbursements_xaf: moneyAmount(disbursements.failed_withdrawals_xaf),
      estimated_cash_after_disbursements_xaf: cashAfterDisbursementsXaf,
      estimated_net_revenue_xaf: cashAfterDisbursementsXaf,
      campay_disbursement_sync_available: disbursements.available,
      campay_disbursement_sync_error: disbursements.error,
      campay_disbursement_auto_sync_available: syncResult.available,
      campay_disbursement_auto_sync_error: syncResult.error,
      campay_disbursement_auto_sync_skipped: Boolean(syncResult.skipped),
      campay_disbursement_auto_sync_rows: syncResult.synced,
      campay_disbursement_auto_sync_start_date: syncResult.start_date,
      campay_disbursement_auto_sync_end_date: syncResult.end_date,
      campay_disbursement_auto_synced_at: syncResult.synced_at,
      campay_disbursement_count: disbursements.withdrawal_count,
      campay_successful_disbursement_count:
        disbursements.successful_withdrawal_count,
      campay_pending_disbursement_count: disbursements.pending_withdrawal_count,
      campay_failed_disbursement_count: disbursements.failed_withdrawal_count,
      recent_disbursements: disbursements.recent_disbursements,
      assumptions: [
        ...(revenue.assumptions || []).filter((assumption) => {
          const text = String(assumption).toLowerCase();
          return !text.includes("processing fee");
        }),
        "Estimated total collected ignores extra processing fees.",
        "Successful synced Campay disbursement withdrawals plus withdrawal charges are deducted from estimated net revenue.",
      ],
    },
  };
};

export default async function revenueHandler(req, res) {
  const capturedHeaders = new Map();
  let capturedBody = "";

  const captureRes = {
    statusCode: res.statusCode || 200,
    headersSent: false,
    writableEnded: false,
    setHeader(name, value) {
      capturedHeaders.set(name, value);
      return this;
    },
    getHeader(name) {
      return capturedHeaders.get(name);
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.setHeader("Content-Type", "application/json; charset=utf-8");
      this.end(JSON.stringify(payload));
      return this;
    },
    end(body = "") {
      if (this.writableEnded) {
        return this;
      }

      this.writableEnded = true;
      this.headersSent = true;
      capturedBody = Buffer.isBuffer(body)
        ? body.toString("utf8")
        : String(body || "");
      return this;
    },
  };

  await handler(req, captureRes);

  let responseBody = capturedBody;
  try {
    const payload = JSON.parse(capturedBody || "{}");
    const nextPayload = await normalizeRevenue(payload);
    responseBody = JSON.stringify(nextPayload);
    capturedHeaders.set("Content-Type", "application/json; charset=utf-8");
  } catch {
    // Keep the original response body for non-JSON responses.
  }

  res.statusCode = captureRes.statusCode || 200;
  if (!res.headersSent) {
    for (const [name, value] of capturedHeaders.entries()) {
      res.setHeader(name, value);
    }
  }

  res.end(responseBody);
}
