import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE =
  String(process.env.SMTP_SECURE || "true").toLowerCase() !== "false";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || "";
const REGISTRATION_SUPPORT_EMAIL =
  process.env.REGISTRATION_SUPPORT_EMAIL || SMTP_USER || "";
const PARTICIPANTS_DASHBOARD_PATH =
  process.env.PARTICIPANTS_DASHBOARD_PATH || "/panache-expo/participants-dashboard";

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
    return "";
  }
  return String(value).trim();
};

const normalizeBoolean = (value) => {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === "boolean") {
    return value;
  }
  return String(value).toLowerCase() === "true";
};

const normalizeAdminEmails = (value) => {
  if (value === undefined || value === null) {
    return [];
  }
  if (Array.isArray(value)) {
    return value
      .map((email) => normalizeText(email))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((email) => normalizeText(email))
      .filter(Boolean);
  }
  return [];
};

const resolveDashboardUrl = (req, dashboardUrlFromBody) => {
  if (dashboardUrlFromBody) {
    return dashboardUrlFromBody;
  }

  const host = normalizeText(req.headers.host);
  if (!host) {
    return `https://panache-expo.com${PARTICIPANTS_DASHBOARD_PATH}`;
  }

  const protocol =
    normalizeText(req.headers["x-forwarded-proto"]).includes("https")
      ? "https"
      : "http";
  return `${protocol}://${host}${PARTICIPANTS_DASHBOARD_PATH}`;
};

const buildApplicantText = ({
  applicantFirstName,
  competitionTitle,
  applicationCode,
  category,
  actionHref,
  actionLabel,
  isFree,
}) => `
Hello ${applicantFirstName || "there"},

Your application for ${competitionTitle} has been received successfully.

Application code: ${applicationCode}
${category ? `Category: ${category}` : ""}

${isFree ? "Continue in WhatsApp" : actionLabel}: ${actionHref}

${isFree ? "Please continue in the WhatsApp group and one of our team members will assist you from here." : "Once your payment is confirmed, your status will be updated."}
`.trim();

const buildAdminText = ({
  applicantFirstName,
  competitionTitle,
  competitionSlug,
  applicationCode,
  category,
  email,
  phone,
  city,
  country,
  dashboardUrl,
  submittedAt,
}) => `
A new registration has been submitted.

Application code: ${applicationCode}
Competition: ${competitionTitle} (${competitionSlug || "N/A"})
Applicant: ${applicantFirstName || "N/A"}
Email: ${email || "N/A"}
WhatsApp Number: ${phone || "N/A"}
Location: ${city ? `${city}${country ? ", " : ""}` : ""}${country || "N/A"}
${category ? `Category: ${category}` : ""}
Submitted at: ${submittedAt || "N/A"}

Open dashboard: ${dashboardUrl}
`.trim();

const buildApplicantHtml = ({
  applicantFirstName,
  competitionTitle,
  applicationCode,
  category,
  actionHref,
  actionLabel,
  isFree,
}) => {
  const safeName = applicantFirstName || "there";
  const categoryLine = category
    ? `<p style="margin:0 0 12px;">Category: <strong>${category}</strong></p>`
    : "";
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827;">
      <h2 style="margin:0 0 16px;">Panache registration received</h2>
      <p style="margin:0 0 12px;">Hello ${safeName},</p>
      <p style="margin:0 0 12px;">
        Your application for <strong>${competitionTitle}</strong> has been received successfully.
      </p>
      <p style="margin:0 0 12px;">Application code: <strong>${applicationCode}</strong></p>
      ${categoryLine}
      <p style="margin:0 0 12px;">${isFree ? "Continue your registration flow here:" : "Complete your payment here:"}</p>
      <p style="margin:0 0 20px;">
        <a href="${actionHref}" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;">
          ${actionLabel}
        </a>
      </p>
      <p style="margin:0 0 12px;">
        ${isFree ? "Please continue in WhatsApp and the Panache team will guide the next step." : "Once your payment is confirmed, your status will be updated and be reviewed by the Panache team."}
      </p>
      <p style="margin:0;">
        If you need help, reply to this email or contact ${REGISTRATION_SUPPORT_EMAIL || "the Panache team"}.
      </p>
    </div>
  `;
};

const buildAdminHtml = ({
  applicantFirstName,
  competitionTitle,
  competitionSlug,
  applicationCode,
  category,
  email,
  phone,
  city,
  country,
  dashboardUrl,
  submittedAt,
}) => {
  const safeName = applicantFirstName || "N/A";
  const locationLine = city ? `${city}${country ? ", " : ""}${country || ""}` : country || "";
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827;">
      <h2 style="margin:0 0 16px;">New registration logged</h2>
      <p style="margin:0 0 12px;">Application code: <strong>${applicationCode}</strong></p>
      <p style="margin:0 0 12px;">Competition: <strong>${competitionTitle}</strong> (${competitionSlug || "N/A"})</p>
      <p style="margin:0 0 12px;">Applicant: <strong>${safeName}</strong></p>
      <p style="margin:0 0 12px;">Email: <strong>${email || "N/A"}</strong></p>
      <p style="margin:0 0 12px;">WhatsApp Number: <strong>${phone || "N/A"}</strong></p>
      ${locationLine ? `<p style="margin:0 0 12px;">Location: <strong>${locationLine}</strong></p>` : ""}
      ${category ? `<p style="margin:0 0 12px;">Category: <strong>${category}</strong></p>` : ""}
      <p style="margin:0 0 12px;">Submitted: <strong>${submittedAt || "N/A"}</strong></p>
      <p style="margin:0 0 20px;">
        <a href="${dashboardUrl}" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;">Open dashboard</a>
      </p>
    </div>
  `;
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST,OPTIONS");
    return sendJson(res, 200, { ok: true });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST,OPTIONS");
    return sendJson(res, 405, { message: "Method not allowed." });
  }

  if (!SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return sendJson(res, 500, {
      message: "SMTP is not configured on the server.",
    });
  }

  const body = parseBody(req);
  const applicantEmail = normalizeText(body.applicantEmail);
  const applicantFirstName = normalizeText(body.applicantFirstName);
  const competitionTitle = normalizeText(body.competitionTitle);
  const applicationCode = normalizeText(body.applicationCode);
  const category = normalizeText(body.category);
  const paymentHref = normalizeText(body.paymentHref);
  const postSubmitHref = normalizeText(body.postSubmitHref);
  const recipientType = normalizeText(body.recipientType) || "applicant";
  const isFree = normalizeBoolean(body.isFree);
  const competitionSlug = normalizeText(body.competitionSlug);
  const city = normalizeText(body.city);
  const country = normalizeText(body.country);
  const email = normalizeText(body.email);
  const phone = normalizeText(body.phone);
  const submittedAt = normalizeText(body.submittedAt);
  const dashboardUrl = resolveDashboardUrl(req, normalizeText(body.dashboardUrl));
  const adminEmails = normalizeAdminEmails(body.adminEmails);

  if (!applicantEmail || !competitionTitle || !applicationCode) {
    return sendJson(res, 400, {
      message:
        "applicantEmail, competitionTitle, and applicationCode are required.",
    });
  }

  const actionHref = isFree ? postSubmitHref || paymentHref : paymentHref || postSubmitHref;
  if (!actionHref) {
    return sendJson(res, 400, {
      message: "postSubmitHref/paymentHref is required.",
    });
  }

  const actionLabel = isFree ? "Continue to WhatsApp" : "Complete payment";

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const mailTasks = [];
  if (recipientType === "applicant" || recipientType === "both") {
    mailTasks.push(
      transporter.sendMail({
        from: SMTP_FROM,
        to: applicantEmail,
        replyTo: REGISTRATION_SUPPORT_EMAIL || undefined,
        subject: `Panache registration received - ${applicationCode}`,
        text: buildApplicantText({
          applicantFirstName,
          competitionTitle,
          applicationCode,
          category,
          actionHref,
          actionLabel,
          isFree,
        }),
        html: buildApplicantHtml({
          applicantFirstName,
          competitionTitle,
          applicationCode,
          category,
          actionHref,
          actionLabel,
          isFree,
        }),
      })
    );
  }

  const hasAdminEmails = adminEmails.length > 0 || Boolean(REGISTRATION_SUPPORT_EMAIL);
  if ((recipientType === "admin" || recipientType === "both") && hasAdminEmails) {
    const recipients = adminEmails.length > 0 ? adminEmails : [REGISTRATION_SUPPORT_EMAIL];
    mailTasks.push(
      Promise.all(
        recipients.map((recipient) =>
          transporter.sendMail({
            from: SMTP_FROM,
            to: recipient,
            replyTo: applicantEmail || undefined,
            subject: `New ${competitionTitle} registration - ${applicationCode}`,
            text: buildAdminText({
              applicantFirstName,
              competitionTitle,
              competitionSlug,
              applicationCode,
              category,
              email,
              phone,
              city,
              country,
              dashboardUrl,
              submittedAt,
            }),
            html: buildAdminHtml({
              applicantFirstName,
              competitionTitle,
              competitionSlug,
              applicationCode,
              category,
              email,
              phone,
              city,
              country,
              dashboardUrl,
              submittedAt,
            }),
          })
        )
      )
    );
  }

  try {
    await Promise.all(mailTasks);
  } catch (error) {
    return sendJson(res, 500, {
      message:
        error instanceof Error
          ? error.message
          : "Could not send the registration notification email.",
    });
  }

  return sendJson(res, 200, {
    ok: true,
    message:
      recipientType === "both"
        ? "Registration notifications sent."
        : "Registration confirmation email sent.",
  });
}
