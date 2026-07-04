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

const LEDGER_YEAR = Number.parseInt(
  process.env.PANACHE_REVENUE_LEDGER_YEAR || String(new Date().getUTCFullYear()),
  10
);
const LEDGER_START_DATE =
  process.env.PANACHE_REVENUE_LEDGER_START_DATE || `${LEDGER_YEAR}-01-01`;
const BACKFILL_CHUNK_DAYS = Math.max(
  Number.parseInt(process.env.PANACHE_REVENUE_MULTIAPP_BACKFILL_DAYS || "40", 10) || 40,
  1
);
const RECENT_REFRESH_DAYS = Math.max(
  Number.parseInt(process.env.PANACHE_REVENUE_RECENT_REFRESH_DAYS || "3", 10) || 3,
  1
);
const HISTORY_CONCURRENCY = Math.min(
  Math.max(Number.parseInt(process.env.PANACHE_REVENUE_HISTORY_CONCURRENCY || "10", 10) || 10, 1),
  14
);
const UPSERT_BATCH_SIZE = 500;

const successfulStatuses = new Set(["SUCCESS", "SUCCESSFUL", "COMPLETED"]);
const pendingStatuses = new Set(["PENDING", "INITIATED", "PROCESSING"]);
const failedStatuses = new Set(["FAILED", "CANCELLED", "CANCELED", "ERROR"]);
const tokenCache = new Map();

const normalizeText = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const moneyAmount = (value) => {
  const number = Number(value || 0);
  return Number.isFinite(number) ? Math.round(Math.abs(number)) : 0;
};

const normalizeBaseUrl = (value) =>
  String(value || "https://www.campay.net").replace(/\/+$/, "");

const parseDate = (date) => new Date(`${date}T00:00:00.000Z`);
const formatDate = (date) => date.toISOString().slice(0, 10);

const addDays = (date, days) => {
  const parsed = parseDate(date);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return formatDate(parsed);
};

const getDateRange = (startDate, endDate) => {
  if (!startDate || !endDate || startDate > endDate) return [];
  const dates = [];
  let cursor = startDate;
  while (cursor <= endDate) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return dates;
};

const todayInCameroon = () =>
  new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);

const getAccessKey = (req) =>
  normalizeText(
    req.headers["x-dashboard-key"] ||
      req.headers["x-dashboard-access-key"] ||
      req.query?.access_key
  );

const isDashboardAuthorized = (req) =>
  Boolean(DASHBOARD_ACCESS_KEY && getAccessKey(req) === DASHBOARD_ACCESS_KEY);

const getSupabase = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service credentials are not configured.");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-client-info": "panache-account-ledger-api" } },
  });
};

const credentialFingerprint = ({ baseUrl, username, password }) =>
  crypto
    .createHash("sha256")
    .update(`${baseUrl}|${username}|${password}`)
    .digest("hex")
    .slice(0, 16);

const configuredCampayProfiles = () => {
  const genericBaseUrl = normalizeBaseUrl(process.env.CAMPAY_BASE_URL);
  const genericUsername =
    process.env.CAMPAY_APP_USERNAME || process.env.CAMPAY_USERNAME || "";
  const genericPassword =
    process.env.CAMPAY_APP_PASSWORD || process.env.CAMPAY_PASSWORD || "";

  const candidates = [
    {
      alias: "panache_dor",
      baseUrl: normalizeBaseUrl(
        process.env.PANACHE_DOR_CAMPAY_BASE_URL || genericBaseUrl
      ),
      username:
        process.env.PANACHE_DOR_CAMPAY_APP_USERNAME || genericUsername,
      password:
        process.env.PANACHE_DOR_CAMPAY_APP_PASSWORD || genericPassword,
    },
    {
      alias: "panache_360",
      baseUrl: normalizeBaseUrl(
        process.env.PANACHE_360_CAMPAY_BASE_URL || genericBaseUrl
      ),
      username:
        process.env.PANACHE_360_CAMPAY_APP_USERNAME || genericUsername,
      password:
        process.env.PANACHE_360_CAMPAY_APP_PASSWORD || genericPassword,
    },
    {
      alias: "miss_panache",
      baseUrl: normalizeBaseUrl(
        process.env.MISS_PANACHE_CAMPAY_BASE_URL || genericBaseUrl
      ),
      username:
        process.env.MISS_PANACHE_CAMPAY_APP_USERNAME || genericUsername,
      password:
        process.env.MISS_PANACHE_CAMPAY_APP_PASSWORD || genericPassword,
    },
    {
      alias: "event_tickets",
      baseUrl: normalizeBaseUrl(
        process.env.EVENT_TICKETS_CAMPAY_BASE_URL || genericBaseUrl
      ),
      username:
        process.env.EVENT_TICKETS_CAMPAY_APP_USERNAME || genericUsername,
      password:
        process.env.EVENT_TICKETS_CAMPAY_APP_PASSWORD || genericPassword,
    },
    {
      alias: "generic",
      baseUrl: genericBaseUrl,
      username: genericUsername,
      password: genericPassword,
    },
  ].filter((profile) => profile.username && profile.password);

  const unique = new Map();
  for (const candidate of candidates) {
    const id = credentialFingerprint(candidate);
    const existing = unique.get(id);
    if (existing) {
      existing.aliases = [...new Set([...existing.aliases, candidate.alias])];
    } else {
      unique.set(id, {
        id,
        aliases: [candidate.alias],
        baseUrl: candidate.baseUrl,
        username: candidate.username,
        password: candidate.password,
      });
    }
  }
  return [...unique.values()];
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getCampayToken = async (profile) => {
  const cached = tokenCache.get(profile.id);
  if (cached?.token && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  const response = await fetch(`${profile.baseUrl}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: profile.username,
      password: profile.password,
    }),
  });
  const payload = await readJsonResponse(response);
  if (!response.ok || !payload.token) {
    const error = new Error(payload?.message || "CamPay authentication failed.");
    error.statusCode = response.status || 502;
    throw error;
  }

  tokenCache.set(profile.id, {
    token: payload.token,
    expiresAt: Date.now() + 45 * 60 * 1000,
  });
  return payload.token;
};

const campayRequest = async (profile, endpoint, options = {}, retryAuth = true) => {
  const token = await getCampayToken(profile);
  const response = await fetch(`${profile.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await readJsonResponse(response);

  if (response.status === 401 && retryAuth) {
    tokenCache.delete(profile.id);
    return campayRequest(profile, endpoint, options, false);
  }

  if (!response.ok) {
    const error = new Error(payload?.message || "CamPay request failed.");
    error.statusCode = response.status || 502;
    throw error;
  }
  return payload;
};

const campayRequestWithRetry = async (
  profile,
  endpoint,
  options = {},
  attempts = 3
) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await campayRequest(profile, endpoint, options);
    } catch (error) {
      lastError = error;
      const retryable =
        !error?.statusCode || error.statusCode === 429 || error.statusCode >= 500;
      if (!retryable || attempt >= attempts) throw error;
      await sleep(300 * attempt);
    }
  }
  throw lastError;
};

const extractHistoryRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.transactions)) return payload.transactions;
  return [];
};

const fetchHistoryDay = async (profile, date) => {
  const payload = await campayRequestWithRetry(profile, "/api/history/", {
    method: "POST",
    body: JSON.stringify({ start_date: date, end_date: date }),
  });
  return extractHistoryRows(payload);
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

const normalizeHistoryRow = (row, profile) => ({
  campay_reference: firstTransactionReference(row) || stableFallbackReference(row),
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
  raw: {
    ...(row || {}),
    panache_revenue_source_apps: profile.aliases,
  },
  updated_at: new Date().toISOString(),
});

const mergeDuplicateRows = (rows) => {
  const unique = new Map();
  for (const row of rows) {
    const existing = unique.get(row.campay_reference);
    if (!existing) {
      unique.set(row.campay_reference, row);
      continue;
    }
    const aliases = [
      ...(existing.raw?.panache_revenue_source_apps || []),
      ...(row.raw?.panache_revenue_source_apps || []),
    ];
    unique.set(row.campay_reference, {
      ...existing,
      raw: {
        ...existing.raw,
        panache_revenue_source_apps: [...new Set(aliases)],
      },
      updated_at: new Date().toISOString(),
    });
  }
  return [...unique.values()];
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

const syncKeyForProfile = (profile) =>
  `campay-account-ledger-${LEDGER_YEAR}-${profile.id}`;

const getOrCreateState = async (supabase, profile, today) => {
  const syncKey = syncKeyForProfile(profile);
  const { data: existing, error: readError } = await supabase
    .from("panache_revenue_sync_state")
    .select("*")
    .eq("sync_key", syncKey)
    .maybeSingle();
  if (readError) throw readError;

  if (existing && String(existing.ledger_start_date) === LEDGER_START_DATE) {
    return existing;
  }

  const initial = {
    sync_key: syncKey,
    ledger_start_date: LEDGER_START_DATE,
    backfill_cursor_date: today,
    backfill_completed_at: null,
    last_recent_sync_at: null,
    last_error: null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("panache_revenue_sync_state")
    .upsert(initial, { onConflict: "sync_key" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
};

const updateState = async (supabase, profile, updates) => {
  const { data, error } = await supabase
    .from("panache_revenue_sync_state")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("sync_key", syncKeyForProfile(profile))
    .select("*")
    .single();
  if (error) throw error;
  return data;
};

const upsertHistoryRows = async (supabase, rows) => {
  let stored = 0;
  for (let index = 0; index < rows.length; index += UPSERT_BATCH_SIZE) {
    const batch = rows.slice(index, index + UPSERT_BATCH_SIZE);
    const { error } = await supabase
      .from("panache_dor_campay_transactions")
      .upsert(batch, { onConflict: "campay_reference" });
    if (error) throw error;
    stored += batch.length;
  }
  return stored;
};

const syncAllConfiguredProfiles = async (supabase) => {
  const profiles = configuredCampayProfiles();
  if (!profiles.length) {
    return {
      available: false,
      error: "No CamPay app credentials are configured.",
      configured_apps: [],
      backfill_complete: false,
    };
  }

  const today = todayInCameroon();
  const states = new Map();
  for (const profile of profiles) {
    states.set(profile.id, await getOrCreateState(supabase, profile, today));
  }

  const plans = [];
  const tasks = [];
  for (const profile of profiles) {
    const state = states.get(profile.id);
    const cursor = String(state.backfill_cursor_date);
    const backfillComplete = cursor < LEDGER_START_DATE;
    const mode = backfillComplete ? "recent" : "backfill";
    const endDate = backfillComplete ? today : cursor;
    const startDate = backfillComplete
      ? [LEDGER_START_DATE, addDays(today, -(RECENT_REFRESH_DAYS - 1))]
          .sort()
          .at(-1)
      : [LEDGER_START_DATE, addDays(endDate, -(BACKFILL_CHUNK_DAYS - 1))]
          .sort()
          .at(-1);
    const dates = getDateRange(startDate, endDate);
    plans.push({ profile, state, mode, startDate, endDate, dates });
    for (const date of dates) tasks.push({ profile, date });
  }

  const taskResults = await runWithConcurrency(
    tasks,
    HISTORY_CONCURRENCY,
    async ({ profile, date }) => {
      try {
        const rows = await fetchHistoryDay(profile, date);
        return { ok: true, profile, date, rows };
      } catch (error) {
        return {
          ok: false,
          profile,
          date,
          rows: [],
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  );

  const normalizedRows = taskResults
    .filter((result) => result.ok)
    .flatMap((result) =>
      result.rows.map((row) => normalizeHistoryRow(row, result.profile))
    );
  const uniqueRows = mergeDuplicateRows(normalizedRows);
  const storedRows = uniqueRows.length
    ? await upsertHistoryRows(supabase, uniqueRows)
    : 0;

  const profileSummaries = [];
  for (const plan of plans) {
    const results = taskResults.filter(
      (result) => result.profile.id === plan.profile.id
    );
    const errors = results.filter((result) => !result.ok);
    const fetchedRows = results.reduce(
      (sum, result) => sum + (result.rows?.length || 0),
      0
    );
    let nextState = plan.state;

    if (errors.length) {
      nextState = await updateState(supabase, plan.profile, {
        last_error: errors
          .slice(0, 3)
          .map((result) => `${result.date}: ${result.error}`)
          .join(" | "),
      });
    } else if (plan.mode === "backfill") {
      const nextCursor = addDays(plan.startDate, -1);
      const complete = nextCursor < LEDGER_START_DATE;
      nextState = await updateState(supabase, plan.profile, {
        backfill_cursor_date: nextCursor,
        backfill_completed_at: complete ? new Date().toISOString() : null,
        last_error: null,
      });
    } else {
      nextState = await updateState(supabase, plan.profile, {
        last_recent_sync_at: new Date().toISOString(),
        last_error: null,
      });
    }

    profileSummaries.push({
      credential_id: plan.profile.id,
      apps: plan.profile.aliases,
      mode: plan.mode,
      start_date: plan.startDate,
      end_date: plan.endDate,
      days_requested: plan.dates.length,
      fetched_rows: fetchedRows,
      errors: errors.length,
      backfill_cursor_date: String(nextState.backfill_cursor_date),
      backfill_complete:
        String(nextState.backfill_cursor_date) < LEDGER_START_DATE,
      last_error: nextState.last_error || null,
    });
  }

  return {
    available: profileSummaries.every((profile) => profile.errors === 0),
    error:
      profileSummaries.find((profile) => profile.last_error)?.last_error || null,
    configured_apps: [...new Set(profiles.flatMap((profile) => profile.aliases))],
    credential_profile_count: profiles.length,
    backfill_complete: profileSummaries.every(
      (profile) => profile.backfill_complete
    ),
    fetched_rows: taskResults.reduce(
      (sum, result) => sum + (result.rows?.length || 0),
      0
    ),
    unique_rows: uniqueRows.length,
    stored_rows: storedRows,
    profiles: profileSummaries,
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
    if (error) throw error;
    rows.push(...data);
    if (data.length < pageSize) break;
  }
  return rows;
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
    ledger_year: LEDGER_YEAR,
    ledger_start_date: LEDGER_START_DATE,
    successful_credits_xaf: 0,
    successful_debits_xaf: 0,
    balance_xaf: 0,
    all_history_row_count: rows.length,
    successful_transaction_count: 0,
    successful_credit_transaction_count: 0,
    successful_debit_transaction_count: 0,
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
    if (timestamp && (!firstTimestamp || timestamp < firstTimestamp)) {
      firstTimestamp = timestamp;
    }
    if (timestamp && (!latestTimestamp || timestamp > latestTimestamp)) {
      latestTimestamp = timestamp;
    }

    const status = normalizeText(row.status).toUpperCase();
    const movement = ledgerMovement(row);
    const amount = moneyAmount(row.amount_xaf);
    const charge = moneyAmount(raw.charge_amount);

    if (successfulStatuses.has(status)) {
      summary.successful_transaction_count += 1;
      summary.successful_credits_xaf += movement.credit_xaf;
      summary.successful_debits_xaf += movement.debit_xaf;

      if (movement.credit_xaf > 0) {
        summary.successful_credit_transaction_count += 1;
      }
      if (movement.debit_xaf > 0) {
        summary.successful_debit_transaction_count += 1;
        const actualFee = Math.max(movement.debit_xaf - amount, charge, 0);
        withdrawals.successful_withdrawal_count += 1;
        withdrawals.successful_withdrawals_xaf += amount;
        withdrawals.successful_withdrawal_fees_xaf += actualFee;
        withdrawals.successful_withdrawals_with_fees_xaf += movement.debit_xaf;
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

const buildAccountLedgerSnapshot = async () => {
  const supabase = getSupabase();
  const sync = await syncAllConfiguredProfiles(supabase);
  const rows = await fetchEveryLedgerRow(supabase);
  return buildLedgerAudit(rows, sync);
};

const installRevenueResponseInterceptor = (res, snapshot) => {
  const originalEnd = res.end.bind(res);

  res.end = (chunk, encoding, callback) => {
    try {
      const rawBody = Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk || "");
      const payload = rawBody ? JSON.parse(rawBody) : null;

      if (payload?.revenue && snapshot?.summary?.available) {
        const gross = moneyAmount(payload.revenue.gross_revenue_xaf);
        const actualCollections = moneyAmount(
          snapshot.summary.successful_credits_xaf
        );
        const actualDisbursements = moneyAmount(
          snapshot.summary.successful_debits_xaf
        );
        const actualProviderFees = Math.max(gross - actualCollections, 0);
        const balance = actualCollections - actualDisbursements;

        payload.revenue.estimated_provider_fees_xaf = actualProviderFees;
        payload.revenue.estimated_net_before_withdrawals_xaf = actualCollections;
        payload.revenue.estimated_cash_after_withdrawals_xaf = balance;
        payload.revenue.actual_provider_fees_xaf = actualProviderFees;
        payload.revenue.actual_collections_xaf = actualCollections;
        payload.revenue.actual_disbursements_xaf = actualDisbursements;
        payload.revenue.real_account_balance_xaf = balance;
        payload.revenue.campay_account_balance = snapshot.summary;
        payload.revenue.withdrawals = snapshot.withdrawals;
        payload.revenue.assumptions = [
          "Top-line cash metrics use the combined CamPay ledger from every configured Panache app credential.",
          "Transaction histories are merged and deduplicated by CamPay reference before any totals are calculated.",
          "No transaction is excluded because of the legacy excluded_from_revenue flag or raw exclusion metadata.",
          "Net before withdrawals equals actual successful CamPay credits; cash after withdrawals subtracts actual successful CamPay debits.",
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

  const snapshot = await buildAccountLedgerSnapshot();
  installRevenueResponseInterceptor(res, snapshot);
  return baseRevenueHandler(req, res);
}
