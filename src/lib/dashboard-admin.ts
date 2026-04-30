import type {
  CompetitionApplication,
  CYESAwardCategory,
  CYESAwardNominee,
  CYESVotingPayload,
} from "@/integrations/supabase/services";

const DASHBOARD_ACCESS_KEY_STORAGE = "panache-dashboard-access-key";
const DASHBOARD_API_URL =
  import.meta.env.VITE_DASHBOARD_API_URL || "/api/dashboard-applications";
const CYES_VOTING_API_URL =
  import.meta.env.VITE_CYES_VOTING_API_URL || "/api/cyes-voting";

export interface CompetitionApplicationUpdatePayload {
  payment_status?: string;
  payment_reference?: string | null;
  payment_amount?: number | null;
  review_status?: string;
  review_notes?: string | null;
}

export type CYESVotingCategoryPayload = {
  name?: string;
  description?: string | null;
  status?: string;
  voting_enabled?: boolean;
  sort_order?: number;
};

export type CYESVotingNomineePayload = {
  category_id?: string;
  name?: string;
  organization?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  status?: string;
  sort_order?: number;
};

const readResponsePayload = async (response: Response) => {
  return (await response.json().catch(() => null)) as
    | {
        message?: string;
        applications?: CompetitionApplication[];
        application?: CompetitionApplication;
        voting?: CYESVotingPayload;
        category?: CYESAwardCategory;
        nominee?: CYESAwardNominee;
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

export const fetchCyesVotingDashboard = async (accessKey: string) => {
  const response = await fetch(CYES_VOTING_API_URL, {
    headers: {
      "x-dashboard-key": accessKey,
    },
  });
  const payload = await readResponsePayload(response);

  if (!response.ok || !payload?.voting) {
    throw new Error(payload?.message || "Could not load CYES voting.");
  }

  return payload.voting;
};

const mutateCyesVotingDashboard = async (
  accessKey: string,
  body: Record<string, unknown>
) => {
  const response = await fetch(CYES_VOTING_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-dashboard-key": accessKey,
    },
    body: JSON.stringify(body),
  });
  const payload = await readResponsePayload(response);

  if (!response.ok || !payload?.voting) {
    throw new Error(payload?.message || "Could not update CYES voting.");
  }

  return payload.voting;
};

export const createCyesVotingCategory = async (
  accessKey: string,
  category: CYESVotingCategoryPayload
) => {
  return mutateCyesVotingDashboard(accessKey, {
    action: "createCategory",
    category,
  });
};

export const updateCyesVotingCategory = async (
  accessKey: string,
  id: string,
  updates: CYESVotingCategoryPayload
) => {
  return mutateCyesVotingDashboard(accessKey, {
    action: "updateCategory",
    id,
    updates,
  });
};

export const createCyesVotingNominee = async (
  accessKey: string,
  nominee: CYESVotingNomineePayload
) => {
  return mutateCyesVotingDashboard(accessKey, {
    action: "createNominee",
    nominee,
  });
};

export const updateCyesVotingNominee = async (
  accessKey: string,
  id: string,
  updates: CYESVotingNomineePayload
) => {
  return mutateCyesVotingDashboard(accessKey, {
    action: "updateNominee",
    id,
    updates,
  });
};
