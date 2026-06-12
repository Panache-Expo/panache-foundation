import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MissPanacheVotingPayload } from '@/integrations/supabase/services';

export const useMissPanachePublicVoting = () => {
  return useQuery({
    queryKey: ['missPanacheVoting', 'public-visible'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc(
        'get_miss_panache_public_voting'
      );

      if (error || !data) {
        throw error || new Error('Could not load Miss Panache voting.');
      }

      return data as MissPanacheVotingPayload;
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};
