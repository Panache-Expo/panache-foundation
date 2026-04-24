import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CompetitionPaymentRedirect } from "@/components/registration/CompetitionPaymentRedirect";
import {
  ExpoPageHero,
  ExpoSidebarCard,
  ExpoSurface,
  expoCheckboxClasses,
  expoInputClasses,
  expoTextareaClasses,
} from "@/components/registration/ExpoPageShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitCompetitionApplication } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";
import missPanacheBackdrop from "@/assets/MissPanache.jpeg";
import {
  buildCompetitionApplicationCode,
  competitionRegistrationLinks,
  getCompetitionPaymentSettings,
} from "@/lib/registration-links";
import { ArrowUpRight, Crown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const paymentConfig = competitionRegistrationLinks.missPanache;
const paymentSettings = getCompetitionPaymentSettings(paymentConfig);

const MissPanacheRegisterPage = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const submitCompetitionApplication = useSubmitCompetitionApplication();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [newsletterSubscription, setNewsletterSubscription] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast({
        title: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const applicationCode = buildCompetitionApplicationCode(paymentConfig.codePrefix);
    const ageValue = formData.get("age") as string;
    const firstName = (formData.get("firstName") as string).trim();
    const lastName = (formData.get("lastName") as string).trim();
    const email = (formData.get("email") as string).trim();
    const phone = (formData.get("phone") as string).trim();
    const city = ((formData.get("city") as string) || "").trim() || null;
    const country = ((formData.get("country") as string) || "").trim() || null;
    const instagramHandle =
      ((formData.get("instagramHandle") as string) || "").trim() || null;
    const tiktokHandle = ((formData.get("tiktokHandle") as string) || "").trim() || null;
    const portfolioUrl = ((formData.get("portfolioUrl") as string) || "").trim() || null;
    const motivation = ((formData.get("motivation") as string) || "").trim() || null;
    const occupation = ((formData.get("occupation") as string) || "").trim() || null;
    const education = ((formData.get("education") as string) || "").trim() || null;
    const leadershipExperience =
      ((formData.get("leadershipExperience") as string) || "").trim() || null;
    const additionalDetails = ((formData.get("details") as string) || "").trim() || null;

    try {
      setIsFinalizingSubmission(true);

      await submitCompetitionApplication.mutateAsync({
        application_code: applicationCode,
        competition_slug: paymentConfig.competitionSlug,
        category: "Contestant",
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        city,
        country,
        instagram_handle: instagramHandle,
        tiktok_handle: tiktokHandle,
        portfolio_url: portfolioUrl,
        years_experience: null,
        motivation,
        payment_status: paymentSettings.paymentStatus,
        payment_platform: paymentSettings.paymentPlatform,
        review_status: "submitted",
        competitionTitle: paymentConfig.title,
        postSubmitHref: paymentSettings.postSubmitHref,
        notificationEmails: paymentSettings.notificationEmails,
        form_payload: {
          age: ageValue ? Number(ageValue) : null,
          occupation,
          education,
          leadership_experience: leadershipExperience,
          additional_details: additionalDetails,
          newsletter_subscription: newsletterSubscription,
          agreed_to_terms: agreedToTerms,
        },
      });

      formRef.current?.reset();
      setAgreedToTerms(false);
      setNewsletterSubscription(false);
      setSubmittedApplicationCode(applicationCode);

      toast({
        title: "Application saved",
        description: paymentSettings.successMessage,
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
    <div className="min-h-screen bg-[#f4f3ef]">
      <Header />

      <ExpoPageHero
        eyebrow="Mademoiselle Panache"
        title={
          <>
            Apply To Become
            <br />
            <span className="font-display text-[#f4e93f]">Miss Panache</span>
          </>
        }
        description={paymentConfig.description}
        image={missPanacheBackdrop}
        panelLabel="Contestant Entry"
        panelTitle="Beauty with presence and purpose."
        panelDescription="We want to understand who you are, what you care about, and how you would represent Panache on stage and beyond it."
        panelItems={[
          { label: "Category", value: "Contestant entry" },
          { label: "Best used for", value: "Ambition + purpose" },
          { label: "Registration flow", value: "Saved first, then WhatsApp" },
        ]}
      />

      <section className="px-6 pb-20 pt-10 md:pb-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.84fr,1.16fr]">
          <ExpoSidebarCard
            eyebrow="Contestant notes"
            title="Show us the woman behind the profile."
            description="This application should feel honest and considered. Beyond aesthetics, Panache looks for clarity, leadership, and the ability to represent the platform well."
            points={[
              "Use the leadership and motivation sections to show depth, confidence, and a real sense of purpose.",
              "Add public profile links if they help tell your story, but let the written answers carry the application.",
              "Treat this like your first introduction to the panel that may eventually put you on stage.",
            ]}
            footer={
              <div className="rounded-[1.25rem] border border-black/10 bg-white/72 px-4 py-4">
                <div className="flex items-start gap-3">
                  <Crown className="mt-0.5 h-4 w-4 text-[#8241B6]" />
                  <div>
                    <p className="font-sans text-sm font-semibold text-[#171411]">
                      Submission flow
                    </p>
                    <p className="mt-1 font-sans text-sm leading-relaxed text-[#171411]/64">
                      Save your contestant form first, then continue in WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            }
          />

          {submittedApplicationCode ? (
            <CompetitionPaymentRedirect
              applicationCode={submittedApplicationCode}
              paymentHref={paymentSettings.postSubmitHref}
              title={paymentConfig.successTitle || "Miss Panache Application Received"}
              description={
                paymentConfig.successDescription ||
                "Your contestant application is now stored in the Panache registration system."
              }
              actionLabel={paymentSettings.ctaLabel}
              postSubmitCopy={paymentSettings.postSubmitCopy}
            />
          ) : (
            <ExpoSurface>
              <div className="mb-8">
                <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                  Contestant form
                </p>
                <h2 className="mt-3 font-sans text-[clamp(2rem,3vw,2.8rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                  Save your contestant profile.
                </h2>
                <p className="mt-3 max-w-2xl font-sans text-[0.98rem] leading-relaxed text-[#171411]/68">
                  Share your background, your public presence, and the reasons you
                  want to represent Miss Panache Expo.
                </p>
              </div>

              <form ref={formRef} className="space-y-8" onSubmit={handleSubmit}>
                <div>
                  <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-[#171411]/44">
                    Personal details
                  </p>
                  <div className="mt-5 grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName" className="font-sans text-sm font-semibold text-[#171411]">
                        First Name
                      </Label>
                      <Input id="firstName" name="firstName" className={expoInputClasses} placeholder="Your first name" required />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="font-sans text-sm font-semibold text-[#171411]">
                        Last Name
                      </Label>
                      <Input id="lastName" name="lastName" className={expoInputClasses} placeholder="Your last name" required />
                    </div>
                    <div>
                      <Label htmlFor="email" className="font-sans text-sm font-semibold text-[#171411]">
                        Email Address
                      </Label>
                      <Input id="email" name="email" type="email" className={expoInputClasses} placeholder="your.email@example.com" required />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="font-sans text-sm font-semibold text-[#171411]">
                        WhatsApp Number
                      </Label>
                      <Input id="phone" name="phone" type="tel" className={expoInputClasses} placeholder="WhatsApp number e.g. +237 6XX XXX XXX" required />
                    </div>
                  </div>
                </div>

                <div className="border-t border-black/8 pt-8">
                  <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-[#171411]/44">
                    Background
                  </p>
                  <div className="mt-5 grid gap-6 md:grid-cols-3">
                    <div>
                      <Label htmlFor="age" className="font-sans text-sm font-semibold text-[#171411]">
                        Age
                      </Label>
                      <Input id="age" name="age" type="number" min="18" max="28" className={expoInputClasses} placeholder="18-28" required />
                    </div>
                    <div>
                      <Label htmlFor="city" className="font-sans text-sm font-semibold text-[#171411]">
                        City
                      </Label>
                      <Input id="city" name="city" className={expoInputClasses} placeholder="Buea" required />
                    </div>
                    <div>
                      <Label htmlFor="country" className="font-sans text-sm font-semibold text-[#171411]">
                        Country
                      </Label>
                      <Input id="country" name="country" className={expoInputClasses} placeholder="Cameroon" required />
                    </div>
                    <div>
                      <Label htmlFor="occupation" className="font-sans text-sm font-semibold text-[#171411]">
                        Occupation
                      </Label>
                      <Input id="occupation" name="occupation" className={expoInputClasses} placeholder="Student, entrepreneur, model..." required />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="education" className="font-sans text-sm font-semibold text-[#171411]">
                        Education / Current Schooling
                      </Label>
                      <Input id="education" name="education" className={expoInputClasses} placeholder="University, college, professional training..." />
                    </div>
                  </div>
                </div>

                <div className="border-t border-black/8 pt-8">
                  <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-[#171411]/44">
                    Public profile & purpose
                  </p>
                  <div className="mt-5 grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="instagramHandle" className="font-sans text-sm font-semibold text-[#171411]">
                        Instagram Handle
                      </Label>
                      <Input id="instagramHandle" name="instagramHandle" className={expoInputClasses} placeholder="@yourhandle" />
                    </div>
                    <div>
                      <Label htmlFor="tiktokHandle" className="font-sans text-sm font-semibold text-[#171411]">
                        TikTok Handle
                      </Label>
                      <Input id="tiktokHandle" name="tiktokHandle" className={expoInputClasses} placeholder="@yourhandle" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="portfolioUrl" className="font-sans text-sm font-semibold text-[#171411]">
                        Portfolio / Public Profile Link
                      </Label>
                      <Input
                        id="portfolioUrl"
                        name="portfolioUrl"
                        type="url"
                        className={expoInputClasses}
                        placeholder="https://instagram.com/..., Linktree, or portfolio page"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="leadershipExperience" className="font-sans text-sm font-semibold text-[#171411]">
                        Leadership / Community Experience
                      </Label>
                      <Textarea
                        id="leadershipExperience"
                        name="leadershipExperience"
                        className={expoTextareaClasses}
                        rows={4}
                        placeholder="Tell us about any leadership roles, volunteering, advocacy, or community work you have done."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="motivation" className="font-sans text-sm font-semibold text-[#171411]">
                        Why do you want to be Miss Panache Expo?
                      </Label>
                      <Textarea
                        id="motivation"
                        name="motivation"
                        className={expoTextareaClasses}
                        placeholder="Tell us why you want to compete and what kind of ambassador you would be."
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="details" className="font-sans text-sm font-semibold text-[#171411]">
                        Additional Details
                      </Label>
                      <Textarea
                        id="details"
                        name="details"
                        className={expoTextareaClasses}
                        rows={4}
                        placeholder="Anything else the Panache team should know during application review."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t border-black/8 pt-8">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      className={expoCheckboxClasses}
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    />
                    <Label htmlFor="terms" className="font-sans text-sm leading-6 text-[#171411]/72">
                      I confirm that the information provided is accurate and I understand that registration continues in WhatsApp after this form is submitted.
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="newsletter"
                      className={expoCheckboxClasses}
                      checked={newsletterSubscription}
                      onCheckedChange={(checked) => setNewsletterSubscription(checked === true)}
                    />
                    <Label htmlFor="newsletter" className="font-sans text-sm leading-6 text-[#171411]/72">
                      Keep me updated about Miss Panache Expo announcements and contestant information.
                    </Label>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-black/8 pt-8 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-sans text-sm text-[#171411]/56">
                    Your application code appears as soon as the form is saved.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white shadow-none hover:bg-[#171411]/92"
                      disabled={
                        submitCompetitionApplication.isPending || isFinalizingSubmission
                      }
                      >
                      {submitCompetitionApplication.isPending || isFinalizingSubmission
                        ? "Saving application..."
                        : "Save Application & Continue"}
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="h-12 rounded-full border-black/12 bg-white/72 px-6 font-sans text-sm font-semibold text-[#171411] hover:bg-white"
                    >
                      <a href={paymentSettings.postSubmitHref} target="_blank" rel="noopener noreferrer">
                        {paymentSettings.ctaLabel}
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </form>
            </ExpoSurface>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MissPanacheRegisterPage;
