import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const DASHBOARD_ACCESS_KEY = process.env.DASHBOARD_ACCESS_KEY || "";
const PANACHE_DOR_PHOTO_BUCKET =
  process.env.PANACHE_DOR_NOMINEE_PHOTO_BUCKET ||
  "panache-dor-nominee-photos";
const PANACHE_DOR_PHOTO_MAX_BYTES = Number.parseInt(
  process.env.PANACHE_DOR_NOMINEE_PHOTO_MAX_BYTES || String(3 * 1024 * 1024),
  10
);
const PANACHE_DOR_AYATI_API_URL =
  process.env.PANACHE_DOR_AYATI_API_URL || "";
const PANACHE_DOR_AYATI_API_KEY =
  process.env.PANACHE_DOR_AYATI_API_KEY || "";
const PANACHE_DOR_AYATI_EVENT_ID =
  process.env.PANACHE_DOR_AYATI_EVENT_ID || "";
const PANACHE_DOR_AYATI_LEADERBOARD_URL =
  process.env.PANACHE_DOR_AYATI_LEADERBOARD_URL || "";

const CATEGORY_COLUMNS =
  "id, slug, name, description, status, sort_order, created_at, updated_at";
const NOMINEE_COLUMNS =
  "id, category_id, slug, name, organization, bio, photo_url, status, sort_order, ayati_vote_url, ayati_sync_id, ayati_vote_count, ayati_last_synced_at, created_at, updated_at";

const allowedStatuses = new Set(["active", "draft", "archived"]);
const allowedPhotoTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ayatiSyncConfigured = Boolean(
  PANACHE_DOR_AYATI_API_URL || PANACHE_DOR_AYATI_LEADERBOARD_URL
);

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

const setPublicCacheHeaders = (res) => {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=30, stale-while-revalidate=120"
  );
};

const normalizeText = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  const normalized = String(value).trim();
  return normalized || null;
};

const normalizeStatus = (value, fallback = "active") => {
  const status = normalizeText(value) || fallback;
  return allowedStatuses.has(status) ? status : fallback;
};

const normalizeInteger = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeUrl = (value) => {
  const url = normalizeText(value);
  if (!url) {
    return null;
  }

  try {
    return new URL(url).toString();
  } catch {
    return null;
  }
};

const slugify = (value) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || crypto.randomUUID();

const isDashboardRequest = (req) => {
  const key =
    req.headers["x-dashboard-key"] ||
    req.headers["x-dashboard-access-key"] ||
    req.query?.access_key;

  return Boolean(DASHBOARD_ACCESS_KEY && key === DASHBOARD_ACCESS_KEY);
};

const getSupabase = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service credentials are not configured.");
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
    },
  });
};

const assertAdmin = (req) => {
  if (!isDashboardRequest(req)) {
    const error = new Error("Invalid dashboard access code.");
    error.statusCode = 401;
    throw error;
  }
};

const sanitizeCategory = (category = {}) => {
  const name = normalizeText(category.name);
  if (!name) {
    throw new Error("Category name is required.");
  }

  return {
    name,
    slug: slugify(category.slug || name),
    description: normalizeText(category.description),
    status: normalizeStatus(category.status),
    sort_order: normalizeInteger(category.sort_order),
  };
};

const sanitizeNominee = (nominee = {}, fallback = {}) => {
  const name = normalizeText(nominee.name ?? fallback.name);
  const categoryId = normalizeText(nominee.category_id ?? fallback.category_id);
  const status = normalizeStatus(nominee.status ?? fallback.status);
  const ayatiVoteUrl = normalizeUrl(
    nominee.ayati_vote_url ?? fallback.ayati_vote_url
  );

  if (!name) {
    throw new Error("Nominee name is required.");
  }
  if (!categoryId) {
    throw new Error("Nominee category is required.");
  }

  return {
    category_id: categoryId,
    name,
    slug: slugify(nominee.slug || fallback.slug || name),
    organization: normalizeText(nominee.organization ?? fallback.organization),
    bio: normalizeText(nominee.bio ?? fallback.bio),
    photo_url: normalizeText(nominee.photo_url ?? fallback.photo_url),
    status,
    sort_order: normalizeInteger(nominee.sort_order ?? fallback.sort_order),
    ayati_vote_url: ayatiVoteUrl,
    ayati_sync_id: normalizeText(
      nominee.ayati_sync_id ?? fallback.ayati_sync_id
    ),
  };
};

const withUpdatedAt = (payload) => ({
  ...payload,
  updated_at: new Date().toISOString(),
});

const collectAyatiLastSyncedAt = (nominees) => {
  const timestamps = nominees
    .map((nominee) => nominee.ayati_last_synced_at)
    .filter(Boolean)
    .sort();

  return timestamps[timestamps.length - 1] || null;
};

const buildVotingPayload = (categories, nominees, includeDrafts = false) => {
  const nomineesByCategory = nominees.reduce((accumulator, nominee) => {
    if (!accumulator[nominee.category_id]) {
      accumulator[nominee.category_id] = [];
    }
    accumulator[nominee.category_id].push(nominee);
    return accumulator;
  }, {});
  const lastSyncedAt = collectAyatiLastSyncedAt(nominees);
  const countsAvailable = Boolean(ayatiSyncConfigured && lastSyncedAt);

  return {
    categories: categories.map((category) => ({
      ...category,
      nominees: nomineesByCategory[category.id] || [],
    })),
    total_nominees: nominees.length,
    counts_available: countsAvailable,
    ayati_sync_configured: ayatiSyncConfigured,
    ayati_leaderboard_url: PANACHE_DOR_AYATI_LEADERBOARD_URL || null,
    last_synced_at: lastSyncedAt,
    admin: includeDrafts,
  };
};

const fetchVotingPayload = async (supabase, includeDrafts = false) => {
  let categoryQuery = supabase
    .from("panache_dor_award_categories")
    .select(CATEGORY_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (!includeDrafts) {
    categoryQuery = categoryQuery.eq("status", "active");
  }

  const { data: categories = [], error: categoriesError } = await categoryQuery;
  if (categoriesError) {
    throw categoriesError;
  }

  let nomineeQuery = supabase
    .from("panache_dor_award_nominees")
    .select(NOMINEE_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (!includeDrafts) {
    nomineeQuery = nomineeQuery.eq("status", "active");
  }

  const { data: rawNominees = [], error: nomineesError } = await nomineeQuery;
  if (nomineesError) {
    throw nomineesError;
  }

  const categoryIds = new Set(categories.map((category) => category.id));
  const nominees = rawNominees.filter((nominee) =>
    categoryIds.has(nominee.category_id)
  );

  return buildVotingPayload(categories, nominees, includeDrafts);
};

const mutateAndReturnVoting = async (supabase, mutation) => {
  const result = await mutation();
  const voting = await fetchVotingPayload(supabase, true);
  return {
    ...result,
    voting,
  };
};

const decodeUpload = ({ fileName, contentType, base64 }) => {
  const fileType = normalizeText(contentType);
  if (!fileName || !fileType || !allowedPhotoTypes.has(fileType)) {
    throw new Error("Upload a JPG, PNG, WEBP, or GIF image.");
  }

  const buffer = Buffer.from(String(base64 || ""), "base64");
  if (!buffer.length) {
    throw new Error("Image upload is empty.");
  }
  if (buffer.length > PANACHE_DOR_PHOTO_MAX_BYTES) {
    throw new Error("Nominee photo must be under 3 MB.");
  }

  const extension =
    fileType === "image/png"
      ? "png"
      : fileType === "image/webp"
      ? "webp"
      : fileType === "image/gif"
      ? "gif"
      : "jpg";

  return {
    buffer,
    contentType: fileType,
    path: `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${slugify(
      fileName
    )}.${extension}`,
  };
};

const parseCsvRows = (csvText) => {
  const rows = [];
  let row = [];
  let field = "";
  let insideQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index];
    const nextCharacter = csvText[index + 1];

    if (character === '"' && insideQuotes && nextCharacter === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (character === "," && !insideQuotes) {
      row.push(field.trim());
      field = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      row.push(field.trim());
      if (row.some((value) => value)) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += character;
  }

  row.push(field.trim());
  if (row.some((value) => value)) {
    rows.push(row);
  }

  return rows;
};

const normalizeCsvHeader = (value) =>
  slugify(value).replace(/-/g, "_").replace(/^nominee$/, "name");

const rowsToObjects = (csvText) => {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) {
    throw new Error("CSV needs a header row and at least one nominee row.");
  }

  const headers = rows[0].map(normalizeCsvHeader);
  return rows.slice(1).map((row) =>
    headers.reduce((object, header, index) => {
      object[header] = row[index] || "";
      return object;
    }, {})
  );
};

const findOrUpsertCategory = async (supabase, categoryCache, row) => {
  const categoryName =
    normalizeText(row.category) ||
    normalizeText(row.category_name) ||
    normalizeText(row.award_category);
  if (!categoryName) {
    throw new Error("Each CSV row needs a category.");
  }

  const categorySlug = slugify(row.category_slug || categoryName);
  const cachedCategory = categoryCache.get(categorySlug);
  if (cachedCategory) {
    return cachedCategory;
  }

  const payload = {
    slug: categorySlug,
    name: categoryName,
    description: normalizeText(row.category_description),
    status: normalizeStatus(row.category_status),
    sort_order: normalizeInteger(row.category_sort_order),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("panache_dor_award_categories")
    .upsert(payload, { onConflict: "slug" })
    .select(CATEGORY_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  categoryCache.set(categorySlug, data);
  return data;
};

const importCsv = async (supabase, csvText) => {
  const rows = rowsToObjects(csvText);
  const { data: existingCategories = [], error: categoriesError } = await supabase
    .from("panache_dor_award_categories")
    .select(CATEGORY_COLUMNS);

  if (categoriesError) {
    throw categoriesError;
  }

  const categoryCache = new Map(
    existingCategories.map((category) => [category.slug, category])
  );
  const errors = [];
  let imported = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const rowNumber = index + 2;

    try {
      const category = await findOrUpsertCategory(supabase, categoryCache, row);
      const name =
        normalizeText(row.name) ||
        normalizeText(row.nominee_name) ||
        normalizeText(row.nominee);
      if (!name) {
        throw new Error("Nominee name is required.");
      }

      const ayatiVoteUrl = normalizeUrl(row.ayati_vote_url || row.ayati_link);
      const status = normalizeStatus(row.status, "active");

      const payload = {
        category_id: category.id,
        slug: slugify(row.slug || name),
        name,
        organization: normalizeText(row.organization || row.business),
        bio: normalizeText(row.bio),
        photo_url: normalizeText(row.photo_url || row.image_url),
        status,
        sort_order: normalizeInteger(row.sort_order),
        ayati_vote_url: ayatiVoteUrl,
        ayati_sync_id: normalizeText(row.ayati_sync_id || row.ayati_id),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("panache_dor_award_nominees")
        .upsert(payload, { onConflict: "slug" });

      if (error) {
        throw error;
      }

      imported += 1;
    } catch (error) {
      errors.push({
        row: rowNumber,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    imported,
    failed: errors.length,
    errors,
  };
};

const extractAyatiRows = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const candidates = [
    payload.data,
    payload.items,
    payload.nominees,
    payload.leaderboard,
    payload.results,
    payload.votes,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

const extractAyatiId = (row) =>
  normalizeText(
    row.ayati_sync_id ||
      row.sync_id ||
      row.nominee_id ||
      row.nomineeId ||
      row.id ||
      row.slug
  );

const extractAyatiCount = (row) => {
  const value =
    row.vote_count ??
    row.votes ??
    row.total_votes ??
    row.paid_votes ??
    row.count;
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const fetchAyatiLeaderboard = async () => {
  const url = PANACHE_DOR_AYATI_API_URL || PANACHE_DOR_AYATI_LEADERBOARD_URL;
  if (!url) {
    throw new Error("Ayati count sync is not configured.");
  }

  const requestUrl = new URL(url);
  if (PANACHE_DOR_AYATI_EVENT_ID && !requestUrl.searchParams.has("event_id")) {
    requestUrl.searchParams.set("event_id", PANACHE_DOR_AYATI_EVENT_ID);
  }

  const headers = {
    Accept: "application/json",
  };
  if (PANACHE_DOR_AYATI_API_KEY) {
    headers.Authorization = `Bearer ${PANACHE_DOR_AYATI_API_KEY}`;
  }

  const response = await fetch(requestUrl, { headers });
  const text = await response.text();
  let payload = null;

  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error("Ayati leaderboard did not return JSON data.");
  }

  if (!response.ok) {
    throw new Error(
      payload?.message ||
        `Ayati sync failed (${response.status} ${response.statusText}).`
    );
  }

  return extractAyatiRows(payload);
};

const syncAyatiCounts = async (supabase) => {
  if (!ayatiSyncConfigured) {
    return {
      configured: false,
      synced: 0,
      skipped: 0,
      message:
        "Ayati count sync is not configured. Add PANACHE_DOR_AYATI_API_URL or PANACHE_DOR_AYATI_LEADERBOARD_URL first.",
    };
  }

  const rows = await fetchAyatiLeaderboard();
  const updates = rows
    .map((row) => ({
      ayati_sync_id: extractAyatiId(row),
      ayati_vote_count: extractAyatiCount(row),
    }))
    .filter((row) => row.ayati_sync_id && row.ayati_vote_count !== null);
  const syncedAt = new Date().toISOString();
  let synced = 0;

  for (const update of updates) {
    const { data, error } = await supabase
      .from("panache_dor_award_nominees")
      .update({
        ayati_vote_count: update.ayati_vote_count,
        ayati_last_synced_at: syncedAt,
        updated_at: syncedAt,
      })
      .eq("ayati_sync_id", update.ayati_sync_id)
      .select("id");

    if (error) {
      throw error;
    }

    synced += data?.length || 0;
  }

  return {
    configured: true,
    synced,
    skipped: Math.max(0, rows.length - updates.length),
    source_rows: rows.length,
    synced_at: syncedAt,
    message: `${synced} nominee count${synced === 1 ? "" : "s"} synced from Ayati.`,
  };
};

const handleGet = async (req, res, supabase) => {
  const includeDrafts = isDashboardRequest(req);
  const voting = await fetchVotingPayload(supabase, includeDrafts);

  if (!includeDrafts) {
    setPublicCacheHeaders(res);
  }

  sendJson(res, 200, { voting });
};

const handlePost = async (req, res, supabase) => {
  assertAdmin(req);
  const body = parseBody(req);
  const action = normalizeText(body.action);

  if (action === "createCategory") {
    const category = sanitizeCategory(body.category);
    const result = await mutateAndReturnVoting(supabase, async () => {
      const { data, error } = await supabase
        .from("panache_dor_award_categories")
        .insert(category)
        .select(CATEGORY_COLUMNS)
        .single();
      if (error) {
        throw error;
      }
      return { category: data };
    });
    sendJson(res, 200, result);
    return;
  }

  if (action === "updateCategory") {
    const id = normalizeText(body.id);
    if (!id) {
      throw new Error("Category id is required.");
    }

    const updates = sanitizeCategory(body.updates);
    const result = await mutateAndReturnVoting(supabase, async () => {
      const { data, error } = await supabase
        .from("panache_dor_award_categories")
        .update(withUpdatedAt(updates))
        .eq("id", id)
        .select(CATEGORY_COLUMNS)
        .single();
      if (error) {
        throw error;
      }
      return { category: data };
    });
    sendJson(res, 200, result);
    return;
  }

  if (action === "deleteCategory") {
    const id = normalizeText(body.id);
    if (!id) {
      throw new Error("Category id is required.");
    }

    const result = await mutateAndReturnVoting(supabase, async () => {
      const { error } = await supabase
        .from("panache_dor_award_categories")
        .delete()
        .eq("id", id);
      if (error) {
        throw error;
      }
      return {};
    });
    sendJson(res, 200, result);
    return;
  }

  if (action === "createNominee") {
    const nominee = sanitizeNominee(body.nominee);
    const result = await mutateAndReturnVoting(supabase, async () => {
      const { data, error } = await supabase
        .from("panache_dor_award_nominees")
        .insert(nominee)
        .select(NOMINEE_COLUMNS)
        .single();
      if (error) {
        throw error;
      }
      return { nominee: data };
    });
    sendJson(res, 200, result);
    return;
  }

  if (action === "updateNominee") {
    const id = normalizeText(body.id);
    if (!id) {
      throw new Error("Nominee id is required.");
    }

    const updates = sanitizeNominee(body.updates);
    const result = await mutateAndReturnVoting(supabase, async () => {
      const { data, error } = await supabase
        .from("panache_dor_award_nominees")
        .update(withUpdatedAt(updates))
        .eq("id", id)
        .select(NOMINEE_COLUMNS)
        .single();
      if (error) {
        throw error;
      }
      return { nominee: data };
    });
    sendJson(res, 200, result);
    return;
  }

  if (action === "deleteNominee") {
    const id = normalizeText(body.id);
    if (!id) {
      throw new Error("Nominee id is required.");
    }

    const result = await mutateAndReturnVoting(supabase, async () => {
      const { error } = await supabase
        .from("panache_dor_award_nominees")
        .delete()
        .eq("id", id);
      if (error) {
        throw error;
      }
      return {};
    });
    sendJson(res, 200, result);
    return;
  }

  if (action === "uploadNomineePhoto") {
    const upload = decodeUpload(body);
    const { error } = await supabase.storage
      .from(PANACHE_DOR_PHOTO_BUCKET)
      .upload(upload.path, upload.buffer, {
        contentType: upload.contentType,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from(PANACHE_DOR_PHOTO_BUCKET)
      .getPublicUrl(upload.path);

    sendJson(res, 200, {
      photoUrl: data.publicUrl,
      photo_url: data.publicUrl,
      path: upload.path,
    });
    return;
  }

  if (action === "importNomineesCsv") {
    const csv = normalizeText(body.csv || body.csvText);
    if (!csv) {
      throw new Error("CSV content is required.");
    }

    const importSummary = await importCsv(supabase, csv);
    const voting = await fetchVotingPayload(supabase, true);
    sendJson(res, 200, { importSummary, voting });
    return;
  }

  if (action === "syncAyatiCounts") {
    const syncSummary = await syncAyatiCounts(supabase);
    const voting = await fetchVotingPayload(supabase, true);
    sendJson(res, 200, { syncSummary, voting });
    return;
  }

  sendJson(res, 400, { message: "Unsupported Panache D'or voting action." });
};

export default async function handler(req, res) {
  try {
    const supabase = getSupabase();

    if (req.method === "GET") {
      await handleGet(req, res, supabase);
      return;
    }

    if (req.method === "POST") {
      await handlePost(req, res, supabase);
      return;
    }

    sendJson(res, 405, { message: "Method not allowed." });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    console.error("Panache D'or voting API error", {
      message: error.message,
      details: error.details || error.stack,
      hint: error.hint || "",
      code: error.code || "",
    });
    sendJson(res, statusCode, {
      message:
        error.message ||
        "Could not process the Panache D'or voting request.",
      details: error.details || "",
      hint: error.hint || "",
      code: error.code || "",
    });
  }
}
