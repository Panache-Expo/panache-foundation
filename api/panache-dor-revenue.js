import { createClient } from "@supabase/supabase-js";
import handler from "./panache-dor-revenue-lite.js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const CURRENCY = (process.env.PANACHE_DOR_CURRENCY || process.env.CURRENCY || "XAF").toUpperCase();
const successfulStatuses = new Set(["SUCCESS", "SUCCESSFUL", "COMPLETED"]);
const pendingStatuses = new Set(["PENDING", "INITIATED", "PROCESSING"]);
const failedStatuses = new Set(["FAILED", "CANCELLED", "CANCELED", "ERROR"]);
const ignoredDisbursementReferences = new Set([
  "2b3575f5-f4f6-423a-94f9-6a6d739da775",
]);

const moneyAmount = (value) => Math.round(Number(value || 0));

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
      "campay_reference, external_reference, direction, amount_xaf, currency, status, phone, operator, description, transaction_date, created_at"
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
    (row) => !ignoredDisbursementReferences.has(String(row.campay_reference || ""))
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

  const disbursements = await fetchSyncedDisbursements();
  const grossVoteRevenueXaf = moneyAmount(revenue.gross_vote_revenue_xaf);
  const providerFeesXaf = moneyAmount(revenue.estimated_provider_fees_xaf);
  const estimatedTotalCollectedXaf = moneyAmount(
    grossVoteRevenueXaf - providerFeesXaf
  );
  const successfulDisbursementsXaf = moneyAmount(disbursements.successful_withdrawals_xaf);
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
      pending_disbursements_xaf: moneyAmount(disbursements.pending_withdrawals_xaf),
      failed_disbursements_xaf: moneyAmount(disbursements.failed_withdrawals_xaf),
      estimated_cash_after_disbursements_xaf: cashAfterDisbursementsXaf,
      estimated_net_revenue_xaf: cashAfterDisbursementsXaf,
      campay_disbursement_sync_available: disbursements.available,
      campay_disbursement_sync_error: disbursements.error,
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
        "Successful synced Campay disbursement withdrawals are deducted from estimated net revenue.",
        "The 18,650 XAF disbursement is intentionally ignored in this dashboard calculation.",
      ],
    },
  };
};

export default async function revenueHandler(req, res) {
  const originalEnd = res.end.bind(res);

  res.end = async (body, ...args) => {
    try {
      const text = Buffer.isBuffer(body) ? body.toString("utf8") : String(body || "");
      const payload = JSON.parse(text);
      const nextPayload = await normalizeRevenue(payload);
      return originalEnd(JSON.stringify(nextPayload), ...args);
    } catch {
      return originalEnd(body, ...args);
    }
  };

  return handler(req, res);
}
