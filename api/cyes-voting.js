import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const DASHBOARD_ACCESS_KEY = process.env.DASHBOARD_ACCESS_KEY || "";
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || "";
const CYES_VOTING_AGENT_KEY =
  process.env.CYES_VOTING_AGENT_KEY ||
  process.env.PANACHE_CYES_VOTING_AGENT_KEY ||
  "";
const CYES_VOTE_OTP_TTL_MINUTES = Number.parseInt(
  process.env.CYES_VOTE_OTP_TTL_MINUTES || "10",
  10
);
const CYES_VOTE_OTP_SECRET =
  process.env.CYES_VOTE_OTP_SECRET ||
  CYES_VOTING_AGENT_KEY ||
  DASHBOARD_ACCESS_KEY ||
  SUPABASE_SERVICE_ROLE_KEY ||
  "panache-cyes-vote-otp";
const CYES_NOMINEE_PHOTO_BUCKET =
  process.env.CYES_NOMINEE_PHOTO_BUCKET || "cyes-nominee-photos";
const CYES_NOMINEE_PHOTO_MAX_BYTES = Number.parseInt(
  process.env.CYES_NOMINEE_PHOTO_MAX_BYTES || String(3 * 1024 * 1024),
  10
);
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE =
  String(process.env.SMTP_SECURE || "true").toLowerCase() !== "false";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || "";
const ADMIN_NOTIFICATION_EMAILS =
  process.env.ADMIN_NOTIFICATION_EMAILS ||
  process.env.PANACHE_NOTIFICATION_EMAILS ||
  "glenmue2020@gmail.com";
const CYES_VOTE_NOTIFICATION_EMAILS =
  process.env.CYES_VOTE_NOTIFICATION_EMAILS ||
  process.env.CYES_VOTING_NOTIFICATION_EMAILS ||
  ADMIN_NOTIFICATION_EMAILS ||
  process.env.REGISTRATION_SUPPORT_EMAIL ||
  SMTP_USER ||
  "";
const PARTICIPANTS_DASHBOARD_PATH =
  process.env.PARTICIPANTS_DASHBOARD_PATH || "/panache-expo/participants-dashboard";

const CATEGORY_COLUMNS =
  "id, slug, name, description, status, voting_enabled, sort_order, created_at, updated_at";
const NOMINEE_COLUMNS =
  "id, category_id, name, organization, bio, photo_url, status, sort_order, created_at, updated_at";
const VOTE_COLUMNS =
  "id, category_id, nominee_id, voter_name, voter_phone, voter_email, created_at";

const allowedStatuses = new Set(["active", "draft", "archived"]);
const allowedNomineePhotoTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

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

const normalizeText = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  const normalized = String(value).trim();
  return normalized || null;
};

const normalizeBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    if (["true", "1", "yes", "on"].includes(value.toLowerCase())) {
      return true;
    }
    if (["false", "0", "no", "off"].includes(value.toLowerCase())) {
      return false;
    }
  }
  return fallback;
};

const normalizeInteger = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizePhone = (value) => {
  const raw = normalizeText(value);
  if (!raw) {
    return null;
  }

  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 16) {
    return null;
  }

  return `${hasPlus ? "+" : "+"}${digits}`;
};

const normalizeEmail = (value) => {
  const raw = normalizeText(value);
  if (!raw) {
    return null;
  }

  const email = raw.toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
};

const normalizeEmailList = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeEmail).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => normalizeEmail(item))
      .filter(Boolean);
  }
  return [];
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);

const sanitizeStorageFileName = (value) => {
  const fallbackName = `nominee-photo-${Date.now()}`;
  const normalized = String(value || fallbackName)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || fallbackName;
};

const extensionForMimeType = (contentType) => {
  if (contentType === "image/png") {
    return "png";
  }
  if (contentType === "image/webp") {
    return "webp";
  }
  if (contentType === "image/gif") {
    return "gif";
  }
  return "jpg";
};

const parseBase64File = ({ base64, dataUrl, contentType }) => {
  let normalizedBase64 = normalizeText(base64);
  let normalizedContentType = normalizeText(contentType);

  const normalizedDataUrl = normalizeText(dataUrl);
  if (normalizedDataUrl?.startsWith("data:")) {
    const match = normalizedDataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return { error: "Image data is invalid." };
    }
    normalizedContentType = normalizedContentType || match[1];
    normalizedBase64 = match[2];
  }

  if (!normalizedBase64) {
    return { error: "Image file data is required." };
  }
  if (!normalizedContentType || !allowedNomineePhotoTypes.has(normalizedContentType)) {
    return { error: "Upload a JPG, PNG, WEBP, or GIF image." };
  }

  const buffer = Buffer.from(normalizedBase64, "base64");
  if (!buffer.length) {
    return { error: "Image file is empty." };
  }
  if (buffer.length > CYES_NOMINEE_PHOTO_MAX_BYTES) {
    return {
      error: `Image is too large. Upload an image under ${Math.round(
        CYES_NOMINEE_PHOTO_MAX_BYTES / (1024 * 1024)
      )} MB.`,
    };
  }

  return {
    buffer,
    contentType: normalizedContentType,
  };
};

const getClientIp = (req) => {
  const forwarded = normalizeText(req.headers["x-forwarded-for"]);
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return (
    normalizeText(req.headers["x-real-ip"]) ||
    normalizeText(req.socket?.remoteAddress) ||
    "unknown"
  );
};

const resolveProtocol = (req) => {
  const forwardedProto = normalizeText(req.headers["x-forwarded-proto"]);
  if (forwardedProto?.includes("https")) {
    return "https";
  }
  return forwardedProto?.startsWith("http") ? forwardedProto : "http";
};

const resolveDashboardUrl = (req) => {
  const host = normalizeText(req.headers.host);
  if (!host) {
    return "";
  }
  return `${resolveProtocol(req)}://${host}${PARTICIPANTS_DASHBOARD_PATH}`;
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
        "x-client-info": "panache-cyes-voting-api",
      },
    },
  });
};

const getDashboardKeyFromRequest = (req) =>
  req.headers["x-dashboard-key"] ||
  req.headers["X-Dashboard-Key"] ||
  req.headers["x-dashboard-access-key"];

const isAuthorizedDashboardRequest = (req) =>
  Boolean(DASHBOARD_ACCESS_KEY && getDashboardKeyFromRequest(req) === DASHBOARD_ACCESS_KEY);

const getAgentKeyFromRequest = (req) =>
  req.headers["x-cyes-agent-key"] || req.headers["X-CYES-Agent-Key"];

const isTrustedVotingAgentRequest = (req) =>
  Boolean(
    (CYES_VOTING_AGENT_KEY && getAgentKeyFromRequest(req) === CYES_VOTING_AGENT_KEY) ||
      isAuthorizedDashboardRequest(req)
  );

const assertAuthorized = (req, res) => {
  if (!isAuthorizedDashboardRequest(req)) {
    sendJson(res, 401, { message: "Invalid dashboard access code." });
    return false;
  }
  return true;
};

const captchaSecret = () =>
  TURNSTILE_SECRET_KEY ||
  DASHBOARD_ACCESS_KEY ||
  SUPABASE_SERVICE_ROLE_KEY ||
  "panache-cyes-voting";

const signCaptchaPayload = (payload) =>
  crypto.createHmac("sha256", captchaSecret()).update(payload).digest("base64url");

const createFallbackCaptcha = () => {
  const left = crypto.randomInt(3, 13);
  const right = crypto.randomInt(2, 10);
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const payload = Buffer.from(
    JSON.stringify({
      answer: left + right,
      expiresAt,
      nonce: crypto.randomUUID(),
    })
  ).toString("base64url");

  return {
    id: `${payload}.${signCaptchaPayload(payload)}`,
    question: `${left} + ${right}`,
    expiresAt,
  };
};

const verifyFallbackCaptcha = (challengeId, answer) => {
  const challenge = normalizeText(challengeId);
  const normalizedAnswer = normalizeText(answer);
  if (!challenge || !normalizedAnswer || !challenge.includes(".")) {
    return false;
  }

  const [payload, signature] = challenge.split(".");
  if (!payload || !signature || signature !== signCaptchaPayload(payload)) {
    return false;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!decoded || Date.now() > Number(decoded.expiresAt)) {
      return false;
    }

    return Number.parseInt(normalizedAnswer, 10) === Number(decoded.answer);
  } catch {
    return false;
  }
};

const verifyTurnstileToken = async (token, ipAddress) => {
  if (!TURNSTILE_SECRET_KEY) {
    return false;
  }

  const formData = new URLSearchParams();
  formData.set("secret", TURNSTILE_SECRET_KEY);
  formData.set("response", token);
  if (ipAddress && ipAddress !== "unknown") {
    formData.set("remoteip", ipAddress);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData,
    }
  );
  const payload = await response.json().catch(() => null);
  return Boolean(response.ok && payload?.success);
};

const verifyCaptcha = async (req, body) => {
  const captchaToken = normalizeText(body.captchaToken || body.captcha_token);
  const captchaChallengeId = normalizeText(
    body.captchaChallengeId || body.captcha_challenge_id
  );
  const captchaAnswer = normalizeText(body.captchaAnswer || body.captcha_answer);

  if (captchaToken && TURNSTILE_SECRET_KEY) {
    const didPass = await verifyTurnstileToken(captchaToken, getClientIp(req));
    return didPass
      ? { ok: true }
      : { ok: false, message: "CAPTCHA verification failed. Please try again." };
  }
  if (captchaToken && !TURNSTILE_SECRET_KEY) {
    return {
      ok: false,
      message: "CAPTCHA secret is not configured on the server.",
    };
  }

  if (captchaChallengeId || captchaAnswer) {
    return verifyFallbackCaptcha(captchaChallengeId, captchaAnswer)
      ? { ok: true }
      : { ok: false, message: "CAPTCHA answer is incorrect or expired." };
  }

  return {
    ok: false,
    message: "Complete the CAPTCHA before requesting an OTP.",
  };
};

const enforceRateLimit = async (
  supabase,
  { key, action, maxAttempts, windowSeconds }
) => {
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const cleanupBefore = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  await supabase.from("cyes_voting_rate_limits").delete().lt("created_at", cleanupBefore);

  const { count, error: countError } = await supabase
    .from("cyes_voting_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("rate_key", key)
    .eq("action", action)
    .gte("created_at", windowStart);

  if (countError) {
    throw countError;
  }

  if ((count || 0) >= maxAttempts) {
    return {
      ok: false,
      message: "Too many attempts. Please wait a few minutes and try again.",
    };
  }

  const { error: insertError } = await supabase
    .from("cyes_voting_rate_limits")
    .insert([{ rate_key: key, action }]);

  if (insertError) {
    throw insertError;
  }

  return { ok: true };
};

const fetchVotingPayload = async (supabase, { includeDrafts = false } = {}) => {
  let categoryQuery = supabase
    .from("cyes_award_categories")
    .select(CATEGORY_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (!includeDrafts) {
    categoryQuery = categoryQuery.eq("status", "active").eq("voting_enabled", true);
  }

  const { data: categories, error: categoryError } = await categoryQuery;
  if (categoryError) {
    throw categoryError;
  }

  const categoryIds = (categories || []).map((category) => category.id);
  let nominees = [];
  if (categoryIds.length) {
    let nomineeQuery = supabase
      .from("cyes_award_nominees")
      .select(NOMINEE_COLUMNS)
      .in("category_id", categoryIds)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (!includeDrafts) {
      nomineeQuery = nomineeQuery.eq("status", "active");
    }

    const { data: nomineeData, error: nomineeError } = await nomineeQuery;
    if (nomineeError) {
      throw nomineeError;
    }
    nominees = nomineeData || [];
  }

  let votes = [];
  if (categoryIds.length) {
    const { data: voteData, error: voteError } = await supabase
      .from("cyes_award_votes")
      .select("category_id, nominee_id")
      .in("category_id", categoryIds);

    if (voteError) {
      throw voteError;
    }
    votes = voteData || [];
  }

  const nomineeVoteCounts = votes.reduce((accumulator, vote) => {
    accumulator[vote.nominee_id] = (accumulator[vote.nominee_id] || 0) + 1;
    return accumulator;
  }, {});

  const categoryVoteCounts = votes.reduce((accumulator, vote) => {
    accumulator[vote.category_id] = (accumulator[vote.category_id] || 0) + 1;
    return accumulator;
  }, {});

  const categoriesWithNominees = (categories || []).map((category) => ({
    ...category,
    vote_count: categoryVoteCounts[category.id] || 0,
    nominees: nominees
      .filter((nominee) => nominee.category_id === category.id)
      .map((nominee) => ({
        ...nominee,
        vote_count: nomineeVoteCounts[nominee.id] || 0,
      })),
  }));

  return {
    categories: categoriesWithNominees,
    total_votes: votes.length,
  };
};

const fetchVotingSelection = async (supabase, categoryId, nomineeId) => {
  const { data: category, error: categoryError } = await supabase
    .from("cyes_award_categories")
    .select(CATEGORY_COLUMNS)
    .eq("id", categoryId)
    .maybeSingle();

  if (categoryError) {
    throw categoryError;
  }
  if (!category || category.status !== "active" || !category.voting_enabled) {
    return {
      ok: false,
      statusCode: 400,
      message: "Voting is not open for that category.",
    };
  }

  const { data: nominee, error: nomineeError } = await supabase
    .from("cyes_award_nominees")
    .select(NOMINEE_COLUMNS)
    .eq("id", nomineeId)
    .maybeSingle();

  if (nomineeError) {
    throw nomineeError;
  }
  if (!nominee || nominee.status !== "active" || nominee.category_id !== category.id) {
    return {
      ok: false,
      statusCode: 400,
      message: "Choose an active nominee in this category.",
    };
  }

  return { ok: true, category, nominee };
};

const buildVoteNotificationText = ({ vote, category, nominee, dashboardUrl }) => `
A new CYES Awards vote has been recorded.

Category: ${category.name}
Nominee: ${nominee.name}${nominee.organization ? ` - ${nominee.organization}` : ""}
Voter: ${vote.voter_name}
Email: ${vote.voter_email || "N/A"}
Phone: ${vote.voter_phone || "N/A"}
Vote ID: ${vote.id}
Recorded at: ${vote.created_at || "N/A"}

${dashboardUrl ? `Open dashboard: ${dashboardUrl}` : ""}
`.trim();

const buildVoteNotificationHtml = ({ vote, category, nominee, dashboardUrl }) => `
  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827;">
    <h2 style="margin:0 0 16px;">New CYES Awards vote</h2>
    <p style="margin:0 0 12px;">Category: <strong>${escapeHtml(category.name)}</strong></p>
    <p style="margin:0 0 12px;">
      Nominee: <strong>${escapeHtml(nominee.name)}</strong>
      ${nominee.organization ? ` - ${escapeHtml(nominee.organization)}` : ""}
    </p>
    <p style="margin:0 0 12px;">Voter: <strong>${escapeHtml(vote.voter_name)}</strong></p>
    <p style="margin:0 0 12px;">Email: <strong>${escapeHtml(vote.voter_email || "N/A")}</strong></p>
    <p style="margin:0 0 12px;">Phone: <strong>${escapeHtml(vote.voter_phone || "N/A")}</strong></p>
    <p style="margin:0 0 12px;">Vote ID: <strong>${escapeHtml(vote.id)}</strong></p>
    <p style="margin:0 0 20px;">Recorded at: <strong>${escapeHtml(vote.created_at || "N/A")}</strong></p>
    ${
      dashboardUrl
        ? `<p style="margin:0;"><a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;">Open dashboard</a></p>`
        : ""
    }
  </div>
`;

const sendVoteNotification = async (req, { vote, category, nominee }) => {
  const recipients = normalizeEmailList(CYES_VOTE_NOTIFICATION_EMAILS);
  if (!recipients.length) {
    return {
      attempted: false,
      skipped: true,
      reason: "No vote notification recipients configured.",
    };
  }

  if (!SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return {
      attempted: false,
      skipped: true,
      reason: "SMTP is not configured on the server.",
    };
  }

  const dashboardUrl = resolveDashboardUrl(req);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: SMTP_FROM,
    to: recipients,
    replyTo: vote.voter_email || undefined,
    subject: `New CYES Awards vote - ${category.name}`,
    text: buildVoteNotificationText({ vote, category, nominee, dashboardUrl }),
    html: buildVoteNotificationHtml({ vote, category, nominee, dashboardUrl }),
  });

  return {
    attempted: true,
    ok: true,
    recipients,
  };
};

const getVoteOtpTtlMinutes = () =>
  Number.isFinite(CYES_VOTE_OTP_TTL_MINUTES) && CYES_VOTE_OTP_TTL_MINUTES > 0
    ? CYES_VOTE_OTP_TTL_MINUTES
    : 10;

const normalizeOtp = (value) => {
  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }
  const digits = normalized.replace(/\D/g, "");
  return digits || normalized;
};

const createVoteOtpCode = () =>
  String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");

const hashVoteOtp = (voter, otp) =>
  crypto
    .createHmac("sha256", CYES_VOTE_OTP_SECRET)
    .update(
      [
        voter.categoryId,
        voter.nomineeId,
        voter.voterEmail,
        voter.voterPhone,
        normalizeOtp(otp),
      ].join(":")
    )
    .digest("hex");

const buildVoteOtpText = ({ voter, category, nominee, otp, ttlMinutes }) => `
Your CYES Awards voting code is ${otp}.

Category: ${category.name}
Nominee: ${nominee.name}${nominee.organization ? ` - ${nominee.organization}` : ""}

This code expires in ${ttlMinutes} minutes. If you did not request this vote, you can ignore this email.
`.trim();

const buildVoteOtpHtml = ({ category, nominee, otp, ttlMinutes }) => `
  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827;">
    <h2 style="margin:0 0 16px;">Your CYES Awards voting code</h2>
    <p style="margin:0 0 12px;">Use this code to confirm your vote:</p>
    <p style="font-size:32px;letter-spacing:8px;font-weight:700;margin:0 0 18px;">${escapeHtml(otp)}</p>
    <p style="margin:0 0 12px;">Category: <strong>${escapeHtml(category.name)}</strong></p>
    <p style="margin:0 0 12px;">
      Nominee: <strong>${escapeHtml(nominee.name)}</strong>
      ${nominee.organization ? ` - ${escapeHtml(nominee.organization)}` : ""}
    </p>
    <p style="margin:0;">This code expires in ${escapeHtml(ttlMinutes)} minutes.</p>
  </div>
`;

const sendVoteOtpEmail = async ({ voter, category, nominee, otp, ttlMinutes }) => {
  if (!SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return {
      ok: false,
      statusCode: 500,
      message: "Email OTP sending is not configured on the server.",
    };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: SMTP_FROM,
    to: voter.voterEmail,
    replyTo: normalizeEmailList(ADMIN_NOTIFICATION_EMAILS)[0] || undefined,
    subject: `Your CYES Awards voting code: ${otp}`,
    text: buildVoteOtpText({ voter, category, nominee, otp, ttlMinutes }),
    html: buildVoteOtpHtml({ category, nominee, otp, ttlMinutes }),
  });

  return { ok: true };
};

const cleanupExpiredVoteOtps = async (supabase) => {
  const cleanupBefore = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await supabase
    .from("cyes_vote_email_otps")
    .delete()
    .lt("expires_at", cleanupBefore);
};

const storeVoteOtp = async (supabase, { voter, otp, expiresAt }) => {
  const { error } = await supabase.from("cyes_vote_email_otps").insert([
    {
      category_id: voter.categoryId,
      nominee_id: voter.nomineeId,
      voter_email: voter.voterEmail,
      voter_phone: voter.voterPhone,
      otp_hash: hashVoteOtp(voter, otp),
      expires_at: expiresAt,
    },
  ]);

  if (error) {
    throw error;
  }
};

const verifyVoteOtp = async (supabase, voter, otp) => {
  const expectedHash = hashVoteOtp(voter, otp);
  const { data: otpRecord, error: otpError } = await supabase
    .from("cyes_vote_email_otps")
    .select("id, otp_hash, attempts, expires_at")
    .eq("category_id", voter.categoryId)
    .eq("nominee_id", voter.nomineeId)
    .eq("voter_email", voter.voterEmail)
    .eq("voter_phone", voter.voterPhone)
    .is("used_at", null)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (otpError) {
    throw otpError;
  }
  if (!otpRecord) {
    return {
      ok: false,
      statusCode: 401,
      message: "OTP is invalid or expired. Please request a new code.",
    };
  }

  const attempts = Number(otpRecord.attempts || 0);
  if (attempts >= 5) {
    return {
      ok: false,
      statusCode: 429,
      message: "Too many incorrect OTP attempts. Please request a new code.",
    };
  }

  if (otpRecord.otp_hash !== expectedHash) {
    await supabase
      .from("cyes_vote_email_otps")
      .update({ attempts: attempts + 1 })
      .eq("id", otpRecord.id);
    return {
      ok: false,
      statusCode: 401,
      message: "OTP is incorrect. Please check the code and try again.",
    };
  }

  return { ok: true, otpRecord };
};

const buildVoterPayload = (body, { requireEmail = true } = {}) => {
  const categoryId = normalizeText(body.categoryId || body.category_id);
  const nomineeId = normalizeText(body.nomineeId || body.nominee_id);
  const voterName = normalizeText(body.voterName || body.voter_name);
  const voterEmail = normalizeEmail(body.voterEmail || body.voter_email);
  const voterPhone = normalizePhone(body.voterPhone || body.voter_phone || body.phone);

  if (!categoryId || !nomineeId) {
    return { error: "Choose a category and nominee before continuing." };
  }
  if (!voterName) {
    return { error: "Your full name is required." };
  }
  if (!voterPhone) {
    return { error: "Enter a valid phone number with country code." };
  }
  if (requireEmail && !voterEmail) {
    return { error: "Enter a valid email address for OTP verification." };
  }

  return {
    voter: {
      categoryId,
      nomineeId,
      voterName,
      voterEmail,
      voterPhone,
    },
  };
};

const handleRequestOtp = async (req, res, supabase, body) => {
  const { error, voter } = buildVoterPayload(body);
  if (error) {
    return sendJson(res, 400, { message: error });
  }

  const selection = await fetchVotingSelection(
    supabase,
    voter.categoryId,
    voter.nomineeId
  );
  if (!selection.ok) {
    return sendJson(res, selection.statusCode, { message: selection.message });
  }

  if (!isTrustedVotingAgentRequest(req)) {
    const captcha = await verifyCaptcha(req, body);
    if (!captcha.ok) {
      return sendJson(res, 400, { message: captcha.message });
    }
  }

  const ipAddress = getClientIp(req);
  const limit = await enforceRateLimit(supabase, {
    key: `otp:${ipAddress}:${voter.voterEmail}`,
    action: "request_otp",
    maxAttempts: 3,
    windowSeconds: 10 * 60,
  });
  if (!limit.ok) {
    return sendJson(res, 429, { message: limit.message });
  }
  await cleanupExpiredVoteOtps(supabase).catch(() => null);

  const { data: existingEmailVote, error: existingEmailVoteError } = await supabase
    .from("cyes_award_votes")
    .select("id")
    .eq("category_id", voter.categoryId)
    .eq("voter_email", voter.voterEmail)
    .maybeSingle();

  if (existingEmailVoteError) {
    throw existingEmailVoteError;
  }
  if (existingEmailVote) {
    return sendJson(res, 409, {
      message: "This email address has already voted in this category.",
    });
  }

  const { data: existingPhoneVote, error: existingPhoneVoteError } = await supabase
    .from("cyes_award_votes")
    .select("id")
    .eq("category_id", voter.categoryId)
    .eq("voter_phone", voter.voterPhone)
    .maybeSingle();

  if (existingPhoneVoteError) {
    throw existingPhoneVoteError;
  }
  if (existingPhoneVote) {
    return sendJson(res, 409, {
      message: "This phone number has already voted in this category.",
    });
  }

  const ttlMinutes = getVoteOtpTtlMinutes();
  const otp = createVoteOtpCode();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

  try {
    await storeVoteOtp(supabase, { voter, otp, expiresAt });
  } catch (otpStorageError) {
    console.error("Failed to store CYES vote OTP", otpStorageError);
    return sendJson(res, 400, {
      message:
        otpStorageError?.code === "42P01"
          ? "Vote OTP storage is not configured. Apply the latest Supabase migration."
          : otpStorageError?.message || "Could not prepare the OTP.",
    });
  }

  const emailResult = await sendVoteOtpEmail({
    voter,
    category: selection.category,
    nominee: selection.nominee,
    otp,
    ttlMinutes,
  });
  if (!emailResult.ok) {
    return sendJson(res, emailResult.statusCode || 500, {
      message: emailResult.message || "Could not send the OTP email.",
    });
  }

  return sendJson(res, 200, {
    message: "OTP sent.",
    email: voter.voterEmail,
    expiresAt,
  });
};

const handleCastVote = async (req, res, supabase, body) => {
  const isTrustedAgent = isTrustedVotingAgentRequest(req);
  const { error, voter } = buildVoterPayload(body, {
    requireEmail: !isTrustedAgent,
  });
  if (error) {
    return sendJson(res, 400, { message: error });
  }

  const otp = normalizeOtp(body.otp || body.token || body.verificationCode);
  if (!isTrustedAgent && (!otp || otp.length !== 6)) {
    return sendJson(res, 400, { message: "Enter the OTP sent to your email." });
  }

  const selection = await fetchVotingSelection(
    supabase,
    voter.categoryId,
    voter.nomineeId
  );
  if (!selection.ok) {
    return sendJson(res, selection.statusCode, { message: selection.message });
  }

  const ipAddress = getClientIp(req);
  const limit = await enforceRateLimit(supabase, {
    key: `vote:${ipAddress}:${voter.voterEmail || voter.voterPhone}`,
    action: "cast_vote",
    maxAttempts: 8,
    windowSeconds: 60 * 60,
  });
  if (!limit.ok) {
    return sendJson(res, 429, { message: limit.message });
  }

  let otpVerification = null;
  if (!isTrustedAgent) {
    try {
      otpVerification = await verifyVoteOtp(supabase, voter, otp);
    } catch (otpVerificationError) {
      console.error("Failed to verify CYES vote OTP", otpVerificationError);
      return sendJson(res, 400, {
        message:
          otpVerificationError?.code === "42P01"
            ? "Vote OTP storage is not configured. Apply the latest Supabase migration."
            : otpVerificationError?.message || "Could not verify the OTP.",
      });
    }
    if (!otpVerification.ok) {
      return sendJson(res, otpVerification.statusCode || 401, {
        message: otpVerification.message,
      });
    }
  }

  const { data: existingPhoneVote, error: existingPhoneVoteError } = await supabase
    .from("cyes_award_votes")
    .select(VOTE_COLUMNS)
    .eq("voter_phone", voter.voterPhone)
    .maybeSingle();
  if (existingPhoneVoteError) {
    return sendJson(res, 400, {
      message: existingPhoneVoteError.message || "Could not check existing votes.",
      error: existingPhoneVoteError,
    });
  }
  if (existingPhoneVote) {
    return sendJson(res, 409, {
      message: "This WhatsApp number has already voted. Each WhatsApp number can cast one CYES vote.",
      vote: existingPhoneVote,
    });
  }

  const { data: vote, error: insertError } = await supabase
    .from("cyes_award_votes")
    .insert([
      {
        category_id: voter.categoryId,
        nominee_id: voter.nomineeId,
        voter_name: voter.voterName,
        voter_phone: voter.voterPhone,
        voter_email: voter.voterEmail || null,
        supabase_user_id: null,
        ip_address: ipAddress,
        user_agent: normalizeText(req.headers["user-agent"]),
        verification_provider: isTrustedAgent
          ? "panache-whatsapp-agent"
          : "panache-email-otp",
      },
    ])
    .select(VOTE_COLUMNS)
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return sendJson(res, 409, {
        message: "This WhatsApp number has already voted. Each WhatsApp number can cast one CYES vote.",
      });
    }

    return sendJson(res, 400, {
      message: insertError.message || "Could not save the vote.",
      error: insertError,
    });
  }

  if (otpVerification?.otpRecord?.id) {
    const { error: markOtpUsedError } = await supabase
      .from("cyes_vote_email_otps")
      .update({ used_at: new Date().toISOString() })
      .eq("id", otpVerification.otpRecord.id);
    if (markOtpUsedError) {
      console.error("Failed to mark CYES vote OTP as used", markOtpUsedError);
    }
  }

  const voting = await fetchVotingPayload(supabase);
  let notification = {
    attempted: false,
    skipped: true,
    reason: "Vote notification was not attempted.",
  };
  try {
    notification = await sendVoteNotification(req, {
      vote,
      category: selection.category,
      nominee: selection.nominee,
    });
  } catch (notificationError) {
    console.error("Failed to send CYES vote notification", notificationError);
    notification = {
      attempted: true,
      ok: false,
      error:
        notificationError instanceof Error
          ? notificationError.message
          : "Could not send CYES vote notification.",
    };
  }

  return sendJson(res, 200, {
    message: "Vote recorded.",
    vote,
    voting,
    notification,
  });
};

const sanitizeCategoryPayload = (payload, { creating = false } = {}) => {
  const name = normalizeText(payload.name);
  const updates = {};

  if (creating && !name) {
    return { error: "Category name is required." };
  }

  if (name) {
    updates.name = name;
    if (creating || payload.slug) {
      updates.slug = slugify(payload.slug || name);
    }
  }

  if ("description" in payload) {
    updates.description = normalizeText(payload.description);
  }
  if ("status" in payload) {
    const status = normalizeText(payload.status) || "draft";
    if (!allowedStatuses.has(status)) {
      return { error: "Category status is invalid." };
    }
    updates.status = status;
  } else if (creating) {
    updates.status = "active";
  }
  if ("voting_enabled" in payload || "votingEnabled" in payload) {
    updates.voting_enabled = normalizeBoolean(
      payload.voting_enabled ?? payload.votingEnabled,
      creating
    );
  } else if (creating) {
    updates.voting_enabled = true;
  }
  if ("sort_order" in payload || "sortOrder" in payload) {
    updates.sort_order = normalizeInteger(payload.sort_order ?? payload.sortOrder, 0);
  } else if (creating) {
    updates.sort_order = 0;
  }

  updates.updated_at = new Date().toISOString();
  return { updates };
};

const sanitizeNomineePayload = (payload, { creating = false } = {}) => {
  const name = normalizeText(payload.name);
  const updates = {};

  if (creating && !name) {
    return { error: "Nominee name is required." };
  }

  if (creating || "category_id" in payload || "categoryId" in payload) {
    const categoryId = normalizeText(payload.category_id || payload.categoryId);
    if (!categoryId) {
      return { error: "Category is required for this nominee." };
    }
    updates.category_id = categoryId;
  }
  if (name) {
    updates.name = name;
  }
  if ("organization" in payload) {
    updates.organization = normalizeText(payload.organization);
  }
  if ("bio" in payload) {
    updates.bio = normalizeText(payload.bio);
  }
  if ("photo_url" in payload || "photoUrl" in payload) {
    updates.photo_url = normalizeText(payload.photo_url || payload.photoUrl);
  }
  if ("status" in payload) {
    const status = normalizeText(payload.status) || "draft";
    if (!allowedStatuses.has(status)) {
      return { error: "Nominee status is invalid." };
    }
    updates.status = status;
  } else if (creating) {
    updates.status = "active";
  }
  if ("sort_order" in payload || "sortOrder" in payload) {
    updates.sort_order = normalizeInteger(payload.sort_order ?? payload.sortOrder, 0);
  } else if (creating) {
    updates.sort_order = 0;
  }

  updates.updated_at = new Date().toISOString();
  return { updates };
};

const handleUploadNomineePhoto = async (res, supabase, body) => {
  const upload = parseBase64File({
    base64: body.base64 || body.fileBase64 || body.file_base64,
    dataUrl: body.dataUrl || body.data_url,
    contentType: body.contentType || body.content_type,
  });
  if (upload.error) {
    return sendJson(res, 400, { message: upload.error });
  }

  const rawFileName = sanitizeStorageFileName(body.fileName || body.file_name);
  const extension = extensionForMimeType(upload.contentType);
  const baseFileName = rawFileName.includes(".")
    ? rawFileName.replace(/\.[^.]+$/, "")
    : rawFileName;
  const objectPath = `nominees/${new Date().toISOString().slice(0, 10)}/${Date.now()}-${crypto
    .randomBytes(4)
    .toString("hex")}-${baseFileName}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(CYES_NOMINEE_PHOTO_BUCKET)
    .upload(objectPath, upload.buffer, {
      contentType: upload.contentType,
      upsert: false,
    });

  if (uploadError) {
    return sendJson(res, 400, {
      message:
        uploadError.message ||
        "Could not upload the nominee photo. Check the Supabase storage bucket.",
      error: uploadError,
    });
  }

  const { data: publicUrlData } = supabase.storage
    .from(CYES_NOMINEE_PHOTO_BUCKET)
    .getPublicUrl(objectPath);

  return sendJson(res, 200, {
    photoUrl: publicUrlData?.publicUrl || "",
    photo_url: publicUrlData?.publicUrl || "",
    path: objectPath,
  });
};

const handleAdminAction = async (req, res, supabase, body) => {
  if (!assertAuthorized(req, res)) {
    return;
  }

  const action = normalizeText(body.action);

  if (action === "uploadNomineePhoto") {
    return await handleUploadNomineePhoto(res, supabase, body);
  }

  if (action === "createCategory") {
    const { error, updates } = sanitizeCategoryPayload(body.category || body, {
      creating: true,
    });
    if (error) {
      return sendJson(res, 400, { message: error });
    }

    const { data, error: insertError } = await supabase
      .from("cyes_award_categories")
      .insert([updates])
      .select(CATEGORY_COLUMNS)
      .single();

    if (insertError) {
      return sendJson(res, 400, {
        message: insertError.message || "Could not create the category.",
      });
    }

    const voting = await fetchVotingPayload(supabase, { includeDrafts: true });
    return sendJson(res, 200, { category: data, voting });
  }

  if (action === "updateCategory") {
    const id = normalizeText(body.id || body.categoryId);
    if (!id) {
      return sendJson(res, 400, { message: "Category id is required." });
    }

    const { error, updates } = sanitizeCategoryPayload(body.updates || body.category || {});
    if (error) {
      return sendJson(res, 400, { message: error });
    }

    const { data, error: updateError } = await supabase
      .from("cyes_award_categories")
      .update(updates)
      .eq("id", id)
      .select(CATEGORY_COLUMNS)
      .single();

    if (updateError) {
      return sendJson(res, 400, {
        message: updateError.message || "Could not update the category.",
      });
    }

    const voting = await fetchVotingPayload(supabase, { includeDrafts: true });
    return sendJson(res, 200, { category: data, voting });
  }

  if (action === "createNominee") {
    const { error, updates } = sanitizeNomineePayload(body.nominee || body, {
      creating: true,
    });
    if (error) {
      return sendJson(res, 400, { message: error });
    }

    const { data, error: insertError } = await supabase
      .from("cyes_award_nominees")
      .insert([updates])
      .select(NOMINEE_COLUMNS)
      .single();

    if (insertError) {
      return sendJson(res, 400, {
        message: insertError.message || "Could not create the nominee.",
      });
    }

    const voting = await fetchVotingPayload(supabase, { includeDrafts: true });
    return sendJson(res, 200, { nominee: data, voting });
  }

  if (action === "updateNominee") {
    const id = normalizeText(body.id || body.nomineeId);
    if (!id) {
      return sendJson(res, 400, { message: "Nominee id is required." });
    }

    const { error, updates } = sanitizeNomineePayload(body.updates || body.nominee || {});
    if (error) {
      return sendJson(res, 400, { message: error });
    }

    const { data, error: updateError } = await supabase
      .from("cyes_award_nominees")
      .update(updates)
      .eq("id", id)
      .select(NOMINEE_COLUMNS)
      .single();

    if (updateError) {
      return sendJson(res, 400, {
        message: updateError.message || "Could not update the nominee.",
      });
    }

    const voting = await fetchVotingPayload(supabase, { includeDrafts: true });
    return sendJson(res, 200, { nominee: data, voting });
  }

  if (action === "deleteNominee") {
    const id = normalizeText(body.id || body.nomineeId);
    if (!id) {
      return sendJson(res, 400, { message: "Nominee id is required." });
    }

    const { count, error: voteCountError } = await supabase
      .from("cyes_award_votes")
      .select("id", { count: "exact", head: true })
      .eq("nominee_id", id);

    if (voteCountError) {
      return sendJson(res, 400, {
        message: voteCountError.message || "Could not check nominee votes.",
      });
    }

    if ((count || 0) > 0) {
      return sendJson(res, 409, {
        message:
          "This nominee already has votes. Archive the nominee instead so voting records stay intact.",
      });
    }

    const { data, error: deleteError } = await supabase
      .from("cyes_award_nominees")
      .delete()
      .eq("id", id)
      .select(NOMINEE_COLUMNS)
      .single();

    if (deleteError) {
      return sendJson(res, 400, {
        message: deleteError.message || "Could not delete the nominee.",
      });
    }

    const voting = await fetchVotingPayload(supabase, { includeDrafts: true });
    return sendJson(res, 200, { nominee: data, voting });
  }

  return sendJson(res, 400, { message: "Unknown dashboard voting action." });
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET,POST,OPTIONS");
    return sendJson(res, 200, { ok: true });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return sendJson(res, 500, {
      message: "CYES voting backend is not configured on the server.",
    });
  }

  try {
    if (req.method === "GET") {
      if (req.query?.captcha === "1") {
        return sendJson(res, 200, { captcha: createFallbackCaptcha() });
      }

      const voting = await fetchVotingPayload(supabase, {
        includeDrafts: isAuthorizedDashboardRequest(req),
      });
      return sendJson(res, 200, { voting });
    }

    if (req.method === "POST") {
      const body = parseBody(req);
      const action = normalizeText(body.action);

      if (action === "requestOtp") {
        return await handleRequestOtp(req, res, supabase, body);
      }

      if (action === "castVote") {
        return await handleCastVote(req, res, supabase, body);
      }

      return await handleAdminAction(req, res, supabase, body);
    }
  } catch (error) {
    console.error("CYES voting API error", error);
    return sendJson(res, 500, {
      message:
        error instanceof Error
          ? error.message
          : error?.message || "Could not complete the CYES voting request.",
    });
  }

  res.setHeader("Allow", "GET,POST,OPTIONS");
  return sendJson(res, 405, { message: "Method not allowed." });
}
