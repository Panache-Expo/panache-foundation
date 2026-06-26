import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const TICKET_ACCESS_KEY =
  process.env.EVENT_TICKETS_ACCESS_KEY ||
  process.env.DASHBOARD_ACCESS_KEY ||
  process.env.PANACHE_DASHBOARD_ACCESS_KEY ||
  "";

const CAMPAY_BASE_URL = (
  process.env.EVENT_TICKETS_CAMPAY_BASE_URL ||
  process.env.CAMPAY_BASE_URL ||
  "https://www.campay.net"
).replace(/\/+$/, "");
const CAMPAY_APP_USERNAME =
  process.env.EVENT_TICKETS_CAMPAY_APP_USERNAME || "";
const CAMPAY_APP_PASSWORD =
  process.env.EVENT_TICKETS_CAMPAY_APP_PASSWORD || "";
const CAMPAY_PAYMENT_OPTIONS =
  process.env.EVENT_TICKETS_CAMPAY_PAYMENT_OPTIONS || "MOMO,CARD";
const CURRENCY = (process.env.EVENT_TICKETS_CURRENCY || "XAF").toUpperCase();
const CAMPAY_DEMO_MODE = /demo\.campay/i.test(CAMPAY_BASE_URL);
const DEMO_PAYMENT_AMOUNT_XAF = Number.parseInt(
  process.env.EVENT_TICKETS_DEMO_PAYMENT_AMOUNT_XAF || "25",
  10
);
const EVENT_TICKETS_BASE_URL = (
  process.env.EVENT_TICKETS_BASE_URL ||
  process.env.PANACHE_FRONTEND_BASE_URL ||
  ""
).replace(/\/+$/, "");

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE =
  String(process.env.SMTP_SECURE || "true").toLowerCase() !== "false";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || "";

const getErrorMessage = (error, fallback) =>
  error instanceof Error ? error.message : fallback;

const createTransportOptions = () => {
  const options = [];
  const addOption = (port, secure) => {
    const key = `${SMTP_HOST}:${port}:${secure}`;
    if (options.some((option) => option.key === key)) return;
    options.push({
      key,
      host: SMTP_HOST,
      port,
      secure,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  };

  addOption(SMTP_PORT, SMTP_SECURE);
  if (SMTP_HOST.toLowerCase().includes("gmail.com")) {
    addOption(465, true);
    addOption(587, false);
  }
  return options;
};

const createVerifiedTransporter = async () => {
  let lastError = null;

  for (const option of createTransportOptions()) {
    const { key, ...transportOption } = option;
    const transporter = nodemailer.createTransport(transportOption);
    try {
      await transporter.verify();
      return transporter;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Could not connect to the SMTP server.");
};

const EVENT_COLUMNS =
  "id, slug, title, short_title, event_date, event_date_label, venue, brand, status, sort_order, created_at, updated_at";
const PACKAGE_COLUMNS =
  "id, event_id, slug, name, description, price_xaf, admit_count, benefits, status, sort_order, style_key, created_at, updated_at";
const ORDER_COLUMNS =
  "id, event_id, package_id, tx_ref, campay_reference, payment_link, provider, status, buyer_name, buyer_email, buyer_whatsapp, whatsapp_consent, amount_xaf, currency, provider_status, provider_payload, verified_at, failure_reason, ticket_email_sent_at, ticket_email_error, created_at, updated_at";
const TICKET_COLUMNS =
  "id, order_id, event_id, package_id, ticket_code, qr_token, buyer_name, buyer_email, buyer_whatsapp, admit_count, checked_in_count, status, issued_at, last_checked_in_at, created_at, updated_at";

const completedProviderStatuses = new Set(["SUCCESSFUL", "SUCCESS"]);
const failedProviderStatuses = new Set(["FAILED", "CANCELLED", "CANCELED"]);
const eventVerifyPaths = {
  "cyes-awards-night": "/cyes/tickets/payment/verify",
  "panache-dor-awards-night": "/panache-expo/panache-dor/tickets/payment/verify",
};
const eventPrefixes = {
  "cyes-awards-night": "CYES",
  "panache-dor-awards-night": "PDOR",
};
const CONTESTANT_BASE_PASS_PROVIDER = "contestant-pass";
const CONTESTANT_BASE_PASS_PACKAGE_SLUG = "access-beer";
const contestantBasePassSources = {
  cyes: {
    label: "CYES Awards",
    eventSlug: "cyes-awards-night",
    verifyRpcName: "public_verify_cyes_contestant_password",
  },
  "panache-dor": {
    label: "Panache D'or",
    eventSlug: "panache-dor-awards-night",
    verifyRpcName: "public_verify_panache_dor_contestant_password",
  },
  "panache-360": {
    label: "Panache 360",
    eventSlug: "panache-dor-awards-night",
    verifyRpcName: "public_verify_panache_360_contestant_password",
  },
  "miss-panache": {
    label: "Miss Panache",
    eventSlug: "panache-dor-awards-night",
    verifyRpcName: "verify_miss_panache_contestant_password",
  },
};
const ticketBackgrounds = {
  "cyes-awards-night": "cyes-ticket-bg-downloaded.png",
  "panache-dor-awards-night": "panache-dor-ticket-bg-downloaded.png",
};
const ticketEventDetails = {
  "cyes-awards-night": {
    redCarpet: "RED CARPET 5PM",
    eventTime: "EVENT PROPER 7PM",
    dressCode: "STRICTLY CLASSIC OR TRADITIONAL",
  },
  "panache-dor-awards-night": {
    redCarpet: "RED CARPET 5PM",
    eventTime: "AWARD NIGHT 7PM",
    dressCode: "STRICTLY CLASSIC OR TRADITIONAL",
  },
};

const ticketEventDisplayOverrides = {
  "cyes-awards-night": {
    title: "CYES & Awards Night",
    short_title: "CYES & Awards",
    venue: "Chariot Hotel, Buea",
  },
  "panache-dor-awards-night": {
    venue: "Chariot Hotel, Buea",
  },
};

const ticketPackageVisuals = {
  "prestige-table-8": {
    tier: "PRESTIGE",
    tierAccent: "#E4B94A",
    tierAccentDark: "#7A5A12",
    tierAccentSoft: "#F7E6AD",
    tierAccentInk: "#171411",
    motif: "WHISKY  BAILEYS  WINE  BEER",
  },
  "premium-table-5": {
    tier: "PREMIUM",
    tierAccent: "#1F76D2",
    tierAccentDark: "#0D4E91",
    tierAccentSoft: "#DFECFB",
    tierAccentInk: "#FFFFFF",
    motif: "WHISKY  BAILEYS  WINE",
  },
  "classic-table-3": {
    tier: "CLASSIC",
    tierAccent: "#0F8A5F",
    tierAccentDark: "#064D36",
    tierAccentSoft: "#DDF4EA",
    tierAccentInk: "#FFFFFF",
    motif: "BAILEYS  WINE  BEER",
  },
  "access-beer": {
    tier: "ACCESS",
    tierAccent: "#E83E8C",
    tierAccentDark: "#8A1D52",
    tierAccentSoft: "#FBE0EE",
    tierAccentInk: "#FFFFFF",
    motif: "ACCESS  BEER",
  },
};

const ticketPackageVisualAliases = {
  prestige: "prestige-table-8",
  premium: "premium-table-5",
  classic: "classic-table-3",
  access: "access-beer",
};

const isAccessPassPackage = (ticketPackage = {}) => {
  const slug = String(ticketPackage.slug || "").toLowerCase();
  const styleKey = String(ticketPackage.style_key || "").toLowerCase();
  return slug === "access-beer" || styleKey === "access";
};

const ticketPriceVisuals = {
  2000: {
    tierAccent: "#E83E8C",
    tierAccentDark: "#8A1D52",
    tierAccentSoft: "#FBE0EE",
    tierAccentInk: "#FFFFFF",
  },
  25000: {
    tierAccent: "#0F8A5F",
    tierAccentDark: "#064D36",
    tierAccentSoft: "#DDF4EA",
    tierAccentInk: "#FFFFFF",
  },
  50000: {
    tierAccent: "#1F76D2",
    tierAccentDark: "#0D4E91",
    tierAccentSoft: "#DFECFB",
    tierAccentInk: "#FFFFFF",
  },
  100000: {
    tierAccent: "#E4B94A",
    tierAccentDark: "#7A5A12",
    tierAccentSoft: "#F7E6AD",
    tierAccentInk: "#171411",
  },
};

const ticketBrandThemes = {
  cyes: {
    deep: "#063621",
    deepAlt: "#0D5D37",
    accent: "#1F76D2",
    ink: "#14231D",
    light: "#FBF8EC",
  },
  "panache-dor": {
    deep: "#171411",
    deepAlt: "#2A1730",
    accent: "#8241B6",
    ink: "#171411",
    light: "#FBF7EF",
  },
};

const CYES_FRAME_MARK_PATHS = [
  {
    fill: "#E00012",
    d: "M38.9012 35.6638C39.1731 31.149 38.5631 26.8132 37.3831 22.5371C36.203 18.2809 34.413 14.2964 32.1456 10.4513C32.318 10.4181 32.4373 10.3717 32.55 10.3783C34.4262 10.4446 36.3024 10.5838 38.1786 10.5706C39.1333 10.5706 39.6504 11.0413 40.194 11.691C42.9321 14.9793 45.1132 18.6057 46.7706 22.5437C46.8634 22.7625 46.8966 23.0874 46.8104 23.2995C44.9541 27.8276 42.3685 31.8982 39.0802 35.5246C39.0471 35.5577 39.0073 35.5776 38.9012 35.6572V35.6638Z",
  },
  {
    fill: "#FFB100",
    d: "M10.639 38.9587C15.1538 39.2305 19.4896 38.6206 23.7657 37.4405C28.022 36.2605 32.0064 34.4705 35.8516 32.2031C35.8847 32.3755 35.9311 32.4948 35.9245 32.6075C35.8582 34.4837 35.719 36.3599 35.7323 38.2361C35.7323 39.1908 35.2615 39.7079 34.6118 40.2515C31.3235 42.9896 27.6971 45.1707 23.7591 46.8281C23.5403 46.9209 23.2155 46.9541 23.0033 46.8679C18.4753 45.0116 14.4047 42.426 10.7783 39.1377C10.7451 39.1046 10.7252 39.0648 10.6457 38.9587H10.639Z",
  },
  {
    fill: "#007033",
    d: "M35.4537 7.96473C26.391 7.56695 18.1371 10.179 10.3539 14.7402C10.3539 13.4474 10.3207 12.2077 10.3671 10.968C10.4003 9.94036 10.513 8.9194 10.6191 7.89843C10.639 7.71943 10.7251 7.49402 10.8577 7.38132C14.3648 4.25213 18.336 1.84556 22.6718 0.0423005C22.811 -0.0173663 23.0165 -0.0107367 23.1557 0.0423005C26.6031 1.46767 29.8185 3.29746 32.7687 5.59131C33.7035 6.31395 34.6051 7.07635 35.52 7.8255C35.5001 7.87191 35.4802 7.91832 35.4603 7.96473H35.4537Z",
  },
  {
    fill: "#006798",
    d: "M14.6432 35.7299C13.3703 35.7299 12.177 35.763 10.9837 35.7232C9.94281 35.6835 8.90859 35.5774 7.87436 35.4713C7.6821 35.4514 7.44344 35.3454 7.31747 35.2061C4.24795 31.7322 1.83475 27.8472 0.064639 23.5645C-0.0215463 23.3523 -0.0215463 23.0341 0.064639 22.8219C1.71542 18.7513 4.00265 15.0653 6.82688 11.704C7.15173 11.3195 7.48984 10.9483 7.88099 10.4974C7.47658 19.6397 10.082 27.9069 14.6432 35.7365V35.7299Z",
  },
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

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parseBody = (req) => {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }
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
  if (value === undefined || value === null) {
    return "";
  }
  return String(value).trim();
};

const normalizeEmail = (value) => {
  const email = normalizeText(value).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
};

const normalizePhone = (value) => {
  const digits = normalizeText(value).replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  if (digits.startsWith("237")) {
    return digits;
  }
  if (digits.length === 9) {
    return `237${digits}`;
  }
  return digits;
};

const normalizeUrl = (value) => {
  const url = normalizeText(value);
  if (!url) {
    return "";
  }
  try {
    return new URL(url).toString();
  } catch {
    return "";
  }
};

const moneyAmount = (value) => Math.round(Number(value || 0));

const normalizeContestantPassSource = (value) => {
  const source = normalizeText(value)
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");

  if (source === "panachedor") return "panache-dor";
  if (source === "panache360") return "panache-360";
  if (source === "misspanache") return "miss-panache";
  return source;
};

const resolveChargeAmount = (ticketPackage) => {
  const packagePrice = moneyAmount(ticketPackage.price_xaf);
  if (!CAMPAY_DEMO_MODE) {
    return packagePrice;
  }

  return Math.max(1, Math.min(packagePrice, DEMO_PAYMENT_AMOUNT_XAF || 25));
};

const getSupabase = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw createHttpError("Ticket backend is not configured.", 503);
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
};

const paymentsConfigured = () =>
  Boolean(CAMPAY_APP_USERNAME && CAMPAY_APP_PASSWORD);

const getRequestBaseUrl = (req) => {
  const host = normalizeText(req.headers.host);
  if (!host) {
    return "https://panache-foundation.org";
  }
  const protocol =
    normalizeText(req.headers["x-forwarded-proto"]).includes("https")
      ? "https"
      : "http";
  return `${protocol}://${host}`.replace(/\/+$/, "");
};

const getHostname = (urlOrHost) => {
  const raw = normalizeText(urlOrHost);
  if (!raw) {
    return "";
  }

  try {
    return new URL(raw.includes("://") ? raw : `http://${raw}`).hostname;
  } catch {
    return raw.split(":")[0] || "";
  }
};

const isLocalOrPrivateHost = (host) => {
  const hostname = getHostname(host);
  if (["localhost", "127.0.0.1", "::1"].includes(hostname)) {
    return true;
  }

  if (/^192\.168\./.test(hostname) || /^10\./.test(hostname)) {
    return true;
  }

  const match = /^172\.(\d{1,2})\./.exec(hostname);
  return Boolean(match && Number(match[1]) >= 16 && Number(match[1]) <= 31);
};

const resolveBaseUrl = (req) => {
  if (req.ticketBaseUrlOverride) {
    return req.ticketBaseUrlOverride;
  }

  const requestBaseUrl = getRequestBaseUrl(req);
  const configuredHost = getHostname(EVENT_TICKETS_BASE_URL);
  const requestHost = getHostname(requestBaseUrl);

  if (
    EVENT_TICKETS_BASE_URL &&
    ["localhost", "127.0.0.1", "::1"].includes(configuredHost) &&
    isLocalOrPrivateHost(requestHost) &&
    !["localhost", "127.0.0.1", "::1"].includes(requestHost)
  ) {
    return requestBaseUrl;
  }

  if (EVENT_TICKETS_BASE_URL) {
    return EVENT_TICKETS_BASE_URL;
  }

  return requestBaseUrl;
};

const assertLocalTestRequest = (req) => {
  if (!isLocalOrPrivateHost(req.headers.host)) {
    throw createHttpError("Local test tickets are only available on localhost.", 404);
  }
};

const getAccessKey = (req, body = {}) =>
  normalizeText(
    req.headers["x-dashboard-key"] ||
      req.headers["x-dashboard-access-key"] ||
      body.accessKey ||
      body.access_key
  );

const requireTicketAccess = (req, body = {}) => {
  if (!TICKET_ACCESS_KEY || getAccessKey(req, body) !== TICKET_ACCESS_KEY) {
    throw createHttpError("Ticket staff access is required.", 401);
  }
};

const buildCheckInUrl = (req, ticket) =>
  `${resolveBaseUrl(req)}/tickets/check-in?code=${encodeURIComponent(
    ticket.ticket_code
  )}&token=${encodeURIComponent(ticket.qr_token)}`;

const buildDownloadUrl = (req, ticket) =>
  `${resolveBaseUrl(req)}/api/event-tickets?action=downloadTicket&ticketCode=${encodeURIComponent(
    ticket.ticket_code
  )}&token=${encodeURIComponent(ticket.qr_token)}`;

const getTicketBackgroundPath = (eventSlug, ticketPackage = {}) => {
  const eventPrefix =
    eventSlug === "cyes-awards-night"
      ? "cyes"
      : eventSlug === "panache-dor-awards-night"
        ? "panache-dor"
        : "";
  const packageSlug = normalizeText(ticketPackage.slug).toLowerCase();
  const packageBackground = eventPrefix && packageSlug
    ? `${eventPrefix}-${packageSlug}-ticket-bg.png`
    : "";
  const filenames = [packageBackground, ticketBackgrounds[eventSlug]].filter(Boolean);

  for (const filename of filenames) {
    const candidate = path.join(process.cwd(), "src", "assets", "tickets", filename);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return "";
};

const getPanacheDorLogoPath = () => {
  const candidate = path.join(
    process.cwd(),
    "src",
    "assets",
    "panache_dor_awards_2026_logo_transparent.png"
  );
  return fs.existsSync(candidate) ? candidate : "";
};

const getCampayToken = async () => {
  if (!paymentsConfigured()) {
    throw createHttpError("Ticket payments are not configured yet.", 503);
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
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.token) {
    throw createHttpError("Could not connect to secure payment.", 502);
  }

  campayTokenCache = {
    token: payload.token,
    expiresAt: Date.now() + 45 * 60 * 1000,
  };
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

const loadPublicEvent = async (supabase, eventSlug) => {
  const { data: event, error: eventError } = await supabase
    .from("event_ticket_events")
    .select(`${EVENT_COLUMNS}, packages:event_ticket_packages(${PACKAGE_COLUMNS})`)
    .eq("slug", eventSlug)
    .eq("status", "active")
    .single();

  if (eventError || !event) {
    throw createHttpError("This ticket event is not available.", 404);
  }

  return {
    ...applyTicketEventDisplayOverrides(event),
    packages: (event.packages || [])
      .filter((ticketPackage) => ticketPackage.status === "active")
      .sort((left, right) => left.sort_order - right.sort_order),
  };
};

const applyTicketEventDisplayOverrides = (event) => ({
  ...event,
  ...(ticketEventDisplayOverrides[event?.slug] || {}),
});

const isContestantBasePassOrder = (order = {}) =>
  order.provider === CONTESTANT_BASE_PASS_PROVIDER ||
  Boolean(order.provider_payload?.contestant_base_pass);

const getDisplayTicketPackage = (order, ticketPackage) => {
  if (!isContestantBasePassOrder(order)) {
    return ticketPackage;
  }

  return {
    ...ticketPackage,
    slug: "contestant-access-pass",
    name: "Access Pass",
    description:
      "Complimentary nominee entrance pass. This pass does not include a free drink.",
    price_xaf: 0,
    admit_count: 1,
    benefits: ["Event access", "QR entrance pass"],
    style_key: "contestant-access",
  };
};

const serializeEvent = (event) => {
  const displayEvent = applyTicketEventDisplayOverrides(event);

  return {
    id: displayEvent.id,
    slug: displayEvent.slug,
    title: displayEvent.title,
    short_title: displayEvent.short_title,
    event_date: displayEvent.event_date,
    event_date_label: displayEvent.event_date_label,
    venue: displayEvent.venue,
    brand: displayEvent.brand,
    packages: displayEvent.packages || [],
  };
};

const buildTicketResponse = async (req, ticket, order, event, ticketPackage) => {
  const displayEvent = applyTicketEventDisplayOverrides(event);
  const displayPackage = getDisplayTicketPackage(order, ticketPackage);
  const checkInUrl = buildCheckInUrl(req, ticket);
  const qrImageDataUrl = await QRCode.toDataURL(checkInUrl, {
    width: 420,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  return {
    id: ticket.id,
    ticket_code: ticket.ticket_code,
    qr_token: ticket.qr_token,
    buyer_name: ticket.buyer_name,
    buyer_email: ticket.buyer_email,
    buyer_whatsapp: ticket.buyer_whatsapp,
    admit_count: ticket.admit_count,
    checked_in_count: ticket.checked_in_count,
    status: ticket.status,
    issued_at: ticket.issued_at,
    check_in_url: checkInUrl,
    download_url: buildDownloadUrl(req, ticket),
    qr_image_data_url: qrImageDataUrl,
    event: serializeEvent({ ...displayEvent, packages: [] }),
    package: displayPackage,
    order: {
      id: order.id,
      tx_ref: order.tx_ref,
      reference: order.campay_reference,
      amount_xaf: order.amount_xaf,
      currency: order.currency,
      status: order.status,
    },
  };
};

const createTicketCode = (eventSlug) => {
  const prefix = eventPrefixes[eventSlug] || "PASS";
  const token = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${token}`;
};

const createOrLoadTicket = async (supabase, order, event, ticketPackage) => {
  const { data: existingTicket, error: existingError } = await supabase
    .from("event_tickets")
    .select(TICKET_COLUMNS)
    .eq("order_id", order.id)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }
  if (existingTicket) {
    return existingTicket;
  }

  const { data: ticket, error } = await supabase
    .from("event_tickets")
    .insert({
      order_id: order.id,
      event_id: event.id,
      package_id: ticketPackage.id,
      ticket_code: createTicketCode(event.slug),
      qr_token: crypto.randomBytes(18).toString("hex"),
      buyer_name: order.buyer_name,
      buyer_email: order.buyer_email,
      buyer_whatsapp: order.buyer_whatsapp,
      admit_count: ticketPackage.admit_count,
      checked_in_count: 0,
      status: "active",
    })
    .select(TICKET_COLUMNS)
    .single();

  if (error) {
    throw error;
  }
  return ticket;
};

const renderBenefits = (benefits) =>
  Array.isArray(benefits) ? benefits.filter(Boolean) : [];

const getTicketVisualTheme = (event, ticketPackage) => {
  const brandTheme =
    ticketBrandThemes[event.brand] ||
    ticketBrandThemes[event.slug === "cyes-awards-night" ? "cyes" : "panache-dor"];
  const packageTheme =
    ticketPackageVisuals[ticketPackage.slug] ||
    ticketPackageVisuals[ticketPackage.style_key] ||
    ticketPackageVisuals["premium-table-5"];

  if (event.slug === "cyes-awards-night" && isAccessPassPackage(ticketPackage)) {
    return {
      ...brandTheme,
      ...packageTheme,
      deep: "#050505",
      deepAlt: "#151515",
      accent: "#FFFFFF",
      ink: "#0A0A0A",
      light: "#F7F3E4",
      tier: "ACCESS",
      tierAccent: "#F1C84B",
      tierAccentDark: "#0A0A0A",
      tierAccentSoft: "#FFF4C2",
      tierAccentInk: "#0A0A0A",
      motif: "CYES  ACCESS",
      backgroundOverlayOpacity: 0.58,
      monochromeLogo: true,
      qrDark: "#0A0A0A",
      qrLight: "#FFFFFF",
      qrCardFill: "#FFFFFF",
      qrCardOpacity: 1,
      qrStroke: "#F1C84B",
      qrStrokeOpacity: 0.9,
    };
  }

  return {
    ...brandTheme,
    ...packageTheme,
  };
};

const drawTicketBackground = (doc, width, height, theme) => {
  doc.rect(0, 0, width, height).fill(theme.light);

  doc.fillOpacity(0.96).fillColor(theme.deep).rect(0, 0, width, 178).fill();
  doc.fillOpacity(1);

  doc.fillOpacity(0.82).fillColor(theme.tierAccent).rect(0, 0, width, 10).fill();
  doc.fillOpacity(0.18).fillColor(theme.tierAccent).circle(width - 32, 82, 132).fill();
  doc.fillOpacity(0.1).fillColor(theme.accent).circle(58, 170, 94).fill();
  doc.fillOpacity(0.1).fillColor(theme.deepAlt).circle(width - 60, height - 86, 126).fill();
  doc.fillOpacity(1);

  doc.save();
  doc.rotate(-19, { origin: [width / 2, height / 2] });
  doc
    .fillOpacity(0.07)
    .fillColor(theme.ink)
    .font("Helvetica-Bold")
    .fontSize(28)
    .text(theme.motif, -34, 405, {
      width: width + 68,
      align: "center",
      characterSpacing: 2,
    });
  doc.restore();
  doc.fillOpacity(1);

  for (let index = 0; index < 9; index += 1) {
    const y = 230 + index * 44;
    doc
      .fillOpacity(index % 2 === 0 ? 0.12 : 0.07)
      .fillColor(index % 2 === 0 ? theme.tierAccent : theme.accent)
      .roundedRect(width - 74 + index * 3, y, 118, 18, 9)
      .fill();
  }
  doc.fillOpacity(1);
};

const drawCyesAwardLogo = (doc, width, y, theme = {}) => {
  if (theme.monochromeLogo) {
    doc
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .fontSize(25)
      .text("CYES", 0, y + 5, {
        width,
        align: "center",
        characterSpacing: 1.8,
      });
    doc
      .fillColor(theme.tierAccent || "#F1C84B")
      .font("Helvetica-Bold")
      .fontSize(8.8)
      .text("AWARDS NIGHT", 0, y + 38, {
        width,
        align: "center",
        characterSpacing: 2.1,
      });
    return;
  }

  const scale = 0.88;
  const logoWidth = 122;
  const logoX = (width - logoWidth) / 2;
  const markX = logoX;

  CYES_FRAME_MARK_PATHS.forEach((path) => {
    doc.save();
    doc.translate(markX, y + 3).scale(scale);
    doc.path(path.d).fill(path.fill);
    doc.restore();
  });

  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(19)
    .text("CYES", logoX + 54, y + 13, {
      width: 68,
      align: "left",
      characterSpacing: 0.6,
    });
  doc
    .fillColor("#FFFFFF")
    .font("Helvetica")
    .fontSize(6.4)
    .text("AWARDS NIGHT", logoX + 55, y + 35, {
      width: 70,
      align: "left",
      characterSpacing: 0.65,
    });
};

const drawPanacheDorAwardLogo = (doc, width, y, theme) => {
  const logoPath = getPanacheDorLogoPath();
  if (logoPath) {
    const sourceWidth = 460;
    const visibleWidth = 400;
    const visibleTop = 110;
    const logoWidth = 176;
    const scale = logoWidth / visibleWidth;
    const imageWidth = sourceWidth * scale;

    doc.image(logoPath, (width - imageWidth) / 2, y - visibleTop * scale, {
      width: imageWidth,
    });
    return;
  }

  const logoWidth = 178;
  const logoX = (width - logoWidth) / 2;
  const markX = logoX + 2;
  const markY = y + 5;

  doc.save();
  doc
    .strokeColor("#FFFFFF")
    .fillColor("#FFFFFF")
    .lineWidth(2.7)
    .lineCap("round")
    .lineJoin("round");
  doc.moveTo(markX, markY + 36).bezierCurveTo(markX + 14, markY + 18, markX + 34, markY + 14, markX + 50, markY + 27).stroke();
  doc.moveTo(markX + 52, markY + 28).bezierCurveTo(markX + 61, markY + 2, markX + 80, markY - 1, markX + 70, markY + 35).stroke();
  doc.moveTo(markX + 47, markY + 31).lineTo(markX + 39, markY + 58).lineTo(markX + 54, markY + 58).lineTo(markX + 52, markY + 31).fill();
  doc.moveTo(markX + 31, markY + 63).bezierCurveTo(markX + 42, markY + 59, markX + 57, markY + 59, markX + 68, markY + 63).stroke();
  doc
    .fillColor(theme.tierAccent)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("*", markX + 33, markY + 9, { width: 14, align: "center" });
  doc.restore();

  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("PANACHE", logoX + 84, y + 14, {
      width: 90,
      align: "left",
      characterSpacing: 0.5,
    });
  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(31)
    .text("D'OR", logoX + 82, y + 27, {
      width: 96,
      align: "left",
      characterSpacing: 0.7,
    });
  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("AWARDS 2026", logoX + 84, y + 58, {
      width: 96,
      align: "left",
      characterSpacing: 0.4,
    });
};

const getBenefitIconType = (benefit) => {
  const value = String(benefit || "").toLowerCase();
  if (value.includes("beer")) {
    return "beer";
  }
  if (value.includes("wine")) {
    return "wine";
  }
  if (
    value.includes("whisky") ||
    value.includes("whiskey") ||
    value.includes("chivas") ||
    value.includes("black")
  ) {
    return "whisky";
  }
  if (value.includes("baileys")) {
    return "baileys";
  }
  if (value.includes("access") || value.includes("entry")) {
    return "access";
  }
  return "ticket";
};

const drawBenefitIcon = (doc, type, x, y, theme) => {
  const size = 14;
  doc
    .circle(x + size / 2, y + size / 2, size / 2)
    .fillColor(theme.tierAccentSoft)
    .fillOpacity(1)
    .fill();

  doc.save();
  doc
    .translate(x, y)
    .strokeColor(theme.tierAccentDark)
    .fillColor(theme.tierAccentDark)
    .lineWidth(1.05)
    .lineCap("round")
    .lineJoin("round");

  if (type === "beer") {
    doc.roundedRect(3.2, 5.1, 6.4, 6.5, 1.4).stroke();
    doc.roundedRect(9, 6.5, 2.3, 3.3, 1.2).stroke();
    doc.moveTo(5.2, 6.6).lineTo(5.2, 10.2).stroke();
    doc.moveTo(7.5, 6.6).lineTo(7.5, 10.2).stroke();
    doc.circle(4.6, 4.4, 1.2).fill();
    doc.circle(6.8, 3.8, 1.4).fill();
    doc.circle(8.8, 4.5, 1.1).fill();
  } else if (type === "wine") {
    doc.moveTo(4.2, 2.8).lineTo(9.8, 2.8).lineTo(8.8, 6.5).stroke();
    doc.moveTo(4.2, 2.8).lineTo(5.2, 6.5).stroke();
    doc.moveTo(5.2, 6.5).quadraticCurveTo(7, 8.1, 8.8, 6.5).stroke();
    doc.moveTo(7, 7.8).lineTo(7, 11.4).stroke();
    doc.moveTo(4.8, 11.4).lineTo(9.2, 11.4).stroke();
  } else if (type === "whisky") {
    doc.roundedRect(3.5, 4, 7, 7.4, 1.4).stroke();
    doc.moveTo(4.2, 8).quadraticCurveTo(7, 9, 9.8, 8).stroke();
    doc.roundedRect(5, 5.5, 1.5, 1.5, 0.3).stroke();
    doc.roundedRect(7.5, 5.2, 1.5, 1.5, 0.3).stroke();
  } else if (type === "baileys") {
    doc.roundedRect(4.6, 3.5, 4.8, 8.2, 1.5).stroke();
    doc.roundedRect(5.8, 1.8, 2.4, 2.3, 0.6).stroke();
    doc.moveTo(5.2, 7).lineTo(8.8, 7).stroke();
    doc.moveTo(5.4, 8.7).lineTo(8.6, 8.7).stroke();
  } else {
    doc.roundedRect(2.8, 4.2, 8.4, 5.8, 1.2).stroke();
    doc.moveTo(7, 4.8).lineTo(7, 9.4).stroke();
    doc.circle(4.4, 7.1, 0.55).fill();
    doc.circle(9.6, 7.1, 0.55).fill();
  }

  doc.restore();
};

const formatPosterBenefit = (benefit) => {
  const value = String(benefit || "")
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!value) {
    return "";
  }

  return value
    .split(" ")
    .map((part, index) =>
      index === 0 && /^\d+$/.test(part)
        ? part
        : `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`
    )
    .join(" ");
};

const getPosterBenefits = (benefits) => {
  const priority = ["whisky", "wine", "baileys", "beer", "access", "ticket"];
  return renderBenefits(benefits)
    .map((benefit) => ({
      label: formatPosterBenefit(benefit),
      type: getBenefitIconType(benefit),
    }))
    .filter((benefit) => benefit.label)
    .sort((first, second) => priority.indexOf(first.type) - priority.indexOf(second.type));
};

const formatCompactXaf = (amount) => {
  const value = Number(amount || 0);
  if (value >= 1000 && value % 1000 === 0) {
    return `${Math.round(value / 1000)}K`;
  }
  return new Intl.NumberFormat("en-US").format(value);
};

const buildTicketPdfBuffer = async ({ req, ticket, order, event, ticketPackage }) => {
  event = applyTicketEventDisplayOverrides(event);
  ticketPackage = getDisplayTicketPackage(order, ticketPackage);
  const width = 420;
  const height = 760;
  const theme = getTicketVisualTheme(event, ticketPackage);
  const qrUrl = buildCheckInUrl(req, ticket);
  const qrBuffer = await QRCode.toBuffer(qrUrl, {
    type: "png",
    width: 360,
    margin: 1,
    errorCorrectionLevel: "M",
    color: {
      dark: theme.qrDark || `${theme.tierAccent}ff`,
      light: theme.qrLight || "#00000000",
    },
  });
  const eventDetails = ticketEventDetails[event.slug] || {};
  const backgroundPath = getTicketBackgroundPath(event.slug, ticketPackage);

  return await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [width, height], margin: 0 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    if (backgroundPath && !theme.forceGeneratedBackground) {
      doc.image(backgroundPath, 0, 0, { width, height });
    } else {
      drawTicketBackground(doc, width, height, theme);
    }

    doc
      .rect(0, 0, width, height)
      .fillColor("#040503")
      .fillOpacity(theme.backgroundOverlayOpacity ?? 0.72)
      .fill();
    doc.fillOpacity(1);
    doc.circle(26, 318, 112).fillColor(theme.tierAccent).fillOpacity(0.12).fill();
    doc.circle(width - 22, 222, 102).fillColor(theme.tierAccent).fillOpacity(0.1).fill();
    doc.fillOpacity(1);

    const packageTitle = ticketPackage.name.toUpperCase();
    const eventTitle = event.title.replace(/\s+Night$/i, "");
    const benefits = getPosterBenefits(ticketPackage.benefits);
    const benefitLine = benefits.map((benefit) => benefit.label).join(", ");
    const qrSize = 242;
    const qrX = (width - qrSize) / 2;
    const qrY = 258;

    if (event.slug === "panache-dor-awards-night") {
      drawPanacheDorAwardLogo(doc, width, 8, theme);
    } else {
      drawCyesAwardLogo(doc, width, 40, theme);
    }

    doc
      .fillColor(theme.tierAccentSoft)
      .font("Times-Bold")
      .fontSize(packageTitle.length > 14 ? 32 : 36)
      .text(packageTitle, 24, 124, {
        width: width - 48,
        align: "center",
        characterSpacing: 1.2,
      });
    doc
      .fillColor("#FFFFFF")
      .font("Times-Roman")
      .fontSize(24)
      .text(eventTitle, 34, 174, {
        width: width - 68,
        align: "center",
      });
    doc
      .fillColor(theme.tierAccent)
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .text(
        `${event.event_date_label}  |  ${eventDetails.eventTime || "EVENT 7PM"}  |  ${event.venue}`,
        42,
        214,
        {
          width: width - 84,
          align: "center",
          characterSpacing: 0.5,
        }
      );

    doc
      .roundedRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 10)
      .fillColor(theme.qrCardFill || "#020302")
      .fillOpacity(theme.qrCardOpacity ?? 0.84)
      .fill()
      .fillOpacity(1);
    doc
      .roundedRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 10)
      .strokeColor(theme.qrStroke || theme.tierAccent)
      .strokeOpacity(theme.qrStrokeOpacity ?? 0.24)
      .lineWidth(1.1)
      .stroke()
      .strokeOpacity(1);
    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

    if (benefits.length) {
      const iconGap = 24;
      const iconStartX = (width - ((benefits.length - 1) * iconGap + 14)) / 2;
      benefits.forEach((benefit, index) => {
        drawBenefitIcon(doc, benefit.type, iconStartX + index * iconGap, qrY + qrSize + 20, theme);
      });
    }
    doc
      .fillColor(theme.tierAccentSoft)
      .font("Helvetica")
      .fontSize(12)
      .text(benefitLine, 30, qrY + qrSize + 42, {
        width: width - 60,
        align: "center",
        ellipsis: true,
      });

    doc
      .fillColor("#FFFFFF")
      .font("Helvetica")
      .fontSize(ticket.buyer_name.length > 30 ? 18 : 21)
      .text(ticket.buyer_name, 24, 608, {
        width: width - 48,
        align: "center",
        ellipsis: true,
      });
    doc
      .fillColor(theme.tierAccent)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(`TICKET CODE: ${ticket.ticket_code}`, 24, 654, {
        width: width - 48,
        align: "center",
        characterSpacing: 0.35,
      });
    doc
      .fillColor("#FFFFFF")
      .font("Helvetica")
      .fontSize(8.2)
      .text(
        `${ticket.admit_count} ${ticket.admit_count === 1 ? "guest" : "guests"}  |  ${formatCompactXaf(
          ticketPackage.price_xaf
        )} XAF  |  Present QR at entrance`,
        30,
        708,
        {
          width: width - 60,
          align: "center",
        }
      );

    doc.end();
  });
};

const updateTicketEmailStatus = async (supabase, orderId, result) => {
  const { error } = await supabase
    .from("event_ticket_orders")
    .update({
      ticket_email_sent_at: result.ok ? new Date().toISOString() : null,
      ticket_email_error: result.ok
        ? null
        : result.message || result.error || "Ticket email could not be sent.",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error("Could not update ticket email status", error);
  }
};

const sendTicketEmail = async ({ req, ticket, order, event, ticketPackage }) => {
  event = applyTicketEventDisplayOverrides(event);
  if (!order.buyer_email) {
    return {
      attempted: true,
      ok: false,
      message: "Buyer email is missing.",
    };
  }
  if (!SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return {
      attempted: true,
      ok: false,
      message: "SMTP is not configured on the server.",
    };
  }

  const pdfBuffer = await buildTicketPdfBuffer({
    req,
    ticket,
    order,
    event,
    ticketPackage,
  });
  const downloadUrl = buildDownloadUrl(req, ticket);
  const benefits = renderBenefits(ticketPackage.benefits).join(", ");
  const isContestantBasePass =
    order.provider === CONTESTANT_BASE_PASS_PROVIDER ||
    Boolean(order.provider_payload?.contestant_base_pass);
  const ticketLabel = isContestantBasePass ? "base event pass" : "ticket";
  const readyMessage = isContestantBasePass
    ? "Your complimentary contestant base pass is attached. No payment is required for this pass."
    : "Your payment has been verified and your ticket is attached.";
  const transporter = await createVerifiedTransporter();

  await transporter.sendMail({
    from: SMTP_FROM,
    to: order.buyer_email,
    subject: `${event.short_title} ${ticketLabel} - ${ticket.ticket_code}`,
    text: `
Hello ${order.buyer_name},

Your ${ticketLabel} for ${event.title} is ready.
${readyMessage}

Ticket code: ${ticket.ticket_code}
Package: ${ticketPackage.name}
Admits: ${ticket.admit_count}
Date: ${event.event_date_label}
Venue: ${event.venue}
Includes: ${benefits}

Download your ticket: ${downloadUrl}

Please present the QR code at the entrance.
`.trim(),
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#171411;">
        <h2 style="margin:0 0 16px;">Your ${event.short_title} ${ticketLabel} is ready</h2>
        <p style="margin:0 0 12px;">Hello ${order.buyer_name},</p>
        <p style="margin:0 0 12px;">${readyMessage}</p>
        <p style="margin:0 0 8px;">Ticket code: <strong>${ticket.ticket_code}</strong></p>
        <p style="margin:0 0 8px;">Package: <strong>${ticketPackage.name}</strong></p>
        <p style="margin:0 0 8px;">Admits: <strong>${ticket.admit_count}</strong></p>
        <p style="margin:0 0 8px;">Date: <strong>${event.event_date_label}</strong></p>
        <p style="margin:0 0 16px;">Venue: <strong>${event.venue}</strong></p>
        <p style="margin:0 0 20px;">
          <a href="${downloadUrl}" style="display:inline-block;padding:12px 18px;background:#171411;color:#ffffff;text-decoration:none;border-radius:999px;">
            Download ticket
          </a>
        </p>
        <p style="margin:0;">Please present the QR code at the entrance.</p>
      </div>
    `,
    attachments: [
      {
        filename: `${ticket.ticket_code}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  return { attempted: true, ok: true };
};

const maybeSendTicketEmail = async (supabase, args) => {
  try {
    const result = await sendTicketEmail(args);
    if (result.attempted) {
      await updateTicketEmailStatus(supabase, args.order.id, result);
    }
    return result;
  } catch (error) {
    const result = {
      attempted: true,
      ok: false,
      message: getErrorMessage(error, "Ticket email could not be sent."),
    };
    await updateTicketEmailStatus(supabase, args.order.id, result);
    return result;
  }
};

const initializeTicketPayment = async (req, supabase, body) => {
  const eventSlug = normalizeText(body.eventSlug || body.event_slug);
  const packageSlug = normalizeText(body.packageSlug || body.package_slug);
  const buyerName = normalizeText(body.buyerName || body.buyer_name || body.name);
  const rawEmail = normalizeText(body.buyerEmail || body.buyer_email || body.email);
  const buyerEmail = normalizeEmail(rawEmail);
  const buyerWhatsapp = normalizePhone(
    body.buyerWhatsapp || body.buyer_whatsapp || body.whatsapp
  );
  const whatsappConsent = Boolean(body.whatsappConsent || body.whatsapp_consent);

  if (!buyerName) {
    throw createHttpError("Enter the buyer name.");
  }
  if (!rawEmail || !buyerEmail) {
    throw createHttpError("Enter a valid email address for the ticket.");
  }
  if (buyerWhatsapp && !whatsappConsent) {
    throw createHttpError("Confirm WhatsApp consent or leave the number blank.");
  }
  if (!paymentsConfigured()) {
    throw createHttpError("Ticket payment is being connected. Please check again shortly.", 503);
  }

  const event = await loadPublicEvent(supabase, eventSlug);
  const ticketPackage = event.packages.find((item) => item.slug === packageSlug);
  if (!ticketPackage) {
    throw createHttpError("This ticket package is not available.", 404);
  }

  const amount = resolveChargeAmount(ticketPackage);
  const txRef = `ticket-${event.slug}-${Date.now()}-${crypto
    .randomBytes(5)
    .toString("hex")}`;
  const verifyPath = eventVerifyPaths[event.slug] || "/tickets/payment/verify";
  const redirectUrl = `${resolveBaseUrl(req)}${verifyPath}?tx_ref=${encodeURIComponent(txRef)}`;
  const description = `${event.short_title} ${ticketPackage.name} ticket`;
  const paymentLinkRequest = {
    amount: String(amount),
    currency: CURRENCY,
    description,
    payment_options: CAMPAY_PAYMENT_OPTIONS,
    external_reference: txRef,
    redirect_url: redirectUrl,
    failure_redirect_url: redirectUrl,
    email: buyerEmail,
  };

  const campayPayment = await campayRequest("/api/get_payment_link/", {
    method: "POST",
    body: JSON.stringify(paymentLinkRequest),
  });
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
    throw createHttpError(
      "Secure payment could not return a payment link. Please try again.",
      502
    );
  }

  const { data: order, error } = await supabase
    .from("event_ticket_orders")
    .insert({
      event_id: event.id,
      package_id: ticketPackage.id,
      tx_ref: txRef,
      campay_reference: campayReference,
      payment_link: paymentLink,
      provider: "campay",
      status: "pending",
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_whatsapp: buyerWhatsapp || null,
      whatsapp_consent: Boolean(buyerWhatsapp && whatsappConsent),
      amount_xaf: amount,
      currency: CURRENCY,
      provider_payload: {
        display_price_xaf: ticketPackage.price_xaf,
        demo_payment_mode: CAMPAY_DEMO_MODE,
        payment_link_request: paymentLinkRequest,
        payment_link_response: campayPayment,
      },
    })
    .select(ORDER_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return {
    order: {
      id: order.id,
      tx_ref: order.tx_ref,
      reference: order.campay_reference,
      payment_link: order.payment_link,
      amount_xaf: order.amount_xaf,
      currency: order.currency,
      event_title: event.title,
      package_name: ticketPackage.name,
      redirect_url: redirectUrl,
    },
  };
};

const verifyContestantForBasePass = async (supabase, sourceConfig, slug, password) => {
  if (!slug) {
    throw createHttpError("Contestant link is missing.", 400);
  }
  if (!password) {
    throw createHttpError("Enter your private password.", 400);
  }

  const { data, error } = await supabase.rpc(sourceConfig.verifyRpcName, {
    p_slug: slug,
    p_password: password,
  });

  if (error) {
    throw error;
  }

  const contestant = Array.isArray(data) ? data[0] : data;
  if (!contestant?.id) {
    throw createHttpError("Invalid private password.", 401);
  }

  return {
    id: contestant.id,
    slug: contestant.slug || slug,
    name: contestant.name || "Contestant",
    organization: contestant.organization || null,
    category_name: contestant.category_name || null,
    category_slug: contestant.category_slug || null,
    total_votes: contestant.total_votes || 0,
  };
};

const loadContestantBasePassOrder = async (supabase, txRef) => {
  const { data, error } = await supabase
    .from("event_ticket_orders")
    .select(
      `${ORDER_COLUMNS}, event:event_ticket_events(${EVENT_COLUMNS}), package:event_ticket_packages(${PACKAGE_COLUMNS}), ticket:event_tickets(${TICKET_COLUMNS})`
    )
    .eq("tx_ref", txRef)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data || null;
};

const getBasePassPackage = (event) =>
  event.packages.find((item) => item.slug === CONTESTANT_BASE_PASS_PACKAGE_SLUG) ||
  event.packages.find(
    (item) => moneyAmount(item.price_xaf) === 2000 && Number(item.admit_count) === 1
  );

const createContestantBasePass = async (req, supabase, body) => {
  const source = normalizeContestantPassSource(
    body.source || body.platform || body.competition
  );
  const sourceConfig = contestantBasePassSources[source];
  const slug = normalizeText(body.slug || body.contestantSlug || body.contestant_slug);
  const password = normalizeText(body.password || body.accessCode || body.access_code);

  if (!sourceConfig) {
    throw createHttpError("Contestant pass source is not supported.", 400);
  }

  const contestant = await verifyContestantForBasePass(
    supabase,
    sourceConfig,
    slug,
    password
  );
  const event = await loadPublicEvent(supabase, sourceConfig.eventSlug);
  const ticketPackage = getBasePassPackage(event);
  if (!ticketPackage) {
    throw createHttpError("The base event pass package is not available.", 404);
  }

  const buyerName =
    normalizeText(body.buyerName || body.buyer_name || body.name) ||
    contestant.name;
  const rawEmail = normalizeText(body.buyerEmail || body.buyer_email || body.email);
  const buyerEmail = normalizeEmail(rawEmail);
  const buyerWhatsapp = normalizePhone(
    body.buyerWhatsapp || body.buyer_whatsapp || body.whatsapp
  );
  const whatsappConsent = Boolean(body.whatsappConsent || body.whatsapp_consent);

  if (!buyerName) {
    throw createHttpError("Enter the name for the pass.", 400);
  }
  if (!rawEmail || !buyerEmail) {
    throw createHttpError("Enter a valid email address for the pass.", 400);
  }
  if (buyerWhatsapp && !whatsappConsent) {
    throw createHttpError("Confirm WhatsApp consent or leave the number blank.", 400);
  }

  const txRef = `${CONTESTANT_BASE_PASS_PROVIDER}-${source}-${contestant.id}`;
  const existingOrder = await loadContestantBasePassOrder(supabase, txRef);
  if (existingOrder) {
    const ticket =
      Array.isArray(existingOrder.ticket) && existingOrder.ticket.length
        ? existingOrder.ticket[0]
        : await createOrLoadTicket(
            supabase,
            existingOrder,
            existingOrder.event,
            existingOrder.package
          );
    const emailResult = await maybeSendTicketEmail(supabase, {
      req,
      ticket,
      order: existingOrder,
      event: existingOrder.event,
      ticketPackage: existingOrder.package,
    });

    return {
      status: "already-created",
      message: "This contestant base pass has already been created.",
      contestant,
      email: emailResult,
      ticket: await buildTicketResponse(
        req,
        ticket,
        existingOrder,
        existingOrder.event,
        existingOrder.package
      ),
    };
  }

  const now = new Date().toISOString();
  const basePassPayload = {
    contestant_base_pass: {
      source,
      source_label: sourceConfig.label,
      contestant_id: contestant.id,
      contestant_slug: contestant.slug,
      contestant_name: contestant.name,
      category_name: contestant.category_name,
      category_slug: contestant.category_slug,
      generated_without_payment: true,
      created_from: "private_vote_count_link",
      created_at: now,
    },
    display_price_xaf: ticketPackage.price_xaf,
    excluded_from_revenue: true,
    no_payment_required: true,
  };

  const insertOrder = async () =>
    supabase
      .from("event_ticket_orders")
      .insert({
        event_id: event.id,
        package_id: ticketPackage.id,
        tx_ref: txRef,
        campay_reference: null,
        payment_link: null,
        provider: CONTESTANT_BASE_PASS_PROVIDER,
        status: "completed",
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_whatsapp: buyerWhatsapp || null,
        whatsapp_consent: Boolean(buyerWhatsapp && whatsappConsent),
        amount_xaf: ticketPackage.price_xaf,
        currency: CURRENCY,
        provider_status: "COMPLIMENTARY",
        provider_payload: basePassPayload,
        verified_at: now,
      })
      .select(
        `${ORDER_COLUMNS}, event:event_ticket_events(${EVENT_COLUMNS}), package:event_ticket_packages(${PACKAGE_COLUMNS})`
      )
      .single();

  let { data: order, error } = await insertOrder();
  if (error?.code === "23505") {
    order = await loadContestantBasePassOrder(supabase, txRef);
    error = null;
  }
  if (error) {
    throw error;
  }
  if (!order) {
    throw createHttpError("Could not create this base pass.", 500);
  }

  const ticket = await createOrLoadTicket(supabase, order, order.event, order.package);
  const emailResult = await maybeSendTicketEmail(supabase, {
    req,
    ticket,
    order,
    event: order.event,
    ticketPackage: order.package,
  });

  return {
    status: "success",
    message: "Your base event pass is ready.",
    contestant,
    email: emailResult,
    ticket: await buildTicketResponse(req, ticket, order, order.event, order.package),
  };
};

const createLocalTestTicket = async (req, supabase, body) => {
  assertLocalTestRequest(req);

  const eventSlug =
    normalizeText(body.eventSlug || body.event_slug) || "cyes-awards-night";
  const packageSlug =
    normalizeText(body.packageSlug || body.package_slug) || "premium-table-5";
  const buyerName =
    normalizeText(body.buyerName || body.buyer_name || body.name) ||
    "Local Test Guest";
  const buyerEmail =
    normalizeEmail(body.buyerEmail || body.buyer_email || body.email) ||
    normalizeEmail(SMTP_USER);
  const buyerWhatsapp = normalizePhone(
    body.buyerWhatsapp || body.buyer_whatsapp || body.whatsapp
  );
  const requestedBaseUrl = normalizeUrl(body.baseUrl || body.base_url);

  if (!buyerEmail) {
    throw createHttpError(
      "Add buyerEmail to the test URL or configure SMTP_USER in .env.local."
    );
  }
  if (requestedBaseUrl && !isLocalOrPrivateHost(requestedBaseUrl)) {
    throw createHttpError("Local test baseUrl must be localhost or a private LAN IP.");
  }
  if (requestedBaseUrl) {
    req.ticketBaseUrlOverride = requestedBaseUrl.replace(/\/+$/, "");
  }

  const event = await loadPublicEvent(supabase, eventSlug);
  const ticketPackage = event.packages.find((item) => item.slug === packageSlug);
  if (!ticketPackage) {
    throw createHttpError("This ticket package is not available.", 404);
  }

  const now = new Date().toISOString();
  const txRef = `local-test-ticket-${event.slug}-${Date.now()}-${crypto
    .randomBytes(4)
    .toString("hex")}`;
  const reference = `local-test-${crypto.randomBytes(5).toString("hex")}`;

  const { data: order, error } = await supabase
    .from("event_ticket_orders")
    .insert({
      event_id: event.id,
      package_id: ticketPackage.id,
      tx_ref: txRef,
      campay_reference: reference,
      payment_link: null,
      provider: "local-test",
      status: "completed",
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_whatsapp: buyerWhatsapp || null,
      whatsapp_consent: Boolean(buyerWhatsapp),
      amount_xaf: ticketPackage.price_xaf,
      currency: CURRENCY,
      provider_status: "LOCAL_TEST_SUCCESS",
      provider_payload: {
        local_test: true,
        created_from: "api/event-tickets createLocalTestTicket",
        base_url: resolveBaseUrl(req),
      },
      verified_at: now,
    })
    .select(`${ORDER_COLUMNS}, event:event_ticket_events(${EVENT_COLUMNS}), package:event_ticket_packages(${PACKAGE_COLUMNS})`)
    .single();

  if (error) {
    throw error;
  }

  const ticket = await createOrLoadTicket(supabase, order, order.event, order.package);
  const emailResult = await maybeSendTicketEmail(supabase, {
    req,
    ticket,
    order,
    event: order.event,
    ticketPackage: order.package,
  });
  const verifyPath = eventVerifyPaths[event.slug] || "/tickets/payment/verify";
  const confirmationUrl = `${resolveBaseUrl(req)}${verifyPath}?tx_ref=${encodeURIComponent(
    txRef
  )}`;

  return {
    status: "success",
    message: "Local test ticket created.",
    confirmation_url: confirmationUrl,
    email: emailResult,
    ticket: await buildTicketResponse(req, ticket, order, order.event, order.package),
  };
};

const loadOrderForVerification = async (supabase, body) => {
  const txRef = normalizeText(body.tx_ref || body.txRef);
  const reference = normalizeText(
    body.reference || body.transId || body.transaction_id || body.transactionId
  );
  if (!txRef && !reference) {
    throw createHttpError("Payment reference is missing.");
  }

  let query = supabase
    .from("event_ticket_orders")
    .select(
      `${ORDER_COLUMNS}, event:event_ticket_events(${EVENT_COLUMNS}), package:event_ticket_packages(${PACKAGE_COLUMNS}), ticket:event_tickets(${TICKET_COLUMNS})`
    );
  query = txRef ? query.eq("tx_ref", txRef) : query.eq("campay_reference", reference);

  const { data: order, error } = await query.single();
  if (error || !order) {
    throw createHttpError("This ticket payment could not be found.", 404);
  }
  return order;
};

const verifyTicketPayment = async (req, supabase, body) => {
  const order = await loadOrderForVerification(supabase, body);
  const event = order.event;
  const ticketPackage = order.package;

  if (order.status === "completed") {
    const ticket =
      Array.isArray(order.ticket) && order.ticket.length
        ? order.ticket[0]
        : await createOrLoadTicket(supabase, order, event, ticketPackage);
    const emailResult = await maybeSendTicketEmail(supabase, {
      req,
      ticket,
      order,
      event,
      ticketPackage,
    });
    return {
      status: "already-counted",
      message: "This ticket payment has already been verified.",
      email: emailResult,
      ticket: await buildTicketResponse(req, ticket, order, event, ticketPackage),
    };
  }

  const transaction = await campayRequest(
    `/api/transaction/${encodeURIComponent(order.campay_reference)}/`
  );
  const providerStatus = String(transaction.status || "").toUpperCase();
  const paidAmount = Number(transaction.amount);
  const externalReference =
    transaction.external_reference || transaction.externalReference;
  const successful = completedProviderStatuses.has(providerStatus);
  const sameReference = externalReference === order.tx_ref;
  const enoughPaid = paidAmount >= Number(order.amount_xaf);
  const sameCurrency =
    String(transaction.currency || order.currency).toUpperCase() === order.currency;
  const now = new Date().toISOString();

  if (successful && sameReference && enoughPaid && sameCurrency) {
    const { data: completedOrder, error } = await supabase
      .from("event_ticket_orders")
      .update({
        status: "completed",
        provider_status: providerStatus,
        provider_payload: {
          ...(order.provider_payload || {}),
          verify_response: transaction,
        },
        verified_at: now,
        failure_reason: null,
        updated_at: now,
      })
      .eq("id", order.id)
      .select(`${ORDER_COLUMNS}, event:event_ticket_events(${EVENT_COLUMNS}), package:event_ticket_packages(${PACKAGE_COLUMNS})`)
      .single();

    if (error) {
      throw error;
    }

    const ticket = await createOrLoadTicket(
      supabase,
      completedOrder,
      completedOrder.event,
      completedOrder.package
    );
    const emailResult = await maybeSendTicketEmail(supabase, {
      req,
      ticket,
      order: completedOrder,
      event: completedOrder.event,
      ticketPackage: completedOrder.package,
    });

    return {
      status: "success",
      message: "Payment verified and ticket issued.",
      ticket: await buildTicketResponse(
        req,
        ticket,
        completedOrder,
        completedOrder.event,
        completedOrder.package
      ),
      email: emailResult,
    };
  }

  const shouldFail =
    failedProviderStatuses.has(providerStatus) ||
    (successful && (!sameReference || !enoughPaid || !sameCurrency));
  const nextStatus = shouldFail ? "failed" : "pending";
  const failureReason = successful
    ? "Payment did not match the expected ticket order."
    : `Payment status is ${providerStatus || "pending"}.`;

  await supabase
    .from("event_ticket_orders")
    .update({
      status: nextStatus,
      provider_status: providerStatus || null,
      provider_payload: {
        ...(order.provider_payload || {}),
        verify_response: transaction,
      },
      failure_reason: nextStatus === "failed" ? failureReason : null,
      updated_at: now,
    })
    .eq("id", order.id);

  return {
    status: nextStatus,
    message:
      nextStatus === "pending"
        ? "Payment is still pending. Please refresh shortly."
        : failureReason,
  };
};

const loadTicketByCode = async (supabase, ticketCode, token = "") => {
  let query = supabase
    .from("event_tickets")
    .select(
      `${TICKET_COLUMNS}, event:event_ticket_events(${EVENT_COLUMNS}), package:event_ticket_packages(${PACKAGE_COLUMNS}), order:event_ticket_orders(${ORDER_COLUMNS})`
    )
    .eq("ticket_code", ticketCode);
  if (token) {
    query = query.eq("qr_token", token);
  }
  const { data: ticket, error } = await query.single();
  if (error || !ticket) {
    throw createHttpError("Ticket not found.", 404);
  }
  return ticket;
};

const downloadTicket = async (req, res, supabase) => {
  const ticketCode = normalizeText(req.query.ticketCode || req.query.ticket_code);
  const token = normalizeText(req.query.token);
  if (!ticketCode || !token) {
    throw createHttpError("Ticket code and token are required.", 400);
  }
  const ticket = await loadTicketByCode(supabase, ticketCode, token);
  const pdfBuffer = await buildTicketPdfBuffer({
    req,
    ticket,
    order: ticket.order,
    event: ticket.event,
    ticketPackage: ticket.package,
  });

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${ticket.ticket_code}.pdf"`
  );
  res.end(pdfBuffer);
};

const searchTickets = async (supabase, search) => {
  const normalized = normalizeText(search);
  if (!normalized) {
    return [];
  }
  const pattern = `%${normalized}%`;
  const { data, error } = await supabase
    .from("event_tickets")
    .select(
      `${TICKET_COLUMNS}, event:event_ticket_events(${EVENT_COLUMNS}), package:event_ticket_packages(${PACKAGE_COLUMNS}), order:event_ticket_orders(${ORDER_COLUMNS})`
    )
    .or(
      `ticket_code.ilike.${pattern},buyer_name.ilike.${pattern},buyer_email.ilike.${pattern},buyer_whatsapp.ilike.${pattern}`
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw error;
  }
  return data || [];
};

const serializeStaffTicket = (ticket) => ({
  id: ticket.id,
  ticket_code: ticket.ticket_code,
  buyer_name: ticket.buyer_name,
  buyer_email: ticket.buyer_email,
  buyer_whatsapp: ticket.buyer_whatsapp,
  admit_count: ticket.admit_count,
  checked_in_count: ticket.checked_in_count,
  remaining_count: Math.max(0, ticket.admit_count - ticket.checked_in_count),
  status: ticket.status,
  issued_at: ticket.issued_at,
  last_checked_in_at: ticket.last_checked_in_at,
  event: ticket.event,
  package: ticket.package,
  order_status: ticket.order?.status,
});

const lookupTicket = async (req, supabase, body) => {
  requireTicketAccess(req, body);
  const ticketCode = normalizeText(body.ticketCode || body.ticket_code);
  const token = normalizeText(body.token);
  const search = normalizeText(body.search);
  const tickets = ticketCode
    ? [await loadTicketByCode(supabase, ticketCode, token)]
    : await searchTickets(supabase, search);

  return {
    tickets: tickets.map(serializeStaffTicket),
  };
};

const checkInTicket = async (req, supabase, body) => {
  requireTicketAccess(req, body);
  const ticketCode = normalizeText(body.ticketCode || body.ticket_code);
  const token = normalizeText(body.token);
  const count = Math.max(1, Number.parseInt(String(body.count || "1"), 10) || 1);
  const checkedInBy = normalizeText(body.checkedInBy || body.checked_in_by);
  const notes = normalizeText(body.notes);
  const method = normalizeText(body.method) === "manual" ? "manual" : "qr";

  const ticket = await loadTicketByCode(supabase, ticketCode, token);
  if (ticket.status !== "active" || ticket.order?.status !== "completed") {
    throw createHttpError("This ticket is not valid for check-in.", 409);
  }
  const remaining = ticket.admit_count - ticket.checked_in_count;
  if (remaining <= 0) {
    throw createHttpError("This ticket has already been fully checked in.", 409);
  }
  if (count > remaining) {
    throw createHttpError(`Only ${remaining} guest(s) remain on this ticket.`, 409);
  }

  const now = new Date().toISOString();
  const nextCheckedInCount = ticket.checked_in_count + count;
  const { data: updatedTicket, error } = await supabase
    .from("event_tickets")
    .update({
      checked_in_count: nextCheckedInCount,
      last_checked_in_at: now,
      updated_at: now,
    })
    .eq("id", ticket.id)
    .select(
      `${TICKET_COLUMNS}, event:event_ticket_events(${EVENT_COLUMNS}), package:event_ticket_packages(${PACKAGE_COLUMNS}), order:event_ticket_orders(${ORDER_COLUMNS})`
    )
    .single();

  if (error) {
    throw error;
  }

  await supabase.from("event_ticket_checkins").insert({
    ticket_id: ticket.id,
    event_id: ticket.event_id,
    checked_in_count: count,
    checked_in_by: checkedInBy || null,
    notes: notes || null,
    method,
  });

  return {
    ticket: serializeStaffTicket(updatedTicket),
    checked_in_count: count,
  };
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET,POST,OPTIONS");
    return sendJson(res, 200, { ok: true });
  }

  try {
    const supabase = getSupabase();

    if (req.method === "GET") {
      const action = normalizeText(req.query.action);
      if (action === "downloadTicket") {
        return await downloadTicket(req, res, supabase);
      }
      if (action === "createLocalTestTicket") {
        const result = await createLocalTestTicket(req, supabase, req.query);
        if (normalizeText(req.query.redirect) === "1") {
          res.statusCode = 302;
          res.setHeader("Location", result.confirmation_url);
          res.end();
          return;
        }
        return sendJson(res, 200, result);
      }

      const eventSlug = normalizeText(req.query.eventSlug || req.query.event_slug);
      if (!eventSlug) {
        throw createHttpError("Event slug is required.");
      }
      const event = await loadPublicEvent(supabase, eventSlug);
      return sendJson(res, 200, {
        event: serializeEvent(event),
        payment: {
          provider: "campay",
          provider_name: "Secure payment",
          payments_configured: paymentsConfigured(),
          currency: CURRENCY,
          demo_mode: CAMPAY_DEMO_MODE,
          demo_payment_amount_xaf: CAMPAY_DEMO_MODE
            ? resolveChargeAmount({ price_xaf: DEMO_PAYMENT_AMOUNT_XAF || 25 })
            : null,
        },
      });
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "GET,POST,OPTIONS");
      return sendJson(res, 405, { message: "Method not allowed." });
    }

    const body = parseBody(req);
    const action = normalizeText(body.action);
    let result;

    if (action === "initializeTicketPayment") {
      result = await initializeTicketPayment(req, supabase, body);
    } else if (
      action === "createContestantBasePass" ||
      action === "createContestantAccessPass"
    ) {
      result = await createContestantBasePass(req, supabase, body);
    } else if (action === "createLocalTestTicket") {
      result = await createLocalTestTicket(req, supabase, body);
    } else if (action === "verifyTicketPayment") {
      result = await verifyTicketPayment(req, supabase, body);
    } else if (action === "lookupTicket") {
      result = await lookupTicket(req, supabase, body);
    } else if (action === "checkInTicket") {
      result = await checkInTicket(req, supabase, body);
    } else {
      throw createHttpError("Unknown ticket action.");
    }

    return sendJson(res, 200, result);
  } catch (error) {
    console.error("Event tickets API error", error);
    return sendJson(res, error.statusCode || 500, {
      message:
        error.statusCode && error.statusCode < 500
          ? error.message
          : error?.message || "Could not complete ticket request.",
    });
  }
}
