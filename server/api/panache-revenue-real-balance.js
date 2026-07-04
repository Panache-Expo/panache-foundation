import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import baseRevenueHandler from "./panache-revenue.js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const DASHBOARD_ACCESS_KEY =
  process.env.DASHBOARD_ACCESS_KEY || process.env.PANACHE_DASHBOARD_ACCESS_KEY || "";
const CURRENCY = (
  process.env.PANACHE_REVENUE_CURRENCY || process.env.CURRENCY || "XAF"
).toUpperCase();

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
const LIVE_SYNC_LOOKBACK_DAYS = Math.max(
  Number.parseInt(process.env.PANACHE_REVENUE_LIVE_SYNC_LOOKBACK_DAYS || "2", 10) || 2,
  0
);

const successfulStatuses = new Set(["SUCCESS", "SUCCESSFUL", "COMPLETED"]);
const pendingStatuses = new Set(["PENDING", "INITIATED", "PROCESSING"]);
const failedStatuses = new Set(["FAILED", "CANCELLED", "CANCELED", "ERROR"]);

let campayTokenCache = {
  token: "",
  expiresAt: 0,
};

const normalizeText = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const moneyAmount = (value) => {
  const number = Number(value || 0);
  return Number.isFinite(number) ? Math.round(Math.abs(number)) : 0;
};

const getAccessKey = (req) =>
  normalizeText(
    req.headers["x-dashboard-key"] ||
      req.headers["x-dashboard-access-key"] ||
      req.query?.access_key
  );

const isDashboardAuthorized = (req) =>
  Boolean(DASHBOARD_ACCESS_KEY && getAccessKey(req) === DASHBOARD_ACCESS_KEY);

const createAdminClient = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service credentials are not configured.");
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-client-info": "panache-real-balance-api" } },
  });
};

const readJsonResponse = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const getCampayToken = async () => {
  if (!CAMPAY_APP_USERNAME || !CAMPAY_APP_PASSWORD) {
    throw new Error("CamPay credentials are not configured.");
  }

  if (campayTokenCache.token && campayTokenCache.expiresAt > Date.now()) {
    return campayTokenCache.token;
  }

  const response = await fetch(`${CAMPAY_BASE_URL}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: CAMPAY_APP_USERNAME,
      password: CAMPAY_APP_PASSWORD,
    }),
  });
  const payload = await readJsonResponse(response);

  if (!response.ok || !payload.token) {
    throw new Error(payload?.message || "CamPay authentication failed.");
  }

  campayTokenCache = {
    token: payload.token,
    expiresAt: Date.now() + 45 * 60 * 1000,
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
    throw new Error(payload?.message || "CamPay request failed.");
  }

  return payload;
};

const extractHistoryRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.transactions)) return payload.transactions;
  return [];
};

const firstTransactionReference = (row) =>
  normalizeText(
    row?.reference_uuid ||
      row?.reference ||
      row?.transaction_reference ||
      row?.transaction_id ||
      row?.transactionId ||
      row?.id ||
      row?.uuid ||
      row?.ref ||
      row?.operator_tx_code ||
      row?.code ||
      row?.external_reference ||
      row?.external_ref ||
      row?.externalReference
  );

const stableFallbackReference = (row) =>
  `history-row-${crypto
    .createHash("sha256")
    .update(JSON.stringify(row || {}))
    .digest("hex")}`;

const classifyDirection = (row) => {
  const credit = moneyAmount(row?.credit);
  const debit = moneyAmount(row?.debit);
  if (credit > 0) return "deposit";
  if (debit > 0) return "withdrawal";

  const text = [
    row?.type,
    row?.transaction_type,
    row?.payment_type,
    row?.operation,
    row?.reason,
    row?.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/disburse|withdraw|payout|cashout|debit/.test(text)) return "withdrawal";
  if (/collect|collection|payment|deposit|cashin|credit/.test(text)) return "deposit";
  return "unknown";
};

const normalizeHistoryRow = (row) => {
  const providerReference = firstTransactionReference(row);
  const campayReference = providerReference || stableFallbackReference(row);

  return {
    campay_reference: campayReference,
    external_reference: normalizeText(
      row?.external_reference || row?.external_ref || row?.externalReference
    ) || null,
    direction: classifyDirection(row),
    amount_xaf: moneyAmount(
      row?.amount || row?.amount_paid || row?.value || row?.total_amount || row?.app_amount
    ),
    currency: String(row?.currency || CURRENCY).toUpperCase(),
    status: String(row?.status || row?.transaction_status || "UNKNOWN").toUpperCase(),
    phone:
      normalizeText(row?.from || row?.to || row?.phone_number || row?.msisdn) || null,
    operator: normalizeText(row?.operator || row?.network) || null,
    description: normalizeText(row?.description || row?.reason) || null,
    transaction_date:
      normalizeText(
        row?.created_at || row?.date || row?.datetime || row?.timestamp
      ) || null,
    raw: row || {},
    updated_at: new Date().toISOString(),
    generated_reference: !providerReference,
  };
};

const addDays = (date, days) => {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
};

const todayInCameroon = () =>
  new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);

const syncRecentCampayHistory = async (supabase) => {
  if (!CAMPAY_APP_USERNAME || !CAMPAY_APP_PASSWORD) {
    return {
      attempted: false,
      available: false,
      error: "CamPay credentials are not configured.",
      fetched_rows: 0,
      stored_rows: 0,
      generated_reference_count: 0,
    };
  }

  const today = todayInCameroon();
  const dates = [];
  for (let offset = LIVE_SYNC_LOOKBACK_DAYS; offset >= 0; offset -= 1) {
    dates.push(addDays(today, -offset));
  }

  const historyPayloads = await Promise.all(
    dates.map((date) =>
      campayRequest("/api/history/", {
        method: "POST",
        body: JSON.stringify({ start_date: date, end_date: date }),
      })
    )
  );

  const rawRows = historyPayloads.flatMap(extractHistoryRows);
  const normalizedRows = rawRows.map(normalizeHistoryRow);
  const uniqueRows = [
    ...new Map(normalizedRows.map((row) => [row.campay_reference, row])).values(),
  ];

  if (uniqueRows.length) {
    const rowsToStore = uniqueRows.map(({ generated_reference: _generated, ...row }) => row);
    const { error } = await supabase
      .from("panache_dor_campay_transactions")
      .upsert(rowsToStore, { onConflict: "campay_reference" });
    if (error) throw error;
  }

  return {
    attempted: true,
    available: true,
    error: null,
    date_from: dates[0] || today,
    date_to: dates.at(-1) || today,
    fetched_rows: rawRows.length,
    stored_rows: uniqueRows.length,
    generated_reference_count: uniqueRows.filter((row) => row.generated_reference).length,
    synced_at: new Date().toISOString(),
  };
};

const fetchEveryLedgerRow = async (supabase) => {
  const pageSize = 1000;
  const rows = [];

  for (let page = 0; ; page += 1) {
    const { data = [], error } = await supabase
      .from("panache_dor_campay_transactions")
      .select(
        "id, campay_reference, external_reference, direction, amount_xaf, currency, status, transaction_date, created_at, raw, excluded_from_revenue, revenue_exclusion_note"
      )
      .order("transaction_date", { ascending: false, nullsFirst: false })
      .range(page * pageSize, page * pageSize + pageSize - 1);

    if (error) {
      if (
        error.code === "42P01" ||
        error.code === "PGRST205" ||
        /does not exist|could not find/i.test(error.message || "")
      ) {
        return { rows: [], available: false, error: error.message };
      }
      throw error;
    }

    rows.push(...data);
    if (data.length < pageSize) break;
  }

  return { rows, available: true, error: null };
};

const ledgerMovement = (row) => {
  const raw = row?.raw && typeof row.raw === "object" ? row.raw : {};
  let creditXaf = moneyAmount(raw.credit);
  let debitXaf = moneyAmount(raw.debit);
  let source = "campay-credit-debit";

  if (creditXaf === 0 && debitXaf === 0) {
    const amount = moneyAmount(row?.amount_xaf);
    const direction = normalizeText(row?.direction).toLowerCase();
    if (direction === "deposit") creditXaf = amount;
    else if (direction === "withdrawal") debitXaf = amount;
    source = "direction-fallback";
  }

  return { credit_xaf: creditXaf, debit_xaf: debitXaf, source };
};

const buildLedgerAudit = (rows, sync) => {
  const summary = {
    available: true,
    error: null,
    balance_xaf: 0,
    successful_credits_xaf: 0,
    successful_debits_xaf: 0,
    all_history_row_count: rows.length,
    successful_transaction_count: 0,
    successful_credit_transaction_count: 0,
    successful_debit_transaction_count: 0,
    successful_zero_effect_transaction_count: 0,
    non_successful_transaction_count: 0,
    transaction_reference_count: 0,
    missing_reference_count: 0,
    ignored_transaction_count: 0,
    previously_excluded_but_included_count: 0,
    first_transaction_at: null,
    latest_transaction_at: null,
    sync,
  };

  const withdrawals = {
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

  let firstTimestamp = "";
  let latestTimestamp = "";

  for (const row of rows) {
    const raw = row?.raw && typeof row.raw === "object" ? row.raw : {};
    const reference = normalizeText(
      row.campay_reference ||
        row.external_reference ||
        raw.reference_uuid ||
        raw.operator_tx_code ||
        raw.code ||
        row.id
    );

    if (reference) summary.transaction_reference_count += 1;
    else summary.missing_reference_count += 1;

    if (
      row.excluded_from_revenue ||
      raw.panache_revenue_excluded ||
      raw.panache_revenue_exclusion_financial_transaction_id
    ) {
      summary.previously_excluded_but_included_count += 1;
    }

    const timestamp = normalizeText(row.transaction_date || row.created_at);
    if (timestamp && (!firstTimestamp || timestamp < firstTimestamp)) firstTimestamp = timestamp;
    if (timestamp && (!latestTimestamp || timestamp > latestTimestamp)) latestTimestamp = timestamp;

    const status = normalizeText(row.status).toUpperCase();
    const movement = ledgerMovement(row);
    const amount = moneyAmount(row.amount_xaf);
    const charge = moneyAmount(raw.charge_amount);

    if (successfulStatuses.has(status)) {
      summary.successful_transaction_count += 1;
      summary.successful_credits_xaf += movement.credit_xaf;
      summary.successful_debits_xaf += movement.debit_xaf;

      if (movement.credit_xaf > 0) summary.successful_credit_transaction_count += 1;
      if (movement.debit_xaf > 0) {
        summary.successful_debit_transaction_count += 1;
        const principal = amount;
        const actualFee = Math.max(movement.debit_xaf - principal, charge, 0);
        withdrawals.successful_withdrawal_count += 1;
        withdrawals.successful_withdrawals_xaf += principal;
        withdrawals.successful_withdrawal_fees_xaf += actualFee;
        withdrawals.successful_withdrawals_with_fees_xaf += movement.debit_xaf;
      }
      if (movement.credit_xaf === 0 && movement.debit_xaf === 0) {
        summary.successful_zero_effect_transaction_count += 1;
      }
    } else {
      summary.non_successful_transaction_count += 1;
      if (movement.debit_xaf > 0 || normalizeText(row.direction).toLowerCase() === "withdrawal") {
        if (pendingStatuses.has(status)) {
          withdrawals.pending_withdrawal_count += 1;
          withdrawals.pending_withdrawals_xaf += amount;
        } else if (failedStatuses.has(status)) {
          withdrawals.failed_withdrawal_count += 1;
          withdrawals.failed_withdrawals_xaf += amount;
        }
      }
    }
  }

  summary.balance_xaf = Math.round(
    summary.successful_credits_xaf - summary.successful_debits_xaf
  );
  summary.first_transaction_at = firstTimestamp || null;
  summary.latest_transaction_at = latestTimestamp || null;

  return { summary, withdrawals };
};

const buildRealBalanceSnapshot = async () => {
  const supabase = createAdminClient();
  let sync;

  try {
    sync = await syncRecentCampayHistory(supabase);
  } catch (error) {
    sync = {
      attempted: true,
      available: false,
      error: error instanceof Error ? error.message : String(error),
      fetched_rows: 0,
      stored_rows: 0,
      generated_reference_count: 0,
    };
  }

  const ledger = await fetchEveryLedgerRow(supabase);
  if (!ledger.available) {
    return {
      summary: {
        available: false,
        error: ledger.error,
        balance_xaf: 0,
        ignored_transaction_count: 0,
        sync,
      },
      withdrawals: null,
    };
  }

  return buildLedgerAudit(ledger.rows, sync);
};

const installRevenueResponseInterceptor = (res, snapshot) => {
  const originalEnd = res.end.bind(res);

  res.end = (chunk, encoding, callback) => {
    try {
      const rawBody = Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk || "");
      const payload = rawBody ? JSON.parse(rawBody) : null;

      if (payload?.revenue && snapshot?.summary?.available) {
        const balance = snapshot.summary.balance_xaf;
        payload.revenue.real_account_balance_xaf = balance;
        payload.revenue.estimated_cash_after_withdrawals_xaf = balance;
        payload.revenue.campay_account_balance = snapshot.summary;
        if (snapshot.withdrawals) payload.revenue.withdrawals = snapshot.withdrawals;
        payload.revenue.assumptions = [
          "Real CamPay balance uses every synced CamPay history row. No transaction ID is excluded.",
          "Successful CamPay credit values increase the balance and successful debit values reduce it, so collection and withdrawal charges come from the provider ledger instead of estimated fee percentages.",
          "Pending and failed transactions remain in audit counts but do not change the real balance.",
          ...(Array.isArray(payload.revenue.assumptions) ? payload.revenue.assumptions : []),
        ];
      }

      return originalEnd(
        payload ? JSON.stringify(payload) : chunk,
        encoding,
        callback
      );
    } catch {
      return originalEnd(chunk, encoding, callback);
    }
  };
};

export default async function handler(req, res) {
  if (req.method !== "GET" || !isDashboardAuthorized(req)) {
    return baseRevenueHandler(req, res);
  }

  let snapshot = null;
  try {
    snapshot = await buildRealBalanceSnapshot();
  } catch (error) {
    snapshot = {
      summary: {
        available: false,
        error: error instanceof Error ? error.message : String(error),
        balance_xaf: 0,
        ignored_transaction_count: 0,
      },
      withdrawals: null,
    };
  }

  installRevenueResponseInterceptor(res, snapshot);
  return baseRevenueHandler(req, res);
}
