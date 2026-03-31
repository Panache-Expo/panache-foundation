/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService, profileService, authService, competitionApplicationService } from '@/integrations/supabase/services';

// Query Keys (for cache management)
export const queryKeys = {
  contact: {
    all: ['contact'] as const,
    submissions: (userId?: string) => [...queryKeys.contact.all, 'submissions', userId] as const,
  },
  competitions: {
    all: ['competitions'] as const,
    applications: ['competitions', 'applications'] as const,
  },
  profile: {
    all: ['profile'] as const,
    detail: (userId: string) => [...queryKeys.profile.all, userId] as const,
  },
  auth: {
    currentUser: ['auth', 'currentUser'] as const,
  },
};

// Contact Hooks
export const useSubmitContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contactService.submit,
    onSuccess: () => {
      // Invalidate submissions cache after successful submission
      queryClient.invalidateQueries({ queryKey: queryKeys.contact.all });
    },
  });
};

export const useContactSubmissions = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.contact.submissions(userId),
    queryFn: () => contactService.getSubmissions(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSubmitCompetitionApplication = () => {
  return useMutation({
    mutationFn: competitionApplicationService.submit,
  });
};

// Profile Hooks
export const useProfile = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.profile.detail(userId),
    queryFn: () => profileService.getProfile(userId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: any }) =>
      profileService.updateProfile(userId, updates),
    onSuccess: (data) => {
      if (data?.id) {
        queryClient.setQueryData(queryKeys.profile.detail(data.id), data);
      }
    },
  });
};

// Auth Hooks
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: authService.getCurrentUser,
    staleTime: Infinity, // Don't auto-refetch
  });
};
