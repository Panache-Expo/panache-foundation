import type {
  CompetitionApplication,
  CYESAwardCategory,
  CYESAwardNominee,
  CYESVotingPayload,
  PanacheDorAwardCategory,
  PanacheDorAwardNominee,
  PanacheDorVotingPayload,
  Panache360AwardCategory,
  Panache360AwardNominee,
  Panache360VotingPayload,
  MissPanacheAwardCategory,
  MissPanacheAwardNominee,
  MissPanacheVotingPayload,
} from "@/integrations/supabase/services";

const DASHBOARD_ACCESS_KEY_STORAGE = "panache-dashboard-access-key";
const DASHBOARD_API_URL =
  import.meta.env.VITE_DASHBOARD_API_URL || "/api/dashboard-applications";
const CYES_VOTING_API_URL =
  import.meta.env.VITE_CYES_VOTING_API_URL || "/api/cyes-voting";
const PANACHE_DOR_VOTING_API_URL =
  import.meta.env.VITE_PANACHE_DOR_VOTING_API_URL ||
  "/api/panache-dor-voting";
const PANACHE_360_VOTING_API_URL =
  import.meta.env.VITE_PANACHE_360_VOTING_API_URL ||
  "/api/panache-360-voting";
const MISS_PANACHE_VOTING_API_URL =
  import.meta.env.VITE_MISS_PANACHE_VOTING_API_URL ||
  "/api/miss-panache-voting";

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

export type Panache360VotingCategoryPayload = PanacheDorVotingCategoryPayload;
export type Panache360VotingNomineePayload = PanacheDorVotingNomineePayload;
export type Panache360VotingNomineePhotoUploadPayload =
  PanacheDorVotingNomineePhotoUploadPayload;
export type MissPanacheVotingCategoryPayload = PanacheDorVotingCategoryPayload;
export type MissPanacheVotingNomineePayload = PanacheDorVotingNomineePayload;
export type MissPanacheVotingNomineePhotoUploadPayload =
  PanacheDorVotingNomineePhotoUploadPayload;

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
        panache360Voting?: Panache360VotingPayload;
        missPanacheVoting?: MissPanacheVotingPayload;
        category?: CYESAwardCategory;
        panacheDorCategory?: PanacheDorAwardCategory;
        panache360Category?: Panache360AwardCategory;
        missPanacheCategory?: MissPanacheAwardCategory;
        nominee?: CYESAwardNominee;
        panacheDorNominee?: PanacheDorAwardNominee;
        panache360Nominee?: Panache360AwardNominee;
        missPanacheNominee?: MissPanacheAwardNominee;
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
        reconcileSummary?: {
          start_date: string;
          end_date: string;
          dry_run: boolean;
          pending_checked: number;
          history_rows_checked: number;
          matched: number;
          recoverable: number;
          recovered: number;
          failed: number;
          skipped: number;
          no_match: number;
          errors: number;
          votes_recoverable: number;
          amount_recoverable_xaf: number;
          votes_recovered: number;
          amount_recovered_xaf: number;
        };
        autoHistoryReconcileSummary?: Record<string, unknown>;
        autoVerifySummary?: Record<string, unknown>;
        paidPendingScanSummary?: Record<string, unknown>;
        recoverPaidPendingSummary?: Record<string, unknown>;
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
    reconcileSummary: payload.reconcileSummary,
    autoHistoryReconcileSummary: payload.autoHistoryReconcileSummary,
    autoVerifySummary: payload.autoVerifySummary,
    paidPendingScanSummary: payload.paidPendingScanSummary,
    recoverPaidPendingSummary: payload.recoverPaidPendingSummary,
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

export const reconcilePanacheDorCampayHistory = async (
  accessKey: string,
  data: { startDate: string; endDate: string; dryRun: boolean }
) => {
  return mutatePanacheDorVotingDashboard(accessKey, {
    action: "reconcileCampayHistory",
    startDate: data.startDate,
    endDate: data.endDate,
    dryRun: data.dryRun,
  });
};

export const scanPanacheDorPaidPendingVotes = async (accessKey: string) => {
  return mutatePanacheDorVotingDashboard(accessKey, {
    action: "scanPaidPendingCampayVotes",
  });
};

export const recoverPanacheDorPaidPendingVotes = async (
  accessKey: string,
  limit = 100
) => {
  return mutatePanacheDorVotingDashboard(accessKey, {
    action: "recoverPaidPendingCampayVotes",
    limit,
  });
};

export const fetchPanache360VotingDashboard = async (accessKey: string) => {
  const response = await fetch(PANACHE_360_VOTING_API_URL, {
    headers: {
      "x-dashboard-key": accessKey,
    },
  });
  const payload = await readResponsePayload(response);

  if (!response.ok || !payload?.voting) {
    throw new Error(payload?.message || "Could not load Panache 360 voting.");
  }

  return payload.voting as unknown as Panache360VotingPayload;
};

const mutatePanache360VotingDashboard = async (
  accessKey: string,
  body: Record<string, unknown>
) => {
  const response = await fetch(PANACHE_360_VOTING_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-dashboard-key": accessKey,
    },
    body: JSON.stringify(body),
  });
  const payload = await readResponsePayload(response);

  if (!response.ok || !payload?.voting) {
    throw new Error(payload?.message || "Could not update Panache 360 voting.");
  }

  return {
    voting: payload.voting as unknown as Panache360VotingPayload,
    importSummary: payload.importSummary,
    syncSummary: payload.syncSummary,
    verifySummary: payload.verifySummary,
    reconcileSummary: payload.reconcileSummary,
    autoHistoryReconcileSummary: payload.autoHistoryReconcileSummary,
    autoVerifySummary: payload.autoVerifySummary,
    paidPendingScanSummary: payload.paidPendingScanSummary,
    recoverPaidPendingSummary: payload.recoverPaidPendingSummary,
  };
};

export const createPanache360VotingCategory = async (
  accessKey: string,
  category: Panache360VotingCategoryPayload
) => {
  return mutatePanache360VotingDashboard(accessKey, {
    action: "createCategory",
    category,
  });
};

export const updatePanache360VotingCategory = async (
  accessKey: string,
  id: string,
  updates: Panache360VotingCategoryPayload
) => {
  return mutatePanache360VotingDashboard(accessKey, {
    action: "updateCategory",
    id,
    updates,
  });
};

export const deletePanache360VotingCategory = async (
  accessKey: string,
  id: string
) => {
  return mutatePanache360VotingDashboard(accessKey, {
    action: "deleteCategory",
    id,
  });
};

export const createPanache360VotingNominee = async (
  accessKey: string,
  nominee: Panache360VotingNomineePayload
) => {
  return mutatePanache360VotingDashboard(accessKey, {
    action: "createNominee",
    nominee,
  });
};

export const updatePanache360VotingNominee = async (
  accessKey: string,
  id: string,
  updates: Panache360VotingNomineePayload
) => {
  return mutatePanache360VotingDashboard(accessKey, {
    action: "updateNominee",
    id,
    updates,
  });
};

export const deletePanache360VotingNominee = async (
  accessKey: string,
  id: string
) => {
  return mutatePanache360VotingDashboard(accessKey, {
    action: "deleteNominee",
    id,
  });
};

export const uploadPanache360VotingNomineePhoto = async (
  accessKey: string,
  upload: Panache360VotingNomineePhotoUploadPayload
) => {
  const response = await fetch(PANACHE_360_VOTING_API_URL, {
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

export const importPanache360NomineesCsv = async (
  accessKey: string,
  csv: string
) => {
  return mutatePanache360VotingDashboard(accessKey, {
    action: "importNomineesCsv",
    csv,
  });
};

export const verifyPendingPanache360CampayVotes = async (accessKey: string) => {
  return mutatePanache360VotingDashboard(accessKey, {
    action: "verifyPendingCampayVotes",
  });
};

export const reconcilePanache360CampayHistory = async (
  accessKey: string,
  data: { startDate: string; endDate: string; dryRun: boolean }
) => {
  return mutatePanache360VotingDashboard(accessKey, {
    action: "reconcileCampayHistory",
    startDate: data.startDate,
    endDate: data.endDate,
    dryRun: data.dryRun,
  });
};

export const scanPanache360PaidPendingVotes = async (accessKey: string) => {
  return mutatePanache360VotingDashboard(accessKey, {
    action: "scanPaidPendingCampayVotes",
  });
};

export const recoverPanache360PaidPendingVotes = async (
  accessKey: string,
  limit = 100
) => {
  return mutatePanache360VotingDashboard(accessKey, {
    action: "recoverPaidPendingCampayVotes",
    limit,
  });
};

export const fetchMissPanacheVotingDashboard = async (accessKey: string) => {
  const response = await fetch(MISS_PANACHE_VOTING_API_URL, {
    headers: {
      "x-dashboard-key": accessKey,
    },
  });
  const payload = await readResponsePayload(response);

  if (!response.ok || !payload?.voting) {
    throw new Error(payload?.message || "Could not load Miss Panache voting.");
  }

  return payload.voting as unknown as MissPanacheVotingPayload;
};

const mutateMissPanacheVotingDashboard = async (
  accessKey: string,
  body: Record<string, unknown>
) => {
  const response = await fetch(MISS_PANACHE_VOTING_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-dashboard-key": accessKey,
    },
    body: JSON.stringify(body),
  });
  const payload = await readResponsePayload(response);

  if (!response.ok || !payload?.voting) {
    throw new Error(payload?.message || "Could not update Miss Panache voting.");
  }

  return {
    voting: payload.voting as unknown as MissPanacheVotingPayload,
    importSummary: payload.importSummary,
    syncSummary: payload.syncSummary,
    verifySummary: payload.verifySummary,
    reconcileSummary: payload.reconcileSummary,
    autoHistoryReconcileSummary: payload.autoHistoryReconcileSummary,
    autoVerifySummary: payload.autoVerifySummary,
    paidPendingScanSummary: payload.paidPendingScanSummary,
    recoverPaidPendingSummary: payload.recoverPaidPendingSummary,
  };
};

export const createMissPanacheVotingCategory = async (
  accessKey: string,
  category: MissPanacheVotingCategoryPayload
) => {
  return mutateMissPanacheVotingDashboard(accessKey, {
    action: "createCategory",
    category,
  });
};

export const updateMissPanacheVotingCategory = async (
  accessKey: string,
  id: string,
  updates: MissPanacheVotingCategoryPayload
) => {
  return mutateMissPanacheVotingDashboard(accessKey, {
    action: "updateCategory",
    id,
    updates,
  });
};

export const deleteMissPanacheVotingCategory = async (
  accessKey: string,
  id: string
) => {
  return mutateMissPanacheVotingDashboard(accessKey, {
    action: "deleteCategory",
    id,
  });
};

export const createMissPanacheVotingNominee = async (
  accessKey: string,
  nominee: MissPanacheVotingNomineePayload
) => {
  return mutateMissPanacheVotingDashboard(accessKey, {
    action: "createNominee",
    nominee,
  });
};

export const updateMissPanacheVotingNominee = async (
  accessKey: string,
  id: string,
  updates: MissPanacheVotingNomineePayload
) => {
  return mutateMissPanacheVotingDashboard(accessKey, {
    action: "updateNominee",
    id,
    updates,
  });
};

export const deleteMissPanacheVotingNominee = async (
  accessKey: string,
  id: string
) => {
  return mutateMissPanacheVotingDashboard(accessKey, {
    action: "deleteNominee",
    id,
  });
};

export const uploadMissPanacheVotingNomineePhoto = async (
  accessKey: string,
  upload: MissPanacheVotingNomineePhotoUploadPayload
) => {
  const response = await fetch(MISS_PANACHE_VOTING_API_URL, {
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

export const importMissPanacheNomineesCsv = async (
  accessKey: string,
  csv: string
) => {
  return mutateMissPanacheVotingDashboard(accessKey, {
    action: "importNomineesCsv",
    csv,
  });
};

export const verifyPendingMissPanacheCampayVotes = async (accessKey: string) => {
  return mutateMissPanacheVotingDashboard(accessKey, {
    action: "verifyPendingCampayVotes",
  });
};

export const reconcileMissPanacheCampayHistory = async (
  accessKey: string,
  data: { startDate: string; endDate: string; dryRun: boolean }
) => {
  return mutateMissPanacheVotingDashboard(accessKey, {
    action: "reconcileCampayHistory",
    startDate: data.startDate,
    endDate: data.endDate,
    dryRun: data.dryRun,
  });
};

export const scanMissPanachePaidPendingVotes = async (accessKey: string) => {
  return mutateMissPanacheVotingDashboard(accessKey, {
    action: "scanPaidPendingCampayVotes",
  });
};

export const recoverMissPanachePaidPendingVotes = async (
  accessKey: string,
  limit = 100
) => {
  return mutateMissPanacheVotingDashboard(accessKey, {
    action: "recoverPaidPendingCampayVotes",
    limit,
  });
};

export const syncPanacheDorCliqVotesCounts = verifyPendingPanacheDorCampayVotes;
export const syncPanacheDorAyatiCounts = verifyPendingPanacheDorCampayVotes;
