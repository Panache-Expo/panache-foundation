import { CIYES_DONATE_CAMPAIGN } from "@/lib/ciyes-donate-content";

export const DONATIONS_API_URL =
  import.meta.env.VITE_CIYES_DONATIONS_API_URL || "/api/ciyes-donations";

export type DonationTotals = {
  goal_xaf: number | null;
  raised_xaf: number;
  donors: number;
  usd_per_xaf: number | null; // approximate; null when no exchange rate is available
  usd_rate_date: string | null; // YYYY-MM-DD of the European Central Bank rate, if known
};
export type DonationVerifyStatus = "pending" | "completed" | "failed" | "cancelled";
export type DonationVerifyResult = {
  status: DonationVerifyStatus;
  amount_xaf: number;
  donor_name: string | null;
};

export class DonationApiError extends Error {
  field?: string;
  status: number;
  constructor(message: string, status: number, field?: string) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

const readJson = async (response: Response) => {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new DonationApiError(payload?.message || "Request failed", response.status, payload?.field);
  }
  return payload;
};

export const fetchDonationTotals = async (campaign = CIYES_DONATE_CAMPAIGN): Promise<DonationTotals> => {
  const response = await fetch(`${DONATIONS_API_URL}?campaign=${encodeURIComponent(campaign)}`, {
    cache: "no-store",
  });
  const payload = await readJson(response);
  return {
    goal_xaf: typeof payload.goal_xaf === "number" ? payload.goal_xaf : null,
    raised_xaf: Number(payload.raised_xaf) || 0,
    donors: Number(payload.donors) || 0,
    usd_per_xaf: Number(payload.usd_per_xaf) > 0 ? Number(payload.usd_per_xaf) : null,
    usd_rate_date: typeof payload.usd_rate_date === "string" ? payload.usd_rate_date : null,
  };
};

const post = async (body: Record<string, unknown>) =>
  readJson(
    await fetch(DONATIONS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );

export const startDonation = async (body: {
  amount: number;
  donorName?: string;
  whatsappPhone?: string;
  language: string;
  source: string | null;
  website: string;
}): Promise<{ paymentLink: string | null; txRef?: string }> =>
  post({ action: "start", campaign: CIYES_DONATE_CAMPAIGN, ...body });

export const verifyDonation = async (txRef: string): Promise<DonationVerifyResult> =>
  post({ action: "verify", txRef });
