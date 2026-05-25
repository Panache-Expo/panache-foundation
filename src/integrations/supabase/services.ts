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

export type PanacheDorPaymentSummary = {
  pending: number;
  completed: number;
  failed: number;
  cancelled: number;
  total_votes: number;
  total_amount_xaf: number;
};

export type PanacheDorVotingPayload = {
  categories: PanacheDorAwardCategory[];
  total_nominees: number;
  total_votes?: number;
  counts_available: boolean;
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
  admin?: boolean;
};

export type PanacheDorVoteInitializePayload = {
  nomineeId: string;
  voterEmail?: string;
  voteCount: number;
};

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

export type PanacheDorVoteVerifyResponse = {
  status: 'success' | 'pending' | 'failed' | 'already-counted' | string;
  message?: string;
  receipt?: PanacheDorVoteReceipt;
  voting?: PanacheDorVotingPayload;
};

type CompetitionApplicationSubmitPayload =
  Omit<CompetitionApplicationInsert, 'id' | 'created_at' | 'updated_at'> & {
    competitionTitle?: string;
    postSubmitHref?: string;
    paymentMode?: string;
    notificationEmails?: string[];
    [key: string]: unknown;
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
      | { application?: CompetitionApplication; message?: string }
      | null;

    if (!response.ok || !payload) {
      throw new Error(
        payload?.message ||
          `Could not submit the registration (${response.statusText || 'request failed'}).`
      );
    }

    return payload.application || null;
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
