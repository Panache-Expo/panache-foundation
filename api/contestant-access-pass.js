import crypto from "node:crypto";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const CURRENCY = (process.env.EVENT_TICKETS_CURRENCY || "XAF").toUpperCase();
const EVENT_TICKETS_BASE_URL = (
  process.env.EVENT_TICKETS_BASE_URL ||
  process.env.PANACHE_FRONTEND_BASE_URL ||
  ""
).replace(/\/+$/, "");

const EVENT_COLUMNS =
  "id, slug, title, short_title, event_date, event_date_label, venue, brand, status, sort_order, created_at, updated_at";
const PACKAGE_COLUMNS =
  "id, event_id, slug, name, description, price_xaf, admit_count, benefits, status, sort_order, style_key, created_at, updated_at";
const ORDER_COLUMNS =
  "id, event_id, package_id, tx_ref, campay_reference, payment_link, provider, status, buyer_name, buyer_email, buyer_whatsapp, whatsapp_consent, amount_xaf, currency, provider_status, provider_payload, verified_at, failure_reason, ticket_email_sent_at, ticket_email_error, created_at, updated_at";
const TICKET_COLUMNS =
  "id, order_id, event_id, package_id, ticket_code, qr_token, buyer_name, buyer_email, buyer_whatsapp, admit_count, checked_in_count, status, issued_at, last_checked_in_at, created_at, updated_at";

const CONTESTANT_ACCESS_PASS_PROVIDER = "contestant-access-pass";
const CONTESTANT_ACCESS_PASS_DB_PACKAGE_SLUG = "access-beer";

const contestantAccessPassSources = {
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

const ticketEventDisplayOverrides = {
  "panache-dor-awards-night": {
    venue: "Chariot Hotel, Buea",
  },
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

const normalizeText = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const normalizeEmail = (value) => {
  const text = normalizeText(value).toLowerCase();
  if (!text || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return "";
  return text;
};

const normalizePhone = (value) => normalizeText(value).replace(/[\s()-]/g, "");

const normalizeContestantPassSource = (value) => {
  const text = normalizeText(value).toLowerCase();
  if (["panache-dor", "panache_dor", "dor"].includes(text)) return "panache-dor";
  if (["panache-360", "panache_360", "360"].includes(text)) return "panache-360";
  if (["miss-panache", "miss_panache", "miss"].includes(text)) return "miss-panache";
  return text;
};

const resolveBaseUrl = (req) => {
  if (EVENT_TICKETS_BASE_URL) return EVENT_TICKETS_BASE_URL;
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "";
  return host ? `${protocol}://${host}` : "";
};

const createSupabaseAdmin = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw createHttpError("Ticket service is not configured.", 500);
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
};

const applyTicketEventDisplayOverrides = (event) => ({
  ...event,
  ...(ticketEventDisplayOverrides[event?.slug] || {}),
});

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
  };
};

const getDisplayPackage = (ticketPackage) => ({
  ...ticketPackage,
  slug: "contestant-access-pass",
  name: "Contestant Access Pass",
  description:
    "Complimentary nominee entrance pass. This pass does not include a free drink.",
  price_xaf: 0,
  admit_count: 1,
  benefits: ["Event access", "QR entrance pass"],
  style_key: "contestant-access",
});

const loadPublicEvent = async (supabase, eventSlug) => {
  const { data: event, error: eventError } = await supabase
    .from("event_ticket_events")
    .select(`${EVENT_COLUMNS}, packages:event_ticket_packages(${PACKAGE_COLUMNS})`)
    .eq("slug", eventSlug)
    .eq("status", "active")
    .single();

  if (eventError || !event) throw createHttpError("This ticket event is not available.", 404);

  return {
    ...applyTicketEventDisplayOverrides(event),
    packages: (event.packages || [])
      .filter((ticketPackage) => ticketPackage.status === "active")
      .sort((left, right) => left.sort_order - right.sort_order),
  };
};

const getDbAccessPackage = (event) =>
  event.packages.find((item) => item.slug === CONTESTANT_ACCESS_PASS_DB_PACKAGE_SLUG) ||
  event.packages.find((item) => Number(item.price_xaf) === 2000 && Number(item.admit_count) === 1);

const verifyContestant = async (supabase, sourceConfig, slug, password) => {
  if (!slug) throw createHttpError("Contestant link is missing.", 400);
  if (!password) throw createHttpError("Enter your private password.", 400);

  const { data, error } = await supabase.rpc(sourceConfig.verifyRpcName, {
    p_slug: slug,
    p_password: password,
  });

  if (error) throw error;
  const contestant = Array.isArray(data) ? data[0] : data;
  if (!contestant?.id) throw createHttpError("Invalid private password.", 401);

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

const createTicketCode = () => `PASS-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

const createOrLoadTicket = async (supabase, order, event, ticketPackage) => {
  const { data: existingTicket, error: existingError } = await supabase
    .from("event_tickets")
    .select(TICKET_COLUMNS)
    .eq("order_id", order.id)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existingTicket) return existingTicket;

  const { data: ticket, error } = await supabase
    .from("event_tickets")
    .insert({
      order_id: order.id,
      event_id: event.id,
      package_id: ticketPackage.id,
      ticket_code: createTicketCode(),
      qr_token: crypto.randomBytes(18).toString("hex"),
      buyer_name: order.buyer_name,
      buyer_email: order.buyer_email,
      buyer_whatsapp: order.buyer_whatsapp,
      admit_count: 1,
      checked_in_count: 0,
      status: "active",
    })
    .select(TICKET_COLUMNS)
    .single();

  if (error) throw error;
  return ticket;
};

const buildCheckInUrl = (req, ticket) => {
  const baseUrl = resolveBaseUrl(req);
  return `${baseUrl}/tickets/check-in?code=${encodeURIComponent(ticket.ticket_code)}&token=${encodeURIComponent(ticket.qr_token)}`;
};

const buildDownloadUrl = (req, ticket) => {
  const baseUrl = resolveBaseUrl(req);
  return `${baseUrl}/api/contestant-access-pass?download=1&ticketCode=${encodeURIComponent(ticket.ticket_code)}&token=${encodeURIComponent(ticket.qr_token)}`;
};

const buildTicketResponse = async (req, ticket, order, event, dbPackage) => {
  const displayPackage = getDisplayPackage(dbPackage);
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
    event: serializeEvent(event),
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

const drawTicketPdf = async ({ req, ticket, event, dbPackage }) => {
  const displayPackage = getDisplayPackage(dbPackage);
  const width = 420;
  const height = 760;
  const deep = "#18051f";
  const deepAlt = "#2a0a35";
  const purple = "#8241B6";
  const purpleLight = "#f1dcff";
  const gold = "#E4B94A";
  const qrUrl = buildCheckInUrl(req, ticket);
  const qrBuffer = await QRCode.toBuffer(qrUrl, {
    type: "png",
    width: 360,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: `${purple}ff`, light: "#00000000" },
  });

  return await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [width, height], margin: 0 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.rect(0, 0, width, height).fill(deep);
    doc.circle(width - 36, 88, 148).fillColor(purple).fillOpacity(0.28).fill();
    doc.circle(34, 290, 124).fillColor(gold).fillOpacity(0.13).fill();
    doc.circle(width - 48, height - 96, 130).fillColor(purple).fillOpacity(0.18).fill();
    doc.fillOpacity(1);
    doc.rect(0, 0, width, 12).fillColor(purple).fill();

    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(15).text("PANACHE FOUNDATION", 28, 36, {
      width: width - 56,
      align: "center",
      characterSpacing: 1.8,
    });
    doc.fillColor(gold).font("Times-Bold").fontSize(30).text("Panache D'or Awards 2026", 28, 64, {
      width: width - 56,
      align: "center",
    });

    doc.roundedRect(52, 118, width - 104, 54, 14).fillColor(purple).fillOpacity(0.95).fill();
    doc.fillOpacity(1);
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(22).text(displayPackage.name.toUpperCase(), 58, 136, {
      width: width - 116,
      align: "center",
      characterSpacing: 1.4,
    });

    doc.fillColor(purpleLight).font("Helvetica").fontSize(12).text(`${event.event_date_label}  |  7PM  |  ${event.venue}`, 36, 198, {
      width: width - 72,
      align: "center",
    });

    const qrSize = 246;
    const qrX = (width - qrSize) / 2;
    const qrY = 254;
    doc.roundedRect(qrX - 18, qrY - 18, qrSize + 36, qrSize + 36, 14).fillColor(deepAlt).fill();
    doc.roundedRect(qrX - 18, qrY - 18, qrSize + 36, qrSize + 36, 14).strokeColor(purple).lineWidth(1.4).stroke();
    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

    doc.fillColor(purpleLight).font("Helvetica-Bold").fontSize(13).text(displayPackage.benefits.join("  |  "), 30, qrY + qrSize + 36, {
      width: width - 60,
      align: "center",
    });
    doc.fillColor(gold).font("Helvetica-Bold").fontSize(11).text("NO FREE DRINK INCLUDED", 30, qrY + qrSize + 61, {
      width: width - 60,
      align: "center",
      characterSpacing: 1.2,
    });

    doc.fillColor("#FFFFFF").font("Helvetica").fontSize(ticket.buyer_name.length > 30 ? 18 : 22).text(ticket.buyer_name, 24, 612, {
      width: width - 48,
      align: "center",
      ellipsis: true,
    });
    doc.fillColor(purpleLight).font("Helvetica-Bold").fontSize(12).text(`TICKET CODE: ${ticket.ticket_code}`, 24, 655, {
      width: width - 48,
      align: "center",
      characterSpacing: 0.45,
    });
    doc.fillColor("#FFFFFF").font("Helvetica").fontSize(8.8).text("1 guest  |  Complimentary nominee access  |  Present QR at entrance", 30, 708, {
      width: width - 60,
      align: "center",
    });

    doc.end();
  });
};

const loadContestantAccessPassOrder = async (supabase, txRef) => {
  const { data, error } = await supabase
    .from("event_ticket_orders")
    .select(`${ORDER_COLUMNS}, event:event_ticket_events(${EVENT_COLUMNS}), package:event_ticket_packages(${PACKAGE_COLUMNS}), ticket:event_tickets(${TICKET_COLUMNS})`)
    .eq("tx_ref", txRef)
    .maybeSingle();

  if (error) throw error;
  return data || null;
};

const createContestantAccessPass = async (req, supabase, body) => {
  const source = normalizeContestantPassSource(body.source || body.platform || body.competition);
  const sourceConfig = contestantAccessPassSources[source];
  const slug = normalizeText(body.slug || body.contestantSlug || body.contestant_slug);
  const password = normalizeText(body.password || body.accessCode || body.access_code);

  if (!sourceConfig) throw createHttpError("Contestant pass source is not supported.", 400);

  const contestant = await verifyContestant(supabase, sourceConfig, slug, password);
  const event = await loadPublicEvent(supabase, sourceConfig.eventSlug);
  const dbPackage = getDbAccessPackage(event);
  if (!dbPackage) throw createHttpError("The contestant access pass package is not available.", 404);

  const buyerName = normalizeText(body.buyerName || body.buyer_name || body.name) || contestant.name;
  const rawEmail = normalizeText(body.buyerEmail || body.buyer_email || body.email);
  const buyerEmail = normalizeEmail(rawEmail);
  const buyerWhatsapp = normalizePhone(body.buyerWhatsapp || body.buyer_whatsapp || body.whatsapp);
  const whatsappConsent = Boolean(body.whatsappConsent || body.whatsapp_consent);

  if (!buyerName) throw createHttpError("Enter the name for the pass.", 400);
  if (!rawEmail || !buyerEmail) throw createHttpError("Enter a valid email address for the pass.", 400);
  if (buyerWhatsapp && !whatsappConsent) throw createHttpError("Confirm WhatsApp consent or leave the number blank.", 400);

  const txRef = `${CONTESTANT_ACCESS_PASS_PROVIDER}-${source}-${contestant.id}`;
  const existingOrder = await loadContestantAccessPassOrder(supabase, txRef);
  if (existingOrder) {
    const ticket = Array.isArray(existingOrder.ticket) && existingOrder.ticket.length
      ? existingOrder.ticket[0]
      : await createOrLoadTicket(supabase, existingOrder, existingOrder.event, existingOrder.package);

    return {
      status: "already-created",
      message: "This contestant access pass has already been created.",
      contestant,
      ticket: await buildTicketResponse(req, ticket, existingOrder, existingOrder.event, existingOrder.package),
    };
  }

  const now = new Date().toISOString();
  const providerPayload = {
    contestant_access_pass: {
      source,
      source_label: sourceConfig.label,
      contestant_id: contestant.id,
      contestant_slug: contestant.slug,
      contestant_name: contestant.name,
      category_name: contestant.category_name,
      category_slug: contestant.category_slug,
      generated_without_payment: true,
      no_free_drink: true,
      created_from: "private_vote_count_link",
      created_at: now,
    },
    excluded_from_revenue: true,
    no_payment_required: true,
    display_price_xaf: 0,
  };

  const insertOrder = async () =>
    supabase
      .from("event_ticket_orders")
      .insert({
        event_id: event.id,
        package_id: dbPackage.id,
        tx_ref: txRef,
        campay_reference: null,
        payment_link: null,
        provider: CONTESTANT_ACCESS_PASS_PROVIDER,
        status: "completed",
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_whatsapp: buyerWhatsapp || null,
        whatsapp_consent: Boolean(buyerWhatsapp && whatsappConsent),
        amount_xaf: 0,
        currency: CURRENCY,
        provider_status: "COMPLIMENTARY_ACCESS_ONLY",
        provider_payload: providerPayload,
        verified_at: now,
      })
      .select(`${ORDER_COLUMNS}, event:event_ticket_events(${EVENT_COLUMNS}), package:event_ticket_packages(${PACKAGE_COLUMNS})`)
      .single();

  let { data: order, error } = await insertOrder();
  if (error?.code === "23505") {
    order = await loadContestantAccessPassOrder(supabase, txRef);
    error = null;
  }
  if (error) throw error;
  if (!order) throw createHttpError("Could not create this contestant access pass.", 500);

  const ticket = await createOrLoadTicket(supabase, order, order.event, order.package);
  return {
    status: "success",
    message: "Your contestant access pass is ready.",
    contestant,
    ticket: await buildTicketResponse(req, ticket, order, order.event, order.package),
  };
};

const downloadContestantAccessPass = async (req, res, supabase) => {
  const ticketCode = normalizeText(req.query?.ticketCode || req.query?.code);
  const token = normalizeText(req.query?.token);

  if (!ticketCode || !token) throw createHttpError("Ticket code and token are required.", 400);

  const { data: ticket, error } = await supabase
    .from("event_tickets")
    .select(`${TICKET_COLUMNS}, order:event_ticket_orders(${ORDER_COLUMNS}), event:event_ticket_events(${EVENT_COLUMNS}), package:event_ticket_packages(${PACKAGE_COLUMNS})`)
    .eq("ticket_code", ticketCode)
    .eq("qr_token", token)
    .maybeSingle();

  if (error) throw error;
  if (!ticket?.order || ticket.order.provider !== CONTESTANT_ACCESS_PASS_PROVIDER) {
    throw createHttpError("Contestant access pass not found.", 404);
  }

  const pdfBuffer = await drawTicketPdf({
    req,
    ticket,
    order: ticket.order,
    event: ticket.event,
    dbPackage: ticket.package,
  });

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${ticket.ticket_code}.pdf"`);
  res.end(pdfBuffer);
};

export default async function handler(req, res) {
  try {
    const supabase = createSupabaseAdmin();

    if (req.method === "GET") {
      if (req.query?.download) {
        await downloadContestantAccessPass(req, res, supabase);
        return;
      }
      sendJson(res, 200, { status: "ok", message: "Contestant access pass service is available." });
      return;
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      sendJson(res, 405, { message: "Method not allowed." });
      return;
    }

    const body = parseBody(req);
    const action = normalizeText(body.action || "createContestantAccessPass");
    if (action !== "createContestantAccessPass") {
      throw createHttpError("Unsupported contestant access pass action.", 400);
    }

    const payload = await createContestantAccessPass(req, supabase, body);
    sendJson(res, 200, payload);
  } catch (error) {
    console.error("Contestant access pass API error", error);
    sendJson(res, error.statusCode || 500, {
      message: error.message || "Contestant access pass service failed.",
    });
  }
}
