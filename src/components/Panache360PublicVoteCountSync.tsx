import type { Panache360VotingPayload } from "@/integrations/supabase/services";
import { panache360VotingService } from "@/integrations/supabase/services";
import { queryKeys } from "@/hooks/useSupabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const PANACHE_360_PUBLIC_COUNTS_API_URL =
  import.meta.env.VITE_PANACHE_360_PUBLIC_COUNTS_API_URL ||
  "/api/panache-360-public-counts";

type PublicCount = {
  nominee_id: string;
  total_votes: number;
};

type PublicCountControl = {
  visible: boolean;
  updated_at?: string | null;
  counts: PublicCount[];
};

type ControlledPanache360VotingPayload = Panache360VotingPayload & {
  public_vote_counts_visible?: boolean;
  public_vote_counts_signature?: string;
};

const isPanache360Path = (pathname: string) =>
  pathname.startsWith("/panache-expo/panache-360");

const getControlSignature = (control: PublicCountControl) =>
  `${control.visible ? "visible" : "hidden"}:${control.updated_at || ""}:${control.counts
    .map((row) => `${row.nominee_id}:${Number(row.total_votes || 0)}`)
    .join("|")}`;

const applyCountControl = (
  voting: Panache360VotingPayload,
  control: PublicCountControl
): ControlledPanache360VotingPayload => {
  const countsByNominee = new Map(
    control.counts.map((row) => [row.nominee_id, Number(row.total_votes || 0)])
  );
  let totalVotes = 0;

  const categories = voting.categories.map((category) => {
    let categoryVotes = 0;
    const nominees = category.nominees.map((nominee) => {
      const voteCount = control.visible
        ? countsByNominee.get(nominee.id) || 0
        : 0;
      categoryVotes += voteCount;
      totalVotes += voteCount;

      return {
        ...nominee,
        vote_count: voteCount,
        ayati_vote_count: voteCount,
      };
    });

    return {
      ...category,
      vote_count: categoryVotes,
      nominees,
    };
  });

  return {
    ...voting,
    categories,
    total_votes: totalVotes,
    counts_available: control.visible,
    blind_voting: !control.visible,
    public_vote_counts_visible: control.visible,
    public_vote_counts_signature: getControlSignature(control),
  };
};

export const Panache360PublicVoteCountSync = () => {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const active = isPanache360Path(pathname);
  const [control, setControl] = useState<PublicCountControl | null>(null);

  const { data: voting } = useQuery({
    queryKey: queryKeys.panache360Voting.public,
    queryFn: panache360VotingService.getVoting,
    enabled: active,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!active) {
      setControl(null);
      return;
    }

    let cancelled = false;

    const loadControl = async () => {
      try {
        const response = await fetch(PANACHE_360_PUBLIC_COUNTS_API_URL, {
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as
          | {
              visible?: boolean;
              updated_at?: string | null;
              counts?: PublicCount[];
            }
          | null;

        if (!response.ok || !payload || cancelled) {
          return;
        }

        setControl({
          visible: Boolean(payload.visible),
          updated_at: payload.updated_at || null,
          counts: Array.isArray(payload.counts) ? payload.counts : [],
        });
      } catch {
        // Keep the last known public state if the visibility feed is temporarily unavailable.
      }
    };

    void loadControl();
    const interval = window.setInterval(loadControl, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [active]);

  const controlSignature = useMemo(
    () => (control ? getControlSignature(control) : ""),
    [control]
  );

  useEffect(() => {
    if (!active || !voting || !control) {
      return;
    }

    const currentVoting = voting as ControlledPanache360VotingPayload;
    if (currentVoting.public_vote_counts_signature === controlSignature) {
      return;
    }

    queryClient.setQueryData(
      queryKeys.panache360Voting.public,
      applyCountControl(voting, control)
    );
  }, [active, control, controlSignature, queryClient, voting]);

  return null;
};
