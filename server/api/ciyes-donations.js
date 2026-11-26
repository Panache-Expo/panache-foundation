// CIYES community project donations (2027: a borehole).
//   POST {action:"start", amount, campaign?, donorName?, whatsappPhone?, email?, message?, language?, source?, website?}
//        -> saves a pending row, asks Campay for a payment link, returns { paymentLink, txRef }
//   POST {action:"verify", txRef} -> checks the transaction with Campay; completes the row only if
//        status, external reference, amount and currency all match (same four checks as ticket payments).
//   GET  ?campaign=borehole-2027 -> { goal_xaf, raised_xaf, donors, usd_per_xaf, usd_rate_date } from
//        completed rows only. The USD rate is approximate (see getUsdPerXaf) and may be null.
// External references start with "donation-" so the revenue dashboards can leave them out.
// Donors can pay by Mobile Money or bank card. If Campay refuses the card option for this account,
// the payment link is requested again with Mobile Money only, so giving never breaks.
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const CAMPAY_BASE_URL = (
  process.env.DONATIONS_CAMPAY_BASE_URL ||
  process.env.CAMPAY_BASE_URL ||
  "https://www.campay.net"
).replace(/\/+$/, "");
const CAMPAY_APP_USERNAME =
  process.env.MISS_PANACHE_CAMPAY_APP_USERNAME || process.env.CAMPAY_APP_USERNAME || "";
const CAMPAY_APP_PASSWORD =
  process.env.MISS_PANACHE_CAMPAY_APP_PASSWORD || process.env.CAMPAY_APP_PASSWORD || "";
// Cards are on by default. This deliberately ignores the shared CAMPAY_PAYMENT_OPTIONS (other flows
// may limit it to MOMO); set DONATIONS_CAMPAY_PAYMENT_OPTIONS to override for donations only.
const normalizePaymentOptions = (value) =>
  [...new Set(String(value || "").toUpperCase().split(",").map((option) => option.trim()))]
    .filter((option) => option === "MOMO" || option === "CARD")
    .join(",");
const CAMPAY_PAYMENT_OPTIONS =
  "MOMO,CARD";
const CURRENCY = "XAF";
// XAF is pegged to the euro (1 EUR = 655.957 XAF), so XAF -> USD only needs the day's EUR/USD rate.
// That comes from the European Central Bank via Frankfurter, cached for 6 hours. DONATIONS_USD_PER_XAF
// pins a rate by hand. If no rate is available the API returns null and the page hides the dollars.
const XAF_PER_EUR = 655.957;
const FX_URL = "https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD";
const FX_TTL_MS = 6 * 60 * 60 * 1000;
let fxCache = { usdPerXaf: null, date: null, expiresAt: 0 };

export const getUsdPerXaf = async (fetchImpl = fetch) => {
  const pinned = Number(process.env.DONATIONS_USD_PER_XAF);
  if (Number.isFinite(pinned) && pinned > 0) return { usdPerXaf: pinned, date: null };
  if (fxCache.usdPerXaf && fxCache.expiresAt > Date.now()) return { usdPerXaf: fxCache.usdPerXaf, date: fxCache.date };
  try {
    const response = await fetchImpl(FX_URL, { signal: AbortSignal.timeout(3000) });
    const payload = await response.json().catch(() => null);
    const eurUsd = Number(payload?.rates?.USD);
    if (response.ok && eurUsd > 0.5 && eurUsd < 2) {
      fxCache = { usdPerXaf: eurUsd / XAF_PER_EUR, date: payload.date || null, expiresAt: Date.now() + FX_TTL_MS };
    }
  } catch {
    // Keep the last good rate (even if stale) rather than failing the totals.
  }
  return { usdPerXaf: fxCache.usdPerXaf, date: fxCache.date };
};

const BASE_URL = (
  process.env.DONATIONS_BASE_URL ||
  process.env.PANACHE_FRONTEND_BASE_URL ||
  ""
).replace(/\/+$/, "");

export const MIN_DONATION_XAF = 500;
export const MAX_DONATION_XAF = 2000000;
const DEFAULT_CAMPAIGN = "borehole-2027";
const LANGUAGES = new Set(["en", "fr"]);

const completedProviderStatuses = new Set(["SUCCESSFUL", "SUCCESS"]);
const failedProviderStatuses = new Set(["FAILED", "CANCELLED", "CANCELED"]);

let campayTokenCache = { token: "", expiresAt: 0 };

const createHttpError = (message, statusCode = 400, field) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (field) error.field = field;
  return error;
};

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
};

const parseBody = (req) => {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
};

const normalizeText = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const text = (value, max) => {
  const clean = normalizeText(value).replace(/\s+/g, " ");
  return clean ? clean.slice(0, max) : null;
};

// Same as event-tickets.js: digits only, Cameroon numbers get the 237 prefix.
const normalizePhone = (value) => {
  const digits = normalizeText(value).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("237")) return digits;
  if (digits.length === 9) return `237${digits}`;
  return digits;
};

const normalizeUrl = (value) => {
  const url = normalizeText(value);
  if (!url) return "";
  try {
    return new URL(url).toString();
  } catch {
    return "";
  }
};

const normalizeCampaign = (value) =>
  normalizeText(value || DEFAULT_CAMPAIGN).toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60) ||
  DEFAULT_CAMPAIGN;

export const parseDonationAmount = (value) => {
  const raw = typeof value === "string" ? value.replace(/[\s,\u00A0]/g, "") : value;
  const amount = Number(raw);
  if (!Number.isFinite(amount) || !Number.isInteger(amount)) return null;
  if (amount < MIN_DONATION_XAF || amount > MAX_DONATION_XAF) return null;
  return amount;
};

const getSupabase = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw createHttpError("Donations are not configured on the server.", 503);
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-client-info": "panache-foundation-api" } },
  });
};

const paymentsConfigured = () => Boolean(CAMPAY_APP_USERNAME && CAMPAY_APP_PASSWORD);

const getRequestBaseUrl = (req) => {
  if (BASE_URL) return BASE_URL;
  const host = normalizeText(req.headers.host);
  if (!host) return "https://panache-foundation.org";
  const protocol = normalizeText(req.headers["x-forwarded-proto"]).includes("https")
    ? "https"
    : "http";
  return `${protocol}://${host}`.replace(/\/+$/, "");
};

// Copied from event-tickets.js (there is no shared Campay module).
const getCampayToken = async () => {
  if (!paymentsConfigured()) {
    throw createHttpError("Donations are being connected. Please try again shortly.", 503);
  }
  if (campayTokenCache.token && campayTokenCache.expiresAt > Date.now()) {
    return campayTokenCache.token;
  }

  const response = await fetch(`${CAMPAY_BASE_URL}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: CAMPAY_APP_USERNAME, password: CAMPAY_APP_PASSWORD }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.token) {
    throw createHttpError("Could not connect to secure payment.", 502);
  }

  campayTokenCache = { token: payload.token, expiresAt: Date.now() + 45 * 60 * 1000 };
  return payload.token;
};

const campayRequest = async (endpoint, options = {}) => {
  const token = await getCampayToken();
  const response = await fetch(`${CAMPAY_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw createHttpError(
      payload?.message || payload?.detail || "Secure payment request failed.",
      response.status || 502
    );
  }
  return payload;
};

// Ask Campay for a payment link. If it refuses a request that offers cards (for example because card
// payments are not switched on for this account), try once more with Mobile Money only.
export const requestPaymentLink = async (paymentLinkRequest, request = campayRequest) => {
  const send = (body) => request("/api/get_payment_link/", { method: "POST", body: JSON.stringify(body) });
  try {
    return { payment: await send(paymentLinkRequest), request: paymentLinkRequest, cardFallback: false };
  } catch (error) {
    const options = String(paymentLinkRequest.payment_options || "").split(",");
    const refused = error?.statusCode >= 400 && error?.statusCode < 500;
    if (!refused || !options.includes("CARD") || !options.includes("MOMO")) throw error;
    console.warn("ciyes-donations: Campay refused the card option, retrying with MOMO only:", error.message);
    const momoOnly = { ...paymentLinkRequest, payment_options: "MOMO" };
    return { payment: await send(momoOnly), request: momoOnly, cardFallback: true };
  }
};

const loadCampaign = async (supabase, slug) => {
  const { data, error } = await supabase
    .from("ciyes_donation_campaigns")
    .select("slug, title, goal_xaf, active")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data || !data.active) throw createHttpError("This campaign is not open.", 404);
  return data;
};

export const buildDonationRecord = (body) => {
  const amount = parseDonationAmount(body.amount ?? body.amount_xaf);
  if (!amount) {
    throw createHttpError(
      `Choose an amount between ${MIN_DONATION_XAF} and ${MAX_DONATION_XAF} FCFA.`,
      400,
      "amount"
    );
  }

  const rawPhone = normalizeText(body.whatsappPhone ?? body.whatsapp_phone);
  const whatsappPhone = normalizePhone(rawPhone);
  if (rawPhone && !/^\d{9,15}$/.test(whatsappPhone)) {
    throw createHttpError("Please check the WhatsApp number.", 400, "whatsappPhone");
  }

  const email = text(body.email, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createHttpError("Please check your email address.", 400, "email");
  }

  const language = text(body.language, 2);
  const source = text(body.source, 60);

  return {
    amount_xaf: amount,
    donor_name: text(body.donorName ?? body.donor_name, 80),
    whatsapp_phone: whatsappPhone || null,
    email: email ? email.toLowerCase() : null,
    message: text(body.message, 200),
    language: language && LANGUAGES.has(language) ? language : "en",
    source: source ? source.toLowerCase().replace(/[^a-z0-9_.-]/g, "") || null : null,
  };
};

const startDonation = async (req, body) => {
  // Validate before touching anything external.
  const record = buildDonationRecord(body);
  const campaignSlug = normalizeCampaign(body.campaign);
  if (!paymentsConfigured()) {
    throw createHttpError("Donations are being connected. Please try again shortly.", 503);
  }
  const supabase = getSupabase();
  await loadCampaign(supabase, campaignSlug);

  const txRef = `donation-${campaignSlug}-${Date.now()}-${crypto.randomBytes(5).toString("hex")}`;
  const redirectUrl = `${getRequestBaseUrl(req)}/donate/thank-you?tx_ref=${encodeURIComponent(txRef)}`;
  const paymentLinkRequest = {
    amount: String(record.amount_xaf),
    currency: CURRENCY,
    description: "CIYES community borehole donation",
    payment_options: CAMPAY_PAYMENT_OPTIONS,
    external_reference: txRef,
    redirect_url: redirectUrl,
    failure_redirect_url: redirectUrl,
    ...(record.email ? { email: record.email } : {}),
  };

  const { error: insertError } = await supabase.from("ciyes_donations").insert({
    ...record,
    tx_ref: txRef,
    campaign: campaignSlug,
    currency: CURRENCY,
    status: "pending",
    provider_payload: { payment_link_request: paymentLinkRequest },
  });
  if (insertError) throw insertError;

  let campayPayment;
  let linkRequest = paymentLinkRequest;
  let cardFallback = false;
  try {
    ({ payment: campayPayment, request: linkRequest, cardFallback } = await requestPaymentLink(paymentLinkRequest));
  } catch (error) {
    await supabase
      .from("ciyes_donations")
      .update({ status: "failed", provider_status: "LINK_FAILED", updated_at: new Date().toISOString() })
      .eq("tx_ref", txRef);
    throw error;
  }

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
    throw createHttpError("Secure payment could not return a payment link. Please try again.", 502);
  }

  const { error: updateError } = await supabase
    .from("ciyes_donations")
    .update({
      campay_reference: campayReference,
      payment_link: paymentLink,
      provider_payload: {
        payment_link_request: linkRequest,
        payment_link_response: campayPayment,
        ...(cardFallback ? { card_fallback: true } : {}),
      },
      updated_at: new Date().toISOString(),
    })
    .eq("tx_ref", txRef);
  if (updateError) throw updateError;

  return { ok: true, paymentLink, txRef };
};

const verifyDonation = async (body) => {
  const txRef = normalizeText(body.txRef ?? body.tx_ref);
  if (!/^donation-[a-z0-9-]+$/i.test(txRef)) {
    throw createHttpError("Missing donation reference.", 400);
  }
  const supabase = getSupabase();
  const { data: donation, error } = await supabase
    .from("ciyes_donations")
    .select("id, tx_ref, campay_reference, amount_xaf, currency, status, provider_payload, donor_name, campaign")
    .eq("tx_ref", txRef)
    .maybeSingle();
  if (error) throw error;
  if (!donation) throw createHttpError("We could not find this donation.", 404);

  const publicDonation = (status) => ({
    ok: true,
    status,
    amount_xaf: donation.amount_xaf,
    donor_name: donation.donor_name,
    campaign: donation.campaign,
  });

  if (donation.status === "completed") return publicDonation("completed");
  if (!donation.campay_reference) return publicDonation(donation.status === "pending" ? "failed" : donation.status);

  const transaction = await campayRequest(
    `/api/transaction/${encodeURIComponent(donation.campay_reference)}/`
  );
  const providerStatus = String(transaction.status || "").toUpperCase();
  const paidAmount = Number(transaction.amount);
  const externalReference = transaction.external_reference || transaction.externalReference;
  const successful = completedProviderStatuses.has(providerStatus);
  const sameReference = externalReference === donation.tx_ref;
  const enoughPaid = paidAmount >= Number(donation.amount_xaf);
  const sameCurrency =
    String(transaction.currency || donation.currency).toUpperCase() === donation.currency;
  const now = new Date().toISOString();
  const payload = { ...(donation.provider_payload || {}), verify_response: transaction };

  if (successful && sameReference && enoughPaid && sameCurrency) {
    const { error: updateError } = await supabase
      .from("ciyes_donations")
      .update({ status: "completed", provider_status: providerStatus, provider_payload: payload, verified_at: now, updated_at: now })
      .eq("id", donation.id);
    if (updateError) throw updateError;
    return publicDonation("completed");
  }

  const shouldFail =
    failedProviderStatuses.has(providerStatus) ||
    (successful && (!sameReference || !enoughPaid || !sameCurrency));
  const nextStatus = shouldFail
    ? providerStatus.startsWith("CANCEL")
      ? "cancelled"
      : "failed"
    : "pending";

  await supabase
    .from("ciyes_donations")
    .update({ status: nextStatus, provider_status: providerStatus || null, provider_payload: payload, updated_at: now })
    .eq("id", donation.id);

  return publicDonation(nextStatus);
};

const getTotals = async (req) => {
  const url = new URL(req.url || "/", "http://localhost");
  const campaignSlug = normalizeCampaign(req.query?.campaign || url.searchParams.get("campaign"));
  const supabase = getSupabase();
  const campaign = await loadCampaign(supabase, campaignSlug);

  let raised = 0;
  let donors = 0;
  const pageSize = 1000;
  for (let page = 0; ; page += 1) {
    const { data = [], error } = await supabase
      .from("ciyes_donations")
      .select("amount_xaf")
      .eq("campaign", campaignSlug)
      .eq("status", "completed")
      .range(page * pageSize, page * pageSize + pageSize - 1);
    if (error) throw error;
    for (const row of data) {
      raised += Number(row.amount_xaf) || 0;
      donors += 1;
    }
    if (data.length < pageSize) break;
  }

  const fx = await getUsdPerXaf();
  return {
    ok: true,
    campaign: campaignSlug,
    goal_xaf: campaign.goal_xaf ?? null,
    raised_xaf: raised,
    donors,
    usd_per_xaf: fx.usdPerXaf,
    usd_rate_date: fx.date,
  };
};

export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      res.setHeader("Allow", "GET,POST,OPTIONS");
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "GET") {
      res.setHeader("Cache-Control", "no-store");
      return sendJson(res, 200, await getTotals(req));
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "GET,POST,OPTIONS");
      return sendJson(res, 405, { ok: false, message: "Method not allowed." });
    }

    const body = parseBody(req);
    const action = normalizeText(body.action);

    if (action === "start") {
      // Honeypot: only bots fill in the hidden "website" field. Pretend nothing happened.
      if (text(body.website, 200)) return sendJson(res, 200, { ok: true, paymentLink: null });
      return sendJson(res, 200, await startDonation(req, body));
    }
    if (action === "verify") {
      return sendJson(res, 200, await verifyDonation(body));
    }
    return sendJson(res, 400, { ok: false, message: "Unknown action." });
  } catch (error) {
    const statusCode = error?.statusCode || 500;
    if (statusCode >= 500) console.error("ciyes-donations failed", error?.code, error?.message);
    return sendJson(res, statusCode, {
      ok: false,
      message: statusCode >= 500 && !error?.statusCode ? "Something went wrong. Please try again." : error.message,
      field: error?.field,
    });
  }
}
