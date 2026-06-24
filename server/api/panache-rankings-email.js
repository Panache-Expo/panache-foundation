import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const DASHBOARD_ACCESS_KEY =
  process.env.DASHBOARD_ACCESS_KEY || process.env.PANACHE_DASHBOARD_ACCESS_KEY || "";
const RANKINGS_REPORT_EMAIL =
  process.env.PANACHE_RANKINGS_REPORT_EMAIL ||
  process.env.PANACHE_ADMIN_EMAIL ||
  "glenmue2020@gmail.com";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE =
  String(process.env.SMTP_SECURE || "true").toLowerCase() !== "false";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || "";

const sources = [
  {
    label: "Panache D'or",
    nomineeTable: "panache_dor_award_nominees",
    categoryTable: "panache_dor_award_categories",
    countTable: "panache_dor_nominee_vote_counts",
    overallLimit: 10,
    categoryLimit: 3,
  },
  {
    label: "Panache 360",
    nomineeTable: "panache_360_award_nominees",
    categoryTable: "panache_360_award_categories",
    countTable: "panache_360_nominee_vote_counts",
    overallLimit: 10,
    categoryLimit: 3,
  },
  {
    label: "Miss Panache",
    nomineeTable: "miss_panache_award_nominees",
    categoryTable: "miss_panache_award_categories",
    countTable: "miss_panache_nominee_vote_counts",
    overallLimit: 10,
    categoryLimit: 3,
  },
];

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
};

const normalizeText = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    Number(value || 0)
  );

const getAccessKey = (req) =>
  normalizeText(
    req.headers["x-dashboard-key"] ||
      req.headers["x-dashboard-access-key"] ||
      req.query?.access_key
  );

const assertAdmin = (req) => {
  if (!DASHBOARD_ACCESS_KEY || getAccessKey(req) !== DASHBOARD_ACCESS_KEY) {
    const error = new Error("Invalid dashboard access code.");
    error.statusCode = 401;
    throw error;
  }
};

const getSupabase = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service credentials are not configured.");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-client-info": "panache-rankings-email-api" } },
  });
};

const getMailer = () => {
  if (!SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    throw new Error("SMTP email credentials are not configured.");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const escapeHtml = (value) =>
  normalizeText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const fetchSourceRankings = async (supabase, source) => {
  const [nomineesResult, countsResult] = await Promise.all([
    supabase
      .from(source.nomineeTable)
      .select(`id, name, slug, status, category:${source.categoryTable}(name, slug, status)`)
      .eq("status", "active"),
    supabase.from(source.countTable).select("nominee_id, total_votes"),
  ]);

  if (nomineesResult.error) throw nomineesResult.error;
  if (countsResult.error) throw countsResult.error;

  const voteCountByNominee = new Map(
    (countsResult.data || []).map((row) => [row.nominee_id, Number(row.total_votes || 0)])
  );

  const rows = (nomineesResult.data || [])
    .filter((nominee) => !nominee.category?.status || nominee.category.status === "active")
    .map((nominee) => ({
      id: nominee.id,
      name: nominee.name || "Unnamed nominee",
      slug: nominee.slug || "",
      category: nominee.category?.name || "Uncategorized",
      votes: voteCountByNominee.get(nominee.id) || 0,
    }));

  const sortRows = (items) =>
    [...items].sort(
      (left, right) =>
        right.votes - left.votes || left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
    );

  const overall = sortRows(rows).slice(0, source.overallLimit);
  const byCategory = new Map();

  for (const row of rows) {
    if (!byCategory.has(row.category)) byCategory.set(row.category, []);
    byCategory.get(row.category).push(row);
  }

  const categories = Array.from(byCategory.entries())
    .sort(([left], [right]) => left.localeCompare(right, undefined, { sensitivity: "base" }))
    .map(([category, items]) => ({
      category,
      rows: sortRows(items).slice(0, source.categoryLimit),
    }));

  return {
    label: source.label,
    overall,
    categories,
  };
};

const buildTable = (rows, { includeVotes, includeCategory }) => {
  const headers = ["Rank", "Nominee"];
  if (includeCategory) headers.push("Category");
  if (includeVotes) headers.push("Votes");

  const headerHtml = headers
    .map((header) => `<th>${escapeHtml(header)}</th>`)
    .join("");
  const bodyHtml = rows
    .map((row, index) => {
      const cells = [`#${index + 1}`, row.name];
      if (includeCategory) cells.push(row.category);
      if (includeVotes) cells.push(formatNumber(row.votes));
      return `<tr>${cells.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`;
    })
    .join("");

  return `<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
};

const buildRankingsSection = (rankings, includeVotes) =>
  rankings
    .map((source) => {
      const categoriesHtml = source.categories
        .map(
          (category) => `
            <h4>${escapeHtml(category.category)}</h4>
            ${buildTable(category.rows, { includeVotes, includeCategory: false })}
          `
        )
        .join("");

      return `
        <section class="source-section">
          <h3>${escapeHtml(source.label)} overall top 10</h3>
          ${buildTable(source.overall, { includeVotes, includeCategory: true })}
          <h3>${escapeHtml(source.label)} top 3 per category</h3>
          ${categoriesHtml}
        </section>
      `;
    })
    .join("");

const buildEmailHtml = (rankings) => {
  const generatedAt = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Douala",
  }).format(new Date());

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #171411; line-height: 1.45; }
          h1 { color: #43145a; }
          h2 { margin-top: 28px; color: #43145a; border-bottom: 2px solid #43145a; padding-bottom: 6px; }
          h3 { margin-top: 20px; color: #2A1730; }
          h4 { margin: 16px 0 6px; color: #171411; }
          table { border-collapse: collapse; width: 100%; margin: 8px 0 14px; font-size: 14px; }
          th { background: #43145a; color: #ffffff; text-align: left; }
          th, td { border: 1px solid #d6d0dc; padding: 8px 10px; }
          tr:nth-child(even) td { background: #f5f3f6; }
          .muted { color: #666666; }
          .source-section { margin-bottom: 26px; }
        </style>
      </head>
      <body>
        <h1>Panache rankings report</h1>
        <p class="muted">Generated ${escapeHtml(generatedAt)} WAT.</p>
        <h2>Rankings with vote counts</h2>
        ${buildRankingsSection(rankings, true)}
        <h2>Blind rankings without vote counts</h2>
        ${buildRankingsSection(rankings, false)}
      </body>
    </html>
  `;
};

const buildTextSummary = (rankings) => {
  const lines = ["Panache rankings report", "", "WITH VOTES"];
  for (const source of rankings) {
    lines.push("", `${source.label} overall top 10`);
    source.overall.forEach((row, index) => {
      lines.push(`${index + 1}. ${row.name} - ${row.category} - ${formatNumber(row.votes)} votes`);
    });
  }
  lines.push("", "BLIND VERSION WITHOUT VOTES");
  for (const source of rankings) {
    lines.push("", `${source.label} overall top 10`);
    source.overall.forEach((row, index) => {
      lines.push(`${index + 1}. ${row.name} - ${row.category}`);
    });
  }
  return lines.join("\n");
};

export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      sendJson(res, 204, {});
      return;
    }
    if (req.method !== "POST") {
      sendJson(res, 405, { message: "Method not allowed." });
      return;
    }

    assertAdmin(req);
    const supabase = getSupabase();
    const rankings = await Promise.all(
      sources.map((source) => fetchSourceRankings(supabase, source))
    );
    const mailer = getMailer();
    const subject = `Panache rankings report - ${new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Africa/Douala",
    }).format(new Date())}`;

    await mailer.sendMail({
      from: SMTP_FROM,
      to: RANKINGS_REPORT_EMAIL,
      subject,
      html: buildEmailHtml(rankings),
      text: buildTextSummary(rankings),
    });

    sendJson(res, 200, {
      ok: true,
      message: `Rankings email sent to ${RANKINGS_REPORT_EMAIL}.`,
      recipient: RANKINGS_REPORT_EMAIL,
    });
  } catch (error) {
    sendJson(res, error.statusCode || 500, {
      ok: false,
      message: error.message || "Could not email rankings.",
      details: error.details || "",
      code: error.code || "",
    });
  }
}
