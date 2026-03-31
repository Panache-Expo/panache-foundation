interface SendCompetitionRegistrationEmailParams {
  applicantEmail: string;
  applicantFirstName: string;
  competitionTitle: string;
  applicationCode: string;
  paymentHref: string;
  category?: string | null;
}

const REGISTRATION_EMAIL_API_URL =
  import.meta.env.VITE_REGISTRATION_EMAIL_API_URL || "/api/send-registration-email";

export const sendCompetitionRegistrationEmail = async ({
  applicantEmail,
  applicantFirstName,
  competitionTitle,
  applicationCode,
  paymentHref,
  category,
}: SendCompetitionRegistrationEmailParams) => {
  const response = await fetch(REGISTRATION_EMAIL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      applicantEmail,
      applicantFirstName,
      competitionTitle,
      applicationCode,
      paymentHref,
      category: category || undefined,
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      payload?.message || "Could not send the registration confirmation email."
    );
  }

  return payload;
};
