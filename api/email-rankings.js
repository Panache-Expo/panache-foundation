import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const DASHBOARD_ACCESS_KEY = process.env.DASHBOARD_ACCESS_KEY || "";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || "true").toLowerCase() !== "false";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || "";
const RANKINGS_REPORT_EMAIL =
  process.env.RANKINGS_REPORT_EMAIL ||
  process.env.PANACHE_RANKINGS_REPORT_EMAIL ||
  process.env.ADMIN_REPORT_EMAIL ||
  SMTP_USER ||
  "glenmue2020@gmail.com";

const WAT_TIME_ZONE = "Africa/Douala";

const REPORTS = [
  {
    label: "Panache 360",
    categoryTable: "panache_360_award_categories",
    nomineeTable: "panache_360_award_nominees",
    countTable: "panache_360_nominee_vote_counts",
    overallLimit: 10,
    categoryLimit: 3,
  },
  {
    label: "Panache D'or",
    categoryTable: "panache_dor_award_categories",
    nomineeTable: "panache_dor_award_nominees",
    countTable: "panache_dor_nominee_vote_counts",
    overallLimit: 10,
    categoryLimit: 3,
  },
  {
    label: "Miss Panache",
    categoryTable: "miss_panache_award_categories",
    nomineeTable: "miss_panache_award_nominees",
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

const getDashboardKeyFromRequest = (req) =>
  req.headers["x-dashboard-key"] ||
  req.headers["x-dashboard-access-key"] ||
  req.headers["X-Dashboard-Key"] ||
  req.query?.access_key;

const isAuthorized = (req) =>
  Boolean(DASHBOARD_ACCESS_KEY && getDashboardKeyFromRequest(req) === DASHBOARD_ACCESS_KEY);

const createAdminClient = () =>
  createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const normalizeInteger = (value) => {
  const parsed = Number.parseInt(String(value ?? 0), 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatNumber = (value) => normalizeInteger(value).toLocaleString("en-US");

const formatWatDateTime = (value = new Date()) => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: WAT_TIME_ZONE,
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${formatter.format(value).replace(",", "") } WAT`;
};

const sortByRank = (left, right) =>
  right.votes - left.votes ||
  left.nominee.sort_order - right.nominee.sort_order ||
  left.nominee.name.localeCompare(right.nominee.name);

const fetchRankingData = async (supabase, config) => {
  const [categoryResult, nomineeResult, countResult] = await Promise.all([
    supabase
      .from(config.categoryTable)
      .select("id,name,status,sort_order")
      .eq("status", "active")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from(config.nomineeTable)
      .select("id,category_id,name,status,sort_order")
      .eq("status", "active"),
    supabase.from(config.countTable).select("nominee_id,total_votes"),
  ]);

  if (categoryResult.error) {
    throw categoryResult.error;
  }
  if (nomineeResult.error) {
    throw nomineeResult.error;
  }
  if (countResult.error) {
    throw countResult.error;
  }

  const categories = categoryResult.data || [];
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const votesByNomineeId = new Map(
    (countResult.data || []).map((row) => [row.nominee_id, normalizeInteger(row.total_votes)])
  );

  const rankedNominees = (nomineeResult.data || [])
    .filter((nominee) => categoriesById.has(nominee.category_id))
    .map((nominee) => ({
      nominee,
      category: categoriesById.get(nominee.category_id),
      votes: votesByNomineeId.get(nominee.id) || 0,
    }))
    .sort(sortByRank);

  const overall = rankedNominees.slice(0, config.overallLimit);
  const categoryRankings = categories
    .map((category) => ({
      category,
      nominees: rankedNominees
        .filter((entry) => entry.category.id === category.id)
        .sort(sortByRank)
        .slice(0, config.categoryLimit),
    }))
    .filter((entry) => entry.nominees.length > 0);

  return {
    ...config,
    overall,
    categoryRankings,
    totalVotes: rankedNominees.reduce((sum, entry) => sum + entry.votes, 0),
    totalNominees: rankedNominees.length,
  };
};

const renderTable = (rows, { includeVotes }) => {
  const header = includeVotes
    ? "<tr><th>Rank</th><th>Name</th><th>Category</th><th>Votes</th></tr>"
    : "<tr><th>Rank</th><th>Name</th><th>Category</th></tr>";

  const body = rows
    .map((entry, index) => {
      const cells = [
        `<td>#${index + 1}</td>`,
        `<td><strong>${escapeHtml(entry.nominee.name)}</strong></td>`,
        `<td>${escapeHtml(entry.category.name)}</td>`,
      ];
      if (includeVotes) {
        cells.push(`<td>${formatNumber(entry.votes)}</td>`);
      }
      return `<tr>${cells.join("")}</tr>`;
    })
    .join("");

  return `<table>${header}${body}</table>`;
};

const renderCategoryTable = (rows, { includeVotes }) => {
  const header = includeVotes
    ? "<tr><th>Rank</th><th>Name</th><th>Votes</th></tr>"
    : "<tr><th>Rank</th><th>Name</th></tr>";

  const body = rows
    .map((entry, index) => {
      const cells = [
        `<td>#${index + 1}</td>`,
        `<td><strong>${escapeHtml(entry.nominee.name)}</strong></td>`,
      ];
      if (includeVotes) {
        cells.push(`<td>${formatNumber(entry.votes)}</td>`);
      }
      return `<tr>${cells.join("")}</tr>`;
    })
    .join("");

  return `<table>${header}${body}</table>`;
};

const renderReportSection = (report, { includeVotes }) => {
  const blocks = [
    `<h2>${escapeHtml(report.label)} ${includeVotes ? "with vote count" : "without vote count"}</h2>`,
    `<p>${report.totalNominees} nominees · ${includeVotes ? `${formatNumber(report.totalVotes)} votes` : "vote counts hidden"}</p>`,
    `<h3>Overall top ${report.overall.length}</h3>`,
    renderTable(report.overall, { includeVotes }),
  ];

  for (const categoryRanking of report.categoryRankings) {
    blocks.push(`<h3>${escapeHtml(categoryRanking.category.name)}</h3>`);
    blocks.push(renderCategoryTable(categoryRanking.nominees, { includeVotes }));
  }

  return blocks.join("\n");
};

const renderPlainTextReport = (report, { includeVotes }) => {
  const lines = [
    `${report.label} ${includeVotes ? "with vote count" : "without vote count"}`,
    `Overall top ${report.overall.length}`,
  ];

  for (const [index, entry] of report.overall.entries()) {
    lines.push(
      includeVotes
        ? `${index + 1}. ${entry.nominee.name} — ${entry.category.name} — ${formatNumber(entry.votes)}`
        : `${index + 1}. ${entry.nominee.name} — ${entry.category.name}`
    );
  }

  for (const categoryRanking of report.categoryRankings) {
    lines.push("", categoryRanking.category.name);
    for (const [index, entry] of categoryRanking.nominees.entries()) {
      lines.push(
        includeVotes
          ? `${index + 1}. ${entry.nominee.name} — ${formatNumber(entry.votes)}`
          : `${index + 1}. ${entry.nominee.name}`
      );
    }
  }

  return lines.join("\n");
};

const buildEmail = (reports, checkedAt) => {
  const htmlSections = reports
    .flatMap((report) => [
      renderReportSection(report, { includeVotes: true }),
      renderReportSection(report, { includeVotes: false }),
    ])
    .join("<hr />");

  const textSections = reports
    .flatMap((report) => [
      renderPlainTextReport(report, { includeVotes: true }),
      "",
      renderPlainTextReport(report, { includeVotes: false }),
    ])
    .join("\n\n---\n\n");

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #171411; background: #f6f4f7; padding: 24px; }
          .card { background: #ffffff; border: 1px solid #ded8e6; border-radius: 18px; padding: 22px; max-width: 980px; margin: 0 auto; }
          h1 { margin: 0 0 8px; color: #43145a; }
          h2 { color: #43145a; margin-top: 28px; }
          h3 { margin-top: 20px; color: #171411; }
          p { color: #5f5866; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0 18px; background: #ffffff; }
          th { background: #43145a; color: #ffffff; text-align: left; padding: 9px; font-size: 13px; }
          td { border: 1px solid #ded8e6; padding: 9px; font-size: 13px; }
          tr:nth-child(even) td { background: #f4f1f7; }
          hr { border: none; border-top: 1px solid #ded8e6; margin: 30px 0; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Panache voting rankings report</h1>
          <p>Generated: ${escapeHtml(checkedAt)}</p>
          <p>This email contains both versions: <strong>with vote counts</strong> and <strong>without vote counts</strong>.</p>
          ${htmlSections}
        </div>
      </body>
    </html>`;

  const text = [
    "Panache voting rankings report",
    `Generated: ${checkedAt}`,
    "Contains both with-vote and voteless rankings.",
    "",
    textSections,
  ].join("\n");

  return { html, text };
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    throw new Error("SMTP credentials are not configured.");
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
    to,
    subject,
    html,
    text,
  });
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { message: "Method not allowed." });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !DASHBOARD_ACCESS_KEY) {
    return sendJson(res, 500, {
      message: "Rankings email server environment variables are incomplete.",
    });
  }

  if (!isAuthorized(req)) {
    return sendJson(res, 401, { message: "Invalid dashboard access code." });
  }

  try {
    const supabase = createAdminClient();
    const checkedAt = formatWatDateTime();
    const reports = [];
    const skipped = [];

    for (const config of REPORTS) {
      try {
        reports.push(await fetchRankingData(supabase, config));
      } catch (error) {
        console.error(`Could not build ${config.label} rankings`, error);
        skipped.push({ label: config.label, message: error?.message || "Could not load rankings." });
      }
    }

    if (!reports.length) {
      return sendJson(res, 500, { message: "No rankings could be loaded." });
    }

    const { html, text } = buildEmail(reports, checkedAt);
    await sendEmail({
      to: RANKINGS_REPORT_EMAIL,
      subject: `Panache voting rankings report - ${checkedAt}`,
      html,
      text,
    });

    return sendJson(res, 200, {
      message: "Rankings email sent.",
      recipient: RANKINGS_REPORT_EMAIL,
      generated_at: checkedAt,
      reports: reports.map((report) => report.label),
      skipped,
    });
  } catch (error) {
    console.error("Failed to email rankings report", error);
    return sendJson(res, 500, {
      message: error?.message || "Could not email rankings report.",
    });
  }
}
