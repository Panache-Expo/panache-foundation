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
import { useSubmitCompetitionApplication } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";
import cyesEvent from "@/assets/CYES.jpeg";
import speaker1 from "@/assets/speaker1.jpeg";
import speaker2 from "@/assets/speaker2.jpeg";
import speaker3 from "@/assets/speaker3.jpeg";
import {
  buildCompetitionApplicationCode,
  competitionRegistrationLinks,
  getCompetitionPaymentSettings,
} from "@/lib/registration-links";
import {
  Calendar,
  CheckCircle2,
  Lightbulb,
  Loader2,
  MapPin,
  MessageCircle,
  Mic,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const registrationConfig = competitionRegistrationLinks.cyesSummit;
const registrationSettings = getCompetitionPaymentSettings(registrationConfig);

const topics = [
  "Entrepreneurship & Business Growth",
  "Digital Economy & Personal Branding",
  "Technology, Innovation and AI",
  "Agri Business & Food Security",
  "Leadership & National Development",
];

const registrationHeroCards = [
  {
    image: speaker1,
    alt: "Featured speaker portrait",
    className: "left-[18%] top-[8%] z-20 w-[41%] rotate-[-4deg]",
  },
  {
    image: speaker2,
    alt: "Young entrepreneur portrait",
    className: "left-[61%] top-[18%] z-10 w-[28%] rotate-[7deg]",
  },
  {
    image: speaker3,
    alt: "CYES support portrait",
    className: "left-[29%] top-[60%] z-30 w-[24%] rotate-[-8deg]",
  },
  {
    image: cyesEvent,
    alt: "CYES event atmosphere",
    className: "left-[55%] top-[56%] z-20 w-[33%] rotate-[9deg]",
  },
];

const registrationValueCards = [
  {
    icon: Mic,
    title: "Live sessions and keynotes",
    description:
      "Join the summit floor, keynote conversations, and practical discussions driving entrepreneurship forward.",
  },
  {
    icon: Users,
    title: "Real networking",
    description:
      "Meet founders, operators, students, partners, and mentors in a room built for meaningful connection.",
  },
  {
    icon: Lightbulb,
    title: "Focused tracks",
    description:
      "Choose the topic area most relevant to you so your registration immediately aligns with the summit flow.",
  },
];

export const CYESRegisterPage = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [newsletterSubscription, setNewsletterSubscription] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [submittedApplicationCode, setSubmittedApplicationCode] = useState("");
  const [isFinalizingSubmission, setIsFinalizingSubmission] = useState(false);
  const { toast } = useToast();
  const submitCompetitionApplication = useSubmitCompetitionApplication();

  useEffect(() => {
    if (!submittedApplicationCode) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      window.location.assign(registrationSettings.postSubmitHref);
    }, registrationSettings.redirectDelayMs);

    return () => window.clearTimeout(timeoutId);
  }, [submittedApplicationCode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast({
        title: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTopic) {
      toast({
        title: "Please select a topic",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const applicationCode = buildCompetitionApplicationCode(
      registrationConfig.codePrefix,
    );
    const firstName = ((formData.get("firstName") as string) || "").trim();
    const lastName = ((formData.get("lastName") as string) || "").trim();
    const email = ((formData.get("email") as string) || "").trim();
    const phone = ((formData.get("phone") as string) || "").trim();
    const details = ((formData.get("details") as string) || "").trim() || null;

    try {
      setIsFinalizingSubmission(true);

      const submission = await submitCompetitionApplication.mutateAsync({
        application_code: applicationCode,
        competition_slug: registrationConfig.competitionSlug,
        category: selectedTopic,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        country: "Cameroon",
        motivation: details,
        payment_status: registrationSettings.paymentStatus,
        payment_platform: registrationSettings.paymentPlatform,
        review_status: "submitted",
        competitionTitle: registrationConfig.title,
        postSubmitHref: registrationSettings.postSubmitHref,
        notificationEmails: registrationSettings.notificationEmails,
        form_payload: {
          selected_topic: selectedTopic,
          additional_details: details,
          newsletter_subscription: newsletterSubscription,
          agreed_to_terms: agreedToTerms,
          event_dates: "2026-07-09 to 2026-07-11",
          whatsapp_channel_url: registrationSettings.postSubmitHref,
        },
      });
      const notificationFailed =
        submission?.notification?.attempted &&
        submission.notification.ok === false;

      formRef.current?.reset();
      setAgreedToTerms(false);
      setNewsletterSubscription(false);
      setSelectedTopic("");
      setSubmittedApplicationCode(applicationCode);

      toast({
        title: notificationFailed
          ? "Registration saved, email not sent"
          : "Registration saved",
        description: notificationFailed
          ? "Your registration was saved, but the confirmation email could not be sent. Please join the CYES announcements channel for updates."
          : registrationSettings.successMessage,
        variant: notificationFailed ? "destructive" : "default",
      });
    } catch (error) {
      toast({
        title: "We could not save your registration",
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
          eyebrow="CYES registration"
          title={
            <>
              Reserve your place
              <br />
              <span className="font-display text-[#156D3B]">
                inside the summit
              </span>
            </>
          }
          description="Register for the Cameroon Youth Entrepreneurial Summit and Awards, choose the conversation stream most relevant to you, and enter the room prepared."
          actions={
            <>
              <a
                href="#cyes-registration-form"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#171411]/92"
              >
                Start registration
              </a>
              <Link
                to="/cyes/contact"
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white/80 px-7 font-sans text-sm font-semibold text-[#171411] transition-colors hover:bg-white"
              >
                Contact the team
              </Link>
              <a
                href={registrationSettings.postSubmitHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#25D366]/25 bg-[#f3fbf6] px-7 font-sans text-sm font-semibold text-[#156D3B] transition-colors hover:bg-white"
              >
                <MessageCircle className="mr-2 h-4 w-4 text-[#25D366]" />
                Join announcements channel
              </a>
            </>
          }
          chips={[
            {
              label: "Date",
              value: "9-11 July 2026",
              accentClassName: "text-[#156D3B]",
            },
            {
              label: "Venue",
              value: "Buea, Cameroon",
              accentClassName: "text-[#1875D2]",
            },
            {
              label: "Tracks",
              value: "5 focus areas",
              accentClassName: "text-[#CC2129]",
            },
          ]}
          cards={registrationHeroCards}
          mobileImage={cyesEvent}
          mobileImageAlt="CYES event stage"
          mobileImageClassName="rotate-[10deg]"
        />

        <section className="mx-auto mt-16 max-w-6xl px-6 md:px-24">
          <CYESSectionIntro
            eyebrow="Registration value"
            title={
              <>
                What your
                <span className="block font-display">registration unlocks</span>
              </>
            }
            description="CYES should feel organised from the first click. Registration is not just about attendance. It is how you enter the sessions, people, and ideas most relevant to your path."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {registrationValueCards.map((card) => {
              const Icon = card.icon;

              return (
                <article key={card.title} className={cyesSurfaceClasses + " px-6 py-7"}>
                  <Icon className="h-9 w-9 text-[#156D3B]" />
                  <h3 className="mt-6 font-sans text-[1.28rem] font-semibold leading-[1.05] tracking-[-0.05em] text-[#171411]">
                    {card.title}
                  </h3>
                  <p className="mt-4 font-sans text-[0.98rem] leading-relaxed text-[#171411]/72">
                    {card.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section
          id="cyes-registration-form"
          className="mx-auto mt-20 max-w-6xl px-6 md:px-24"
        >
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div className={cyesSurfaceClasses + " px-6 py-7 md:px-7 md:py-8"}>
              <p className="font-sans text-[0.92rem] font-semibold uppercase tracking-[0.08em] text-[#156D3B]">
                Before you submit
              </p>
              <h2 className="mt-4 font-sans text-[clamp(2rem,4vw,3rem)] font-semibold leading-[0.93] tracking-[-0.065em] text-[#171411]">
                Enter with clarity.
              </h2>
              <p className="mt-4 font-sans text-[1rem] leading-relaxed text-[#171411]/72">
                Choose the topic that best matches your interests. We use this to
                understand how people are entering the summit and what kind of
                value they are looking for.
              </p>

              <div className="mt-8 space-y-3">
                {topics.map((topic, index) => (
                  <div
                    key={topic}
                    className="rounded-[1.3rem] border border-black/8 bg-white/80 px-4 py-4"
                  >
                    <p className="font-sans text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[#171411]/42">
                      Track {index + 1}
                    </p>
                    <p className="mt-2 font-sans text-[1rem] font-semibold leading-[1.2] tracking-[-0.03em] text-[#171411]">
                      {topic}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[1.2rem] border border-black/8 bg-white/80 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-[#156D3B]" />
                    <span className="font-sans text-sm text-[#171411]/76">
                      9-11 July 2026
                    </span>
                  </div>
                </div>
                <div className="rounded-[1.2rem] border border-black/8 bg-white/80 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-[#1875D2]" />
                    <span className="font-sans text-sm text-[#171411]/76">
                      Buea, Cameroon
                    </span>
                  </div>
                </div>
                <div className="rounded-[1.2rem] border border-black/8 bg-white/80 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[#CC2129]" />
                    <span className="font-sans text-sm text-[#171411]/76">
                      Summit and awards
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {submittedApplicationCode ? (
              <div className="grid gap-4">
                <CompetitionPaymentRedirect
                  applicationCode={submittedApplicationCode}
                  paymentHref={registrationSettings.postSubmitHref}
                  title={
                    registrationConfig.successTitle ||
                    "CYES Registration Received"
                  }
                  description={
                    registrationConfig.successDescription ||
                    "Your registration is now stored in the Panache registration system."
                  }
                  actionLabel={registrationSettings.ctaLabel}
                  postSubmitCopy={registrationSettings.postSubmitCopy}
                />

                <a
                  href={registrationSettings.postSubmitHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#25D366]/25 bg-[#f3fbf6] px-6 py-3 text-center font-sans text-sm font-semibold text-[#156D3B] transition-colors hover:bg-white"
                >
                  <MessageCircle className="mr-2 h-4 w-4 text-[#25D366]" />
                  Join the CYES announcements channel
                </a>
              </div>
            ) : (
              <div className={cyesSurfaceClasses + " px-6 py-7 md:px-8 md:py-8"}>
                <div>
                  <p className="font-sans text-[0.92rem] font-semibold uppercase tracking-[0.08em] text-[#156D3B]">
                    Registration form
                  </p>
                  <h2 className="mt-4 font-sans text-[clamp(2rem,4vw,3rem)] font-semibold leading-[0.93] tracking-[-0.065em] text-[#171411]">
                    Confirm your details and join the room.
                  </h2>
                </div>

              <form ref={formRef} className="mt-8 space-y-7" onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="firstName"
                      className="font-sans text-sm font-semibold text-[#171411]"
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      className={cyesInputClasses}
                      placeholder="Your first name"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="lastName"
                      className="font-sans text-sm font-semibold text-[#171411]"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      className={cyesInputClasses}
                      placeholder="Your last name"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
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
                </div>

                <div>
                  <Label className="font-sans text-sm font-semibold text-[#171411]">
                    What are you registering for?
                  </Label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger className={cyesSelectTriggerClasses}>
                      <SelectValue placeholder="Select a summit track" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="details"
                    className="font-sans text-sm font-semibold text-[#171411]"
                  >
                    Additional details
                  </Label>
                  <Textarea
                    id="details"
                    name="details"
                    className={cyesTextareaClasses}
                    placeholder="Share anything the team should know about your attendance or the conversation you want to join."
                  />
                </div>

                <div className="space-y-4 rounded-[1.4rem] border border-black/8 bg-white/76 px-5 py-5">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) =>
                        setAgreedToTerms(checked === true)
                      }
                      className="mt-1"
                    />
                    <Label
                      htmlFor="terms"
                      className="font-sans text-sm leading-relaxed text-[#171411]/72"
                    >
                      I agree to the terms and conditions and understand this
                      registration will be saved before I continue to the CYES
                      WhatsApp channel.
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="newsletter"
                      checked={newsletterSubscription}
                      onCheckedChange={(checked) =>
                        setNewsletterSubscription(checked === true)
                      }
                      className="mt-1"
                    />
                    <Label
                      htmlFor="newsletter"
                      className="font-sans text-sm leading-relaxed text-[#171411]/72"
                    >
                      Keep me updated with future CYES announcements and summit
                      communication.
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isFinalizingSubmission}
                  className="h-12 w-full rounded-full bg-[#171411] font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
                >
                  {isFinalizingSubmission ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving registration...
                    </>
                  ) : (
                    "Submit registration"
                  )}
                </Button>
              </form>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer variant="cyes" />
    </div>
  );
};

export default CYESRegisterPage;
