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

const LEDGER_YEAR = Number.parseInt(
  process.env.PANACHE_REVENUE_LEDGER_YEAR || String(new Date().getUTCFullYear()),
  10
);
const LEDGER_START_DATE =
  process.env.PANACHE_REVENUE_LEDGER_START_DATE || `${LEDGER_YEAR}-01-01`;
const RECENT_REFRESH_DAYS = Math.max(
  Number.parseInt(process.env.PANACHE_REVENUE_RECENT_REFRESH_DAYS || "3", 10) || 3,
  1
);
const MAX_HISTORY_WINDOW_DAYS = Math.max(
  Number.parseInt(process.env.PANACHE_REVENUE_HISTORY_WINDOW_DAYS || "31", 10) || 31,
  1
);
const HISTORY_SPLIT_THRESHOLD = Math.max(
  Number.parseInt(process.env.PANACHE_REVENUE_HISTORY_SPLIT_THRESHOLD || "800", 10) || 800,
  50
);
const HISTORY_CONCURRENCY = Math.min(
  Math.max(Number.parseInt(process.env.PANACHE_REVENUE_HISTORY_CONCURRENCY || "3", 10) || 3, 1),
  6
);
const UPSERT_BATCH_SIZE = 500;

const successfulStatuses = new Set(["SUCCESS", "SUCCESSFUL", "COMPLETED"]);
const pendingStatuses = new Set(["PENDING", "INITIATED", "PROCESSING"]);
const failedStatuses = new Set(["FAILED", "CANCELLED", "CANCELED", "ERROR"]);

let campayTokenCache = { token: "", expiresAt: 0 };

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

const getReportedHistoryTotal = (payload) => {
  const candidates = [
    payload?.count,
    payload?.total,
    payload?.total_count,
    payload?.totalCount,
    payload?.pagination?.total,
    payload?.meta?.total,
  ];
  for (const candidate of candidates) {
    const parsed = Number(candidate);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return null;
};

const hasHistoryContinuation = (payload) =>
  Boolean(
    payload?.next ||
      payload?.next_page ||
      payload?.nextPage ||
      payload?.pagination?.next ||
      payload?.meta?.next
  );

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
    external_reference:
      normalizeText(
        row?.external_reference || row?.external_ref || row?.externalReference
      ) || null,
    direction: classifyDirection(row),
    amount_xaf: moneyAmount(
      row?.amount ||
        row?.amount_paid ||
        row?.value ||
        row?.total_amount ||
        row?.app_amount
    ),
    currency: String(row?.currency || CURRENCY).toUpperCase(),
    status: String(row?.status || row?.transaction_status || "UNKNOWN").toUpperCase(),
    phone:
      normalizeText(row?.from || row?.to || row?.phone_number || row?.msisdn) || null,
    operator: normalizeText(row?.operator || row?.network) || null,
    description: normalizeText(row?.description || row?.reason) || null,
    transaction_date:
      normalizeText(row?.created_at || row?.date || row?.datetime || row?.timestamp) || null,
    raw: row || {},
    updated_at: new Date().toISOString(),
    generated_reference: !providerReference,
  };
};

const parseDate = (date) => new Date(`${date}T00:00:00.000Z`);

const formatDate = (date) => date.toISOString().slice(0, 10);

const addDays = (date, days) => {
  const parsed = parseDate(date);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return formatDate(parsed);
};

const daysBetweenInclusive = (startDate, endDate) =>
  Math.floor((parseDate(endDate) - parseDate(startDate)) / 86400000) + 1;

const todayInCameroon = () =>
  new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);

const splitDateRange = (startDate, endDate) => {
  const totalDays = daysBetweenInclusive(startDate, endDate);
  const leftDays = Math.floor(totalDays / 2);
  const leftEnd = addDays(startDate, Math.max(leftDays - 1, 0));
  const rightStart = addDays(leftEnd, 1);
  return [
    { startDate, endDate: leftEnd },
    { startDate: rightStart, endDate },
  ];
};

const buildDateWindows = (startDate, endDate, maxDays = MAX_HISTORY_WINDOW_DAYS) => {
  if (!startDate || !endDate || startDate > endDate) return [];
  const windows = [];
  let cursor = startDate;

  while (cursor <= endDate) {
    const windowEnd = [addDays(cursor, maxDays - 1), endDate].sort()[0];
    windows.push({ startDate: cursor, endDate: windowEnd });
    cursor = addDays(windowEnd, 1);
  }

  return windows;
};

const fetchHistoryRange = async (startDate, endDate, depth = 0) => {
  const payload = await campayRequest("/api/history/", {
    method: "POST",
    body: JSON.stringify({ start_date: startDate, end_date: endDate }),
  });
  const rows = extractHistoryRows(payload);
  const reportedTotal = getReportedHistoryTotal(payload);
  const shouldSplit =
    startDate < endDate &&
    depth < 12 &&
    (rows.length >= HISTORY_SPLIT_THRESHOLD ||
      (reportedTotal !== null && reportedTotal > rows.length) ||
      hasHistoryContinuation(payload));

  if (!shouldSplit) {
    return {
      rows,
      requests: 1,
      ranges: [{ start_date: startDate, end_date: endDate, rows: rows.length }],
    };
  }

  const [left, right] = splitDateRange(startDate, endDate);
  const [leftResult, rightResult] = await Promise.all([
    fetchHistoryRange(left.startDate, left.endDate, depth + 1),
    fetchHistoryRange(right.startDate, right.endDate, depth + 1),
  ]);

  return {
    rows: [...leftResult.rows, ...rightResult.rows],
    requests: 1 + leftResult.requests + rightResult.requests,
    ranges: [...leftResult.ranges, ...rightResult.ranges],
  };
};

const runWithConcurrency = async (items, limit, worker) => {
  const results = new Array(items.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });

  await Promise.all(runners);
  return results;
};

const fetchLedgerCoverage = async (supabase) => {
  const [firstResult, latestResult] = await Promise.all([
    supabase
      .from("panache_dor_campay_transactions")
      .select("transaction_date")
      .not("transaction_date", "is", null)
      .gte("transaction_date", `${LEDGER_START_DATE}T00:00:00Z`)
      .order("transaction_date", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("panache_dor_campay_transactions")
      .select("transaction_date")
      .not("transaction_date", "is", null)
      .gte("transaction_date", `${LEDGER_START_DATE}T00:00:00Z`)
      .order("transaction_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (firstResult.error) throw firstResult.error;
  if (latestResult.error) throw latestResult.error;

  return {
    first_date: normalizeText(firstResult.data?.transaction_date).slice(0, 10) || null,
    latest_date: normalizeText(latestResult.data?.transaction_date).slice(0, 10) || null,
  };
};

const buildSyncWindows = (coverage, today) => {
  const windows = [];

  if (!coverage.first_date) {
    windows.push(...buildDateWindows(LEDGER_START_DATE, today));
    return windows;
  }

  if (coverage.first_date > LEDGER_START_DATE) {
    windows.push(
      ...buildDateWindows(LEDGER_START_DATE, addDays(coverage.first_date, -1))
    );
  }

  const recentStart = [
    LEDGER_START_DATE,
    addDays(coverage.latest_date || today, -(RECENT_REFRESH_DAYS - 1)),
  ].sort().at(-1);
  windows.push(...buildDateWindows(recentStart, today));

  const unique = new Map(
    windows.map((window) => [`${window.startDate}:${window.endDate}`, window])
  );
  return [...unique.values()];
};

const upsertHistoryRows = async (supabase, normalizedRows) => {
  let storedRows = 0;
  for (let index = 0; index < normalizedRows.length; index += UPSERT_BATCH_SIZE) {
    const batch = normalizedRows
      .slice(index, index + UPSERT_BATCH_SIZE)
      .map(({ generated_reference: _generated, ...row }) => row);
    const { error } = await supabase
      .from("panache_dor_campay_transactions")
      .upsert(batch, { onConflict: "campay_reference" });
    if (error) throw error;
    storedRows += batch.length;
  }
  return storedRows;
};

const syncCompleteCampayLedger = async (supabase) => {
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
  const coverageBefore = await fetchLedgerCoverage(supabase);
  const windows = buildSyncWindows(coverageBefore, today);

  const windowResults = await runWithConcurrency(
    windows,
    HISTORY_CONCURRENCY,
    (window) => fetchHistoryRange(window.startDate, window.endDate)
  );

  const rawRows = windowResults.flatMap((result) => result.rows);
  const normalizedRows = rawRows.map(normalizeHistoryRow);
  const uniqueRows = [
    ...new Map(normalizedRows.map((row) => [row.campay_reference, row])).values(),
  ];
  const storedRows = uniqueRows.length
    ? await upsertHistoryRows(supabase, uniqueRows)
    : 0;
  const coverageAfter = await fetchLedgerCoverage(supabase);

  return {
    attempted: true,
    available: true,
    error: null,
    ledger_start_date: LEDGER_START_DATE,
    date_to: today,
    coverage_before: coverageBefore,
    coverage_after: coverageAfter,
    requested_windows: windows.length,
    campay_requests: windowResults.reduce((sum, result) => sum + result.requests, 0),
    fetched_rows: rawRows.length,
    unique_rows: uniqueRows.length,
    stored_rows: storedRows,
    generated_reference_count: uniqueRows.filter((row) => row.generated_reference).length,
    ranges: windowResults.flatMap((result) => result.ranges).slice(0, 100),
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
      .gte("transaction_date", `${LEDGER_START_DATE}T00:00:00Z`)
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

  if (creditXaf === 0 && debitXaf === 0) {
    const amount = moneyAmount(row?.amount_xaf);
    const direction = normalizeText(row?.direction).toLowerCase();
    if (direction === "deposit") creditXaf = amount;
    else if (direction === "withdrawal") debitXaf = amount;
  }

  return { credit_xaf: creditXaf, debit_xaf: debitXaf };
};

const buildLedgerAudit = (rows, sync) => {
  const summary = {
    available: true,
    error: null,
    ledger_year: LEDGER_YEAR,
    ledger_start_date: LEDGER_START_DATE,
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
    distinct_transaction_reference_count: 0,
    duplicate_reference_count: 0,
    missing_reference_count: 0,
    ignored_transaction_count: 0,
    previously_excluded_but_included_count: 0,
    first_transaction_at: null,
    latest_transaction_at: null,
    balance_basis: "successful_credit_minus_successful_debit",
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

  const references = new Set();
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

    if (reference) {
      summary.transaction_reference_count += 1;
      references.add(reference);
    } else {
      summary.missing_reference_count += 1;
    }

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
      if (
        movement.debit_xaf > 0 ||
        normalizeText(row.direction).toLowerCase() === "withdrawal"
      ) {
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

  summary.distinct_transaction_reference_count = references.size;
  summary.duplicate_reference_count = Math.max(
    summary.transaction_reference_count - references.size,
    0
  );
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
    sync = await syncCompleteCampayLedger(supabase);
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
          `CamPay ledger balance covers transactions from ${LEDGER_START_DATE} and uses every synced transaction reference.`,
          "No transaction ID is excluded from the balance, including rows that were previously marked for exclusion.",
          "Successful CamPay credit values increase the balance and successful debit values reduce it; provider charges are therefore taken from the real ledger movement instead of estimated fee percentages.",
          "Pending and failed transactions remain visible in audit counts but do not change the balance.",
          ...(Array.isArray(payload.revenue.assumptions) ? payload.revenue.assumptions : []),
        ];
      }

      return originalEnd(payload ? JSON.stringify(payload) : chunk, encoding, callback);
    } catch {
      return originalEnd(chunk, encoding, callback);
    }
  };
};

export default async function handler(req, res) {
  if (req.method !== "GET" || !isDashboardAuthorized(req)) {
    return baseRevenueHandler(req, res);
  }

  let snapshot;
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
