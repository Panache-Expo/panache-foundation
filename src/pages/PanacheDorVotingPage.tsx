import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  PanacheDorAwardCategory,
  PanacheDorAwardNominee,
} from "@/integrations/supabase/services";
import { usePanacheDorVoting } from "@/hooks/useSupabase";
import PanacheAwards from "@/assets/PanacheAwards.jpeg";
import {
  Award,
  Loader2,
  RefreshCw,
  Search,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

type NomineeWithCategory = PanacheDorAwardNominee & {
  category: PanacheDorAwardCategory;
};

const flattenNominees = (categories: PanacheDorAwardCategory[]) =>
  categories.flatMap((category) =>
    category.nominees.map((nominee) => ({
      ...nominee,
      category,
    }))
  );

const matchesSearch = (nominee: NomineeWithCategory, query: string) => {
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

const getVoteCount = (nominee: NomineeWithCategory) =>
  nominee.vote_count ?? nominee.ayati_vote_count;

const PanacheDorVotingPage = () => {
  const { data: voting, isLoading, error, refetch } = usePanacheDorVoting();
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => voting?.categories || [], [voting?.categories]);
  const nominees = useMemo(() => flattenNominees(categories), [categories]);
  const visibleNominees = useMemo(() => {
    const filteredByCategory =
      selectedCategoryId === "all"
        ? nominees
        : nominees.filter((nominee) => nominee.category_id === selectedCategoryId);
    const normalizedSearch = searchQuery.trim();

    if (!normalizedSearch) {
      return filteredByCategory;
    }

    return filteredByCategory.filter((nominee) =>
      matchesSearch(nominee, normalizedSearch)
    );
  }, [nominees, searchQuery, selectedCategoryId]);

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
              Panache D&apos;or
              <span className="block font-display text-[#8241B6]">Nominees</span>
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-[#171411]/70">
              Browse the official nominee directory. Each nominee profile now
              has an on-site secure payment flow, and only verified payments
              count on the leaderboard.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
              >
                <a href="#nominees">Browse nominees</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-black/12 bg-white/74 px-7 font-sans text-sm font-semibold text-[#171411] hover:bg-white"
              >
                <Link to="/panache-expo/panache-dor/leaderboard">
                  View leaderboard
                  <Trophy className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative min-h-[24rem] overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_24px_64px_rgba(17,16,14,0.10)]">
            <img
              src={PanacheAwards}
              alt="Panache D'or awards night"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#171411]/84 via-[#171411]/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <Badge className="rounded-full bg-white text-[#171411] hover:bg-white">
                Official nominee directory
              </Badge>
              <p className="mt-4 max-w-md font-sans text-2xl font-semibold leading-tight tracking-[-0.05em] text-white">
                Vote payments happen securely on this site and are verified by Panache
                before they appear in the totals.
              </p>
            </div>
          </div>
        </section>

        <section id="nominees" className="mx-auto mt-14 max-w-7xl px-6 md:px-10">
          <div className="rounded-[2rem] border border-black/8 bg-white p-5 md:p-6">
            <div className="grid gap-4 lg:grid-cols-[0.42fr_0.58fr] lg:items-center">
              <div>
                <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-[#8241B6]">
                  Find a nominee
                </p>
                <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/62">
                  Search by name, brand, or category. Vote totals stay hidden
                  from estimates; only completed verified payments are counted.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#171411]/40" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="h-12 rounded-full border-black/10 bg-[#f8f2e8] pl-11"
                    placeholder="Search nominees"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-full border-black/10 bg-white px-6"
                  onClick={() => void refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className={`rounded-full px-4 py-2 font-sans text-sm font-semibold transition-colors ${
                  selectedCategoryId === "all"
                    ? "bg-[#171411] text-white"
                    : "border border-black/10 bg-[#f8f2e8] text-[#171411]"
                }`}
                onClick={() => setSelectedCategoryId("all")}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`rounded-full px-4 py-2 font-sans text-sm font-semibold transition-colors ${
                    selectedCategoryId === category.id
                      ? "bg-[#8241B6] text-white"
                      : "border border-black/10 bg-[#f8f2e8] text-[#171411]"
                  }`}
                  onClick={() => setSelectedCategoryId(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="mt-8 flex items-center gap-3 rounded-[2rem] border border-black/8 bg-white px-6 py-8">
              <Loader2 className="h-5 w-5 animate-spin text-[#8241B6]" />
              <p className="font-sans text-sm text-[#171411]/68">
                Loading nominees...
              </p>
            </div>
          ) : error ? (
            <div className="mt-8 rounded-[2rem] border border-black/8 bg-white px-6 py-8">
              <p className="font-sans text-sm text-destructive">
                {error instanceof Error ? error.message : "Could not load nominees."}
              </p>
              <Button
                type="button"
                className="mt-4 rounded-full bg-[#171411] text-white hover:bg-[#171411]/92"
                onClick={() => void refetch()}
              >
                Retry
              </Button>
            </div>
          ) : visibleNominees.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleNominees.map((nominee) => (
                <article
                  key={nominee.id}
                  className="group overflow-hidden rounded-[1.8rem] border border-black/8 bg-white shadow-[0_18px_44px_rgba(17,16,14,0.08)]"
                >
                  <Link
                    to={`/panache-expo/panache-dor/nominees/${nominee.slug}`}
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
                      <Badge className="absolute left-4 top-4 rounded-full bg-white text-[#171411] hover:bg-white">
                        {nominee.category.name}
                      </Badge>
                    </div>
                  </Link>

                  <div className="p-5">
                    <h2 className="font-sans text-[1.35rem] font-semibold leading-tight tracking-[-0.04em] text-[#171411]">
                      {nominee.name}
                    </h2>
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
                    <p className="mt-4 font-sans text-sm font-semibold text-[#171411]">
                      {getVoteCount(nominee).toLocaleString()} verified votes
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button
                        asChild
                        variant="outline"
                        className="rounded-full border-black/10 bg-white"
                      >
                        <Link to={`/panache-expo/panache-dor/nominees/${nominee.slug}`}>
                          View profile
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="rounded-full bg-[#171411] text-white hover:bg-[#171411]/92"
                      >
                        <Link to={`/panache-expo/panache-dor/nominees/${nominee.slug}`}>
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
                No public Panache D&apos;or nominees match the current filters.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PanacheDorVotingPage;
