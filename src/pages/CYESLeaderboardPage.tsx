import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  CYESInnerHero,
  CYESSectionIntro,
  cyesInputClasses,
  cyesSurfaceClasses,
} from "@/components/cyes/CYESPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  CYESAwardCategory,
  CYESAwardNominee,
} from "@/integrations/supabase/services";
import { useCyesVoting } from "@/hooks/useSupabase";
import { CYES_WHATSAPP_CHANNEL_URL } from "@/lib/registration-links";
import cyesAwards from "@/assets/CYESCDAwards.jpeg";
import cyesEvent from "@/assets/CYES.jpeg";
import honDonald from "@/assets/HonDonald.jpeg";
import speaker2 from "@/assets/speaker2.jpeg";
import {
  Award,
  BarChart3,
  Crown,
  Loader2,
  MessageCircle,
  Medal,
  RefreshCw,
  Search,
  Trophy,
  Vote,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

type RankedNominee = CYESAwardNominee & {
  categoryId: string;
  categoryName: string;
  categoryVoteCount: number;
  rank: number;
  totalNomineesInCategory: number;
};

const leaderboardHeroCards = [
  {
    image: cyesAwards,
    alt: "CYES awards audience",
    className: "left-[14%] top-[7%] z-20 w-[42%] rotate-[-5deg]",
  },
  {
    image: honDonald,
    alt: "CYES awards guest portrait",
    className: "left-[58%] top-[14%] z-10 w-[30%] rotate-[8deg]",
  },
  {
    image: speaker2,
    alt: "CYES speaker portrait",
    className: "left-[27%] top-[58%] z-30 w-[24%] rotate-[-8deg]",
  },
  {
    image: cyesEvent,
    alt: "CYES event atmosphere",
    className: "left-[52%] top-[57%] z-20 w-[35%] rotate-[9deg]",
  },
];

const formatRank = (rank: number) => {
  const suffix =
    rank % 100 >= 11 && rank % 100 <= 13
      ? "th"
      : rank % 10 === 1
      ? "st"
      : rank % 10 === 2
      ? "nd"
      : rank % 10 === 3
      ? "rd"
      : "th";
  return `${rank}${suffix}`;
};

const nomineeLabel = (nominee: Pick<CYESAwardNominee, "name" | "organization">) =>
  [nominee.name, nominee.organization].filter(Boolean).join(" - ");

const rankCategoryNominees = (category: CYESAwardCategory): RankedNominee[] => {
  const sortedNominees = [...category.nominees].sort((left, right) => {
    if (right.vote_count !== left.vote_count) {
      return right.vote_count - left.vote_count;
    }
    return left.name.localeCompare(right.name);
  });

  let previousVotes: number | null = null;
  let previousRank = 0;

  return sortedNominees.map((nominee, index) => {
    const rank =
      previousVotes === nominee.vote_count && previousRank
        ? previousRank
        : index + 1;
    previousVotes = nominee.vote_count;
    previousRank = rank;

    return {
      ...nominee,
      categoryId: category.id,
      categoryName: category.name,
      categoryVoteCount: category.vote_count,
      rank,
      totalNomineesInCategory: sortedNominees.length,
    };
  });
};

const RankBadge = ({ rank }: { rank: number }) => {
  const isTopRank = rank === 1;
  return (
    <div
      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-sans text-sm font-semibold ${
        isTopRank
          ? "bg-[#171411] text-white"
          : "border border-black/10 bg-white text-[#171411]"
      }`}
    >
      {isTopRank ? <Crown className="h-5 w-5" /> : `#${rank}`}
    </div>
  );
};

const NomineeRow = ({ nominee }: { nominee: RankedNominee }) => (
  <article className="grid gap-4 rounded-[1.35rem] border border-black/8 bg-white/74 p-4 md:grid-cols-[auto_74px_1fr_auto] md:items-center">
    <RankBadge rank={nominee.rank} />
    <div className="h-[4.6rem] w-[4.6rem] overflow-hidden rounded-[1rem] bg-[#eef2f6]">
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
      <p className="font-sans text-[1.08rem] font-semibold leading-tight text-[#171411]">
        {nominee.name}
      </p>
      {nominee.organization ? (
        <p className="mt-1 font-sans text-sm text-[#156D3B]">
          {nominee.organization}
        </p>
      ) : null}
      <p className="mt-2 font-sans text-sm text-[#171411]/58">
        {nominee.categoryName} position: {formatRank(nominee.rank)} of{" "}
        {nominee.totalNomineesInCategory}
      </p>
    </div>
    <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f3fbf6] px-4 py-2 font-sans text-sm font-semibold text-[#156D3B]">
      <Vote className="h-4 w-4" />
      {nominee.vote_count} votes
    </div>
  </article>
);

const CYESLeaderboardPage = () => {
  const { data: voting, isLoading, error, refetch } = useCyesVoting();
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => voting?.categories || [], [voting?.categories]);
  const rankedCategories = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        rankedNominees: rankCategoryNominees(category),
      })),
    [categories]
  );

  const allRankedNominees = useMemo(
    () => rankedCategories.flatMap((category) => category.rankedNominees),
    [rankedCategories]
  );

  const topNominees = useMemo(
    () =>
      [...allRankedNominees]
        .sort((left, right) => {
          if (right.vote_count !== left.vote_count) {
            return right.vote_count - left.vote_count;
          }
          return left.name.localeCompare(right.name);
        })
        .slice(0, 6),
    [allRankedNominees]
  );

  const selectedCategory =
    rankedCategories.find((category) => category.id === selectedCategoryId) ||
    rankedCategories[0];

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const searchedNominees = useMemo(() => {
    if (!normalizedSearch) {
      return [];
    }

    return allRankedNominees
      .filter((nominee) =>
        [
          nominee.name,
          nominee.organization || "",
          nominee.categoryName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)
      )
      .slice(0, 10);
  }, [allRankedNominees, normalizedSearch]);

  const activeCategoryBoards =
    selectedCategoryId === "all"
      ? rankedCategories
      : selectedCategory
      ? [selectedCategory]
      : [];

  const totalVotes = voting?.total_votes || 0;
  const nomineeCount = allRankedNominees.length;
  const activeCategoryCount = rankedCategories.filter(
    (category) => category.rankedNominees.length > 0
  ).length;
  const channelUrl = voting?.announcement_channel_url || CYES_WHATSAPP_CHANNEL_URL;

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-[#171411]">
      <Header />

      <main className="pb-20 md:pb-24">
        <CYESInnerHero
          eyebrow="Public leaderboard"
          title={
            <>
              Track the
              <br />
              <span className="font-display text-[#156D3B]">CYECD Awards</span>
              <br />
              vote standings.
            </>
          }
          description="Voting has ended, and participants can now review public vote totals, category positions, and the nominees leading each CYECD Awards category."
          actions={
            <>
              <a href="#leaderboard">
                <Button className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92">
                  View Standings
                </Button>
              </a>
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#25D366]/25 bg-white/76 px-7 font-sans text-sm font-semibold text-[#156D3B] transition-colors hover:bg-white"
              >
                <MessageCircle className="mr-2 h-4 w-4 text-[#25D366]" />
                Join Channel
              </a>
            </>
          }
          chips={[
            {
              label: "Categories",
              value: String(activeCategoryCount),
              accentClassName: "text-[#156D3B]",
            },
            {
              label: "Nominees",
              value: String(nomineeCount),
              accentClassName: "text-[#1875D2]",
            },
            {
              label: "Votes",
              value: String(totalVotes),
              accentClassName: "text-[#CC2129]",
            },
          ]}
          cards={leaderboardHeroCards}
          mobileImage={cyesAwards}
          mobileImageAlt="CYECD Awards audience"
          mobileImageClassName="rotate-[8deg]"
        />

        <section id="leaderboard" className="mx-auto mt-16 max-w-6xl px-6 md:px-24">
          <CYESSectionIntro
            eyebrow="Final results"
            title={
              <>
                Find your rank,
                <span className="block font-display">review the standings</span>
              </>
            }
            description="Voting ended on 17 May 2026 at 00:00 WAT. Search by nominee, organization, or category to review the public standings."
          />

          <div className="mt-10 rounded-[1.35rem] border border-[#25D366]/20 bg-[#f3fbf6] px-5 py-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-[#156D3B]">
                  Voting closed
                </p>
                <p className="mt-2 max-w-2xl font-sans text-sm leading-relaxed text-[#171411]/70">
                  No new CYES Awards votes can be submitted. Follow the WhatsApp channel for event announcements, finalist updates, and next steps.
                </p>
              </div>
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] px-5 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#22c55e]"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Join CYES Channel
              </a>
            </div>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-[0.42fr_0.58fr]">
            <div className={cyesSurfaceClasses + " px-5 py-5"}>
              <label
                htmlFor="leaderboardSearch"
                className="font-sans text-sm font-semibold text-[#171411]"
              >
                Search nominee
              </label>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#171411]/42" />
                <Input
                  id="leaderboardSearch"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className={cyesInputClasses + " pl-11"}
                  placeholder="Name, organization, or category"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 font-sans text-sm font-semibold transition-colors ${
                    selectedCategoryId === "all"
                      ? "bg-[#171411] text-white"
                      : "border border-black/10 bg-white text-[#171411]"
                  }`}
                  onClick={() => setSelectedCategoryId("all")}
                >
                  All Categories
                </button>
                {rankedCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`rounded-full px-4 py-2 font-sans text-sm font-semibold transition-colors ${
                      selectedCategoryId === category.id
                        ? "bg-[#156D3B] text-white"
                        : "border border-black/10 bg-white text-[#171411]"
                    }`}
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className={cyesSurfaceClasses + " px-5 py-5"}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-[#CC2129]">
                    Overall spotlight
                  </p>
                  <h2 className="mt-2 font-sans text-[1.7rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171411]">
                    Top vote counts
                  </h2>
                </div>
                <Trophy className="h-8 w-8 text-[#FFB200]" />
              </div>

              {isLoading ? (
                <div className="mt-6 flex items-center gap-3 rounded-[1.2rem] bg-white/72 px-4 py-5">
                  <Loader2 className="h-5 w-5 animate-spin text-[#156D3B]" />
                  <p className="font-sans text-sm text-[#171411]/68">
                    Loading standings...
                  </p>
                </div>
              ) : error ? (
                <div className="mt-6 rounded-[1.2rem] bg-white/72 px-4 py-5">
                  <p className="font-sans text-sm text-[#CC2129]">
                    {error instanceof Error
                      ? error.message
                      : "Could not load leaderboard."}
                  </p>
                  <Button
                    type="button"
                    className="mt-4 rounded-full bg-[#171411] text-white hover:bg-[#171411]/92"
                    onClick={() => void refetch()}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                </div>
              ) : topNominees.length ? (
                <div className="mt-6 grid gap-3">
                  {topNominees.map((nominee, index) => (
                    <div
                      key={`${nominee.categoryId}-${nominee.id}`}
                      className="grid gap-3 rounded-[1.2rem] border border-black/8 bg-white/74 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff4d1] text-[#8A5A00]">
                        {index < 3 ? (
                          <Medal className="h-5 w-5" />
                        ) : (
                          <BarChart3 className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-sans text-base font-semibold leading-tight text-[#171411]">
                          {nomineeLabel(nominee)}
                        </p>
                        <p className="mt-1 font-sans text-sm text-[#171411]/58">
                          {nominee.categoryName} • {formatRank(nominee.rank)} in category
                        </p>
                      </div>
                      <p className="font-sans text-sm font-semibold text-[#156D3B]">
                        {nominee.vote_count} votes
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 rounded-[1.2rem] bg-white/72 px-4 py-5 font-sans text-sm text-[#171411]/64">
                  No leaderboard data is available yet.
                </p>
              )}
            </div>
          </div>

          {normalizedSearch ? (
            <div className={cyesSurfaceClasses + " mt-6 px-5 py-5"}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-sans text-[1.35rem] font-semibold leading-tight tracking-[-0.04em] text-[#171411]">
                  Search results
                </h2>
                <p className="font-sans text-sm text-[#171411]/58">
                  {searchedNominees.length} matches
                </p>
              </div>
              <div className="mt-5 grid gap-3">
                {searchedNominees.length ? (
                  searchedNominees.map((nominee) => (
                    <NomineeRow
                      key={`${nominee.categoryId}-${nominee.id}`}
                      nominee={nominee}
                    />
                  ))
                ) : (
                  <p className="rounded-[1.2rem] bg-white/72 px-4 py-5 font-sans text-sm text-[#171411]/64">
                    No nominee matched that search.
                  </p>
                )}
              </div>
            </div>
          ) : null}

          <div className="mt-8 grid gap-6">
            {activeCategoryBoards.length ? (
              activeCategoryBoards.map((category) => (
                <section
                  key={category.id}
                  className={cyesSurfaceClasses + " px-5 py-5 md:px-6 md:py-6"}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-[#156D3B]">
                        Category leaderboard
                      </p>
                      <h2 className="mt-2 font-sans text-[1.7rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171411]">
                        {category.name}
                      </h2>
                      {category.description ? (
                        <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-[#171411]/66">
                          {category.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5fb] px-4 py-2 font-sans text-sm font-semibold text-[#1875D2]">
                      <Vote className="h-4 w-4" />
                      {category.vote_count} category votes
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    {category.rankedNominees.length ? (
                      category.rankedNominees.map((nominee) => (
                        <NomineeRow
                          key={`${category.id}-${nominee.id}`}
                          nominee={nominee}
                        />
                      ))
                    ) : (
                      <p className="rounded-[1.2rem] border border-dashed border-black/10 bg-white/70 px-5 py-6 font-sans text-sm text-[#171411]/64">
                        No active nominees have been added to this category yet.
                      </p>
                    )}
                  </div>
                </section>
              ))
            ) : !isLoading ? (
              <div className={cyesSurfaceClasses + " px-5 py-6"}>
                <p className="font-sans text-sm text-[#171411]/68">
                  No leaderboard categories are open yet.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <Footer variant="cyes" />
    </div>
  );
};

export default CYESLeaderboardPage;
