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

const buildHtml = ({
  applicantFirstName,
  competitionTitle,
  applicationCode,
  paymentHref,
  category,
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
      <p style="margin:0 0 12px;">
        Please complete your payment using the official link below:
      </p>
      <p style="margin:0 0 20px;">
        <a href="${paymentHref}" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;">
          Complete payment
        </a>
      </p>
      <p style="margin:0 0 12px;">
        Once your payment is confirmed, your status will be updated and the Panache team will continue reviewing your application.
      </p>
      <p style="margin:0;">
        If you need help, reply to this email or contact ${REGISTRATION_SUPPORT_EMAIL || "the Panache team"}.
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
  const paymentHref = normalizeText(body.paymentHref);
  const category = normalizeText(body.category);

  if (
    !applicantEmail ||
    !competitionTitle ||
    !applicationCode ||
    !paymentHref
  ) {
    return sendJson(res, 400, {
      message:
        "applicantEmail, competitionTitle, applicationCode, and paymentHref are required.",
    });
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

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: applicantEmail,
      replyTo: REGISTRATION_SUPPORT_EMAIL || undefined,
      subject: `Panache registration received - ${applicationCode}`,
      text: [
        `Hello ${applicantFirstName || "there"},`,
        "",
        `Your application for ${competitionTitle} has been received successfully.`,
        `Application code: ${applicationCode}`,
        category ? `Category: ${category}` : "",
        "",
        `Complete payment here: ${paymentHref}`,
        "",
        "Once your payment is confirmed, your status will be updated.",
      ]
        .filter(Boolean)
        .join("\n"),
      html: buildHtml({
        applicantFirstName,
        competitionTitle,
        applicationCode,
        paymentHref,
        category,
      }),
    });
  } catch (error) {
    return sendJson(res, 500, {
      message:
        error instanceof Error
          ? error.message
          : "Could not send the registration confirmation email.",
    });
  }

  return sendJson(res, 200, {
    ok: true,
    message: "Registration confirmation email sent.",
  });
}
