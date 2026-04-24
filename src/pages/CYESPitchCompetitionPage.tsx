import { useEffect, useRef, useState } from "react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  CYESInnerHero,
  CYESSectionIntro,
  cyesInputClasses,
  cyesSelectTriggerClasses,
  cyesSurfaceClasses,
  cyesTextareaClasses,
} from "@/components/cyes/CYESPageShell";
import { CompetitionPaymentRedirect } from "@/components/registration/CompetitionPaymentRedirect";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSubmitCompetitionApplication } from "@/hooks/useSupabase";
import businessCompBg from "@/assets/businesscomp.jpeg";
import cyesEvent from "@/assets/CYES.jpeg";
import speaker2 from "@/assets/speaker2.jpeg";
import speaker5 from "@/assets/speaker5.jpeg";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Globe,
  Lightbulb,
  MapPin,
  Star,
  Trophy,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  buildCompetitionApplicationCode,
  competitionRegistrationLinks,
} from "@/lib/registration-links";
import { sendCompetitionRegistrationEmail } from "@/lib/send-registration-email";

const industries = [
  "Agriculture & Agribusiness",
  "Technology & Innovation",
  "Fashion & Beauty",
  "Food & Beverage",
  "Health & Wellness",
  "Education & Training",
  "Finance & Fintech",
  "Manufacturing",
  "Media & Entertainment",
  "Retail & E-commerce",
  "Tourism & Hospitality",
  "Transport & Logistics",
  "Other",
];

const operatingOptions = ["Yes", "No"];
const runningDurationOptions = [
  "Just starting (less than 6 months)",
  "6 months - 1 year",
  "1 - 2 years",
  "2 - 5 years",
  "More than 5 years",
];

const paymentConfig = competitionRegistrationLinks.cyesPitch;

const pitchHeroCards = [
  {
    image: businessCompBg,
    alt: "Business pitch competition hero",
    className: "left-[18%] top-[7%] z-20 w-[42%] rotate-[-4deg]",
  },
  {
    image: speaker2,
    alt: "Entrepreneur portrait",
    className: "left-[61%] top-[16%] z-10 w-[28%] rotate-[7deg]",
  },
  {
    image: speaker5,
    alt: "Speaker detail",
    className: "left-[31%] top-[60%] z-30 w-[23%] rotate-[-8deg]",
  },
  {
    image: cyesEvent,
    alt: "CYES live event",
    className: "left-[54%] top-[56%] z-20 w-[33%] rotate-[8deg]",
  },
];

const prizeCards = [
  {
    icon: Trophy,
    title: "300,000 CFA",
    description: "A direct cash prize for the winning pitch on summit day.",
  },
  {
    icon: Globe,
    title: "Business website",
    description:
      "A professional website to strengthen visibility, positioning, and credibility.",
  },
  {
    icon: Video,
    title: "Video advert",
    description:
      "A professionally produced business advert designed for awareness and promotion.",
  },
  {
    icon: Star,
    title: "Platform visibility",
    description:
      "Feature placement across our channels to keep the winning business in view.",
  },
];

const processSteps = [
  "Submit your application through the form below.",
  "Complete payment through Ayati to lock your place in the pool.",
  "Applications are reviewed and the final shortlist is selected.",
  "Only 20 businesses will pitch live in Buea on 16 July 2026.",
  "A jury panel evaluates every pitch and selects the strongest idea.",
];

const CYESPitchCompetitionPage = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [agreedToDeclaration, setAgreedToDeclaration] = useState(false);
  const [isOperating, setIsOperating] = useState("");
  const [runningDuration, setRunningDuration] = useState("");
  const [industry, setIndustry] = useState("");
  const [availablePhysically, setAvailablePhysically] = useState("");
  const [submittedApplicationCode, setSubmittedApplicationCode] = useState("");
  const [isFinalizingSubmission, setIsFinalizingSubmission] = useState(false);
  const { toast } = useToast();
  const submitCompetitionApplication = useSubmitCompetitionApplication();

  useEffect(() => {
    if (!submittedApplicationCode) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      window.location.assign(paymentConfig.paymentHref);
    }, 1600);

    return () => window.clearTimeout(timeoutId);
  }, [submittedApplicationCode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!agreedToDeclaration) {
      toast({
        title: "Please confirm the declaration before submitting",
        variant: "destructive",
      });
      return;
    }
    if (!industry) {
      toast({
        title: "Please select your industry / sector",
        variant: "destructive",
      });
      return;
    }
    if (!isOperating) {
      toast({
        title:
          "Please indicate whether your business is currently operating",
        variant: "destructive",
      });
      return;
    }
    if (!availablePhysically) {
      toast({
        title:
          "Please confirm your availability to pitch in Buea on July 16, 2026",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const applicationCode = buildCompetitionApplicationCode(
      paymentConfig.codePrefix,
    );

    const fullName = (formData.get("fullName") as string).trim();
    const phone = (formData.get("phone") as string).trim();
    const email = (formData.get("email") as string).trim();
    const city = (formData.get("city") as string).trim();
    const businessName = (formData.get("businessName") as string).trim();
    const oneSentence = (formData.get("oneSentence") as string).trim();
    const problemSolved = (formData.get("problemSolved") as string).trim();
    const uniqueness = (formData.get("uniqueness") as string).trim();
    const targetCustomers = (formData.get("targetCustomers") as string).trim();
    const revenueModel = (formData.get("revenueModel") as string).trim();
    const impact = (formData.get("impact") as string).trim();
    const vision = (formData.get("vision") as string).trim();
    const whySelected = (formData.get("whySelected") as string).trim();

    try {
      setIsFinalizingSubmission(true);

      await submitCompetitionApplication.mutateAsync({
        application_code: applicationCode,
        competition_slug: paymentConfig.competitionSlug,
        category: industry,
        first_name: fullName,
        last_name: "",
        email,
        phone,
        city,
        country: "Cameroon",
        motivation: whySelected,
        payment_status: "pending",
        payment_platform: "ayatickets",
        review_status: "submitted",
        form_payload: {
          business_name: businessName,
          business_summary: oneSentence,
          problem_solved: problemSolved,
          uniqueness,
          target_customers: targetCustomers,
          revenue_model: revenueModel,
          impact,
          vision,
          currently_operating: isOperating,
          running_duration: runningDuration || null,
          available_physically: availablePhysically,
          agreed_to_declaration: agreedToDeclaration,
          registration_deadline: "2026-06-10",
          event_date: "2026-07-16",
        },
      });

      let emailWarning: string | null = null;

      try {
        await sendCompetitionRegistrationEmail({
          applicantEmail: email,
          applicantFirstName: fullName,
          competitionTitle: paymentConfig.title,
          applicationCode,
          paymentHref: paymentConfig.paymentHref,
          category: industry,
        });
      } catch (error) {
        emailWarning =
          error instanceof Error
            ? error.message
            : "We could not send the confirmation email.";
      }

      formRef.current?.reset();
      setAgreedToDeclaration(false);
      setIsOperating("");
      setRunningDuration("");
      setIndustry("");
      setAvailablePhysically("");
      setSubmittedApplicationCode(applicationCode);

      toast({
        title: "Application saved",
        description: emailWarning
          ? `${emailWarning} Your application was still saved and you are being redirected to Ayati.`
          : "A confirmation email has been sent. Redirecting you to Ayati to complete payment.",
      });
    } catch (error) {
      toast({
        title: "We could not save your application",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsFinalizingSubmission(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-[#171411]">
      <Header />

      <main className="pb-20 md:pb-24">
        <CYESInnerHero
          eyebrow="CYES pitch competition"
          title={
            <>
              Pitch your business.
              <br />
              <span className="font-display text-[#156D3B]">
                Win visibility and funding.
              </span>
            </>
          }
          description="The CYES pitch competition is built for founders with strong ideas, a clear problem, and a business worth backing. Submit your application, complete payment, and compete for one of the final live slots."
          actions={
            <>
              <a
                href="#cyes-pitch-application"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#171411]/92"
              >
                Start application
              </a>
              <Link
                to="/cyes/contact"
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white/80 px-7 font-sans text-sm font-semibold text-[#171411] transition-colors hover:bg-white"
              >
                Ask a question
              </Link>
            </>
          }
          chips={[
            {
              label: "Slots",
              value: "20 final pitches",
              accentClassName: "text-[#CC2129]",
            },
            {
              label: "Fee",
              value: "20,000 CFA",
              accentClassName: "text-[#1875D2]",
            },
            {
              label: "Pitch date",
              value: "16 July 2026",
              accentClassName: "text-[#156D3B]",
            },
          ]}
          cards={pitchHeroCards}
          mobileImage={businessCompBg}
          mobileImageAlt="CYES pitch competition"
          mobileImageClassName="rotate-[10deg]"
        />

        <section className="mx-auto mt-16 max-w-6xl px-6 md:px-24">
          <CYESSectionIntro
            eyebrow="Competition value"
            title={
              <>
                What this
                <span className="block font-display">can unlock</span>
              </>
            }
            description="This is more than a stage moment. It is a route into visibility, proof of momentum, and a stronger business narrative in front of the right audience."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {prizeCards.map((card) => {
              const Icon = card.icon;

              return (
                <article key={card.title} className={cyesSurfaceClasses + " px-6 py-7"}>
                  <Icon className="h-9 w-9 text-[#156D3B]" />
                  <h3 className="mt-6 font-sans text-[1.2rem] font-semibold leading-[1.08] tracking-[-0.045em] text-[#171411]">
                    {card.title}
                  </h3>
                  <p className="mt-4 font-sans text-[0.96rem] leading-relaxed text-[#171411]/72">
                    {card.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-6xl px-6 md:px-24">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className={cyesSurfaceClasses + " px-6 py-7 md:px-7 md:py-8"}>
              <p className="font-sans text-[0.92rem] font-semibold uppercase tracking-[0.08em] text-[#156D3B]">
                Who this is for
              </p>
              <h2 className="mt-4 font-sans text-[clamp(2rem,4vw,3rem)] font-semibold leading-[0.93] tracking-[-0.065em] text-[#171411]">
                Early traction. Clear ambition. Real pitch readiness.
              </h2>
              <p className="mt-4 font-sans text-[1rem] leading-relaxed text-[#171411]/72">
                We are looking for entrepreneurs, startup founders, and small
                business owners building something with visible potential and the
                discipline to present it clearly.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  "Young entrepreneurs and startup founders",
                  "Businesses with a clear problem-solution fit",
                  "Operators who can pitch live in Buea on 16 July 2026",
                  "Ideas with scale, traction, or strong community value",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.3rem] border border-black/8 bg-white/80 px-4 py-4"
                  >
                    <p className="font-sans text-[1rem] leading-[1.35] text-[#171411]/78">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className={cyesSurfaceClasses + " px-6 py-7 md:px-8 md:py-8"}>
              <p className="font-sans text-[0.92rem] font-semibold uppercase tracking-[0.08em] text-[#156D3B]">
                How it works
              </p>
              <h2 className="mt-4 font-sans text-[clamp(2rem,4vw,3rem)] font-semibold leading-[0.93] tracking-[-0.065em] text-[#171411]">
                The route from application to live pitch.
              </h2>

              <div className="mt-8 space-y-3">
                {processSteps.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-start gap-4 rounded-[1.35rem] border border-black/8 bg-white/80 px-4 py-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#171411] font-sans text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <p className="pt-1 font-sans text-[0.98rem] leading-relaxed text-[#171411]/76">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.2rem] border border-black/8 bg-white/80 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-[#CC2129]" />
                    <span className="font-sans text-sm text-[#171411]/76">
                      20 slots only
                    </span>
                  </div>
                </div>
                <div className="rounded-[1.2rem] border border-black/8 bg-white/80 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-[#156D3B]" />
                    <span className="font-sans text-sm text-[#171411]/76">
                      Deadline 10 June
                    </span>
                  </div>
                </div>
                <div className="rounded-[1.2rem] border border-black/8 bg-white/80 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-[#1875D2]" />
                    <span className="font-sans text-sm text-[#171411]/76">
                      Live in Buea
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="cyes-pitch-application"
          className="mx-auto mt-20 max-w-6xl px-6 md:px-24"
        >
          {submittedApplicationCode ? (
            <CompetitionPaymentRedirect
              applicationCode={submittedApplicationCode}
              paymentHref={paymentConfig.paymentHref}
              title="CYES Pitch Application Received"
              description="Your application is now stored in the CYES registration system. Complete your Ayati payment to finish the registration flow."
            />
          ) : (
            <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
              <div className={cyesSurfaceClasses + " px-6 py-7 md:px-7 md:py-8"}>
                <p className="font-sans text-[0.92rem] font-semibold uppercase tracking-[0.08em] text-[#156D3B]">
                  Before you submit
                </p>
                <h2 className="mt-4 font-sans text-[clamp(2rem,4vw,3rem)] font-semibold leading-[0.93] tracking-[-0.065em] text-[#171411]">
                  Strong applications are clear, grounded, and pitch-ready.
                </h2>
                <p className="mt-4 font-sans text-[1rem] leading-relaxed text-[#171411]/72">
                  We want to understand the business, the problem, the model, and
                  why your idea deserves one of the final live spots. Fill the
                  form carefully, then continue to Ayati for payment.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    "Explain the business in a single sentence with confidence.",
                    "Be specific about the problem, customer, and revenue model.",
                    "Show the difference between ambition and actual traction.",
                    "Only apply if you can pitch physically in Buea.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[1.3rem] border border-black/8 bg-white/80 px-4 py-4"
                    >
                      <p className="font-sans text-[1rem] leading-[1.35] text-[#171411]/78">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={cyesSurfaceClasses + " px-6 py-7 md:px-8 md:py-8"}>
                <div>
                  <p className="font-sans text-[0.92rem] font-semibold uppercase tracking-[0.08em] text-[#156D3B]">
                    Application form
                  </p>
                  <h2 className="mt-4 font-sans text-[clamp(2rem,4vw,3rem)] font-semibold leading-[0.93] tracking-[-0.065em] text-[#171411]">
                    Save your application, then continue to Ayati.
                  </h2>
                </div>

                <form ref={formRef} className="mt-8 space-y-8" onSubmit={handleSubmit}>
                  <div>
                    <h3 className="font-sans text-[1.25rem] font-semibold leading-tight tracking-[-0.04em] text-[#171411]">
                      Personal information
                    </h3>
                    <div className="mt-5 space-y-5">
                      <div>
                        <Label
                          htmlFor="fullName"
                          className="font-sans text-sm font-semibold text-[#171411]"
                        >
                          Full Name
                        </Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          className={cyesInputClasses}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <Label
                            htmlFor="phone"
                            className="font-sans text-sm font-semibold text-[#171411]"
                          >
                            WhatsApp Number
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            className={cyesInputClasses}
                            placeholder="WhatsApp number e.g. +237 6XX XXX XXX"
                            required
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="email"
                            className="font-sans text-sm font-semibold text-[#171411]"
                          >
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            className={cyesInputClasses}
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label
                          htmlFor="city"
                          className="font-sans text-sm font-semibold text-[#171411]"
                        >
                          City / Location
                        </Label>
                        <Input
                          id="city"
                          name="city"
                          className={cyesInputClasses}
                          placeholder="Buea, Douala, Yaounde..."
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-sans text-[1.25rem] font-semibold leading-tight tracking-[-0.04em] text-[#171411]">
                      Business information
                    </h3>
                    <div className="mt-5 space-y-5">
                      <div>
                        <Label
                          htmlFor="businessName"
                          className="font-sans text-sm font-semibold text-[#171411]"
                        >
                          Business Name
                        </Label>
                        <Input
                          id="businessName"
                          name="businessName"
                          className={cyesInputClasses}
                          placeholder="Your business name"
                          required
                        />
                      </div>
                      <div>
                        <Label className="font-sans text-sm font-semibold text-[#171411]">
                          Industry / Sector
                        </Label>
                        <Select value={industry} onValueChange={setIndustry}>
                          <SelectTrigger className={cyesSelectTriggerClasses}>
                            <SelectValue placeholder="Select your industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {industries.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <Label className="font-sans text-sm font-semibold text-[#171411]">
                            Currently operating?
                          </Label>
                          <Select value={isOperating} onValueChange={setIsOperating}>
                            <SelectTrigger className={cyesSelectTriggerClasses}>
                              <SelectValue placeholder="Yes or No" />
                            </SelectTrigger>
                            <SelectContent>
                              {operatingOptions.map((item) => (
                                <SelectItem key={item} value={item}>
                                  {item}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="font-sans text-sm font-semibold text-[#171411]">
                            How long have you been running?
                          </Label>
                          <Select
                            value={runningDuration}
                            onValueChange={setRunningDuration}
                          >
                            <SelectTrigger className={cyesSelectTriggerClasses}>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              {runningDurationOptions.map((item) => (
                                <SelectItem key={item} value={item}>
                                  {item}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-sans text-[1.25rem] font-semibold leading-tight tracking-[-0.04em] text-[#171411]">
                      Business details
                    </h3>
                    <div className="mt-5 space-y-5">
                      <div>
                        <Label
                          htmlFor="oneSentence"
                          className="font-sans text-sm font-semibold text-[#171411]"
                        >
                          Describe your business in one sentence
                        </Label>
                        <Input
                          id="oneSentence"
                          name="oneSentence"
                          className={cyesInputClasses}
                          placeholder="A direct one-line explanation of what you do."
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="problemSolved"
                          className="font-sans text-sm font-semibold text-[#171411]"
                        >
                          What problem does your business solve?
                        </Label>
                        <Textarea
                          id="problemSolved"
                          name="problemSolved"
                          className={cyesTextareaClasses}
                          placeholder="Describe the problem clearly."
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="uniqueness"
                          className="font-sans text-sm font-semibold text-[#171411]"
                        >
                          What makes your business unique?
                        </Label>
                        <Textarea
                          id="uniqueness"
                          name="uniqueness"
                          className={cyesTextareaClasses}
                          placeholder="What differentiates you?"
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="targetCustomers"
                          className="font-sans text-sm font-semibold text-[#171411]"
                        >
                          Who are your target customers?
                        </Label>
                        <Input
                          id="targetCustomers"
                          name="targetCustomers"
                          className={cyesInputClasses}
                          placeholder="Who is this built for?"
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="revenueModel"
                          className="font-sans text-sm font-semibold text-[#171411]"
                        >
                          How do you make money?
                        </Label>
                        <Textarea
                          id="revenueModel"
                          name="revenueModel"
                          className={cyesTextareaClasses}
                          placeholder="Explain the business model."
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-sans text-[1.25rem] font-semibold leading-tight tracking-[-0.04em] text-[#171411]">
                      Impact and pitch readiness
                    </h3>
                    <div className="mt-5 space-y-5">
                      <div>
                        <Label
                          htmlFor="impact"
                          className="font-sans text-sm font-semibold text-[#171411]"
                        >
                          What impact are you creating?
                        </Label>
                        <Textarea
                          id="impact"
                          name="impact"
                          className={cyesTextareaClasses}
                          placeholder="Social, economic, or community value."
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="vision"
                          className="font-sans text-sm font-semibold text-[#171411]"
                        >
                          Where do you see the business in 1-3 years?
                        </Label>
                        <Textarea
                          id="vision"
                          name="vision"
                          className={cyesTextareaClasses}
                          placeholder="Share the short-term growth vision."
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="whySelected"
                          className="font-sans text-sm font-semibold text-[#171411]"
                        >
                          Why should you be selected?
                        </Label>
                        <Textarea
                          id="whySelected"
                          name="whySelected"
                          className={cyesTextareaClasses}
                          placeholder="Make the case for your selection."
                          required
                        />
                      </div>
                      <div>
                        <Label className="font-sans text-sm font-semibold text-[#171411]">
                          Are you available to pitch physically in Buea on 16 July 2026?
                        </Label>
                        <Select
                          value={availablePhysically}
                          onValueChange={setAvailablePhysically}
                        >
                          <SelectTrigger className={cyesSelectTriggerClasses}>
                            <SelectValue placeholder="Yes or No" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border border-black/8 bg-white/76 px-5 py-5">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="declaration"
                        checked={agreedToDeclaration}
                        onCheckedChange={(checked) =>
                          setAgreedToDeclaration(checked === true)
                        }
                        className="mt-1"
                      />
                      <Label
                        htmlFor="declaration"
                        className="font-sans text-sm leading-relaxed text-[#171411]/72"
                      >
                        I confirm that all information provided is accurate and I
                        understand that payment is required on Ayati after this
                        form is submitted.
                      </Label>
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(238,245,251,0.9))] px-5 py-5">
                    <p className="font-sans text-sm text-[#171411]/72">
                      Registration Fee
                    </p>
                    <p className="mt-1 font-sans text-[1.4rem] font-semibold tracking-[-0.05em] text-[#171411]">
                      20,000 CFA
                    </p>
                    <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/66">
                      Save the application here first. You will then continue to
                      Ayati to complete payment.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full rounded-full bg-[#171411] font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
                    disabled={
                      submitCompetitionApplication.isPending || isFinalizingSubmission
                    }
                  >
                    {submitCompetitionApplication.isPending || isFinalizingSubmission
                      ? "Saving application..."
                      : "Save application and continue"}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer variant="cyes" />
    </div>
  );
};

export default CYESPitchCompetitionPage;
