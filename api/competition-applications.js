import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const DASHBOARD_ACCESS_KEY = process.env.DASHBOARD_ACCESS_KEY || "";
const REGISTRATION_SUPPORT_EMAIL = process.env.REGISTRATION_SUPPORT_EMAIL || "";
const PARTICIPANTS_DASHBOARD_PATH =
  process.env.PARTICIPANTS_DASHBOARD_PATH || "/panache-expo/participants-dashboard";
const REGISTRATION_EMAIL_ENDPOINT = "/api/send-registration-email";

const ALLOWED_COMPETITION_SLUGS = new Set([
  "cyes-pitch-competition",
  "panache-360",
  "fashion-night",
  "miss-panache",
  "exhibition-stands",
]);

const normalizeText = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  const normalized = String(value).trim();
  return normalized || null;
};

const normalizeInteger = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeJson = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value;
};

const normalizeAdminEmails = (value) => {
  if (value === undefined || value === null) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map(normalizeText).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => normalizeText(item))
      .filter(Boolean);
  }
  return [];
};

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
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

const resolveHostname = (req) => normalizeText(req.headers.host) || "localhost";

const resolveProtocol = (req) => {
  const headerValue = normalizeText(req.headers["x-forwarded-proto"]);
  return headerValue.startsWith("http") ? headerValue : headerValue.includes("https") ? "https" : "http";
};

const resolveDashboardUrl = (req, overrideUrl) => {
  if (overrideUrl) {
    return overrideUrl;
  }
  return `${resolveProtocol(req)}://${resolveHostname(req)}${PARTICIPANTS_DASHBOARD_PATH}`;
};

const sendRegistrationNotification = async (req, record, body, isFree) => {
  const applicantEmail = normalizeText(record.email);
  const competitionTitle =
    normalizeText(body.competitionTitle) || normalizeText(body.competition_title) || record.competition_slug;
  const applicationCode = normalizeText(record.application_code);
  const notificationEmails = normalizeAdminEmails(
    body.notificationEmails ||
      body.notification_emails ||
      body.notificationRecipientEmails ||
      body.adminEmails
  );

  const postSubmitHref = normalizeText(
    body.postSubmitHref ||
      body.post_submit_href ||
      body.whatsappGroupUrl ||
      body.whatsapp_group_url ||
      body.paymentHref ||
      body.payment_href
  );
  const paymentHref = normalizeText(body.paymentHref || body.payment_href);
  const actionHref =
    isFree && postSubmitHref
      ? postSubmitHref
      : paymentHref || postSubmitHref;

  if (!applicantEmail && notificationEmails.length === 0) {
    return {
      attempted: false,
      skipped: true,
      reason: "No recipient email provided.",
    };
  }

  const host = resolveHostname(req);
  if (!host) {
    return {
      attempted: true,
      skipped: true,
      reason: "Host information is unavailable for notification API call.",
    };
  }

  const emailPayload = {
    applicantEmail: applicantEmail || "",
    applicantFirstName: normalizeText(record.first_name),
    competitionTitle,
    applicationCode,
    category: normalizeText(record.category),
    paymentHref,
    postSubmitHref,
    isFree,
    competitionSlug: normalizeText(record.competition_slug),
    email: normalizeText(record.email),
    phone: normalizeText(record.phone),
    city: normalizeText(record.city),
    country: normalizeText(record.country),
    submittedAt: normalizeText(record.created_at),
    dashboardUrl: resolveDashboardUrl(req, normalizeText(body.dashboardUrl)),
    adminEmails: notificationEmails.length
      ? notificationEmails
      : REGISTRATION_SUPPORT_EMAIL
      ? [REGISTRATION_SUPPORT_EMAIL]
      : [],
    recipientType: notificationEmails.length || actionHref ? "both" : "applicant",
  };

  if (!actionHref) {
    return {
      attempted: true,
      skipped: true,
      reason: "No destination URL available for action button.",
      attemptedWithNoAction: true,
    };
  }

  const requestUrl = `${resolveProtocol(req)}://${host}${REGISTRATION_EMAIL_ENDPOINT}`;

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(emailPayload),
  });

  const emailResponse = (await response.json().catch(() => null)) || {};
  if (!response.ok) {
    return {
      attempted: true,
      ok: false,
      error:
        emailResponse?.message || "Could not send registration notification email.",
    };
  }

  return {
    attempted: true,
    ok: true,
    raw: emailResponse,
  };
};

const buildInsertPayload = (payload) => {
  const record = {
    application_code: normalizeText(payload.application_code),
    competition_slug: normalizeText(payload.competition_slug),
    category: normalizeText(payload.category),
    first_name: normalizeText(payload.first_name),
    last_name: normalizeText(payload.last_name) || "",
    email: normalizeText(payload.email),
    phone: normalizeText(payload.phone),
    city: normalizeText(payload.city),
    country: normalizeText(payload.country),
    instagram_handle: normalizeText(payload.instagram_handle),
    tiktok_handle: normalizeText(payload.tiktok_handle),
    portfolio_url: normalizeText(payload.portfolio_url),
    years_experience: normalizeInteger(payload.years_experience),
    motivation: normalizeText(payload.motivation),
    form_payload: normalizeJson(payload.form_payload),
    payment_status: normalizeText(payload.payment_status) || "pending",
    payment_platform: normalizeText(payload.payment_platform),
    payment_reference: normalizeText(payload.payment_reference),
    payment_amount:
      payload.payment_amount === undefined || payload.payment_amount === null
        ? null
        : Number(payload.payment_amount),
    review_status: normalizeText(payload.review_status) || "submitted",
    review_notes: normalizeText(payload.review_notes),
  };

    if (!record.application_code) {
      return { error: "application_code is required." };
    }
  if (!record.competition_slug || !ALLOWED_COMPETITION_SLUGS.has(record.competition_slug)) {
    return { error: "competition_slug is required and must be valid." };
  }
  if (!record.first_name) {
    return { error: "first_name is required." };
  }
  if (!record.email) {
    return { error: "email is required." };
  }
  if (!record.phone) {
    return { error: "WhatsApp number is required." };
  }

  return { record };
};

const createAdminClient = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        "x-client-info": "panache-foundation-api",
      },
    },
  });
};

const selectColumns = [
  "id",
  "application_code",
  "competition_slug",
  "category",
  "first_name",
  "last_name",
  "email",
  "phone",
  "city",
  "country",
  "instagram_handle",
  "tiktok_handle",
  "portfolio_url",
  "years_experience",
  "motivation",
  "form_payload",
  "payment_status",
  "payment_platform",
  "payment_reference",
  "payment_amount",
  "paid_at",
  "review_status",
  "review_notes",
  "created_at",
  "updated_at",
].join(", ");

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET,POST,PATCH,OPTIONS");
    return sendJson(res, 200, { ok: true });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return sendJson(res, 500, {
      message: "Panache backend is not configured on the server.",
    });
  }

  if (req.method === "POST") {
    const body = parseBody(req);
    const { error, record } = buildInsertPayload(body);
    if (error) {
      return sendJson(res, 400, { message: error });
    }

    const { data, error: insertError } = await supabase
      .from("competition_applications")
      .insert([record])
      .select(selectColumns)
      .single();

    if (insertError) {
      return sendJson(res, 400, {
        message: insertError.message || "Could not save the application.",
        error: insertError,
      });
    }

    let emailResult = {
      attempted: false,
      ok: false,
      skipped: true,
    };
    const isFreeSubmission = normalizeText(record.payment_platform) === "free";
    try {
      emailResult = await sendRegistrationNotification(
        req,
        data,
        body,
        isFreeSubmission
      );
    } catch (notificationError) {
      emailResult = {
        attempted: true,
        ok: false,
        error:
          notificationError instanceof Error
            ? notificationError.message
            : "Could not send registration notification email.",
      };
    }

    return sendJson(res, 200, {
      application: data,
      notification: emailResult,
    });
  }

  if (req.method === "GET") {
    const applicationCode = normalizeText(req.query?.application_code);
    if (!applicationCode) {
      return sendJson(res, 400, {
        message: "application_code is required.",
      });
    }

    const { data, error } = await supabase
      .from("competition_applications")
      .select(selectColumns)
      .eq("application_code", applicationCode)
      .maybeSingle();

    if (error) {
      return sendJson(res, 400, {
        message: error.message || "Could not load the application.",
        error,
      });
    }
    if (!data) {
      return sendJson(res, 404, {
        message: `Application ${applicationCode} was not found.`,
      });
    }

    return sendJson(res, 200, {
      application: data,
    });
  }

  if (req.method === "PATCH") {
    const accessKey = req.headers["x-dashboard-key"];
    if (!DASHBOARD_ACCESS_KEY || accessKey !== DASHBOARD_ACCESS_KEY) {
      return sendJson(res, 401, {
        message: "Invalid dashboard access code.",
      });
    }

    const body = parseBody(req);
    const id = normalizeText(body.id);
    const updates = body.updates && typeof body.updates === "object" ? body.updates : {};
    if (!id) {
      return sendJson(res, 400, { message: "id is required." });
    }

    const normalizedUpdates = {};
    for (const [key, value] of Object.entries(updates)) {
      if (
        [
          "payment_status",
          "payment_reference",
          "payment_platform",
          "review_status",
          "review_notes",
          "paid_at",
        ].includes(key)
      ) {
        normalizedUpdates[key] = normalizeText(value);
      } else if (key === "payment_amount") {
        normalizedUpdates[key] =
          value === undefined || value === null || value === ""
            ? null
            : Number(value);
      }
    }

    const { data, error } = await supabase
      .from("competition_applications")
      .update(normalizedUpdates)
      .eq("id", id)
      .select(selectColumns)
      .single();

    if (error) {
      return sendJson(res, 400, {
        message: error.message || "Could not update the application.",
        error,
      });
    }

    return sendJson(res, 200, { application: data });
  }

  res.setHeader("Allow", "GET,POST,PATCH,OPTIONS");
  return sendJson(res, 405, {
    message: "Method not allowed.",
  });
}
