import { supabase } from './client';
import type { Database } from './types';

// Type helpers for better DX
export type Tables = Database['public']['Tables'];
export type ContactSubmission = Tables['contact_submissions']['Row'];
export type CompetitionApplication = Tables['competition_applications']['Row'];
export type Profile = Tables['profiles']['Row'];
export type CompetitionApplicationInsert = Tables['competition_applications']['Insert'];

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
  async submit(data: CompetitionApplicationInsert) {
    const { error } = await supabase
      .from('competition_applications')
      .insert([data]);

    if (error) throw error;
    return null;
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
