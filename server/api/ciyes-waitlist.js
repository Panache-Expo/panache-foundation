// CIYES app waitlist: POST /api/ciyes-waitlist
// Saves one sign-up per WhatsApp number into public.ciyes_waitlist.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "";

const ROLES = new Set(["entrepreneur", "organiser", "ngo", "customer"]);
const PHONE_OS = new Set(["iphone", "android"]);
const LANGUAGES = new Set(["en", "fr"]);

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

const text = (value, max) => {
  if (value === undefined || value === null) return null;
  const clean = String(value).replace(/\s+/g, " ").trim();
  return clean ? clean.slice(0, max) : null;
};

// Same rules as the form: Cameroon numbers (9 digits starting with 6 or 2, with or
// without +237) or any international number written with +country code.
export const normalizeWhatsAppNumber = (raw) => {
  if (!raw) return null;
  let value = String(raw).replace(/[\s().-]/g, "");
  if (value.startsWith("00")) value = `+${value.slice(2)}`;
  if (/^[26]\d{8}$/.test(value)) return `+237${value}`;
  if (/^237[26]\d{8}$/.test(value)) return `+${value}`;
  if (/^\+237[26]\d{8}$/.test(value)) return value;
  if (/^\+(?!237)[1-9]\d{7,14}$/.test(value)) return value;
  return null;
};

export const buildWaitlistRecord = (body) => {
  const fullName = text(body.fullName ?? body.full_name, 80);
  if (!fullName || fullName.length < 2) return { error: "Please enter your name.", field: "fullName" };

  const whatsappPhone = normalizeWhatsAppNumber(body.whatsappPhone ?? body.whatsapp_phone);
  if (!whatsappPhone) return { error: "Please enter a valid WhatsApp number.", field: "whatsappPhone" };

  const email = text(body.email, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please check your email address.", field: "email" };

  const role = text(body.role, 20);
  if (!role || !ROLES.has(role)) return { error: "Please choose what describes you.", field: "role" };

  const phoneOs = text(body.phoneOs ?? body.phone_os, 10);
  const language = text(body.language, 2);
  const source = text(body.source, 60);

  return {
    record: {
      full_name: fullName,
      whatsapp_phone: whatsappPhone,
      email: email ? email.toLowerCase() : null,
      city: text(body.city, 60),
      role,
      phone_os: phoneOs && PHONE_OS.has(phoneOs) ? phoneOs : null,
      language: language && LANGUAGES.has(language) ? language : "en",
      source: source ? source.toLowerCase().replace(/[^a-z0-9_.-]/g, "") || null : null,
    },
  };
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST,OPTIONS");
    return sendJson(res, 200, { ok: true });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST,OPTIONS");
    return sendJson(res, 405, { ok: false, message: "Method not allowed." });
  }

  const body = parseBody(req);

  // Honeypot: a hidden field only bots fill in. Pretend it worked and save nothing.
  if (text(body.website, 200)) {
    return sendJson(res, 200, { ok: true, already: false });
  }

  const { error, field, record } = buildWaitlistRecord(body);
  if (error) {
    return sendJson(res, 400, { ok: false, message: error, field });
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return sendJson(res, 500, { ok: false, message: "The waitlist is not configured on the server." });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-client-info": "panache-foundation-api" } },
  });

  // Insert without reading back, so this also works with the anon key (insert-only policy).
  const { error: insertError } = await supabase.from("ciyes_waitlist").insert([record]);

  if (insertError) {
    // 23505 = unique violation: this WhatsApp number is already on the list.
    if (insertError.code === "23505") {
      return sendJson(res, 200, { ok: true, already: true });
    }
    console.error("ciyes-waitlist insert failed", insertError.code, insertError.message);
    return sendJson(res, 500, { ok: false, message: "Could not save your sign-up. Please try again." });
  }

  return sendJson(res, 201, { ok: true, already: false });
}
