import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CompetitionPaymentRedirect } from "@/components/registration/CompetitionPaymentRedirect";
import {
  ExpoPageHero,
  ExpoSidebarCard,
  ExpoSurface,
  expoCheckboxClasses,
  expoInputClasses,
  expoSelectTriggerClasses,
} from "@/components/registration/ExpoPageShell";
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
import { useSubmitCompetitionApplication } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";
import {
  buildCompetitionApplicationCode,
  competitionRegistrationLinks,
  getCompetitionPaymentSettings,
  PANACHE_SUPPORT_WHATSAPP_HREF,
  PANACHE_SUPPORT_WHATSAPP_NUMBER,
} from "@/lib/registration-links";
import {
  ArrowRight,
  BriefcaseBusiness,
  PhoneCall,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const paymentConfig = competitionRegistrationLinks.exhibitionStands;
const paymentSettings = getCompetitionPaymentSettings(paymentConfig);

const standOptions = [
  {
    title: "Corporate Booth",
    value: "Corporate Booth",
    price: "200,000 FCFA",
    description: "Best for established companies and brands that need a stronger footprint.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Food / Drinks",
    value: "Food / Drinks",
    price: "150,000 FCFA",
    description: "For meals, beverages, refreshments, and fast-moving hospitality brands.",
    icon: UtensilsCrossed,
  },
  {
    title: "Small Chops & Snacks",
    value: "Small Chops & Snacks",
    price: "70,000 FCFA",
    description: "A lighter point of entry for quick sales, crowd demand, and high turnover.",
    icon: ShoppingBag,
  },
  {
    title: "General Business",
    value: "General Business (Fashion, Wigs, Beauty, etc)",
    price: "50,000 FCFA",
    description: "For fashion, beauty, wigs, retail products, and growing businesses.",
    icon: Store,
  },
] as const;

const eventTraffic = [
  "Day 1: Entrepreneur Summit",
  "Day 2: Panache 360 Beauty Contest",
  "Day 3: Awards Night, Runway Show, Mademoiselle Panache",
];

const reasonsToBook = [
  "Reach 5,000+ potential customers across the full expo weekend.",
  "Sell directly while people are already in discovery mode.",
  "Put your brand in front of partners, guests, and entrepreneurs.",
  "Stay visible across three days of different event traffic.",
];

export const ExhibitionStandsPage = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const submitCompetitionApplication = useSubmitCompetitionApplication();
  const [selectedStandType, setSelectedStandType] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submittedApplicationCode, setSubmittedApplicationCode] = useState("");
  const [isFinalizingSubmission, setIsFinalizingSubmission] = useState(false);

  useEffect(() => {
    if (!submittedApplicationCode) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      window.location.assign(paymentSettings.postSubmitHref);
    }, paymentSettings.redirectDelayMs);

    return () => window.clearTimeout(timeoutId);
  }, [submittedApplicationCode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedStandType) {
      toast({
        title: "Select your stand type",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Please confirm the booking terms",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(event.currentTarget);
    const applicationCode = buildCompetitionApplicationCode(paymentConfig.codePrefix);
    const fullName = (formData.get("fullName") as string).trim();
    const businessName = (formData.get("businessName") as string).trim();
    const email = (formData.get("email") as string).trim();
    const phone = (formData.get("phone") as string).trim();

    try {
      setIsFinalizingSubmission(true);

      await submitCompetitionApplication.mutateAsync({
        application_code: applicationCode,
        competition_slug: paymentConfig.competitionSlug,
        category: selectedStandType,
        first_name: fullName,
        last_name: "",
        email,
        phone,
        payment_status: paymentSettings.paymentStatus,
        payment_platform: paymentSettings.paymentPlatform,
        competitionTitle: paymentConfig.title,
        postSubmitHref: paymentSettings.postSubmitHref,
        notificationEmails: paymentSettings.notificationEmails,
        review_status: "submitted",
        form_payload: {
          business_name: businessName,
          agreed_to_terms: agreedToTerms,
          contact_number: PANACHE_SUPPORT_WHATSAPP_NUMBER,
          registration_type: "exhibition_stand",
        },
      });

      formRef.current?.reset();
      setSelectedStandType("");
      setAgreedToTerms(false);
      setSubmittedApplicationCode(applicationCode);

      toast({
        title: "Stand request saved",
        description: paymentSettings.successMessage,
      });
    } catch (error) {
      toast({
        title: "We could not save your stand request",
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
    <div className="min-h-screen bg-[#f4f3ef]">
      <Header />

      <ExpoPageHero
        eyebrow="Panache Expo exhibition stands"
        title={
          <>
            Put Your
            <br />
            <span className="font-display text-[#f4e93f]">Business on the Floor</span>
          </>
        }
        description={paymentConfig.description}
        panelLabel="Stand booking"
        panelTitle="Save the request. Continue on WhatsApp."
        panelDescription={paymentSettings.postSubmitCopy}
        panelItems={[
          { label: "Traffic expectation", value: "5,000+ visitors" },
          { label: "Booking flow", value: "Request first, WhatsApp after" },
          { label: "Contact line", value: PANACHE_SUPPORT_WHATSAPP_NUMBER },
        ]}
      />

      <main className="px-6 pb-20 pt-10 md:pb-24">
        <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.84fr,1.16fr]">
          <ExpoSidebarCard
            eyebrow="Why brands book"
            title="Three days of real discovery."
            description="The exhibition floor is strongest when the stand is more than decorative. Panache Expo gives brands a chance to sell, build visibility, and meet customers, partners, and collaborators in one weekend."
            points={reasonsToBook}
            footer={
              <a
                href={PANACHE_SUPPORT_WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-black/12 bg-white/74 px-6 font-sans text-sm font-semibold text-[#171411] transition-colors hover:bg-white"
              >
                <PhoneCall className="h-4 w-4" />
                Call / WhatsApp
              </a>
            }
          />

          <ExpoSurface>
            <div>
              <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                Stand options
              </p>
              <h2 className="mt-3 font-sans text-[clamp(2rem,3vw,2.9rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                Choose the space that fits your brand.
              </h2>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {standOptions.map((option) => {
                const Icon = option.icon;

                return (
                  <div
                    key={option.value}
                    className="rounded-[1.6rem] border border-black/8 bg-white/74 px-5 py-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-[#171411] text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-[#8241B6]/78">
                        {option.price}
                      </p>
                    </div>

                    <h3 className="mt-5 font-sans text-[1.25rem] font-semibold leading-[1.08] tracking-[-0.04em] text-[#171411]">
                      {option.title}
                    </h3>
                    <p className="mt-3 font-sans text-[0.95rem] leading-relaxed text-[#171411]/66">
                      {option.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </ExpoSurface>
        </section>

        <section className="mx-auto mt-10 max-w-6xl">
          <ExpoSurface className="overflow-hidden">
            <div className="grid gap-8 lg:grid-cols-[0.86fr,1.14fr] lg:items-start">
              <div>
                <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                  Event traffic
                </p>
                <h2 className="mt-3 max-w-[10ch] font-sans text-[clamp(2rem,3.5vw,3rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                  Your stand stays visible across the biggest moments.
                </h2>
              </div>

              <div className="grid gap-4">
                {eventTraffic.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-[1.5rem] border border-black/8 bg-white/74 px-5 py-5"
                  >
                    <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-[#8241B6]/78">
                      Day 0{index + 1}
                    </p>
                    <p className="mt-3 font-sans text-[1rem] leading-relaxed text-[#171411]/72">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ExpoSurface>
        </section>

        <section id="quick-registration" className="mx-auto mt-10 max-w-6xl">
          {submittedApplicationCode ? (
            <CompetitionPaymentRedirect
              applicationCode={submittedApplicationCode}
              paymentHref={paymentSettings.postSubmitHref}
              title={paymentConfig.successTitle || "Exhibition stand request received"}
              description={
                paymentConfig.successDescription ||
                "Your stand request is now saved in the Panache registration system."
              }
              actionLabel={paymentSettings.ctaLabel}
              postSubmitCopy={paymentSettings.postSubmitCopy}
            />
          ) : (
            <div className="grid gap-8 lg:grid-cols-[0.82fr,1.18fr]">
              <ExpoSidebarCard
                eyebrow="Quick registration"
                title="Save your stand request here."
                description="Complete the short form first so your details are recorded. Your booking is shared with the team, then you continue in WhatsApp to finalize your stand confirmation."
                points={[
                  "We need your full name, business name, WhatsApp number, and stand type.",
                  "Stand requests are processed after your WhatsApp confirmation with the team.",
                  "If you need help choosing a stand type, contact the Panache team in WhatsApp.",
                ]}
              />

              <ExpoSurface>
                <form ref={formRef} className="space-y-7" onSubmit={handleSubmit}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label
                        htmlFor="fullName"
                        className="font-sans text-sm font-semibold text-[#171411]"
                      >
                        Full name
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        className={expoInputClasses}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="businessName"
                        className="font-sans text-sm font-semibold text-[#171411]"
                      >
                        Business name
                      </Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        className={expoInputClasses}
                        placeholder="Your brand or business name"
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
                        Email address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        className={expoInputClasses}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="phone"
                        className="font-sans text-sm font-semibold text-[#171411]"
                      >
                        WhatsApp number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        className={expoInputClasses}
                        placeholder="WhatsApp number e.g. +237 6XX XXX XXX"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="standType"
                      className="font-sans text-sm font-semibold text-[#171411]"
                    >
                      Stand type
                    </Label>
                    <Select value={selectedStandType} onValueChange={setSelectedStandType}>
                      <SelectTrigger
                        id="standType"
                        className={expoSelectTriggerClasses}
                      >
                        <SelectValue placeholder="Choose your stand type" />
                      </SelectTrigger>
                      <SelectContent>
                        {standOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.title} - {option.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-start gap-3 rounded-[1.4rem] border border-black/8 bg-[#f8f2e8] px-4 py-4">
                    <Checkbox
                      id="standTerms"
                      className={expoCheckboxClasses}
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    />
                    <Label
                      htmlFor="standTerms"
                      className="font-sans text-sm leading-relaxed text-[#171411]/72"
                    >
                      I confirm that this booking request is accurate and I understand
                      that my stand remains pending until team confirmation in
                      WhatsApp.
                    </Label>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-black/8 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3 text-sm text-[#171411]/58">
                      <Users className="mt-0.5 h-4 w-4 text-[#8241B6]" />
                      <span>
                        Once saved, your stand request continues in WhatsApp.
                      </span>
                    </div>
                    <Button
                      type="submit"
                      className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
                      disabled={
                        submitCompetitionApplication.isPending || isFinalizingSubmission
                      }
                    >
                      {submitCompetitionApplication.isPending || isFinalizingSubmission
                        ? "Saving request..."
                        : "Save request and continue"}
                    </Button>
                  </div>
                </form>
              </ExpoSurface>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ExhibitionStandsPage;
