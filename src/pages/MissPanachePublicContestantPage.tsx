import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MissPanacheVoteForm } from "@/components/MissPanacheVoteForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMissPanachePublicVoting } from "@/hooks/useMissPanachePublicVoting";
import {
  flattenMissPanacheNominees,
  getMissPanacheCategoryVoteUrl,
  getMissPanacheVoteCount,
  rankMissPanacheNominees,
} from "@/lib/miss-panache-ranking";
import { Award, ArrowLeft, Loader2, Trophy } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

const MissPanachePublicContestantPage = () => {
  const { slug } = useParams();
  const { data: voting, isLoading, error, refetch } = useMissPanachePublicVoting();

  const contestants = useMemo(
    () => flattenMissPanacheNominees(voting?.categories || []),
    [voting?.categories]
  );

  const contestant = contestants.find((entry) => entry.slug === slug);
  const rankedOverall = useMemo(
    () => rankMissPanacheNominees(contestants),
    [contestants]
  );
  const rankedCategory = useMemo(
    () =>
      contestant
        ? rankMissPanacheNominees(
            contestants.filter((entry) => entry.category_id === contestant.category_id)
          )
        : [],
    [contestant, contestants]
  );

  const overallRank = contestant
    ? rankedOverall.findIndex((entry) => entry.id === contestant.id) + 1
    : 0;
  const categoryRank = contestant
    ? rankedCategory.findIndex((entry) => entry.id === contestant.id) + 1
    : 0;
  const backUrl = contestant
    ? getMissPanacheCategoryVoteUrl(contestant.category.slug)
    : "/panache-expo/miss-panache/vote";

  return (
    <div className="min-h-screen bg-[#f4f3ef]">
      <Header />
      <main className="pb-20 pt-24 md:pb-24">
        <section className="mx-auto max-w-7xl px-6 md:px-10">
          <Link
            to={backUrl}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 font-sans text-sm font-semibold text-[#171411] transition-colors hover:bg-[#f8f2e8]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to contestants
          </Link>

          {isLoading ? (
            <div className="mt-8 flex items-center gap-3 rounded-[2rem] border border-black/8 bg-white px-6 py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[#8241B6]" />
              <p className="font-sans text-sm text-[#171411]/68">Loading contestant...</p>
            </div>
          ) : error ? (
            <div className="mt-8 rounded-[2rem] border border-black/8 bg-white px-6 py-8">
              <p className="font-sans text-sm text-destructive">
                {error instanceof Error ? error.message : "Could not load contestant."}
              </p>
              <Button onClick={() => void refetch()} className="mt-4 rounded-full bg-[#171411] text-white hover:bg-[#171411]/92">
                Retry
              </Button>
            </div>
          ) : contestant ? (
            <div className="mt-8 grid gap-8 lg:grid-cols-[0.48fr_0.52fr] lg:items-start">
              <div className="overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_24px_64px_rgba(17,16,14,0.10)]">
                <div className="aspect-[4/5] bg-[#f8f2e8]">
                  {contestant.photo_url ? (
                    <img src={contestant.photo_url} alt={contestant.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Award className="h-16 w-16 text-[#171411]/28" />
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-black/8 bg-white p-6 md:p-8">
                <Badge className="rounded-full bg-[#f8f2e8] text-[#8241B6] hover:bg-[#f8f2e8]">
                  {contestant.category.name}
                </Badge>
                <h1 className="mt-5 font-sans text-[clamp(3rem,6vw,5.8rem)] font-semibold leading-[0.86] tracking-[-0.08em] text-[#171411]">
                  {contestant.name}
                </h1>
                {contestant.organization ? (
                  <p className="mt-4 font-sans text-xl font-semibold text-[#8241B6]">
                    {contestant.organization}
                  </p>
                ) : null}

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-black/8 bg-[#f8f2e8] px-5 py-4">
                    <p className="font-sans text-sm font-semibold text-[#171411]">Vote count</p>
                    <p className="mt-2 font-sans text-2xl font-semibold text-[#171411]">
                      {getMissPanacheVoteCount(contestant).toLocaleString()} verified votes
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-black/8 bg-[#f8f2e8] px-5 py-4">
                    <p className="font-sans text-sm font-semibold text-[#171411]">Overall rank</p>
                    <p className="mt-2 font-sans text-2xl font-semibold text-[#171411]">
                      #{overallRank} of {rankedOverall.length}
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-black/8 bg-[#f8f2e8] px-5 py-4 sm:col-span-2">
                    <p className="font-sans text-sm font-semibold text-[#171411]">Category rank</p>
                    <p className="mt-2 font-sans text-lg font-semibold text-[#171411]">
                      #{categoryRank} in {contestant.category.name}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <MissPanacheVoteForm contestant={contestant} category={contestant.category} payment={voting?.payment} />
                </div>

                <div className="mt-8">
                  <Button asChild variant="outline" className="h-12 rounded-full border-black/12 bg-white/74 px-7 font-sans text-sm font-semibold text-[#171411] hover:bg-white">
                    <Link to="/panache-expo/miss-panache/leaderboard">
                      View leaderboard
                      <Trophy className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-[2rem] border border-dashed border-black/12 bg-white px-6 py-12 text-center">
              <h1 className="font-sans text-3xl font-semibold tracking-[-0.05em] text-[#171411]">Contestant not found</h1>
              <p className="mt-3 font-sans text-sm text-[#171411]/64">This Miss Panache contestant link may be unavailable or inactive.</p>
              <Button asChild className="mt-6 rounded-full bg-[#171411] text-white hover:bg-[#171411]/92">
                <Link to="/panache-expo/miss-panache/vote">View all contestants</Link>
              </Button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MissPanachePublicContestantPage;
