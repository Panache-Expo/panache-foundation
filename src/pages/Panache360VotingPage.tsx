import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Panache360AwardCategory } from "@/integrations/supabase/services";
import { usePanache360Voting } from "@/hooks/useSupabase";
import {
  getPanache360CategoryVoteUrl,
  getPanache360VoteCount,
  type Panache360NomineeWithCategory,
} from "@/lib/panache-360-ranking";
import Panache360Hero from "@/assets/panache360-1.jpeg";
import {
  ArrowLeft,
  Award,
  Loader2,
  RefreshCw,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const matchesSearch = (nominee: Panache360NomineeWithCategory, query: string) => {
  const haystack = [
    nominee.name,
    nominee.organization || "",
    nominee.bio || "",
    nominee.category.name,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.trim().toLowerCase());
};

const alphabetizeCategories = (categories: Panache360AwardCategory[]) =>
  [...categories].sort((left, right) => left.name.localeCompare(right.name));

const alphabetizeCategoryNominees = (
  category: Panache360AwardCategory
): Panache360NomineeWithCategory[] =>
  category.nominees
    .map((nominee) => ({
      ...nominee,
      category,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

const getCategoryVoteTotal = (category: Panache360AwardCategory) =>
  category.nominees.reduce(
    (total, nominee) => total + getPanache360VoteCount(nominee),
    0
  );

const CategoryCard = ({
  category,
  showCounts,
}: {
  category: Panache360AwardCategory;
  showCounts: boolean;
}) => {
  const nomineeCount = category.nominees.length;
  const voteTotal = getCategoryVoteTotal(category);

  return (
    <article className="flex h-full flex-col rounded-[1.8rem] border border-black/8 bg-white p-5 shadow-[0_18px_44px_rgba(17,16,14,0.07)]">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8f2e8] text-[#8241B6]">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <h2 className="mt-5 font-sans text-2xl font-semibold leading-tight tracking-[-0.05em] text-[#171411]">
          {category.name}
        </h2>
        {category.description ? (
          <p className="mt-3 line-clamp-3 font-sans text-sm leading-relaxed text-[#171411]/62">
            {category.description}
          </p>
        ) : (
          <p className="mt-3 font-sans text-sm leading-relaxed text-[#171411]/62">
            Choose this category to see contestants listed alphabetically and support your favorite.
          </p>
        )}
      </div>

      <div className="mt-auto pt-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[1rem] bg-[#f8f2e8] px-4 py-3">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[#171411]/48">
              Contestants
            </p>
            <p className="mt-1 font-sans text-xl font-semibold text-[#171411]">
              {nomineeCount.toLocaleString()}
            </p>
          </div>
          <div className="rounded-[1rem] bg-[#f8f2e8] px-4 py-3">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[#171411]/48">
              Votes
            </p>
            <p className="mt-1 font-sans text-xl font-semibold text-[#171411]">
              {showCounts ? voteTotal.toLocaleString() : "—"}
            </p>
          </div>
        </div>
        <Button
          asChild
          className="mt-5 h-11 w-full rounded-full bg-[#171411] font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
        >
          <Link to={getPanache360CategoryVoteUrl(category.slug)}>
            View category
          </Link>
        </Button>
      </div>
    </article>
  );
};

const Panache360VotingPage = () => {
  const { data: voting, isLoading, error, refetch } = usePanache360Voting();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  const categorySlug = searchParams.get("category") || "";
  const categories = useMemo(
    () => alphabetizeCategories(voting?.categories || []),
    [voting?.categories]
  );
  const selectedCategory = useMemo(
    () => categories.find((category) => category.slug === categorySlug) || null,
    [categories, categorySlug]
  );
  const showCounts = Boolean(voting?.counts_available);
  const categoryIsMissing = Boolean(categorySlug && !selectedCategory && categories.length);
  const selectedCategoryVoteTotal = selectedCategory
    ? getCategoryVoteTotal(selectedCategory)
    : 0;

  const alphabeticalCategoryNominees = useMemo(
    () => (selectedCategory ? alphabetizeCategoryNominees(selectedCategory) : []),
    [selectedCategory]
  );
  const visibleNominees = useMemo(() => {
    const normalizedSearch = searchQuery.trim();

    if (!normalizedSearch) {
      return alphabeticalCategoryNominees;
    }

    return alphabeticalCategoryNominees.filter((nominee) =>
      matchesSearch(nominee, normalizedSearch)
    );
  }, [alphabeticalCategoryNominees, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f4f3ef]">
      <Header />

      <main className="pb-20 pt-24 md:pb-24">
        <section className="mx-auto grid max-w-7xl gap-10 px-6 md:px-10 lg:grid-cols-[0.56fr_0.44fr] lg:items-center">
          <div>
            <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
              Secure online voting
            </p>
            <h1 className="mt-4 font-sans text-[clamp(3.2rem,7vw,6rem)] font-semibold leading-[0.86] tracking-[-0.08em] text-[#171411]">
              Panache 360
              <span className="block font-display text-[#8241B6]">Voting</span>
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-[#171411]/70">
              Start by choosing a contest category, then open a contestant
              profile to vote securely. Public voting counts for{" "}
              {voting?.competition_weight_percent || 25}% of the final
              competition score.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
              >
                <a href="#nominees">Choose a category</a>
              </Button>
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

          <div className="relative min-h-[24rem] overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_24px_64px_rgba(17,16,14,0.10)]">
            <img
              src={Panache360Hero}
              alt="Panache 360 beauty contest"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#171411]/84 via-[#171411]/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <Badge className="rounded-full bg-white text-[#171411] hover:bg-white">
                25% public voting
              </Badge>
              <p className="mt-4 max-w-md font-sans text-2xl font-semibold leading-tight tracking-[-0.05em] text-white">
                Support your favorite contestant and help their verified votes count.
              </p>
            </div>
          </div>
        </section>

        <section id="nominees" className="mx-auto mt-14 max-w-7xl px-6 md:px-10">
          {isLoading ? (
            <div className="mt-8 flex items-center gap-3 rounded-[2rem] border border-black/8 bg-white px-6 py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[#8241B6]" />
              <p className="font-sans text-sm text-[#171411]/68">
                Loading categories...
              </p>
            </div>
          ) : error ? (
            <div className="mt-8 rounded-[2rem] border border-black/8 bg-white px-6 py-8">
              <p className="font-sans text-sm text-destructive">
                {error instanceof Error ? error.message : "Could not load contestants."}
              </p>
              <Button
                type="button"
                className="mt-4 rounded-full bg-[#171411] text-white hover:bg-[#171411]/92"
                onClick={() => void refetch()}
              >
                Retry
              </Button>
            </div>
          ) : selectedCategory ? (
            <>
              <div className="rounded-[2rem] border border-black/8 bg-white p-5 md:p-6">
                <div className="grid gap-5 lg:grid-cols-[0.5fr_0.5fr] lg:items-center">
                  <div>
                    <Link
                      to="/panache-expo/panache-360/vote"
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f8f2e8] px-4 py-2 font-sans text-sm font-semibold text-[#171411] transition-colors hover:bg-white"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      All categories
                    </Link>
                    <p className="mt-5 font-sans text-sm font-semibold uppercase tracking-[0.18em] text-[#8241B6]">
                      Category contestants
                    </p>
                    <h2 className="mt-2 font-sans text-[clamp(2.2rem,4vw,3.7rem)] font-semibold leading-[0.92] tracking-[-0.07em] text-[#171411]">
                      {selectedCategory.name}
                    </h2>
                    <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-[#171411]/62">
                      Contestants in this category are listed alphabetically. Rankings are shown only on the leaderboard.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[1.2rem] bg-[#f8f2e8] px-4 py-3">
                        <p className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[#171411]/48">
                          Contestants
                        </p>
                        <p className="mt-1 font-sans text-xl font-semibold text-[#171411]">
                          {selectedCategory.nominees.length.toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-[1.2rem] bg-[#f8f2e8] px-4 py-3">
                        <p className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[#171411]/48">
                          Votes
                        </p>
                        <p className="mt-1 font-sans text-xl font-semibold text-[#171411]">
                          {showCounts ? selectedCategoryVoteTotal.toLocaleString() : "—"}
                        </p>
                      </div>
                      <Button
                        asChild
                        variant="outline"
                        className="h-full min-h-[4.25rem] rounded-[1.2rem] border-black/10 bg-white px-4"
                      >
                        <Link to="/panache-expo/panache-360/leaderboard">
                          Overall leaderboard
                        </Link>
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#171411]/40" />
                        <Input
                          value={searchQuery}
                          onChange={(event) => setSearchQuery(event.target.value)}
                          className="h-12 rounded-full border-black/10 bg-[#f8f2e8] pl-11"
                          placeholder={`Search ${selectedCategory.name}`}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 rounded-full border-black/10 bg-white px-6"
                        onClick={() => void refetch()}
                        disabled={isLoading}
                      >
                        <RefreshCw
                          className={`mr-2 h-4 w-4 ${
                            isLoading ? "animate-spin" : ""
                          }`}
                        />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {visibleNominees.length ? (
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleNominees.map((nominee) => (
                    <article
                      key={nominee.id}
                      className="group overflow-hidden rounded-[1.8rem] border border-black/8 bg-white shadow-[0_18px_44px_rgba(17,16,14,0.08)]"
                    >
                      <Link
                        to={`/panache-expo/panache-360/nominees/${nominee.slug}`}
                        className="block"
                      >
                        <div className="relative aspect-[4/3] bg-[#f8f2e8]">
                          {nominee.photo_url ? (
                            <img
                              src={nominee.photo_url}
                              alt={nominee.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Award className="h-12 w-12 text-[#171411]/28" />
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="p-5">
                        <h3 className="font-sans text-[1.35rem] font-semibold leading-tight tracking-[-0.04em] text-[#171411]">
                          {nominee.name}
                        </h3>
                        {nominee.organization ? (
                          <p className="mt-1 font-sans text-sm font-medium text-[#8241B6]">
                            {nominee.organization}
                          </p>
                        ) : null}
                        {nominee.bio ? (
                          <p className="mt-3 line-clamp-3 font-sans text-sm leading-relaxed text-[#171411]/64">
                            {nominee.bio}
                          </p>
                        ) : null}

                        <div className="mt-4 rounded-[1.15rem] bg-[#f8f2e8] px-4 py-3">
                          <p className="font-sans text-sm font-semibold text-[#171411]">
                            {showCounts
                              ? `${getPanache360VoteCount(
                                  nominee
                                ).toLocaleString()} verified votes`
                              : "Verified votes are being prepared."}
                          </p>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          <Button
                            asChild
                            variant="outline"
                            className="rounded-full border-black/10 bg-white"
                          >
                            <Link
                              to={`/panache-expo/panache-360/nominees/${nominee.slug}`}
                            >
                              View profile
                            </Link>
                          </Button>
                          <Button
                            asChild
                            className="rounded-full bg-[#171411] text-white hover:bg-[#171411]/92"
                          >
                            <Link
                              to={`/panache-expo/panache-360/nominees/${nominee.slug}`}
                            >
                              Vote securely
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-8 rounded-[2rem] border border-dashed border-black/12 bg-white px-6 py-10 text-center">
                  <p className="font-sans text-sm text-[#171411]/68">
                    No contestants in this category match the current search.
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="rounded-[2rem] border border-black/8 bg-white p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-[#8241B6]">
                      Choose a category
                    </p>
                    <h2 className="mt-2 font-sans text-[clamp(2.2rem,4vw,3.7rem)] font-semibold leading-[0.92] tracking-[-0.07em] text-[#171411]">
                      Pick the category you want to enter.
                    </h2>
                    <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-[#171411]/62">
                      Each category shows contestants alphabetically with current verified vote counts. Rankings are available only on the leaderboard.
                    </p>
                    {categoryIsMissing ? (
                      <p className="mt-3 font-sans text-sm font-semibold text-destructive">
                        That category link is not available. Please choose from
                        the current public categories.
                      </p>
                    ) : null}
                  </div>
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

              {categories.length ? (
                <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {categories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      showCounts={showCounts}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-8 rounded-[2rem] border border-dashed border-black/12 bg-white px-6 py-10 text-center">
                  <p className="font-sans text-sm text-[#171411]/68">
                    No public Panache 360 categories are available yet.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Panache360VotingPage;
