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
import { Textarea } from "@/components/ui/textarea";
import type { CYESAwardCategory } from "@/integrations/supabase/services";
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
  BarChart3,
  CheckCircle2,
  Loader2,
  Phone,
  RefreshCw,
  ShieldCheck,
  Vote,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

const CYESVotingPage = () => {
  const { toast } = useToast();
  const { data: voting, isLoading, error, refetch } = useCyesVoting();
  const requestOtp = useRequestCyesVoteOtp();
  const castVote = useCastCyesVote();
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedNomineeId, setSelectedNomineeId] = useState("");
  const [voterName, setVoterName] = useState("");
  const [voterPhone, setVoterPhone] = useState("");
  const [voterEmail, setVoterEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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
      setSelectedNomineeId(selectedCategory.nominees[0]?.id || "");
    }
  }, [selectedCategory, selectedNomineeId]);

  useEffect(() => {
    void loadFallbackCaptcha();
  }, [loadFallbackCaptcha]);

  const resetOtpAndCaptcha = () => {
    setOtp("");
    setOtpSent(false);
    setCaptchaToken("");
    setCaptchaResetSignal((current) => current + 1);
    void loadFallbackCaptcha();
  };

  const resetOtpForFieldChange = () => {
    setOtp("");
    setOtpSent(false);
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
      setOtpSent(true);
      toast({
        title: "OTP sent",
        description: "Check your phone for the verification code.",
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
          description="Support outstanding entrepreneurs, leaders, and institutions across each open CYECD Awards category. Votes are verified by phone before they are counted."
          actions={
            <>
              <a href="#cyes-voting-board">
                <Button className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92">
                  Start Voting
                </Button>
              </a>
              <a
                href="#cyes-voting-form"
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white/76 px-7 font-sans text-sm font-semibold text-[#171411] transition-colors hover:bg-white"
              >
                Verify Phone
              </a>
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

        <section id="cyes-voting-board" className="mx-auto mt-16 max-w-6xl px-6 md:px-24">
          <CYESSectionIntro
            eyebrow="Voting board"
            title={
              <>
                Categories and
                <span className="block font-display">nominees</span>
              </>
            }
            description="Each category accepts one verified vote per phone number. You can return to vote in another category after completing the current vote."
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
            <div className="mt-10 grid gap-5 lg:grid-cols-[0.42fr_0.58fr]">
              <div className="space-y-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={`w-full rounded-[1.55rem] border px-5 py-4 text-left transition-colors ${
                      category.id === selectedCategoryId
                        ? "border-[#156D3B] bg-white shadow-[0_16px_38px_rgba(17,16,14,0.07)]"
                        : "border-black/8 bg-white/62 hover:border-[#156D3B]/40"
                    }`}
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      resetOtpAndCaptcha();
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

              <div className={cyesSurfaceClasses + " px-5 py-5 md:px-6 md:py-6"}>
                {selectedCategory ? (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-[#156D3B]">
                          Selected category
                        </p>
                        <h2 className="mt-2 font-sans text-[1.8rem] font-semibold leading-[0.98] tracking-[-0.05em] text-[#171411]">
                          {selectedCategory.name}
                        </h2>
                        {selectedCategory.description ? (
                          <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-[#171411]/68">
                            {selectedCategory.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="rounded-2xl bg-[#eef5fb] px-4 py-3 text-sm font-semibold text-[#1875D2]">
                        {selectedCategory.vote_count} votes
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4">
                      {selectedCategory.nominees.length ? (
                        selectedCategory.nominees.map((nominee) => (
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
                              <p className="font-sans text-[1.15rem] font-semibold leading-tight text-[#171411]">
                                {nominee.name}
                              </p>
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
                            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 font-sans text-sm font-semibold text-[#171411] shadow-[0_8px_22px_rgba(17,16,14,0.06)]">
                              <Vote className="h-4 w-4 text-[#CC2129]" />
                              {nominee.vote_count}
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="rounded-[1.4rem] border border-dashed border-black/10 bg-white/70 px-5 py-6 font-sans text-sm text-[#171411]/64">
                          No active nominees have been added to this category yet.
                        </p>
                      )}
                    </div>
                  </>
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

        <section id="cyes-voting-form" className="mx-auto mt-20 max-w-6xl px-6 md:px-24">
          <div className="grid gap-6 lg:grid-cols-[0.48fr_0.52fr] lg:items-start">
            <div>
              <CYESSectionIntro
                eyebrow="Verified vote"
                title={
                  <>
                    Confirm your
                    <span className="block font-display">phone number</span>
                  </>
                }
                description="Your vote is counted after the phone OTP is verified. The same phone number can vote once in each category."
              />

              <div className="mt-8 grid gap-4">
                {[
                  {
                    icon: ShieldCheck,
                    title: "CAPTCHA checked",
                    description: "Voting requests are screened before OTP delivery.",
                  },
                  {
                    icon: Phone,
                    title: "OTP verified",
                    description: "Supabase sends the verification code to your phone.",
                  },
                  {
                    icon: CheckCircle2,
                    title: "One vote counted",
                    description: "A unique phone/category rule blocks repeat votes.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title} className={cyesSurfaceClasses + " px-5 py-5"}>
                      <Icon className="h-6 w-6 text-[#156D3B]" />
                      <h3 className="mt-4 font-sans text-[1.1rem] font-semibold leading-tight text-[#171411]">
                        {item.title}
                      </h3>
                      <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/66">
                        {item.description}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>

            <form
              className={cyesSurfaceClasses + " px-5 py-6 md:px-7 md:py-7"}
              onSubmit={handleRequestOtp}
            >
              <div className="mb-6 rounded-[1.3rem] border border-black/8 bg-white/74 px-4 py-4">
                <p className="font-sans text-sm text-[#171411]/62">Current vote</p>
                <p className="mt-1 font-sans text-[1.1rem] font-semibold leading-tight text-[#171411]">
                  {selectedNominee && selectedCategory
                    ? `${selectedNominee.name} - ${selectedCategory.name}`
                    : "Select a nominee above"}
                </p>
              </div>

              <div className="grid gap-5">
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

                <div>
                  <Label htmlFor="cyesVoterEmail" className="font-sans text-sm font-semibold text-[#171411]">
                    Email
                  </Label>
                  <Input
                    id="cyesVoterEmail"
                    type="email"
                    className={cyesInputClasses + " mt-2"}
                    value={voterEmail}
                    onChange={(event) => setVoterEmail(event.target.value)}
                    placeholder="name@example.com"
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

                {otpSent ? (
                  <div className="rounded-[1.3rem] border border-[#156D3B]/20 bg-[#f3fbf6] px-4 py-4">
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
                    <Button
                      type="button"
                      className="mt-5 h-12 rounded-full bg-[#156D3B] px-7 font-sans text-sm font-semibold text-white hover:bg-[#156D3B]/92"
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
                  </div>
                ) : (
                  <Button
                    type="submit"
                    className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
                    disabled={requestOtp.isPending || !selectedNominee}
                  >
                    {requestOtp.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Phone className="mr-2 h-4 w-4" />
                    )}
                    Send OTP
                  </Button>
                )}
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer variant="cyes" />
    </div>
  );
};

export default CYESVotingPage;
