import type {
  CompetitionApplication,
  CYESAwardCategory,
  CYESAwardNominee,
  CYESVotingPayload,
  PanacheDorAwardCategory,
  PanacheDorAwardNominee,
  PanacheDorVotingPayload,
} from "@/integrations/supabase/services";

const DASHBOARD_ACCESS_KEY_STORAGE = "panache-dashboard-access-key";
const DASHBOARD_API_URL =
  import.meta.env.VITE_DASHBOARD_API_URL || "/api/dashboard-applications";
const CYES_VOTING_API_URL =
  import.meta.env.VITE_CYES_VOTING_API_URL || "/api/cyes-voting";
const PANACHE_DOR_VOTING_API_URL =
  import.meta.env.VITE_PANACHE_DOR_VOTING_API_URL ||
  "/api/panache-dor-voting";

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

export type CYESVotingNomineePhotoUploadPayload = {
  fileName: string;
  contentType: string;
  base64: string;
};

export type PanacheDorVotingCategoryPayload = {
  slug?: string;
  name?: string;
  description?: string | null;
  status?: string;
  sort_order?: number;
};

export type PanacheDorVotingNomineePayload = {
  category_id?: string;
  slug?: string;
  name?: string;
  organization?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  status?: string;
  sort_order?: number;
  ayati_vote_url?: string | null;
  ayati_sync_id?: string | null;
};

export type PanacheDorVotingNomineePhotoUploadPayload = {
  fileName: string;
  contentType: string;
  base64: string;
};

export type PanacheDorCsvImportSummary = {
  imported: number;
  failed: number;
  errors?: Array<{
    row: number;
    message: string;
  }>;
};

export type PanacheDorVoteProviderSyncSummary = {
  configured: boolean;
  provider?: string;
  synced: number;
  created?: number;
  archived?: number;
  skipped?: number;
  source_rows?: number;
  source_nominee_category_rows?: number;
  synced_at?: string;
  message: string;
};

const readResponsePayload = async (response: Response) => {
  return (await response.json().catch(() => null)) as
    | {
        message?: string;
        applications?: CompetitionApplication[];
        application?: CompetitionApplication;
        voting?: CYESVotingPayload;
        panacheDorVoting?: PanacheDorVotingPayload;
        category?: CYESAwardCategory;
        panacheDorCategory?: PanacheDorAwardCategory;
        nominee?: CYESAwardNominee;
        panacheDorNominee?: PanacheDorAwardNominee;
        photoUrl?: string;
        photo_url?: string;
  path?: string;
  importSummary?: PanacheDorCsvImportSummary;
  syncSummary?: PanacheDorVoteProviderSyncSummary;
  verifySummary?: {
    checked: number;
    completed: number;
    pending: number;
    failed: number;
    errors: number;
  };
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

export const deleteCyesVotingNominee = async (accessKey: string, id: string) => {
  return mutateCyesVotingDashboard(accessKey, {
    action: "deleteNominee",
    id,
  });
};

export const uploadCyesVotingNomineePhoto = async (
  accessKey: string,
  upload: CYESVotingNomineePhotoUploadPayload
) => {
  const response = await fetch(CYES_VOTING_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-dashboard-key": accessKey,
    },
    body: JSON.stringify({
      action: "uploadNomineePhoto",
      ...upload,
    }),
  });
  const payload = await readResponsePayload(response);
  const photoUrl = payload?.photoUrl || payload?.photo_url || "";

  if (!response.ok || !photoUrl) {
    throw new Error(payload?.message || "Could not upload nominee photo.");
  }

  return {
    photoUrl,
    path: payload?.path || "",
  };
};

export const fetchPanacheDorVotingDashboard = async (accessKey: string) => {
  const response = await fetch(PANACHE_DOR_VOTING_API_URL, {
    headers: {
      "x-dashboard-key": accessKey,
    },
  });
  const payload = await readResponsePayload(response);

  if (!response.ok || !payload?.voting) {
    throw new Error(payload?.message || "Could not load Panache D'or voting.");
  }

  return payload.voting as unknown as PanacheDorVotingPayload;
};

const mutatePanacheDorVotingDashboard = async (
  accessKey: string,
  body: Record<string, unknown>
) => {
  const response = await fetch(PANACHE_DOR_VOTING_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-dashboard-key": accessKey,
    },
    body: JSON.stringify(body),
  });
  const payload = await readResponsePayload(response);

  if (!response.ok || !payload?.voting) {
    throw new Error(payload?.message || "Could not update Panache D'or voting.");
  }

  return {
    voting: payload.voting as unknown as PanacheDorVotingPayload,
    importSummary: payload.importSummary,
    syncSummary: payload.syncSummary,
    verifySummary: payload.verifySummary,
  };
};

export const createPanacheDorVotingCategory = async (
  accessKey: string,
  category: PanacheDorVotingCategoryPayload
) => {
  return mutatePanacheDorVotingDashboard(accessKey, {
    action: "createCategory",
    category,
  });
};

export const updatePanacheDorVotingCategory = async (
  accessKey: string,
  id: string,
  updates: PanacheDorVotingCategoryPayload
) => {
  return mutatePanacheDorVotingDashboard(accessKey, {
    action: "updateCategory",
    id,
    updates,
  });
};

export const deletePanacheDorVotingCategory = async (
  accessKey: string,
  id: string
) => {
  return mutatePanacheDorVotingDashboard(accessKey, {
    action: "deleteCategory",
    id,
  });
};

export const createPanacheDorVotingNominee = async (
  accessKey: string,
  nominee: PanacheDorVotingNomineePayload
) => {
  return mutatePanacheDorVotingDashboard(accessKey, {
    action: "createNominee",
    nominee,
  });
};

export const updatePanacheDorVotingNominee = async (
  accessKey: string,
  id: string,
  updates: PanacheDorVotingNomineePayload
) => {
  return mutatePanacheDorVotingDashboard(accessKey, {
    action: "updateNominee",
    id,
    updates,
  });
};

export const deletePanacheDorVotingNominee = async (
  accessKey: string,
  id: string
) => {
  return mutatePanacheDorVotingDashboard(accessKey, {
    action: "deleteNominee",
    id,
  });
};

export const uploadPanacheDorVotingNomineePhoto = async (
  accessKey: string,
  upload: PanacheDorVotingNomineePhotoUploadPayload
) => {
  const response = await fetch(PANACHE_DOR_VOTING_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-dashboard-key": accessKey,
    },
    body: JSON.stringify({
      action: "uploadNomineePhoto",
      ...upload,
    }),
  });
  const payload = await readResponsePayload(response);
  const photoUrl = payload?.photoUrl || payload?.photo_url || "";

  if (!response.ok || !photoUrl) {
    throw new Error(payload?.message || "Could not upload nominee photo.");
  }

  return {
    photoUrl,
    path: payload?.path || "",
  };
};

export const importPanacheDorNomineesCsv = async (
  accessKey: string,
  csv: string
) => {
  return mutatePanacheDorVotingDashboard(accessKey, {
    action: "importNomineesCsv",
    csv,
  });
};

export const verifyPendingPanacheDorCampayVotes = async (accessKey: string) => {
  return mutatePanacheDorVotingDashboard(accessKey, {
    action: "verifyPendingCampayVotes",
  });
};

export const syncPanacheDorCliqVotesCounts = verifyPendingPanacheDorCampayVotes;
export const syncPanacheDorAyatiCounts = verifyPendingPanacheDorCampayVotes;
