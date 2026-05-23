import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

function loadEnvFile(path) {
  if (!fs.existsSync(path)) return;
  const text = fs.readFileSync(path, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const baseUrl = (process.env.PANACHE_DOR_CAMPAY_BASE_URL || "https://www.campay.net").replace(/\/+$/, "");
let authHeader = process.env.PANACHE_DOR_CAMPAY_AUTH_HEADER;
const campayUsername =
  process.env.PANACHE_DOR_CAMPAY_APP_USERNAME || process.env.CAMPAY_APP_USERNAME;
const campayPassword =
  process.env.PANACHE_DOR_CAMPAY_APP_PASSWORD || process.env.CAMPAY_APP_PASSWORD;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase service credentials.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function readJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function getCampayAuthHeader() {
  if (authHeader) return authHeader;
  if (!campayUsername || !campayPassword) {
    throw new Error(
      "Missing CamPay auth. Set PANACHE_DOR_CAMPAY_AUTH_HEADER or PANACHE_DOR_CAMPAY_APP_USERNAME/PANACHE_DOR_CAMPAY_APP_PASSWORD."
    );
  }

  const response = await fetch(`${baseUrl}/api/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: campayUsername,
      password: campayPassword,
    }),
  });
  const data = await readJson(response);

  if (!response.ok || !data?.token) {
    throw new Error(`Campay auth failed: ${response.status} ${JSON.stringify(data)}`);
  }

  authHeader = `Token ${data.token}`;
  return authHeader;
}

async function getCampayHistory(startDate, endDate) {
  const response = await fetch(`${baseUrl}/api/history/`, {
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
    throw new Error(`Campay history failed: ${response.status} ${JSON.stringify(data)}`);
  }

  return data;
}

function extractTransactions(historyResponse) {
  if (Array.isArray(historyResponse)) return historyResponse;

  return (
    historyResponse?.transactions ||
    historyResponse?.results ||
    historyResponse?.data ||
    historyResponse?.history ||
    []
  );
}

function classifyCampayTransaction(tx) {
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
}

function normalizeAmount(tx) {
  return Math.abs(
    Math.round(
      Number(tx.amount || tx.amount_paid || tx.value || tx.total_amount || tx.app_amount || 0)
    )
  );
}

function normalizeTransaction(tx) {
  return {
    campay_reference:
      tx.reference_uuid || tx.reference || tx.transaction_reference || tx.ref || null,
    external_reference: tx.external_reference || tx.external_ref || tx.externalReference || null,
    direction: classifyCampayTransaction(tx),
    amount_xaf: normalizeAmount(tx),
    currency: tx.currency || "XAF",
    status: String(tx.status || tx.transaction_status || "UNKNOWN").toUpperCase(),
    phone: tx.from || tx.to || tx.phone_number || tx.msisdn || null,
    operator: tx.operator || tx.network || null,
    description: tx.description || tx.reason || null,
    transaction_date: tx.created_at || tx.date || tx.datetime || tx.timestamp || null,
    raw: tx,
    updated_at: new Date().toISOString(),
  };
}

function summarizeTransactions(transactions) {
  const summary = {
    count: transactions.length,
    deposits: 0,
    withdrawals: 0,
    successfulDeposits: 0,
    successfulWithdrawals: 0,
    pending: 0,
    failed: 0,
    unknown: 0,
  };

  for (const tx of transactions) {
    const status = String(tx.status || "").toUpperCase();
    const isSuccessful = ["SUCCESSFUL", "SUCCESS", "COMPLETED"].includes(status);
    const isPending = ["PENDING", "INITIATED", "PROCESSING"].includes(status);
    const isFailed = ["FAILED", "CANCELLED", "CANCELED", "ERROR"].includes(status);

    if (isPending) summary.pending += 1;
    if (isFailed) summary.failed += 1;
    if (tx.direction === "unknown") summary.unknown += 1;

    if (tx.direction === "deposit") {
      summary.deposits += tx.amount_xaf;
      if (isSuccessful) summary.successfulDeposits += tx.amount_xaf;
    }

    if (tx.direction === "withdrawal") {
      summary.withdrawals += tx.amount_xaf;
      if (isSuccessful) summary.successfulWithdrawals += tx.amount_xaf;
    }
  }

  summary.netSuccessful = summary.successfulDeposits - summary.successfulWithdrawals;
  return summary;
}

async function syncTransactions(transactions) {
  const rows = transactions
    .map(normalizeTransaction)
    .filter((tx) => tx.campay_reference);

  if (!rows.length) return { synced: 0 };

  const { error } = await supabase
    .from("panache_dor_campay_transactions")
    .upsert(rows, { onConflict: "campay_reference" });

  if (error) throw error;
  return { synced: rows.length, rows };
}

async function main() {
  const startDate = process.argv[2] || "2026-05-01";
  const endDate = process.argv[3] || new Date().toISOString().slice(0, 10);

  const history = await getCampayHistory(startDate, endDate);
  const rawTransactions = extractTransactions(history);
  const normalizedTransactions = rawTransactions.map(normalizeTransaction);
  const summary = summarizeTransactions(normalizedTransactions);
  const syncResult = await syncTransactions(rawTransactions);

  console.log("\nSUMMARY");
  console.table(summary);
  console.log(`Synced ${syncResult.synced} Campay transactions to Supabase.`);

  console.log("\nWITHDRAWALS / DISBURSEMENTS");
  console.table(
    normalizedTransactions
      .filter((tx) => tx.direction === "withdrawal")
      .map((tx) => ({
        amount_xaf: tx.amount_xaf,
        currency: tx.currency,
        status: tx.status,
        reference: tx.campay_reference,
        external_reference: tx.external_reference,
        phone: tx.phone,
        operator: tx.operator,
        description: tx.description,
      }))
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
