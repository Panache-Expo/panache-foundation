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
const CURRENCY = (process.env.EVENT_TICKETS_CURRENCY || "XAF").toUpperCase();
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
const contestantAccessPassBackgrounds = {
  "cyes-awards-night": "cyes-access-beer-ticket-bg.png",
  "panache-dor-awards-night": "panache-dor-ticket-bg-downloaded.png",
};

const contestantAccessPassSources = {
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
  if (["cyes", "cyes-awards", "cyes_awards"].includes(text)) return "cyes";
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
  name: "Access Pass",
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

const createTicketCode = (eventSlug) => {
  const prefix = eventSlug === "cyes-awards-night" ? "CYES" : "PASS";
  return `${prefix}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
};

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
      ticket_code: createTicketCode(event.slug),
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

const getContestantAccessPassBackgroundPath = (eventSlug) => {
  const filename = contestantAccessPassBackgrounds[eventSlug];
  if (!filename) return "";

  const candidate = path.join(
    process.cwd(),
    "src",
    "assets",
    "tickets",
    filename
  );
  return fs.existsSync(candidate) ? candidate : "";
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
  const displayEvent = applyTicketEventDisplayOverrides(event);
  const displayPackage = getDisplayPackage(dbPackage);
  const width = 420;
  const height = 760;
  const isCyes = displayEvent.slug === "cyes-awards-night";
  const deep = isCyes ? "#050505" : "#11031d";
  const deepAlt = isCyes ? "#151515" : "#240934";
  const accent = isCyes ? "#F1C84B" : "#8241B6";
  const accentBright = isCyes ? "#F6D969" : "#A55BE8";
  const accentLight = isCyes ? "#FFF4C2" : "#F1DCFF";
  const accentSoft = isCyes ? "#F1C84B" : "#D8A8FF";
  const eventBrandLabel = isCyes ? "CYES" : "PANACHE FOUNDATION";
  const eventTitle = isCyes ? "CYES & Awards" : "Panache D'or Awards";
  const eventHeading = isCyes ? "CYES Awards Night 2026" : "Panache D'or Awards 2026";
  const eventTime = isCyes ? "EVENT PROPER 7PM" : "AWARD NIGHT 7PM";
  const backgroundPath = getContestantAccessPassBackgroundPath(displayEvent.slug);
  const qrUrl = buildCheckInUrl(req, ticket);
  const qrBuffer = await QRCode.toBuffer(qrUrl, {
    type: "png",
    width: 360,
    margin: 1,
    errorCorrectionLevel: "M",
    color: {
      dark: isCyes ? "#0A0A0Aff" : `${accent}ff`,
      light: isCyes ? "#FFFFFFFF" : "#00000000",
    },
  });

  return await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [width, height], margin: 0 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    if (backgroundPath) {
      doc.image(backgroundPath, 0, 0, { width, height });
      doc.rect(0, 0, width, height).fillColor(deep).fillOpacity(isCyes ? 0.62 : 0.7).fill();
    } else {
      doc.rect(0, 0, width, height).fill(deep);
    }
    doc.fillOpacity(0.96).fillColor("#050207").rect(0, 0, width, 178).fill();
    doc.fillOpacity(0.82).fillColor(accent).rect(0, 0, width, 10).fill();
    doc.circle(width - 32, 82, 132).fillColor(accentBright).fillOpacity(0.22).fill();
    doc.circle(58, 170, 94).fillColor(accent).fillOpacity(0.12).fill();
    doc.circle(width - 60, height - 86, 126).fillColor(deepAlt).fillOpacity(0.42).fill();
    doc.circle(18, 396, 102).fillColor(accent).fillOpacity(0.12).fill();
    doc.save();
    doc.rotate(-19, { origin: [width / 2, height / 2] });
    doc
      .fillOpacity(0.08)
      .fillColor(accentLight)
      .font("Helvetica-Bold")
      .fontSize(28)
      .text("ACCESS  PASS  ACCESS  PASS", -34, 404, {
        width: width + 68,
        align: "center",
        characterSpacing: 2,
      });
    doc.restore();
    doc.fillOpacity(1);

    for (let index = 0; index < 8; index += 1) {
      const y = 230 + index * 46;
      doc
        .fillOpacity(index % 2 === 0 ? 0.14 : 0.08)
        .fillColor(index % 2 === 0 ? accentBright : accent)
        .roundedRect(width - 76 + index * 3, y, 118, 18, 9)
        .fill();
    }
    doc.fillOpacity(1);

    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(15).text(eventBrandLabel, 28, 38, {
      width: width - 56,
      align: "center",
      characterSpacing: 1.8,
    });
    doc.fillColor(accentLight).font("Times-Bold").fontSize(30).text(eventHeading, 28, 70, {
      width: width - 56,
      align: "center",
    });

    doc.roundedRect(54, 118, width - 108, 50, 13).fillColor(accent).fillOpacity(0.96).fill();
    doc.fillOpacity(1);
    doc.fillColor(isCyes ? "#0A0A0A" : "#FFFFFF").font("Helvetica-Bold").fontSize(24).text(displayPackage.name.toUpperCase(), 58, 134, {
      width: width - 116,
      align: "center",
      characterSpacing: 1.7,
    });

    doc.fillColor("#FFFFFF").font("Times-Roman").fontSize(23).text(eventTitle, 34, 180, {
      width: width - 68,
      align: "center",
    });
    doc.fillColor(accentBright).font("Helvetica-Bold").fontSize(9.5).text(`${displayEvent.event_date_label}  |  ${eventTime}  |  ${displayEvent.venue}`, 42, 216, {
      width: width - 84,
      align: "center",
      characterSpacing: 0.5,
    });

    const qrSize = 242;
    const qrX = (width - qrSize) / 2;
    const qrY = 258;
    doc.roundedRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 10).fillColor(isCyes ? "#FFFFFF" : "#020302").fillOpacity(isCyes ? 1 : 0.84).fill();
    doc.fillOpacity(1);
    doc.roundedRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 10).strokeColor(accent).strokeOpacity(isCyes ? 0.9 : 0.42).lineWidth(1.2).stroke();
    doc.strokeOpacity(1);
    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

    doc.fillColor(accentLight).font("Helvetica").fontSize(12).text(displayPackage.benefits.join(", "), 30, qrY + qrSize + 42, {
      width: width - 72,
      align: "center",
      ellipsis: true,
    });
    doc.fillColor(accentSoft).font("Helvetica-Bold").fontSize(10.5).text("NO FREE DRINK INCLUDED", 30, qrY + qrSize + 66, {
      width: width - 60,
      align: "center",
      characterSpacing: 1.2,
    });

    doc.fillColor("#FFFFFF").font("Helvetica").fontSize(ticket.buyer_name.length > 30 ? 18 : 21).text(ticket.buyer_name, 24, 608, {
      width: width - 48,
      align: "center",
      ellipsis: true,
    });
    doc.fillColor(accentBright).font("Helvetica-Bold").fontSize(12).text(`TICKET CODE: ${ticket.ticket_code}`, 24, 654, {
      width: width - 48,
      align: "center",
      characterSpacing: 0.35,
    });
    doc.fillColor("#FFFFFF").font("Helvetica").fontSize(8.2).text("1 guest  |  Complimentary nominee access  |  Present QR at entrance", 30, 708, {
      width: width - 60,
      align: "center",
    });

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
    console.error("Could not update contestant access pass email status", error);
  }
};

const sendContestantAccessPassEmail = async ({ req, ticket, order, event, dbPackage }) => {
  const displayEvent = applyTicketEventDisplayOverrides(event);
  const displayPackage = getDisplayPackage(dbPackage);
  if (!order.buyer_email) {
    return { attempted: true, ok: false, message: "Buyer email is missing." };
  }
  if (!SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return { attempted: true, ok: false, message: "SMTP is not configured on the server." };
  }

  const pdfBuffer = await drawTicketPdf({ req, ticket, order, event, dbPackage });
  const downloadUrl = buildDownloadUrl(req, ticket);
  const transporter = await createVerifiedTransporter();

  await transporter.sendMail({
    from: SMTP_FROM,
    to: order.buyer_email,
    subject: `${displayEvent.short_title} access pass - ${ticket.ticket_code}`,
    text: `
Hello ${order.buyer_name},

Your access pass for ${displayEvent.title} is ready.

Ticket code: ${ticket.ticket_code}
Package: ${displayPackage.name}
Admits: ${ticket.admit_count}
Date: ${displayEvent.event_date_label}
Venue: ${displayEvent.venue}

Download your pass: ${downloadUrl}

Please present the QR code at the entrance.
`.trim(),
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#171411;">
        <h2 style="margin:0 0 16px;">Your ${displayEvent.short_title} access pass is ready</h2>
        <p style="margin:0 0 12px;">Hello ${order.buyer_name},</p>
        <p style="margin:0 0 12px;">Your complimentary nominee access pass is attached.</p>
        <p style="margin:0 0 8px;">Ticket code: <strong>${ticket.ticket_code}</strong></p>
        <p style="margin:0 0 8px;">Package: <strong>${displayPackage.name}</strong></p>
        <p style="margin:0 0 8px;">Admits: <strong>${ticket.admit_count}</strong></p>
        <p style="margin:0 0 8px;">Date: <strong>${displayEvent.event_date_label}</strong></p>
        <p style="margin:0 0 16px;">Venue: <strong>${displayEvent.venue}</strong></p>
        <p style="margin:0 0 20px;">
          <a href="${downloadUrl}" style="display:inline-block;padding:12px 18px;background:#171411;color:#ffffff;text-decoration:none;border-radius:999px;">
            Download access pass
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

const maybeSendContestantAccessPassEmail = async (supabase, args) => {
  try {
    const result = await sendContestantAccessPassEmail(args);
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
    const emailResult = await maybeSendContestantAccessPassEmail(supabase, {
      req,
      ticket,
      order: existingOrder,
      event: existingOrder.event,
      dbPackage: existingOrder.package,
    });

    return {
      status: "already-created",
      message: "This contestant access pass has already been created.",
      contestant,
      email: emailResult,
      ticket: await buildTicketResponse(req, ticket, existingOrder, existingOrder.event, existingOrder.package),
    };
  }

  const now = new Date().toISOString();
  const storedAccessPackageAmountXaf = Math.max(
    1,
    Number.parseInt(String(dbPackage.price_xaf || 0), 10) || 1
  );
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
    stored_package_price_xaf: storedAccessPackageAmountXaf,
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
        amount_xaf: storedAccessPackageAmountXaf,
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
  const emailResult = await maybeSendContestantAccessPassEmail(supabase, {
    req,
    ticket,
    order,
    event: order.event,
    dbPackage: order.package,
  });
  return {
    status: "success",
    message: "Your contestant access pass is ready.",
    contestant,
    email: emailResult,
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
