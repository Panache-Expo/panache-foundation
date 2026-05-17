import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  CYESInnerHero,
  CYESSectionIntro,
  cyesSurfaceClasses,
} from "@/components/cyes/CYESPageShell";
import { Button } from "@/components/ui/button";
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
  CheckCircle2,
  Loader2,
  MessageCircle,
  RefreshCw,
  Trophy,
  Vote,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

const votingHeroCards = [
  {
    image: cyesAwards,
    alt: "CYES awards audience",
    className: "left-[18%] top-[8%] z-20 w-[43%] rotate-[-4deg]",
  },
  {
    image: speaker2,
    alt: "CYES speaker portrait",
    className: "left-[60%] top-[18%] z-10 w-[28%] rotate-[7deg]",
  },
  {
    image: honDonald,
    alt: "CYES jury portrait",
    className: "left-[28%] top-[60%] z-30 w-[23%] rotate-[-8deg]",
  },
  {
    image: cyesEvent,
    alt: "CYES event atmosphere",
    className: "left-[52%] top-[56%] z-20 w-[34%] rotate-[9deg]",
  },
];

const CYES_VOTING_CLOSED_LABEL = "17 May 2026 at 00:00 WAT";
const FALLBACK_CLOSED_MESSAGE =
  "CYES Awards voting ended on 17 May 2026 at 00:00 WAT. Results remain available, and the announcements channel is now the best place for updates.";

const getOptimizedSupabaseImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl || !imageUrl.includes("/storage/v1/object/public/")) {
    return imageUrl || "";
  }

  const optimizedUrl = imageUrl.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  );
  const separator = optimizedUrl.includes("?") ? "&" : "?";

  return `${optimizedUrl}${separator}width=300&height=300&resize=cover&quality=60`;
};

const formatVoteCount = (count: number) =>
  `${count.toLocaleString()} vote${count === 1 ? "" : "s"}`;

const getNomineeClassification = (
  nominee: CYESAwardNominee,
  nominees: CYESAwardNominee[]
) => {
  const rankedNominees = [...nominees].sort(
    (left, right) => right.vote_count - left.vote_count
  );
  const rank =
    rankedNominees.findIndex((entry) => entry.id === nominee.id) + 1 || 1;
  const leadingVotes = rankedNominees[0]?.vote_count || 0;
  const topBand = Math.max(1, Math.ceil(rankedNominees.length / 3));
  const middleBand = Math.max(topBand + 1, Math.ceil((rankedNominees.length * 2) / 3));

  if (nominee.vote_count === 0) {
    return {
      label: "No votes recorded",
      className: "bg-[#F7F5F1] text-[#6E6255]",
    };
  }

  if (rank === 1) {
    return {
      label: "Leading",
      className: "bg-[#EEF9F2] text-[#156D3B]",
    };
  }

  if (leadingVotes > 0 && nominee.vote_count >= leadingVotes * 0.8) {
    return {
      label: "Close finish",
      className: "bg-[#EEF4FF] text-[#1875D2]",
    };
  }

  if (rank <= topBand) {
    return {
      label: "Top ranked",
      className: "bg-[#FFF6E8] text-[#A35A00]",
    };
  }

  if (rank <= middleBand) {
    return {
      label: "Contender",
      className: "bg-[#F7F3FF] text-[#6B3FD6]",
    };
  }

  return {
    label: "Finalist",
    className: "bg-[#FFF1F2] text-[#CC2129]",
  };
};

const sortNomineesByVotes = (category: CYESAwardCategory) =>
  [...category.nominees].sort((left, right) => {
    if (right.vote_count !== left.vote_count) {
      return right.vote_count - left.vote_count;
    }
    return left.name.localeCompare(right.name);
  });

const CYESVotingPage = () => {
  const { data: voting, isLoading, error, refetch } = useCyesVoting();

  const categories = useMemo(() => voting?.categories || [], [voting?.categories]);
  const categoryStats = useMemo(() => {
    const categoriesWithNominees = categories.filter((category) => category.nominees.length);
    const nominees = categories.reduce(
      (sum, category) => sum + category.nominees.length,
      0
    );

    return {
      categories: categoriesWithNominees.length,
      nominees,
      votes: voting?.total_votes || 0,
    };
  }, [categories, voting?.total_votes]);

  const channelUrl = voting?.announcement_channel_url || CYES_WHATSAPP_CHANNEL_URL;
  const closedMessage = voting?.closed_message || FALLBACK_CLOSED_MESSAGE;

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-[#171411]">
      <Header />

      <main className="pb-20 md:pb-24">
        <CYESInnerHero
          eyebrow="CYES awards voting"
          title={
            <>
              Voting has
              <br />
              <span className="font-display text-[#156D3B]">officially ended</span>
              <br />
              for the CYECD Awards.
            </>
          }
          description={closedMessage}
          actions={
            <>
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#25D366] px-7 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#22c55e]"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Join CYES WhatsApp Channel
              </a>
              <Link
                to="/cyes/leaderboard"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#156D3B]/20 bg-[#f3fbf6] px-7 font-sans text-sm font-semibold text-[#156D3B] transition-colors hover:bg-white"
              >
                View Leaderboard
              </Link>
            </>
          }
          chips={[
            {
              label: "Status",
              value: "Ended",
              accentClassName: "text-[#CC2129]",
            },
            {
              label: "Closed",
              value: CYES_VOTING_CLOSED_LABEL,
              accentClassName: "text-[#156D3B]",
            },
            {
              label: "Votes",
              value: String(categoryStats.votes),
              accentClassName: "text-[#1875D2]",
            },
          ]}
          cards={votingHeroCards}
          mobileImage={cyesAwards}
          mobileImageAlt="CYECD Awards audience"
          mobileImageClassName="rotate-[10deg]"
        />

        <section id="cyes-voting-results" className="mx-auto mt-16 max-w-6xl px-6 md:px-24">
          <CYESSectionIntro
            eyebrow="Voting closed"
            title={
              <>
                Results remain
                <span className="block font-display">available to view</span>
              </>
            }
            description="Vote submission is no longer available. You can still review the public standings and follow the CYES announcements channel for finalist, event, and awards updates."
          />

          <div className={cyesSurfaceClasses + " mt-10 px-6 py-7 md:px-8"}>
            <div className="grid gap-6 lg:grid-cols-[0.58fr_0.42fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#fff1f2] px-4 py-2 font-sans text-sm font-semibold text-[#CC2129]">
                  <CheckCircle2 className="h-4 w-4" />
                  Voting ended on {CYES_VOTING_CLOSED_LABEL}
                </div>
                <h2 className="mt-5 font-sans text-[clamp(2rem,4vw,3.1rem)] font-semibold leading-[0.94] tracking-[-0.065em] text-[#171411]">
                  No new votes can be submitted.
                </h2>
                <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-[#171411]/68">
                  The voting flow, WhatsApp vote links, and OTP actions are closed. The
                  announcements channel is now the official next step for CYES updates.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-[#25D366]/20 bg-[#f3fbf6] px-5 py-5">
                <MessageCircle className="h-8 w-8 text-[#25D366]" />
                <p className="mt-4 font-sans text-lg font-semibold leading-tight text-[#171411]">
                  Follow the CYES announcements channel
                </p>
                <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/66">
                  Get event notices, finalist updates, and summit announcements directly on WhatsApp.
                </p>
                <a
                  href={channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#25D366] px-5 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#22c55e]"
                >
                  Join channel
                </a>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className={cyesSurfaceClasses + " mt-10 flex items-center gap-3 px-6 py-7"}>
              <Loader2 className="h-5 w-5 animate-spin text-[#156D3B]" />
              <p className="font-sans text-sm text-[#171411]/72">Loading results...</p>
            </div>
          ) : error ? (
            <div className={cyesSurfaceClasses + " mt-10 px-6 py-7"}>
              <p className="font-sans text-sm text-[#CC2129]">
                {error instanceof Error ? error.message : "Could not load results."}
              </p>
              <Button
                type="button"
                className="mt-5 rounded-full bg-[#171411] text-white hover:bg-[#171411]/92"
                onClick={() => void refetch()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : categories.length ? (
            <div className="mt-10 grid gap-6">
              {categories.map((category) => {
                const rankedNominees = sortNomineesByVotes(category);

                return (
                  <section key={category.id} className={cyesSurfaceClasses + " px-5 py-6 md:px-7"}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-[#156D3B]">
                          Final category results
                        </p>
                        <h2 className="mt-2 font-sans text-[1.8rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171411]">
                          {category.name}
                        </h2>
                        {category.description ? (
                          <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-[#171411]/66">
                            {category.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#eef5fb] px-4 py-2 font-sans text-sm font-semibold text-[#1875D2]">
                        <BarChart3 className="h-4 w-4" />
                        {formatVoteCount(category.vote_count)}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4">
                      {rankedNominees.length ? (
                        rankedNominees.map((nominee, index) => {
                          const classification = getNomineeClassification(
                            nominee,
                            rankedNominees
                          );

                          return (
                            <article
                              key={nominee.id}
                              className="grid gap-4 rounded-[1.4rem] border border-black/8 bg-white/74 p-4 md:grid-cols-[86px_1fr_auto] md:items-center"
                            >
                              <div className="h-20 w-20 overflow-hidden rounded-[1.1rem] bg-[#eef2f6]">
                                {nominee.photo_url ? (
                                  <img
                                    src={getOptimizedSupabaseImageUrl(nominee.photo_url)}
                                    alt={nominee.name}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <Award className="h-8 w-8 text-[#171411]/34" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-sans text-[1.15rem] font-semibold leading-tight text-[#171411]">
                                    {nominee.name}
                                  </p>
                                  <span className="inline-flex items-center rounded-full bg-[#171411]/6 px-2.5 py-1 font-sans text-xs font-semibold uppercase tracking-[0.08em] text-[#171411]/72">
                                    #{index + 1}
                                  </span>
                                </div>
                                {nominee.organization ? (
                                  <p className="mt-1 font-sans text-sm text-[#156D3B]">
                                    {nominee.organization}
                                  </p>
                                ) : null}
                                {nominee.bio ? (
                                  <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/66">
                                    {nominee.bio}
                                  </p>
                                ) : null}
                              </div>
                              <div className="flex flex-col items-start gap-2 md:items-end">
                                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 font-sans text-sm font-semibold text-[#171411] shadow-[0_8px_22px_rgba(17,16,14,0.06)]">
                                  <Vote className="h-4 w-4 text-[#CC2129]" />
                                  {formatVoteCount(nominee.vote_count)}
                                </span>
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 font-sans text-xs font-semibold ${classification.className}`}
                                >
                                  {classification.label}
                                </span>
                              </div>
                            </article>
                          );
                        })
                      ) : (
                        <p className="rounded-[1.4rem] border border-dashed border-black/10 bg-white/70 px-5 py-6 font-sans text-sm text-[#171411]/64">
                          No active nominees are available for this category.
                        </p>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className={cyesSurfaceClasses + " mt-10 px-6 py-7"}>
              <p className="font-sans text-sm text-[#171411]/72">
                No public voting results are available yet.
              </p>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/cyes/leaderboard">
              <Button className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92">
                <Trophy className="mr-2 h-4 w-4" />
                View full leaderboard
              </Button>
            </Link>
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#25D366]/25 bg-white px-7 font-sans text-sm font-semibold text-[#156D3B] transition-colors hover:bg-[#f3fbf6]"
            >
              <MessageCircle className="mr-2 h-4 w-4 text-[#25D366]" />
              Join announcements channel
            </a>
          </div>
        </section>
      </main>

      <Footer variant="cyes" />
    </div>
  );
};

export default CYESVotingPage;
