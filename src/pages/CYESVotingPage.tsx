import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  CYESInnerHero,
  CYESSectionIntro,
  cyesInputClasses,
  cyesSurfaceClasses,
} from "@/components/cyes/CYESPageShell";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  CYESAwardCategory,
  CYESAwardNominee,
} from "@/integrations/supabase/services";
import { cyesVotingService } from "@/integrations/supabase/services";
import {
  useCastCyesVote,
  useCyesVoting,
  useRequestCyesVoteOtp,
} from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";
import cyesAwards from "@/assets/CYESCDAwards.jpeg";
import cyesEvent from "@/assets/CYES.jpeg";
import honDonald from "@/assets/HonDonald.jpeg";
import speaker2 from "@/assets/speaker2.jpeg";
import {
  Award,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Loader2,
  Mail,
  RefreshCw,
  Vote,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

type FallbackCaptcha = {
  id: string;
  question: string;
  expiresAt: number;
};

type VotingStep = "category" | "nominee" | "details" | "verify";

type TurnstileCaptchaProps = {
  siteKey: string;
  resetSignal: number;
  onToken: (token: string) => void;
};

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

const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

const TurnstileCaptcha = ({
  siteKey,
  resetSignal,
  onToken,
}: TurnstileCaptchaProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      return;
    }

    let isCancelled = false;

    const renderWidget = () => {
      if (isCancelled || !containerRef.current || !window.turnstile) {
        return;
      }
      if (widgetIdRef.current) {
        return;
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "light",
        callback: (token) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(""),
        "error-callback": () => onTokenRef.current(""),
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const existingScript = document.getElementById("cf-turnstile-script");
      if (existingScript) {
        existingScript.addEventListener("load", renderWidget, { once: true });
      } else {
        const script = document.createElement("script");
        script.id = "cf-turnstile-script";
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.defer = true;
        script.addEventListener("load", renderWidget, { once: true });
        document.head.appendChild(script);
      }
    }

    return () => {
      isCancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [siteKey]);

  useEffect(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      onToken("");
    }
  }, [resetSignal, onToken]);

  return <div ref={containerRef} className="min-h-[65px]" />;
};

const getFirstVotableCategory = (categories: CYESAwardCategory[]) =>
  categories.find((category) => category.nominees.length > 0) || categories[0];

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
      label: "Awaiting first vote",
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
      label: "Close race",
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
    label: "Rising",
    className: "bg-[#FFF1F2] text-[#CC2129]",
  };
};

const CYESVotingPage = () => {
  const { toast } = useToast();
  const { data: voting, isLoading, error, refetch } = useCyesVoting();
  const requestOtp = useRequestCyesVoteOtp();
  const castVote = useCastCyesVote();
  const [votingStep, setVotingStep] = useState<VotingStep>("category");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedNomineeId, setSelectedNomineeId] = useState("");
  const [voterName, setVoterName] = useState("");
  const [voterPhone, setVoterPhone] = useState("");
  const [voterEmail, setVoterEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);
  const [fallbackCaptcha, setFallbackCaptcha] = useState<FallbackCaptcha | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const categories = useMemo(() => voting?.categories || [], [voting?.categories]);
  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId
  );
  const selectedNominee = selectedCategory?.nominees.find(
    (nominee) => nominee.id === selectedNomineeId
  );
  const selectedCategoryNominees = useMemo(
    () =>
      selectedCategory
        ? [...selectedCategory.nominees].sort(
            (left, right) => right.vote_count - left.vote_count
          )
        : [],
    [selectedCategory]
  );

  const categoryStats = useMemo(() => {
    const openCategories = categories.filter((category) => category.nominees.length);
    const nominees = categories.reduce(
      (sum, category) => sum + category.nominees.length,
      0
    );

    return {
      openCategories: openCategories.length,
      nominees,
      votes: voting?.total_votes || 0,
    };
  }, [categories, voting?.total_votes]);

  const votingSteps: Array<{ id: VotingStep; label: string; description: string }> = [
    {
      id: "category",
      label: "Category",
      description: "Choose where your vote should count.",
    },
    {
      id: "nominee",
      label: "Nominee",
      description: "Pick one nominee in that category.",
    },
    {
      id: "details",
      label: "Details",
      description: "Add your name and contact details.",
    },
    {
      id: "verify",
      label: "Verify",
      description: "Enter the code and submit.",
    },
  ];
  const activeStepIndex = Math.max(
    votingSteps.findIndex((step) => step.id === votingStep),
    0
  );
  const voteSummary =
    selectedNominee && selectedCategory
      ? `${selectedNominee.name} - ${selectedCategory.name}`
      : selectedCategory
        ? selectedCategory.name
        : "No selection yet";

  const loadFallbackCaptcha = useCallback(async () => {
    if (turnstileSiteKey) {
      return;
    }

    try {
      const captcha = await cyesVotingService.getCaptchaChallenge();
      setFallbackCaptcha(captcha);
      setCaptchaAnswer("");
    } catch (captchaError) {
      toast({
        title: "CAPTCHA unavailable",
        description:
          captchaError instanceof Error
            ? captchaError.message
            : "Could not prepare the CAPTCHA.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    if (!selectedCategoryId && categories.length) {
      const firstCategory = getFirstVotableCategory(categories);
      setSelectedCategoryId(firstCategory?.id || "");
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    if (!selectedCategory) {
      setSelectedNomineeId("");
      return;
    }

    const nomineeStillAvailable = selectedCategory.nominees.some(
      (nominee) => nominee.id === selectedNomineeId
    );
    if (!nomineeStillAvailable) {
      setSelectedNomineeId("");
    }
  }, [selectedCategory, selectedNomineeId]);

  useEffect(() => {
    void loadFallbackCaptcha();
  }, [loadFallbackCaptcha]);

  const resetOtpAndCaptcha = () => {
    setOtp("");
    setCaptchaToken("");
    setCaptchaResetSignal((current) => current + 1);
    void loadFallbackCaptcha();
  };

  const resetOtpForFieldChange = () => {
    setOtp("");
    setCaptchaToken("");
  };

  const handleRequestOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCategory || !selectedNominee) {
      toast({
        title: "Choose a nominee",
        description: "Select a category and nominee before requesting an OTP.",
        variant: "destructive",
      });
      return;
    }

    if (turnstileSiteKey && !captchaToken) {
      toast({
        title: "CAPTCHA required",
        description: "Complete the CAPTCHA before requesting an OTP.",
        variant: "destructive",
      });
      return;
    }

    try {
      await requestOtp.mutateAsync({
        categoryId: selectedCategory.id,
        nomineeId: selectedNominee.id,
        voterName,
        voterPhone,
        voterEmail,
        captchaToken: captchaToken || undefined,
        captchaChallengeId: fallbackCaptcha?.id,
        captchaAnswer,
      });
      setVotingStep("verify");
      toast({
        title: "OTP sent",
        description: "Check your email for the verification code.",
      });
    } catch (requestError) {
      resetOtpAndCaptcha();
      toast({
        title: "Could not send OTP",
        description:
          requestError instanceof Error
            ? requestError.message
            : "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  const handleCastVote = async () => {
    if (!selectedCategory || !selectedNominee) {
      return;
    }

    try {
      await castVote.mutateAsync({
        categoryId: selectedCategory.id,
        nomineeId: selectedNominee.id,
        voterName,
        voterPhone,
        voterEmail,
        otp,
      });
      toast({
        title: "Vote recorded",
        description: `${selectedNominee.name} has received your vote for ${selectedCategory.name}.`,
      });
      setSelectedNomineeId("");
      setVotingStep("category");
      resetOtpAndCaptcha();
      void refetch();
    } catch (voteError) {
      toast({
        title: "Could not record vote",
        description:
          voteError instanceof Error ? voteError.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-[#171411]">
      <Header />

      <main className="pb-20 md:pb-24">
        <CYESInnerHero
          eyebrow="CYES awards voting"
          title={
            <>
              Vote for the
              <br />
              <span className="font-display text-[#156D3B]">nominees shaping</span>
              <br />
              the CYECD Awards.
            </>
          }
          description="Support outstanding entrepreneurs, leaders, and institutions across each open CYECD Awards category. Votes are verified by email before they are counted."
          actions={
            <>
              <a href="#cyes-voting-flow">
                <Button className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92">
                  Start Voting
                </Button>
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
              label: "Open Categories",
              value: String(categoryStats.openCategories),
              accentClassName: "text-[#156D3B]",
            },
            {
              label: "Nominees",
              value: String(categoryStats.nominees),
              accentClassName: "text-[#1875D2]",
            },
            {
              label: "Votes",
              value: String(categoryStats.votes),
              accentClassName: "text-[#CC2129]",
            },
          ]}
          cards={votingHeroCards}
          mobileImage={cyesAwards}
          mobileImageAlt="CYECD Awards audience"
          mobileImageClassName="rotate-[10deg]"
        />

        <section id="cyes-voting-flow" className="mx-auto mt-16 max-w-6xl px-6 md:px-24">
          <CYESSectionIntro
            eyebrow="Guided voting"
            title={
              <>
                Vote in
                <span className="block font-display">four clear steps</span>
              </>
            }
            description="Choose a category, choose a nominee, verify your email, and submit. You can vote once in each category with the same phone number."
          />

          {isLoading ? (
            <div className={cyesSurfaceClasses + " mt-10 flex items-center gap-3 px-6 py-7"}>
              <Loader2 className="h-5 w-5 animate-spin text-[#156D3B]" />
              <p className="font-sans text-sm text-[#171411]/72">Loading voting categories...</p>
            </div>
          ) : error ? (
            <div className={cyesSurfaceClasses + " mt-10 px-6 py-7"}>
              <p className="font-sans text-sm text-[#CC2129]">
                {error instanceof Error ? error.message : "Could not load voting."}
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
            <div className="mt-10 grid gap-6 lg:grid-cols-[0.34fr_0.66fr] lg:items-start">
              <aside className={cyesSurfaceClasses + " px-4 py-4 lg:sticky lg:top-24"}>
                <div className="grid gap-3">
                  {votingSteps.map((step, index) => {
                    const isCurrent = step.id === votingStep;
                    const isComplete = index < activeStepIndex;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        className={`rounded-[1.15rem] border px-4 py-3 text-left transition-colors ${
                          isCurrent
                            ? "border-[#156D3B] bg-[#f3fbf6]"
                            : isComplete
                              ? "border-[#156D3B]/15 bg-white"
                              : "border-black/8 bg-white/60"
                        }`}
                        onClick={() => {
                          if (index <= activeStepIndex) {
                            setVotingStep(step.id);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                              isComplete
                                ? "bg-[#156D3B] text-white"
                                : isCurrent
                                  ? "bg-white text-[#156D3B]"
                                  : "bg-[#171411]/8 text-[#171411]/58"
                            }`}
                          >
                            {isComplete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                          </span>
                          <span>
                            <span className="block font-sans text-sm font-semibold text-[#171411]">
                              {step.label}
                            </span>
                            <span className="mt-1 block font-sans text-xs leading-relaxed text-[#171411]/58">
                              {step.description}
                            </span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-[1.2rem] border border-black/8 bg-white/72 px-4 py-4">
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#156D3B]">
                    Current vote
                  </p>
                  <p className="mt-2 font-sans text-base font-semibold leading-tight text-[#171411]">
                    {voteSummary}
                  </p>
                </div>
              </aside>

              <div className={cyesSurfaceClasses + " px-5 py-6 md:px-7 md:py-7"}>
                {votingStep === "category" ? (
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-[#156D3B]">
                          Step 1
                        </p>
                        <h2 className="mt-2 font-sans text-[1.8rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171411]">
                          Choose a category
                        </h2>
                      </div>
                      <div className="rounded-2xl bg-[#eef5fb] px-4 py-3 text-sm font-semibold text-[#1875D2]">
                        {categoryStats.openCategories} open
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          className={`rounded-[1.35rem] border px-5 py-4 text-left transition-colors ${
                            category.id === selectedCategoryId
                              ? "border-[#156D3B] bg-[#f3fbf6]"
                              : "border-black/8 bg-white/74 hover:border-[#156D3B]/35"
                          }`}
                          onClick={() => {
                            setSelectedCategoryId(category.id);
                            setSelectedNomineeId("");
                            resetOtpAndCaptcha();
                            setVotingStep("nominee");
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-sans text-[1.02rem] font-semibold leading-tight text-[#171411]">
                                {category.name}
                              </p>
                              <p className="mt-2 font-sans text-sm text-[#171411]/62">
                                {category.nominees.length} nominees
                              </p>
                            </div>
                            <BarChart3 className="mt-1 h-4 w-4 flex-shrink-0 text-[#1875D2]" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {votingStep === "nominee" ? (
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-[#156D3B]">
                          Step 2
                        </p>
                        <h2 className="mt-2 font-sans text-[1.8rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171411]">
                          Choose a nominee
                        </h2>
                        {selectedCategory ? (
                          <p className="mt-3 font-sans text-sm leading-relaxed text-[#171411]/66">
                            {selectedCategory.name}. Live vote totals and current standing
                            are shown below to help you choose.
                          </p>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setVotingStep("category")}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Categories
                      </Button>
                    </div>

                    <div className="mt-6 grid gap-4">
                      {selectedCategoryNominees.length ? (
                        selectedCategoryNominees.map((nominee, index) => {
                          const classification = getNomineeClassification(
                            nominee,
                            selectedCategoryNominees
                          );

                          return (
                            <button
                              key={nominee.id}
                              type="button"
                              className={`grid gap-4 rounded-[1.4rem] border p-4 text-left transition-colors md:grid-cols-[86px_1fr_auto] md:items-center ${
                                nominee.id === selectedNomineeId
                                  ? "border-[#156D3B] bg-[#f3fbf6]"
                                  : "border-black/8 bg-white/74 hover:border-[#156D3B]/35"
                              }`}
                              onClick={() => {
                                setSelectedNomineeId(nominee.id);
                                resetOtpAndCaptcha();
                                setVotingStep("details");
                              }}
                            >
                              <div className="h-20 w-20 overflow-hidden rounded-[1.1rem] bg-[#eef2f6]">
                                {nominee.photo_url ? (
                                  <img
                                    src={nominee.photo_url}
                                    alt={nominee.name}
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
                            </button>
                          );
                        })
                      ) : (
                        <p className="rounded-[1.4rem] border border-dashed border-black/10 bg-white/70 px-5 py-6 font-sans text-sm text-[#171411]/64">
                          No active nominees have been added to this category yet.
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}

                {votingStep === "details" ? (
                  <form className="grid gap-5" onSubmit={handleRequestOtp}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-[#156D3B]">
                          Step 3
                        </p>
                        <h2 className="mt-2 font-sans text-[1.8rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171411]">
                          Add your details
                        </h2>
                        <p className="mt-3 font-sans text-sm leading-relaxed text-[#171411]/66">
                          {voteSummary}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setVotingStep("nominee")}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Nominees
                      </Button>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <Label htmlFor="cyesVoterName" className="font-sans text-sm font-semibold text-[#171411]">
                          Full name
                        </Label>
                        <Input
                          id="cyesVoterName"
                          className={cyesInputClasses + " mt-2"}
                          value={voterName}
                          onChange={(event) => setVoterName(event.target.value)}
                          placeholder="Your full name"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="cyesVoterPhone" className="font-sans text-sm font-semibold text-[#171411]">
                          Phone number
                        </Label>
                        <Input
                          id="cyesVoterPhone"
                          type="tel"
                          className={cyesInputClasses + " mt-2"}
                          value={voterPhone}
                          onChange={(event) => {
                            setVoterPhone(event.target.value);
                            resetOtpForFieldChange();
                          }}
                          placeholder="+237 6XX XXX XXX"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cyesVoterEmail" className="font-sans text-sm font-semibold text-[#171411]">
                        Email
                      </Label>
                      <Input
                        id="cyesVoterEmail"
                        type="email"
                        className={cyesInputClasses + " mt-2"}
                        value={voterEmail}
                        onChange={(event) => {
                          setVoterEmail(event.target.value);
                          resetOtpForFieldChange();
                        }}
                        placeholder="name@example.com"
                        required
                      />
                    </div>

                    {turnstileSiteKey ? (
                      <div className="rounded-[1.3rem] border border-black/8 bg-white/74 px-4 py-4">
                        <TurnstileCaptcha
                          siteKey={turnstileSiteKey}
                          resetSignal={captchaResetSignal}
                          onToken={setCaptchaToken}
                        />
                      </div>
                    ) : (
                      <div className="rounded-[1.3rem] border border-black/8 bg-white/74 px-4 py-4">
                        <div className="flex flex-wrap items-end gap-3">
                          <div className="min-w-[150px] flex-1">
                            <Label htmlFor="cyesCaptchaAnswer" className="font-sans text-sm font-semibold text-[#171411]">
                              CAPTCHA: {fallbackCaptcha?.question || "..."}
                            </Label>
                            <Input
                              id="cyesCaptchaAnswer"
                              inputMode="numeric"
                              className={cyesInputClasses + " mt-2"}
                              value={captchaAnswer}
                              onChange={(event) => setCaptchaAnswer(event.target.value)}
                              required
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-11 rounded-full"
                            onClick={() => void loadFallbackCaptcha()}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reload
                          </Button>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
                      disabled={requestOtp.isPending || !selectedNominee}
                    >
                      {requestOtp.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="mr-2 h-4 w-4" />
                      )}
                      Send OTP
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                ) : null}

                {votingStep === "verify" ? (
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-[#156D3B]">
                          Step 4
                        </p>
                        <h2 className="mt-2 font-sans text-[1.8rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171411]">
                          Verify and submit
                        </h2>
                        <p className="mt-3 font-sans text-sm leading-relaxed text-[#171411]/66">
                          Enter the six-digit code sent to {voterEmail || "your email"}.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setVotingStep("details")}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Details
                      </Button>
                    </div>

                    <div className="mt-6 rounded-[1.3rem] border border-[#156D3B]/20 bg-[#f3fbf6] px-4 py-4">
                      <p className="font-sans text-sm text-[#171411]/62">Submitting</p>
                      <p className="mt-1 font-sans text-[1.1rem] font-semibold leading-tight text-[#171411]">
                        {voteSummary}
                      </p>
                    </div>

                    <div className="mt-6">
                      <Label className="font-sans text-sm font-semibold text-[#171411]">
                        OTP code
                      </Label>
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={setOtp}
                        containerClassName="mt-3"
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className="h-11 w-11 border-[#156D3B]/25 bg-white text-base"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button
                        type="button"
                        className="h-12 rounded-full bg-[#156D3B] px-7 font-sans text-sm font-semibold text-white hover:bg-[#156D3B]/92"
                        onClick={() => void handleCastVote()}
                        disabled={castVote.isPending || otp.length < 4}
                      >
                        {castVote.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Vote className="mr-2 h-4 w-4" />
                        )}
                        Submit Vote
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 rounded-full"
                        onClick={resetOtpAndCaptcha}
                      >
                        Request new code
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className={cyesSurfaceClasses + " mt-10 px-6 py-7"}>
              <p className="font-sans text-sm text-[#171411]/72">
                Voting categories are not open yet.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer variant="cyes" />
    </div>
  );
};

export default CYESVotingPage;
