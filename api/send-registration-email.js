import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;
const REGISTRATION_SUPPORT_EMAIL =
  process.env.REGISTRATION_SUPPORT_EMAIL || SMTP_USER;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

const escapeHtml = (value = "") =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const parseRequestBody = (body) => {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }

  return body;
};

const buildTextBody = ({
  applicantFirstName,
  competitionTitle,
  applicationCode,
  category,
  paymentHref,
}) => {
  const lines = [
    `Hello ${applicantFirstName},`,
    "",
    `Your ${competitionTitle} application has been received by Panache Expo.`,
    `Application code: ${applicationCode}`,
  ];

  if (category) {
    lines.push(`Category: ${category}`);
  }

  lines.push(
    "",
    "Your next step is to complete payment on Ayati using the link below:",
    paymentHref,
    "",
    "Important: your registration will remain pending until payment is completed.",
    "",
    "If you need help, reply to this email or contact the Panache team.",
    "",
    "Panache Expo"
  );

  return lines.join("\n");
};

const buildHtmlBody = ({
  applicantFirstName,
  competitionTitle,
  applicationCode,
  category,
  paymentHref,
}) => {
  const safeFirstName = escapeHtml(applicantFirstName);
  const safeCompetitionTitle = escapeHtml(competitionTitle);
  const safeApplicationCode = escapeHtml(applicationCode);
  const safeCategory = category ? escapeHtml(category) : "";
  const safePaymentHref = escapeHtml(paymentHref);

  return `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 640px; margin: 0 auto; padding: 24px;">
      <p style="margin: 0 0 16px;">Hello ${safeFirstName},</p>
      <p style="margin: 0 0 16px;">
        Your <strong>${safeCompetitionTitle}</strong> application has been received by Panache Expo.
      </p>
      <div style="margin: 24px 0; padding: 16px 20px; border-radius: 14px; background: #f8f4ef; border: 1px solid #eadfd2;">
        <p style="margin: 0 0 8px;"><strong>Application code:</strong> ${safeApplicationCode}</p>
        ${
          safeCategory
            ? `<p style="margin: 0;"><strong>Category:</strong> ${safeCategory}</p>`
            : ""
        }
      </div>
      <p style="margin: 0 0 16px;">
        Your next step is to complete payment on Ayati using the button below.
      </p>
      <p style="margin: 24px 0;">
        <a
          href="${safePaymentHref}"
          style="display: inline-block; background: #8b5e3c; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 999px; font-weight: 700;"
        >
          Continue to Ayati
        </a>
      </p>
      <p style="margin: 0 0 16px;">
        Important: your registration will remain pending until payment is completed.
      </p>
      <p style="margin: 0;">If you need help, reply to this email or contact the Panache team.</p>
      <p style="margin: 24px 0 0;">Panache Expo</p>
    </div>
  `;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return res.status(500).json({
      message: "SMTP environment variables are missing.",
    });
  }

  const body = parseRequestBody(req.body);
  const {
    applicantEmail,
    applicantFirstName,
    competitionTitle,
    applicationCode,
    category,
    paymentHref,
  } = body;

  if (
    !applicantEmail ||
    !applicantFirstName ||
    !competitionTitle ||
    !applicationCode ||
    !paymentHref
  ) {
    return res.status(400).json({
      message: "Missing email payload fields.",
    });
  }

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: applicantEmail,
      replyTo: REGISTRATION_SUPPORT_EMAIL,
      subject: `${competitionTitle} application received`,
      text: buildTextBody({
        applicantFirstName,
        competitionTitle,
        applicationCode,
        category,
        paymentHref,
      }),
      html: buildHtmlBody({
        applicantFirstName,
        competitionTitle,
        applicationCode,
        category,
        paymentHref,
      }),
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Failed to send registration email", error);
    return res.status(500).json({
      message: "Could not send registration email.",
    });
  }
}
