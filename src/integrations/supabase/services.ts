import { supabase } from './client';
import type { Database } from './types';

// Type helpers for better DX
export type Tables = Database['public']['Tables'];
export type ContactSubmission = Tables['contact_submissions']['Row'];
export type CompetitionApplication = Tables['competition_applications']['Row'];
export type CYESAwardCategoryRow = Tables['cyes_award_categories']['Row'];
export type CYESAwardNomineeRow = Tables['cyes_award_nominees']['Row'];
export type CYESAwardVote = Tables['cyes_award_votes']['Row'];
export type Profile = Tables['profiles']['Row'];
export type CompetitionApplicationInsert = Tables['competition_applications']['Insert'];

export type CYESAwardNominee = CYESAwardNomineeRow & {
  vote_count: number;
};

export type CYESAwardCategory = CYESAwardCategoryRow & {
  vote_count: number;
  nominees: CYESAwardNominee[];
};

export type CYESVotingPayload = {
  categories: CYESAwardCategory[];
  total_votes: number;
};

export type CYESVoteRequestPayload = {
  categoryId: string;
  nomineeId: string;
  voterName: string;
  voterPhone: string;
  voterEmail?: string;
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
        vote?: Pick<CYESAwardVote, 'id' | 'category_id' | 'nominee_id' | 'created_at'>;
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
