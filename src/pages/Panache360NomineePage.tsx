import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Panache360VoteForm } from "@/components/Panache360VoteForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePanache360Voting } from "@/hooks/useSupabase";
import {
  flattenPanache360Nominees,
  getPanache360CategoryVoteUrl,
  getPanache360Motivation,
  getPanache360VoteCount,
  rankPanache360Nominees,
  type Panache360NomineeWithCategory,
} from "@/lib/panache-360-ranking";
import { Award, ArrowLeft, Loader2, Trophy } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

const Panache360NomineePage = () => {
  const { slug } = useParams();
  const { data: voting, isLoading, error } = usePanache360Voting();

  const nominees = useMemo(
    () => flattenPanache360Nominees(voting?.categories || []),
    [voting?.categories]
  );

  const rankedNominees = useMemo(
    () => rankPanache360Nominees(nominees),
    [nominees]
  );
  const nominee = nominees.find((entry) => entry.slug === slug);
  const rankedCategoryNominees = useMemo(
    () =>
      nominee
        ? rankPanache360Nominees(
            nominees.filter((entry) => entry.category_id === nominee.category_id)
          )
        : [],
    [nominee, nominees]
  );
  const nomineeOverallRank = nominee
    ? rankedNominees.findIndex((entry) => entry.id === nominee.id) + 1
    : 0;
  const nomineeCategoryRank = nominee
    ? rankedCategoryNominees.findIndex((entry) => entry.id === nominee.id) + 1
    : 0;
  const showCounts = Boolean(voting?.counts_available);
  const nomineeMotivation =
    showCounts && nominee
      ? getPanache360Motivation(rankedCategoryNominees, nominee.id)
      : null;
  const backToCategoryUrl = nominee
    ? getPanache360CategoryVoteUrl(nominee.category.slug)
    : "/panache-expo/panache-360/vote";
  const relatedNominees = rankedCategoryNominees
    .filter((entry) => nominee && entry.id !== nominee.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f4f3ef]">
      <Header />

      <main className="pb-20 pt-24 md:pb-24">
        <section className="mx-auto max-w-7xl px-6 md:px-10">
          <Link
            to={backToCategoryUrl}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 font-sans text-sm font-semibold text-[#171411] transition-colors hover:bg-[#f8f2e8]"
          >
            <ArrowLeft className="h-4 w-4" />
            {nominee ? `Back to ${nominee.category.name}` : "Back to contestants"}
          </Link>

          {isLoading ? (
            <div className="mt-8 flex items-center gap-3 rounded-[2rem] border border-black/8 bg-white px-6 py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[#8241B6]" />
              <p className="font-sans text-sm text-[#171411]/68">
                Loading contestant...
              </p>
            </div>
          ) : error ? (
            <div className="mt-8 rounded-[2rem] border border-black/8 bg-white px-6 py-8">
              <p className="font-sans text-sm text-destructive">
                {error instanceof Error ? error.message : "Could not load contestant."}
              </p>
            </div>
          ) : nominee ? (
            <>
              <div className="mt-8 grid gap-8 lg:grid-cols-[0.48fr_0.52fr] lg:items-start">
                <div className="overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_24px_64px_rgba(17,16,14,0.10)]">
                  <div className="aspect-[4/5] bg-[#f8f2e8]">
                    {nominee.photo_url ? (
                      <img
                        src={nominee.photo_url}
                        alt={nominee.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Award className="h-16 w-16 text-[#171411]/28" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-black/8 bg-white p-6 md:p-8">
                  <Badge className="rounded-full bg-[#f8f2e8] text-[#8241B6] hover:bg-[#f8f2e8]">
                    {nominee.category.name}
                  </Badge>
                  <h1 className="mt-5 font-sans text-[clamp(3rem,6vw,5.8rem)] font-semibold leading-[0.86] tracking-[-0.08em] text-[#171411]">
                    {nominee.name}
                  </h1>
                  {nominee.organization ? (
                    <p className="mt-4 font-sans text-xl font-semibold text-[#8241B6]">
                      {nominee.organization}
                    </p>
                  ) : null}
                  {nominee.bio ? (
                    <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-[#171411]/68">
                      {nominee.bio}
                    </p>
                  ) : (
                    <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-[#171411]/68">
                      This contestant is listed for Panache 360 voting. Use the
                      secure voting flow to support them officially.
                    </p>
                  )}

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.35rem] border border-black/8 bg-[#f8f2e8] px-5 py-4">
                      <p className="font-sans text-sm font-semibold text-[#171411]">
                        Overall rank
                      </p>
                      <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/64">
                        {showCounts && nomineeOverallRank
                          ? `#${nomineeOverallRank} of ${rankedNominees.length}`
                          : "Rank appears after verified votes are available."}
                      </p>
                    </div>
                    <div className="rounded-[1.35rem] border border-black/8 bg-[#f8f2e8] px-5 py-4">
                      <p className="font-sans text-sm font-semibold text-[#171411]">
                        Category rank
                      </p>
                      <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/64">
                        {showCounts && nomineeCategoryRank
                          ? `#${nomineeCategoryRank} in ${nominee.category.name}`
                          : "Category rank appears after verified votes are available."}
                      </p>
                    </div>
                    <div className="rounded-[1.35rem] border border-black/8 bg-[#f8f2e8] px-5 py-4">
                      <p className="font-sans text-sm font-semibold text-[#171411]">
                        Vote source
                      </p>
                      <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/64">
                        Secure verified payment
                      </p>
                    </div>
                    <div className="rounded-[1.35rem] border border-black/8 bg-[#f8f2e8] px-5 py-4">
                      <p className="font-sans text-sm font-semibold text-[#171411]">
                        Vote count
                      </p>
                      <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/64">
                        {showCounts
                          ? `${getPanache360VoteCount(
                              nominee
                            ).toLocaleString()} verified votes`
                          : "Verified votes are not public yet."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8">
                    {nomineeMotivation ? (
                      <div className="mb-4 rounded-[1.35rem] border border-black/8 bg-[#f8f2e8] px-5 py-4">
                        <p className="font-sans text-sm font-semibold text-[#171411]">
                          {nomineeMotivation.isCloseRace
                            ? "Close category race"
                            : "Voting goal"}
                        </p>
                        <p
                          className={`mt-2 font-sans text-sm leading-relaxed ${
                            nomineeMotivation.isCloseRace
                              ? "font-semibold text-[#8241B6]"
                              : "text-[#171411]/64"
                          }`}
                        >
                          {nomineeMotivation.text}
                        </p>
                      </div>
                    ) : null}
                    <Panache360VoteForm
                      contestant={nominee}
                      category={nominee.category}
                      payment={voting?.payment}
                    />
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button
                      asChild
                      variant="outline"
                      className="h-12 rounded-full border-black/12 bg-white/74 px-7 font-sans text-sm font-semibold text-[#171411] hover:bg-white"
                    >
                      <Link to="/panache-expo/panache-360/leaderboard">
                        View overall leaderboard
                        <Trophy className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {relatedNominees.length ? (
                <section className="mt-10 rounded-[2rem] border border-black/8 bg-white p-6">
                  <h2 className="font-sans text-2xl font-semibold tracking-[-0.05em] text-[#171411]">
                    More in {nominee.category.name}
                  </h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {relatedNominees.map((entry: Panache360NomineeWithCategory) => {
                      const categoryRank =
                        rankedCategoryNominees.findIndex(
                          (rankedEntry) => rankedEntry.id === entry.id
                        ) + 1;
                      const relatedMotivation = showCounts
                        ? getPanache360Motivation(
                            rankedCategoryNominees,
                            entry.id
                          )
                        : null;

                      return (
                      <Link
                        key={entry.id}
                        to={`/panache-expo/panache-360/nominees/${entry.slug}`}
                        className="rounded-[1.35rem] border border-black/8 bg-[#f8f2e8] p-4 transition-colors hover:bg-white"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#171411] font-sans text-xs font-semibold text-white">
                            #{categoryRank}
                          </span>
                          <div>
                            <p className="font-sans text-base font-semibold text-[#171411]">
                              {entry.name}
                            </p>
                            {showCounts ? (
                              <p className="mt-1 font-sans text-sm text-[#171411]/60">
                                {getPanache360VoteCount(entry).toLocaleString()} verified votes
                              </p>
                            ) : null}
                          </div>
                        </div>
                        {relatedMotivation ? (
                          <p
                            className={`mt-3 font-sans text-sm ${
                              relatedMotivation.isCloseRace
                                ? "font-semibold text-[#8241B6]"
                                : "text-[#171411]/60"
                            }`}
                          >
                            {relatedMotivation.text}
                          </p>
                        ) : null}
                        {entry.organization ? (
                          <p className="mt-1 font-sans text-sm text-[#171411]/60">
                            {entry.organization}
                          </p>
                        ) : null}
                      </Link>
                      );
                    })}
                  </div>
                </section>
              ) : null}
            </>
          ) : (
            <div className="mt-8 rounded-[2rem] border border-dashed border-black/12 bg-white px-6 py-12 text-center">
              <h1 className="font-sans text-3xl font-semibold tracking-[-0.05em] text-[#171411]">
                Contestant not found
              </h1>
              <p className="mt-3 font-sans text-sm text-[#171411]/64">
                This contestant may not be public yet, or the link may have changed.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Panache360NomineePage;
