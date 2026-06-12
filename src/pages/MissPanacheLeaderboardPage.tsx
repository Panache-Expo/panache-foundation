import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  MissPanacheAwardCategory,
  MissPanacheAwardNominee,
  MissPanacheVotingPayload,
} from "@/integrations/supabase/services";
import { supabase } from "@/integrations/supabase/client";
import MissPanacheHero from "@/assets/misspanacheupdate.jpg";
import {
  Award,
  BarChart3,
  Loader2,
  Medal,
  RefreshCw,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type RankedNominee = MissPanacheAwardNominee & {
  category: MissPanacheAwardCategory;
};

type RankedCategory = MissPanacheAwardCategory & {
  rankedNominees: RankedNominee[];
};

const getVoteCount = (nominee: RankedNominee) =>
  nominee.vote_count ?? nominee.ayati_vote_count ?? 0;

const rankNominees = (categories: MissPanacheAwardCategory[]) =>
  categories
    .flatMap((category) =>
      category.nominees.map((nominee) => ({
        ...nominee,
        category,
      }))
    )
    .sort((left, right) => {
      if (getVoteCount(right) !== getVoteCount(left)) {
        return getVoteCount(right) - getVoteCount(left);
      }
      return left.name.localeCompare(right.name);
    });

const rankNomineesInCategory = (
  category: MissPanacheAwardCategory
): RankedNominee[] =>
  category.nominees
    .map((nominee) => ({
      ...nominee,
      category,
    }))
    .sort((left, right) => {
      if (getVoteCount(right) !== getVoteCount(left)) {
        return getVoteCount(right) - getVoteCount(left);
      }
      return left.name.localeCompare(right.name);
    });

const NomineeLeaderboardRow = ({
  nominee,
  rank,
}: {
  nominee: RankedNominee;
  rank: number;
}) => (
  <article className="grid gap-4 rounded-[1.35rem] border border-black/8 bg-white/78 p-4 md:grid-cols-[auto_74px_1fr_auto] md:items-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#171411] font-sans text-sm font-semibold text-white">
      {rank <= 3 ? <Medal className="h-5 w-5" /> : `#${rank}`}
    </div>
    <div className="h-[4.6rem] w-[4.6rem] overflow-hidden rounded-[1rem] bg-[#f8f2e8]">
      {nominee.photo_url ? (
        <img
          src={nominee.photo_url}
          alt={nominee.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Award className="h-7 w-7 text-[#171411]/34" />
        </div>
      )}
    </div>
    <div className="min-w-0">
      <Link
        to={`/panache-expo/miss-panache/contestants/${nominee.slug}`}
        className="font-sans text-[1.08rem] font-semibold leading-tight text-[#171411] transition-opacity hover:opacity-70"
      >
        {nominee.name}
      </Link>
      {nominee.organization ? (
        <p className="mt-1 font-sans text-sm text-[#8241B6]">
          {nominee.organization}
        </p>
      ) : null}
      <p className="mt-2 font-sans text-sm text-[#171411]/58">
        {nominee.category.name}
      </p>
    </div>
    <div className="flex flex-wrap items-center gap-2 md:justify-end">
      <Badge className="rounded-full bg-[#f8f2e8] px-4 py-2 text-[#171411] hover:bg-[#f8f2e8]">
        {getVoteCount(nominee).toLocaleString()} votes
      </Badge>
      <Button
        asChild
        size="sm"
        className="rounded-full bg-[#171411] text-white hover:bg-[#171411]/92"
      >
        <Link to={`/panache-expo/miss-panache/contestants/${nominee.slug}`}>
          Vote securely
        </Link>
      </Button>
    </div>
  </article>
);

const MissPanacheLeaderboardPage = () => {
  const [voting, setVoting] = useState<MissPanacheVotingPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadVoting = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await (supabase as any).rpc(
        "get_miss_panache_public_voting"
      );

      if (rpcError) {
        throw rpcError;
      }

      setVoting(data as MissPanacheVotingPayload);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError
          : new Error("Could not load Miss Panache leaderboard.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadVoting();
  }, []);

  const categories = useMemo(() => voting?.categories || [], [voting?.categories]);
  const rankedNominees = useMemo(() => rankNominees(categories), [categories]);
  const rankedCategories = useMemo<RankedCategory[]>(
    () =>
      categories
        .map((category) => ({
          ...category,
          rankedNominees: rankNomineesInCategory(category),
        }))
        .filter((category) => category.rankedNominees.length > 0),
    [categories]
  );

  return (
    <div className="min-h-screen bg-[#f4f3ef]">
      <Header />

      <main className="pb-20 pt-24 md:pb-24">
        <section className="mx-auto grid max-w-7xl gap-10 px-6 md:px-10 lg:grid-cols-[0.56fr_0.44fr] lg:items-center">
          <div>
            <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
              People&apos;s Choice leaderboard
            </p>
            <h1 className="mt-4 font-sans text-[clamp(3.2rem,7vw,6rem)] font-semibold leading-[0.86] tracking-[-0.08em] text-[#171411]">
              Overall Public
              <span className="block font-display text-[#8241B6]">Ranking</span>
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-[#171411]/70">
              Votes are now publicly visible. This ranking updates from completed
              verified payments only and counts for {voting?.competition_weight_percent || 25}% of the final competition score.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
              >
                <Link to="/panache-expo/miss-panache/vote">
                  Choose a voting category
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative min-h-[24rem] overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_24px_64px_rgba(17,16,14,0.10)]">
            <img
              src={MissPanacheHero}
              alt="Miss Panache beauty contest"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#171411]/84 via-[#171411]/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <Badge className="rounded-full bg-white text-[#171411] hover:bg-white">
                Overall ranking synced
              </Badge>
              <p className="mt-4 max-w-md font-sans text-2xl font-semibold leading-tight tracking-[-0.05em] text-white">
                The People&apos;s Choice ranking is now visible to the public.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-6xl px-6 md:px-10">
          {isLoading ? (
            <div className="mt-8 flex items-center gap-3 rounded-[2rem] border border-black/8 bg-white px-6 py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[#8241B6]" />
              <p className="font-sans text-sm text-[#171411]/68">
                Loading leaderboard...
              </p>
            </div>
          ) : error ? (
            <div className="mt-8 rounded-[2rem] border border-black/8 bg-white px-6 py-8">
              <p className="font-sans text-sm text-destructive">
                {error.message || "Could not load leaderboard."}
              </p>
              <Button
                type="button"
                className="mt-4 rounded-full bg-[#171411] text-white hover:bg-[#171411]/92"
                onClick={() => void loadVoting()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : rankedNominees.length ? (
            <>
              <div className="rounded-[2rem] border border-[#8241B6]/18 bg-white p-6 md:p-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#f8f2e8] px-4 py-2 font-sans text-sm font-semibold text-[#8241B6]">
                  <BarChart3 className="h-4 w-4" />
                  {voting?.total_votes?.toLocaleString() || 0} verified votes
                </div>
                <h2 className="mt-5 font-sans text-[clamp(2rem,4vw,3rem)] font-semibold leading-[0.95] tracking-[-0.06em] text-[#171411]">
                  Live Miss Panache vote counts
                </h2>
                <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-[#171411]/66">
                  All visible numbers come from completed verified payments only.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                {rankedNominees.map((nominee, index) => (
                  <NomineeLeaderboardRow
                    key={nominee.id}
                    nominee={nominee}
                    rank={index + 1}
                  />
                ))}
              </div>

              <div className="mt-12">
                <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                  Rankings by category
                </p>
                <h2 className="mt-3 font-sans text-[clamp(2.1rem,4vw,3.4rem)] font-semibold leading-[0.94] tracking-[-0.07em] text-[#171411]">
                  Category leaderboards
                </h2>
                <div className="mt-6 space-y-6">
                  {rankedCategories.map((category) => (
                    <section
                      key={category.id}
                      className="rounded-[1.8rem] border border-black/8 bg-[#f8f2e8] p-4 md:p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="font-sans text-2xl font-semibold tracking-[-0.05em] text-[#171411]">
                            {category.name}
                          </h3>
                          <p className="mt-1 font-sans text-sm text-[#171411]/58">
                            Ranks restart inside this category.
                          </p>
                        </div>
                        <Badge className="rounded-full bg-white px-4 py-2 text-[#171411] hover:bg-white">
                          {category.vote_count?.toLocaleString() || 0} votes
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-3">
                        {category.rankedNominees.map((nominee, index) => (
                          <NomineeLeaderboardRow
                            key={`${category.id}-${nominee.id}`}
                            nominee={nominee}
                            rank={index + 1}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="mt-8 rounded-[2rem] border border-dashed border-black/12 bg-white px-6 py-10 text-center">
              <Trophy className="mx-auto h-10 w-10 text-[#171411]/32" />
              <p className="mt-4 font-sans text-sm text-[#171411]/68">
                No public Miss Panache contestants are available yet.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default MissPanacheLeaderboardPage;
