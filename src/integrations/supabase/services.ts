import { supabase } from './client';
import type { Database } from './types';

// Type helpers for better DX
export type Tables = Database['public']['Tables'];
export type ContactSubmission = Tables['contact_submissions']['Row'];
export type CompetitionApplication = Tables['competition_applications']['Row'];
export type CYESAwardCategoryRow = Tables['cyes_award_categories']['Row'];
export type CYESAwardNomineeRow = Tables['cyes_award_nominees']['Row'];
export type CYESAwardVote = Tables['cyes_award_votes']['Row'];
export type PanacheDorAwardCategoryRow =
  Tables['panache_dor_award_categories']['Row'];
export type PanacheDorAwardNomineeRow =
  Tables['panache_dor_award_nominees']['Row'];
export type Profile = Tables['profiles']['Row'];
export type CompetitionApplicationInsert = Tables['competition_applications']['Insert'];

export type VoteSourceBreakdown = {
  total_votes: number;
  otp_votes: number;
  whatsapp_votes: number;
};

export type CYESAwardNominee = CYESAwardNomineeRow & {
  vote_count: number;
  source_breakdown?: VoteSourceBreakdown | null;
};

export type CYESAwardCategory = CYESAwardCategoryRow & {
  vote_count: number;
  source_breakdown?: VoteSourceBreakdown | null;
  nominees: CYESAwardNominee[];
};

export type CYESVotingPayload = {
  categories: CYESAwardCategory[];
  total_votes: number;
  source_breakdown?: VoteSourceBreakdown | null;
  counts_available?: boolean;
  blind_voting?: boolean;
  results_publish_at?: string;
  results_publish_label?: string;
  voting_closed?: boolean;
  voting_closed_at?: string;
  announcement_channel_url?: string;
  closed_message?: string;
};

export type CYESVoteStatus = 'completed' | 'pending_otp' | 'closed' | 'unknown';

export type CYESVoteRequestPayload = {
  categoryId: string;
  nomineeId: string;
  voterName: string;
  voterPhone: string;
  voterEmail: string;
  captchaToken?: string;
  captchaChallengeId?: string;
  captchaAnswer?: string;
};

export type CYESVoteCastPayload = Omit<
  CYESVoteRequestPayload,
  'captchaToken' | 'captchaChallengeId' | 'captchaAnswer'
> & {
  otp: string;
};

export type PanacheDorAwardNominee = PanacheDorAwardNomineeRow & {
  vote_url?: string | null;
  vote_count?: number;
  vote_provider_sync_id?: string | null;
  vote_last_synced_at?: string | null;
};

export type PanacheDorAwardCategory = PanacheDorAwardCategoryRow & {
  vote_count?: number;
  nominees: PanacheDorAwardNominee[];
};

export type PanacheDorPaymentSettings = {
  provider: string;
  provider_name: string;
  payments_configured: boolean;
  vote_price_xaf: number;
  processing_fee_per_vote_xaf: number;
  amount_per_vote_xaf: number;
  currency: string;
};

export type PanacheDorVotePayment = {
  id: string;
  nominee_id: string;
  category_id: string;
  tx_ref: string;
  campay_reference?: string | null;
  payment_link?: string | null;
  provider: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | string;
  voter_email?: string | null;
  voter_whatsapp?: string | null;
  vote_count: number;
  vote_price_xaf: number;
  processing_fee_per_vote_xaf: number;
  amount_xaf: number;
  currency: string;
  provider_status?: string | null;
  verified_at?: string | null;
  failure_reason?: string | null;
  receipt_email_sent_at?: string | null;
  receipt_email_error?: string | null;
  created_at: string;
  updated_at: string;
  nominee?: Pick<PanacheDorAwardNomineeRow, 'name' | 'slug'> | null;
  category?: Pick<PanacheDorAwardCategoryRow, 'name' | 'slug'> | null;
};

export type PanacheDorPaidPendingPayment = PanacheDorVotePayment & {
  matched_reference?: string | null;
  matched_external_reference?: string | null;
  matched_status?: string | null;
  matched_amount_xaf?: number | null;
  matched_currency?: string | null;
  matched_transaction_date?: string | null;
  matched_updated_at?: string | null;
};

export type PanacheDorPaymentSummary = {
  pending: number;
  completed: number;
  failed: number;
  cancelled: number;
  total_votes: number;
  total_amount_xaf: number;
};

export type PanacheDorPaidPendingSummary = {
  count: number;
  visible_count?: number;
  total_votes: number;
  total_amount_xaf: number;
  sync_available?: boolean;
  sync_error?: string | null;
  cutoff?: string | null;
};

export type PanacheDorVotingPayload = {
  categories: PanacheDorAwardCategory[];
  total_nominees: number;
  total_votes?: number;
  counts_available: boolean;
  blind_voting?: boolean;
  results_publish_at?: string;
  results_publish_label?: string;
  voting_ends_at?: string;
  voting_ends_label?: string;
  voting_closed?: boolean;
  vote_provider?: string;
  vote_provider_name?: string;
  vote_provider_sync_configured?: boolean;
  vote_provider_leaderboard_url?: string | null;
  ayati_sync_configured: boolean;
  ayati_leaderboard_url?: string | null;
  last_synced_at?: string | null;
  payment?: PanacheDorPaymentSettings;
  payments?: PanacheDorVotePayment[];
  payment_summary?: PanacheDorPaymentSummary;
  paid_pending_payments?: PanacheDorPaidPendingPayment[];
  paid_pending_summary?: PanacheDorPaidPendingSummary;
  admin?: boolean;
};

export type Panache360AwardCategoryRow = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  status: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type Panache360AwardNomineeRow = {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  organization?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  status: string;
  sort_order: number;
  ayati_vote_url?: string | null;
  ayati_sync_id?: string | null;
  ayati_vote_count?: number;
  ayati_last_synced_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Panache360AwardNominee = Panache360AwardNomineeRow & {
  vote_url?: string | null;
  vote_count?: number;
  vote_provider_sync_id?: string | null;
  vote_last_synced_at?: string | null;
};

export type Panache360AwardCategory = Panache360AwardCategoryRow & {
  vote_count?: number;
  nominees: Panache360AwardNominee[];
};

export type Panache360PaymentSettings = PanacheDorPaymentSettings;

export type Panache360VotePayment = Omit<
  PanacheDorVotePayment,
  'nominee' | 'category'
> & {
  nominee?: Pick<Panache360AwardNomineeRow, 'name' | 'slug'> | null;
  category?: Pick<Panache360AwardCategoryRow, 'name' | 'slug'> | null;
};

export type Panache360PaidPendingPayment = Panache360VotePayment & {
  matched_reference?: string | null;
  matched_external_reference?: string | null;
  matched_status?: string | null;
  matched_amount_xaf?: number | null;
  matched_currency?: string | null;
  matched_transaction_date?: string | null;
  matched_updated_at?: string | null;
};

export type Panache360PaymentSummary = PanacheDorPaymentSummary;
export type Panache360PaidPendingSummary = PanacheDorPaidPendingSummary;

export type Panache360VotingPayload = {
  categories: Panache360AwardCategory[];
  total_nominees: number;
  total_votes?: number;
  counts_available: boolean;
  blind_voting?: boolean;
  results_publish_at?: string;
  results_publish_label?: string;
  competition_weight_percent?: number;
  vote_provider?: string;
  vote_provider_name?: string;
  vote_provider_sync_configured?: boolean;
  vote_provider_leaderboard_url?: string | null;
  ayati_sync_configured: boolean;
  ayati_leaderboard_url?: string | null;
  last_synced_at?: string | null;
  payment?: Panache360PaymentSettings;
  payments?: Panache360VotePayment[];
  payment_summary?: Panache360PaymentSummary;
  paid_pending_payments?: Panache360PaidPendingPayment[];
  paid_pending_summary?: Panache360PaidPendingSummary;
  admin?: boolean;
};

export type PanacheDorVoteInitializePayload = {
  nomineeId: string;
  voterEmail?: string;
  voteCount: number;
};

export type Panache360VoteInitializePayload = PanacheDorVoteInitializePayload;

export type PanacheDorVoteReceipt = {
  id: string;
  tx_ref: string;
  reference?: string | null;
  nominee_id: string;
  nominee_name: string;
  nominee_slug?: string | null;
  category_id: string;
  category_name: string;
  category_slug?: string | null;
  voter_email?: string | null;
  voter_whatsapp?: string | null;
  vote_count: number;
  amount_xaf: number;
  currency: string;
  status: string;
  verified_at?: string | null;
};

export type PanacheDorVoteInitializeResponse = {
  payment: {
    id: string;
    tx_ref: string;
    reference?: string | null;
    payment_link: string;
    redirect_url?: string;
    amount_xaf: number;
    currency: string;
    vote_count: number;
    nominee_name: string;
    category_name: string;
  };
};

export type Panache360VoteInitializeResponse = PanacheDorVoteInitializeResponse;

export type PanacheDorVoteVerifyResponse = {
  status: 'success' | 'pending' | 'failed' | 'already-counted' | string;
  message?: string;
  receipt?: PanacheDorVoteReceipt;
  voting?: PanacheDorVotingPayload;
};

export type Panache360VoteReceipt = PanacheDorVoteReceipt;

export type Panache360VoteVerifyResponse = {
  status: 'success' | 'pending' | 'failed' | 'already-counted' | string;
  message?: string;
  receipt?: Panache360VoteReceipt;
  voting?: Panache360VotingPayload;
};

export type MissPanacheAwardCategoryRow = Panache360AwardCategoryRow;
export type MissPanacheAwardNomineeRow = Panache360AwardNomineeRow;
export type MissPanacheAwardNominee = MissPanacheAwardNomineeRow & {
  vote_url?: string | null;
  vote_count?: number;
  vote_provider_sync_id?: string | null;
  vote_last_synced_at?: string | null;
};
export type MissPanacheAwardCategory = MissPanacheAwardCategoryRow & {
  vote_count?: number;
  nominees: MissPanacheAwardNominee[];
};
export type MissPanachePaymentSettings = PanacheDorPaymentSettings;
export type MissPanacheVotePayment = Omit<
  PanacheDorVotePayment,
  'nominee' | 'category'
> & {
  nominee?: Pick<MissPanacheAwardNomineeRow, 'name' | 'slug'> | null;
  category?: Pick<MissPanacheAwardCategoryRow, 'name' | 'slug'> | null;
};
export type MissPanachePaidPendingPayment = MissPanacheVotePayment & {
  matched_reference?: string | null;
  matched_external_reference?: string | null;
  matched_status?: string | null;
  matched_amount_xaf?: number | null;
  matched_currency?: string | null;
  matched_transaction_date?: string | null;
  matched_updated_at?: string | null;
};
export type MissPanachePaymentSummary = PanacheDorPaymentSummary;
export type MissPanachePaidPendingSummary = PanacheDorPaidPendingSummary;
export type MissPanacheVotingPayload = {
  categories: MissPanacheAwardCategory[];
  total_nominees: number;
  total_votes?: number;
  counts_available: boolean;
  blind_voting?: boolean;
  results_publish_at?: string;
  results_publish_label?: string;
  competition_weight_percent?: number;
  vote_provider?: string;
  vote_provider_name?: string;
  vote_provider_sync_configured?: boolean;
  vote_provider_leaderboard_url?: string | null;
  ayati_sync_configured: boolean;
  ayati_leaderboard_url?: string | null;
  last_synced_at?: string | null;
  payment?: MissPanachePaymentSettings;
  payments?: MissPanacheVotePayment[];
  payment_summary?: MissPanachePaymentSummary;
  paid_pending_payments?: MissPanachePaidPendingPayment[];
  paid_pending_summary?: MissPanachePaidPendingSummary;
  admin?: boolean;
};
export type MissPanacheVoteInitializePayload = PanacheDorVoteInitializePayload;
export type MissPanacheVoteReceipt = PanacheDorVoteReceipt;
export type MissPanacheVoteInitializeResponse = PanacheDorVoteInitializeResponse;
export type MissPanacheVoteVerifyResponse = {
  status: 'success' | 'pending' | 'failed' | 'already-counted' | string;
  message?: string;
  receipt?: MissPanacheVoteReceipt;
  voting?: MissPanacheVotingPayload;
};

export type EventTicketPackage = {
  id: string;
  event_id: string;
  slug: string;
  name: string;
  description?: string | null;
  price_xaf: number;
  admit_count: number;
  benefits: string[];
  status: string;
  sort_order: number;
  style_key: string;
  created_at?: string;
  updated_at?: string;
};

export type EventTicketEvent = {
  id: string;
  slug: string;
  title: string;
  short_title: string;
  event_date: string;
  event_date_label: string;
  venue: string;
  brand: 'cyes' | 'panache-dor' | string;
  packages: EventTicketPackage[];
};

export type EventTicketPaymentSettings = {
  provider: string;
  provider_name: string;
  payments_configured: boolean;
  currency: string;
  demo_mode?: boolean;
  demo_payment_amount_xaf?: number | null;
};

export type EventTicketsPayload = {
  event: EventTicketEvent;
  payment: EventTicketPaymentSettings;
};

export type EventTicketInitializePayload = {
  eventSlug: string;
  packageSlug: string;
  buyerName: string;
  buyerEmail: string;
  buyerWhatsapp?: string;
  whatsappConsent?: boolean;
};

export type EventTicketInitializeResponse = {
  order: {
    id: string;
    tx_ref: string;
    reference?: string | null;
    payment_link: string;
    amount_xaf: number;
    currency: string;
    event_title: string;
    package_name: string;
    redirect_url?: string;
  };
};

export type EventTicketIssued = {
  id: string;
  ticket_code: string;
  qr_token: string;
  buyer_name: string;
  buyer_email: string;
  buyer_whatsapp?: string | null;
  admit_count: number;
  checked_in_count: number;
  status: string;
  issued_at: string;
  check_in_url: string;
  download_url: string;
  qr_image_data_url: string;
  event: Omit<EventTicketEvent, 'packages'>;
  package: EventTicketPackage;
  order: {
    id: string;
    tx_ref: string;
    reference?: string | null;
    amount_xaf: number;
    currency: string;
    status: string;
  };
};

export type EventTicketVerifyResponse = {
  status: 'success' | 'pending' | 'failed' | 'already-counted' | string;
  message?: string;
  ticket?: EventTicketIssued;
  email?: EventTicketContestantBasePassResponse['email'];
};

export type ContestantBasePassSource =
  | 'panache-dor'
  | 'panache-360'
  | 'miss-panache'
  | 'cyes';

export type EventTicketContestantBasePassPayload = {
  source: ContestantBasePassSource;
  slug: string;
  password: string;
  buyerName: string;
  buyerEmail: string;
  buyerWhatsapp?: string;
  whatsappConsent?: boolean;
};

export type EventTicketContestantBasePassResponse = {
  status: 'success' | 'already-created' | string;
  message?: string;
  contestant?: {
    id: string;
    slug: string;
    name: string;
    category_name?: string | null;
    category_slug?: string | null;
    total_votes?: number;
  };
  ticket?: EventTicketIssued;
  email?: {
    attempted?: boolean;
    ok?: boolean;
    skipped?: boolean;
    message?: string;
    error?: string;
  };
};

export type EventTicketStaffTicket = {
  id: string;
  ticket_code: string;
  buyer_name: string;
  buyer_email: string;
  buyer_whatsapp?: string | null;
  admit_count: number;
  checked_in_count: number;
  remaining_count: number;
  status: string;
  issued_at: string;
  last_checked_in_at?: string | null;
  event: Omit<EventTicketEvent, 'packages'>;
  package: EventTicketPackage;
  order_status?: string;
};

type CompetitionApplicationSubmitPayload =
  Omit<CompetitionApplicationInsert, 'id' | 'created_at' | 'updated_at'> & {
    competitionTitle?: string;
    postSubmitHref?: string;
    paymentMode?: string;
    notificationEmails?: string[];
    [key: string]: unknown;
  };

export type CompetitionApplicationNotificationResult = {
  attempted?: boolean;
  ok?: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
  raw?: unknown;
};

export type CompetitionApplicationSubmitResponse = {
  application: CompetitionApplication | null;
  notification?: CompetitionApplicationNotificationResult;
};

// Contact Submissions Service
export const contactService = {
  async submit(data: Omit<ContactSubmission, 'id' | 'created_at'>) {
    const { error } = await supabase
      .from('contact_submissions')
      .insert([data]);
    
    if (error) throw error;
    return null;
  },

  async getSubmissions(userId?: string) {
    let query = supabase.from('contact_submissions').select();
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async deleteSubmission(id: string) {
    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Competition Applications Service
export const competitionApplicationService = {
  async submit(data: CompetitionApplicationSubmitPayload) {
    const endpoint =
      import.meta.env.VITE_COMPETITION_API_URL ||
      '/api/competition-applications';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          application?: CompetitionApplication;
          notification?: CompetitionApplicationNotificationResult;
          message?: string;
        }
      | null;

    if (!response.ok || !payload) {
      throw new Error(
        payload?.message ||
          `Could not submit the registration (${response.statusText || 'request failed'}).`
      );
    }

    return {
      application: payload.application || null,
      notification: payload.notification,
    } satisfies CompetitionApplicationSubmitResponse;
  },
};

// CYES Voting Service
const CYES_VOTING_API_URL =
  import.meta.env.VITE_CYES_VOTING_API_URL || '/api/cyes-voting';

const readCyesVotingResponse = async (response: Response) => {
  return (await response.json().catch(() => null)) as
    | {
        message?: string;
        voting?: CYESVotingPayload;
        captcha?: {
          id: string;
          question: string;
          expiresAt: number;
        };
        voteStatus?: CYESVoteStatus;
        expiresAt?: string;
        vote?: Pick<
          CYESAwardVote,
          'id' | 'category_id' | 'nominee_id' | 'status' | 'created_at'
        >;
      }
    | null;
};

export const cyesVotingService = {
  async getVoting() {
    const response = await fetch(CYES_VOTING_API_URL);
    const payload = await readCyesVotingResponse(response);

    if (!response.ok || !payload?.voting) {
      throw new Error(payload?.message || 'Could not load CYES voting.');
    }

    return payload.voting;
  },

  async getCaptchaChallenge() {
    const response = await fetch(`${CYES_VOTING_API_URL}?captcha=1`);
    const payload = await readCyesVotingResponse(response);

    if (!response.ok || !payload?.captcha) {
      throw new Error(payload?.message || 'Could not load CAPTCHA.');
    }

    return payload.captcha;
  },

  async requestOtp(data: CYESVoteRequestPayload) {
    const response = await fetch(CYES_VOTING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'requestOtp',
        ...data,
      }),
    });
    const payload = await readCyesVotingResponse(response);

    if (!response.ok) {
      throw new Error(payload?.message || 'Could not send the OTP.');
    }

    return payload;
  },

  async castVote(data: CYESVoteCastPayload) {
    const response = await fetch(CYES_VOTING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'castVote',
        ...data,
      }),
    });
    const payload = await readCyesVotingResponse(response);

    if (!response.ok || !payload?.voting) {
      throw new Error(payload?.message || 'Could not record the vote.');
    }

    return payload;
  },
};

// Panache D'or voting directory service
const PANACHE_DOR_VOTING_API_URL =
  import.meta.env.VITE_PANACHE_DOR_VOTING_API_URL ||
  '/api/panache-dor-voting';

const readPanacheDorVotingResponse = async (response: Response) => {
  return (await response.json().catch(() => null)) as
    | {
        message?: string;
        voting?: PanacheDorVotingPayload;
        payment?: PanacheDorVoteInitializeResponse['payment'];
        status?: string;
        receipt?: PanacheDorVoteReceipt;
      }
    | null;
};

export const panacheDorVotingService = {
  async getVoting() {
    const response = await fetch(PANACHE_DOR_VOTING_API_URL);
    const payload = await readPanacheDorVotingResponse(response);

    if (!response.ok || !payload?.voting) {
      throw new Error(payload?.message || "Could not load Panache D'or nominees.");
    }

    return payload.voting;
  },

  async initializeCampayVote(data: PanacheDorVoteInitializePayload) {
    const response = await fetch(PANACHE_DOR_VOTING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'initializeCampayVote',
        nomineeId: data.nomineeId,
        voterEmail: data.voterEmail,
        voteCount: data.voteCount,
      }),
    });
    const payload = await readPanacheDorVotingResponse(response);

    if (!response.ok || !payload?.payment) {
      throw new Error(payload?.message || "Could not start the secure payment.");
    }

    return payload as PanacheDorVoteInitializeResponse;
  },

  async verifyCampayVote(data: { txRef?: string; reference?: string }) {
    const response = await fetch(PANACHE_DOR_VOTING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'verifyCampayVote',
        tx_ref: data.txRef,
        reference: data.reference,
      }),
    });
    const payload = await readPanacheDorVotingResponse(response);

    if (!response.ok || !payload?.status) {
      throw new Error(payload?.message || "Could not verify the payment.");
    }

    return payload as PanacheDorVoteVerifyResponse;
  },
};

// Panache 360 voting service
const PANACHE_360_VOTING_API_URL =
  import.meta.env.VITE_PANACHE_360_VOTING_API_URL ||
  '/api/panache-360-voting';

const readPanache360VotingResponse = async (response: Response) => {
  return (await response.json().catch(() => null)) as
    | {
        message?: string;
        voting?: Panache360VotingPayload;
        payment?: Panache360VoteInitializeResponse['payment'];
        status?: string;
        receipt?: Panache360VoteReceipt;
      }
    | null;
};

export const panache360VotingService = {
  async getVoting() {
    const response = await fetch(PANACHE_360_VOTING_API_URL);
    const payload = await readPanache360VotingResponse(response);

    if (!response.ok || !payload?.voting) {
      throw new Error(payload?.message || 'Could not load Panache 360 contestants.');
    }

    return payload.voting;
  },

  async initializeCampayVote(data: Panache360VoteInitializePayload) {
    const response = await fetch(PANACHE_360_VOTING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'initializeCampayVote',
        nomineeId: data.nomineeId,
        voterEmail: data.voterEmail,
        voteCount: data.voteCount,
      }),
    });
    const payload = await readPanache360VotingResponse(response);

    if (!response.ok || !payload?.payment) {
      throw new Error(payload?.message || 'Could not start the secure payment.');
    }

    return payload as Panache360VoteInitializeResponse;
  },

  async verifyCampayVote(data: { txRef?: string; reference?: string }) {
    const response = await fetch(PANACHE_360_VOTING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'verifyCampayVote',
        tx_ref: data.txRef,
        reference: data.reference,
      }),
    });
    const payload = await readPanache360VotingResponse(response);

    if (!response.ok || !payload?.status) {
      throw new Error(payload?.message || 'Could not verify the payment.');
    }

    return payload as Panache360VoteVerifyResponse;
  },
};

// Miss Panache voting service
const MISS_PANACHE_VOTING_API_URL =
  import.meta.env.VITE_MISS_PANACHE_VOTING_API_URL ||
  '/api/miss-panache-voting';

const readMissPanacheVotingResponse = async (response: Response) => {
  return (await response.json().catch(() => null)) as
    | {
        message?: string;
        voting?: MissPanacheVotingPayload;
        payment?: MissPanacheVoteInitializeResponse['payment'];
        status?: string;
        receipt?: MissPanacheVoteReceipt;
      }
    | null;
};

export const missPanacheVotingService = {
  async getVoting() {
    const response = await fetch(MISS_PANACHE_VOTING_API_URL);
    const payload = await readMissPanacheVotingResponse(response);

    if (!response.ok || !payload?.voting) {
      throw new Error(payload?.message || 'Could not load Miss Panache contestants.');
    }

    return payload.voting;
  },

  async initializeCampayVote(data: MissPanacheVoteInitializePayload) {
    const response = await fetch(MISS_PANACHE_VOTING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'initializeCampayVote',
        nomineeId: data.nomineeId,
        voterEmail: data.voterEmail,
        voteCount: data.voteCount,
      }),
    });
    const payload = await readMissPanacheVotingResponse(response);

    if (!response.ok || !payload?.payment) {
      throw new Error(payload?.message || 'Could not start the secure payment.');
    }

    return payload as MissPanacheVoteInitializeResponse;
  },

  async verifyCampayVote(data: { txRef?: string; reference?: string }) {
    const response = await fetch(MISS_PANACHE_VOTING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'verifyCampayVote',
        tx_ref: data.txRef,
        reference: data.reference,
      }),
    });
    const payload = await readMissPanacheVotingResponse(response);

    if (!response.ok || !payload?.status) {
      throw new Error(payload?.message || 'Could not verify the payment.');
    }

    return payload as MissPanacheVoteVerifyResponse;
  },
};

// Event ticketing service
const EVENT_TICKETS_API_URL =
  import.meta.env.VITE_EVENT_TICKETS_API_URL || '/api/event-tickets';

const readEventTicketsResponse = async (response: Response) => {
  return (await response.json().catch(() => null)) as
    | (Partial<EventTicketsPayload> &
        Partial<EventTicketInitializeResponse> &
        Partial<EventTicketVerifyResponse> & {
          message?: string;
          contestant?: EventTicketContestantBasePassResponse['contestant'];
          email?: EventTicketContestantBasePassResponse['email'];
          tickets?: EventTicketStaffTicket[];
          checked_in_count?: number;
        })
    | null;
};

export const eventTicketsService = {
  async getEvent(eventSlug: string) {
    const response = await fetch(
      `${EVENT_TICKETS_API_URL}?eventSlug=${encodeURIComponent(eventSlug)}`
    );
    const payload = await readEventTicketsResponse(response);

    if (!response.ok || !payload?.event || !payload?.payment) {
      throw new Error(payload?.message || 'Could not load tickets.');
    }

    return payload as EventTicketsPayload;
  },

  async initializePayment(data: EventTicketInitializePayload) {
    const response = await fetch(EVENT_TICKETS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'initializeTicketPayment',
        ...data,
      }),
    });
    const payload = await readEventTicketsResponse(response);

    if (!response.ok || !payload?.order) {
      throw new Error(payload?.message || 'Could not start ticket payment.');
    }

    return payload as EventTicketInitializeResponse;
  },

  async verifyPayment(data: { txRef?: string; reference?: string }) {
    const response = await fetch(EVENT_TICKETS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'verifyTicketPayment',
        tx_ref: data.txRef,
        reference: data.reference,
      }),
    });
    const payload = await readEventTicketsResponse(response);

    if (!response.ok || !payload?.status) {
      throw new Error(payload?.message || 'Could not verify ticket payment.');
    }

    return payload as EventTicketVerifyResponse;
  },

  async createContestantBasePass(data: EventTicketContestantBasePassPayload) {
    const response = await fetch(EVENT_TICKETS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'createContestantBasePass',
        ...data,
      }),
    });
    const payload = await readEventTicketsResponse(response);

    if (!response.ok || !payload?.status || !payload?.ticket) {
      throw new Error(payload?.message || 'Could not create the base event pass.');
    }

    return payload as EventTicketContestantBasePassResponse;
  },

  async lookupTicket(data: {
    accessKey: string;
    ticketCode?: string;
    token?: string;
    search?: string;
  }) {
    const response = await fetch(EVENT_TICKETS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-dashboard-key': data.accessKey,
      },
      body: JSON.stringify({
        action: 'lookupTicket',
        ticketCode: data.ticketCode,
        token: data.token,
        search: data.search,
      }),
    });
    const payload = await readEventTicketsResponse(response);

    if (!response.ok || !payload?.tickets) {
      throw new Error(payload?.message || 'Could not find ticket.');
    }

    return payload.tickets;
  },

  async checkInTicket(data: {
    accessKey: string;
    ticketCode: string;
    token?: string;
    count: number;
    checkedInBy?: string;
    method?: 'qr' | 'manual';
  }) {
    const response = await fetch(EVENT_TICKETS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-dashboard-key': data.accessKey,
      },
      body: JSON.stringify({
        action: 'checkInTicket',
        ticketCode: data.ticketCode,
        token: data.token,
        count: data.count,
        checkedInBy: data.checkedInBy,
        method: data.method,
      }),
    });
    const payload = await readEventTicketsResponse(response);

    if (!response.ok || !payload?.ticket) {
      throw new Error(payload?.message || 'Could not check in ticket.');
    }

    return {
      ticket: payload.ticket as EventTicketStaffTicket,
      checked_in_count: payload.checked_in_count || data.count,
    };
  },
};

// Profiles Service
export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, created_at, updated_at')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data as Profile;
  },

  async updateProfile(userId: string, updates: Partial<Omit<Profile, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select('id, first_name, last_name, created_at, updated_at')
      .single();
    
    if (error) throw error;
    return data as Profile;
  },
};

// Auth Service
export const authService = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
};
