import type { CompetitionApplication } from "@/integrations/supabase/services";

const DASHBOARD_ACCESS_KEY_STORAGE = "panache-dashboard-access-key";
const DASHBOARD_API_URL =
  import.meta.env.VITE_DASHBOARD_API_URL || "/api/dashboard-applications";

export interface CompetitionApplicationUpdatePayload {
  payment_status?: string;
  payment_reference?: string | null;
  payment_amount?: number | null;
  review_status?: string;
  review_notes?: string | null;
}

const readResponsePayload = async (response: Response) => {
  return (await response.json().catch(() => null)) as
    | {
        message?: string;
        applications?: CompetitionApplication[];
        application?: CompetitionApplication;
      }
    | null;
};

export const getStoredDashboardAccessKey = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.sessionStorage.getItem(DASHBOARD_ACCESS_KEY_STORAGE) || "";
};

export const storeDashboardAccessKey = (accessKey: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(DASHBOARD_ACCESS_KEY_STORAGE, accessKey);
};

export const clearStoredDashboardAccessKey = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(DASHBOARD_ACCESS_KEY_STORAGE);
};

export const fetchDashboardApplications = async (accessKey: string) => {
  const response = await fetch(DASHBOARD_API_URL, {
    headers: {
      "x-dashboard-key": accessKey,
    },
  });

  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw new Error(payload?.message || "Could not load dashboard applications.");
  }

  return payload?.applications || [];
};

export const updateDashboardApplication = async (
  accessKey: string,
  id: string,
  updates: CompetitionApplicationUpdatePayload
) => {
  const response = await fetch(DASHBOARD_API_URL, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-dashboard-key": accessKey,
    },
    body: JSON.stringify({
      id,
      updates,
    }),
  });

  const payload = await readResponsePayload(response);

  if (!response.ok || !payload?.application) {
    throw new Error(payload?.message || "Could not update the application.");
  }

  return payload.application;
};
