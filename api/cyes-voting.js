import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const DASHBOARD_ACCESS_KEY = process.env.DASHBOARD_ACCESS_KEY || "";
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || "";

const CATEGORY_COLUMNS =
  "id, slug, name, description, status, voting_enabled, sort_order, created_at, updated_at";
const NOMINEE_COLUMNS =
  "id, category_id, name, organization, bio, photo_url, status, sort_order, created_at, updated_at";
const VOTE_COLUMNS =
  "id, category_id, nominee_id, voter_name, voter_phone, voter_email, created_at";

const allowedStatuses = new Set(["active", "draft", "archived"]);

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

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);

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

const createAuthClient = () => {
  const key = SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !key) {
    return null;
  }

  return createClient(SUPABASE_URL, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        "x-client-info": "panache-cyes-voting-auth",
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

const buildVoterPayload = (body) => {
  const categoryId = normalizeText(body.categoryId || body.category_id);
  const nomineeId = normalizeText(body.nomineeId || body.nominee_id);
  const voterName = normalizeText(body.voterName || body.voter_name);
  const voterEmail = normalizeText(body.voterEmail || body.voter_email);
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

  const captcha = await verifyCaptcha(req, body);
  if (!captcha.ok) {
    return sendJson(res, 400, { message: captcha.message });
  }

  const ipAddress = getClientIp(req);
  const limit = await enforceRateLimit(supabase, {
    key: `otp:${ipAddress}:${voter.voterPhone}`,
    action: "request_otp",
    maxAttempts: 3,
    windowSeconds: 10 * 60,
  });
  if (!limit.ok) {
    return sendJson(res, 429, { message: limit.message });
  }

  const { data: existingVote, error: existingVoteError } = await supabase
    .from("cyes_award_votes")
    .select("id")
    .eq("category_id", voter.categoryId)
    .eq("voter_phone", voter.voterPhone)
    .maybeSingle();

  if (existingVoteError) {
    throw existingVoteError;
  }
  if (existingVote) {
    return sendJson(res, 409, {
      message: "This phone number has already voted in this category.",
    });
  }

  const authClient = createAuthClient();
  if (!authClient) {
    return sendJson(res, 500, {
      message: "Phone OTP is not configured for this server.",
    });
  }

  const { error: otpError } = await authClient.auth.signInWithOtp({
    phone: voter.voterPhone,
    options: {
      shouldCreateUser: true,
    },
  });

  if (otpError) {
    return sendJson(res, 400, {
      message:
        otpError.message ||
        "Could not send the OTP. Check that phone authentication is enabled in Supabase.",
    });
  }

  return sendJson(res, 200, {
    message: "OTP sent.",
    phone: voter.voterPhone,
  });
};

const handleCastVote = async (req, res, supabase, body) => {
  const { error, voter } = buildVoterPayload(body);
  if (error) {
    return sendJson(res, 400, { message: error });
  }

  const otp = normalizeText(body.otp || body.token || body.verificationCode);
  if (!otp || otp.length < 4) {
    return sendJson(res, 400, { message: "Enter the OTP sent to your phone." });
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
    key: `vote:${ipAddress}:${voter.voterPhone}`,
    action: "cast_vote",
    maxAttempts: 8,
    windowSeconds: 60 * 60,
  });
  if (!limit.ok) {
    return sendJson(res, 429, { message: limit.message });
  }

  const authClient = createAuthClient();
  if (!authClient) {
    return sendJson(res, 500, {
      message: "Phone OTP is not configured for this server.",
    });
  }

  const { data: verification, error: verificationError } =
    await authClient.auth.verifyOtp({
      phone: voter.voterPhone,
      token: otp,
      type: "sms",
    });

  if (verificationError) {
    return sendJson(res, 401, {
      message: verificationError.message || "OTP verification failed.",
    });
  }

  const verifiedPhone = normalizePhone(verification?.user?.phone);
  if (verifiedPhone && verifiedPhone !== voter.voterPhone) {
    return sendJson(res, 401, {
      message: "The verified phone number does not match this vote.",
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
        voter_email: voter.voterEmail,
        supabase_user_id: verification?.user?.id || null,
        ip_address: ipAddress,
        user_agent: normalizeText(req.headers["user-agent"]),
      },
    ])
    .select(VOTE_COLUMNS)
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return sendJson(res, 409, {
        message: "This phone number has already voted in this category.",
      });
    }

    return sendJson(res, 400, {
      message: insertError.message || "Could not save the vote.",
      error: insertError,
    });
  }

  const voting = await fetchVotingPayload(supabase);
  return sendJson(res, 200, {
    message: "Vote recorded.",
    vote,
    voting,
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

const handleAdminAction = async (req, res, supabase, body) => {
  if (!assertAuthorized(req, res)) {
    return;
  }

  const action = normalizeText(body.action);

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
