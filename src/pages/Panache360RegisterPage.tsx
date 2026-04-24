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
  expoTextareaClasses,
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
import { Textarea } from "@/components/ui/textarea";
import { useSubmitCompetitionApplication } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";
import panache360Backdrop from "@/assets/panache360-1.jpeg";
import {
  buildCompetitionApplicationCode,
  competitionRegistrationLinks,
  getCompetitionPaymentSettings,
} from "@/lib/registration-links";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const categories = [
  "Barbing",
  "Beauty Makeup",
  "SFX Makeup",
  "Braiding",
  "Artistic Hairstyling",
  "Wig Installation",
  "Nails Installation",
  "Lash Extensions Installation",
];

const paymentConfig = competitionRegistrationLinks.panache360;
const paymentSettings = getCompetitionPaymentSettings(paymentConfig);

export const Panache360RegisterPage = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const submitCompetitionApplication = useSubmitCompetitionApplication();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [newsletterSubscription, setNewsletterSubscription] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
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

    if (!selectedCategory) {
      toast({
        title: "Please select your competition category",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const applicationCode = buildCompetitionApplicationCode(paymentConfig.codePrefix);
    const yearsExperienceValue = formData.get("yearsExperience") as string;
    const firstName = (formData.get("firstName") as string).trim();
    const lastName = (formData.get("lastName") as string).trim();
    const email = (formData.get("email") as string).trim();
    const phone = (formData.get("phone") as string).trim();
    const city = ((formData.get("city") as string) || "").trim() || null;
    const country = ((formData.get("country") as string) || "").trim() || null;
    const instagramHandle =
      ((formData.get("instagramHandle") as string) || "").trim() || null;
    const portfolioUrl = ((formData.get("portfolioUrl") as string) || "").trim() || null;
    const motivation = ((formData.get("motivation") as string) || "").trim() || null;
    const currentRole = ((formData.get("currentRole") as string) || "").trim() || null;
    const additionalDetails = ((formData.get("details") as string) || "").trim() || null;

    try {
      setIsFinalizingSubmission(true);

      await submitCompetitionApplication.mutateAsync({
        application_code: applicationCode,
        competition_slug: paymentConfig.competitionSlug,
        category: selectedCategory,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        city,
        country,
        instagram_handle: instagramHandle,
        portfolio_url: portfolioUrl,
        years_experience: yearsExperienceValue ? Number(yearsExperienceValue) : null,
        motivation,
        payment_status: paymentSettings.paymentStatus,
        payment_platform: paymentSettings.paymentPlatform,
        review_status: "submitted",
        competitionTitle: paymentConfig.title,
        postSubmitHref: paymentSettings.postSubmitHref,
        notificationEmails: paymentSettings.notificationEmails,
        form_payload: {
          current_role: currentRole,
          additional_details: additionalDetails,
          newsletter_subscription: newsletterSubscription,
          agreed_to_terms: agreedToTerms,
        },
      });

      formRef.current?.reset();
      setAgreedToTerms(false);
      setNewsletterSubscription(false);
      setSelectedCategory("");
      setSubmittedApplicationCode(applicationCode);

      toast({
        title: "Application saved",
        description: paymentSettings.successMessage,
      });
    } catch (error) {
      console.log(error);
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
        eyebrow="Panache 360 Beauty Contest"
        title={
          <>
            Bring Your Craft
            <br />
            <span className="font-display text-[#f4e93f]">To The Floor</span>
          </>
        }
        description={paymentConfig.description}
        image={panache360Backdrop}
        panelLabel="Application Notes"
        panelTitle="Live creativity meets structure."
        panelDescription="Choose your category, tell us about your work, and submit a clean profile we can review quickly."
        panelItems={[
          { label: "Categories", value: "8 live contest tracks" },
          { label: "Registration flow", value: "Saved first, then WhatsApp" },
          { label: "Review Status", value: "Saved as submitted" },
        ]}
      />

      <section className="px-6 pb-20 pt-10 md:pb-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.84fr,1.16fr]">
          <ExpoSidebarCard
            eyebrow="Before you apply"
            title="What to prepare."
            description="A strong Panache 360 application is short, clear, and portfolio-driven. Use the form to show both your skill level and your creative angle."
            points={[
              "Select the category that best matches the live skill you want to compete in.",
              "Add your Instagram or portfolio link so the review team can quickly assess your work.",
              "Use the motivation field to explain why your style deserves a live Panache platform.",
            ]}
            footer={
              <div className="rounded-[1.25rem] border border-black/10 bg-white/72 px-4 py-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 text-[#8241B6]" />
                  <div>
                    <p className="font-sans text-sm font-semibold text-[#171411]">
                      After you submit
                    </p>
                    <p className="mt-1 font-sans text-sm leading-relaxed text-[#171411]/64">
                      Your application is saved first, then you are redirected to
                      WhatsApp.
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
              title={paymentConfig.successTitle || "Panache 360 Application Received"}
              description={
                paymentConfig.successDescription ||
                "Your details are now stored in the Panache registration system."
              }
              actionLabel={paymentSettings.ctaLabel}
              postSubmitCopy={paymentSettings.postSubmitCopy}
            />
          ) : (
            <ExpoSurface>
              <div className="mb-8">
                <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                  Competition form
                </p>
                <h2 className="mt-3 font-sans text-[clamp(2rem,3vw,2.8rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                  Save your application.
                </h2>
                <p className="mt-3 max-w-2xl font-sans text-[0.98rem] leading-relaxed text-[#171411]/68">
                  Complete the essentials below. We&apos;ll store your profile first
                  and then route you into WhatsApp.
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
                  </div>
                </div>

                <div className="border-t border-black/8 pt-8">
                  <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-[#171411]/44">
                    Competition profile
                  </p>
                  <div className="mt-5 grid gap-6 md:grid-cols-2">
                    <div>
                      <Label className="font-sans text-sm font-semibold text-[#171411]">
                        Competition Category
                      </Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className={expoSelectTriggerClasses}>
                          <SelectValue placeholder="Select your category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="currentRole" className="font-sans text-sm font-semibold text-[#171411]">
                        Current Role
                      </Label>
                      <Input
                        id="currentRole"
                        name="currentRole"
                        className={expoInputClasses}
                        placeholder="Professional barber, student, salon owner..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="yearsExperience" className="font-sans text-sm font-semibold text-[#171411]">
                        Years of Experience
                      </Label>
                      <Input
                        id="yearsExperience"
                        name="yearsExperience"
                        type="number"
                        min="0"
                        className={expoInputClasses}
                        placeholder="e.g. 4"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagramHandle" className="font-sans text-sm font-semibold text-[#171411]">
                        Instagram Handle
                      </Label>
                      <Input
                        id="instagramHandle"
                        name="instagramHandle"
                        className={expoInputClasses}
                        placeholder="@yourhandle"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="portfolioUrl" className="font-sans text-sm font-semibold text-[#171411]">
                        Portfolio / Work Link
                      </Label>
                      <Input
                        id="portfolioUrl"
                        name="portfolioUrl"
                        type="url"
                        className={expoInputClasses}
                        placeholder="https://instagram.com/... or portfolio link"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-black/8 pt-8">
                  <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-[#171411]/44">
                    Creative statement
                  </p>
                  <div className="mt-5 space-y-6">
                    <div>
                      <Label htmlFor="motivation" className="font-sans text-sm font-semibold text-[#171411]">
                        Why do you want to compete?
                      </Label>
                      <Textarea
                        id="motivation"
                        name="motivation"
                        className={expoTextareaClasses}
                        placeholder="Tell us why you want to join Panache 360 and what makes your work stand out."
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="details" className="font-sans text-sm font-semibold text-[#171411]">
                        Additional Details
                      </Label>
                      <Textarea
                        id="details"
                        name="details"
                        className={expoTextareaClasses}
                        rows={4}
                        placeholder="Anything else the Panache team should know before reviewing your application."
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
                      Keep me updated about Panache Expo announcements and competition information.
                    </Label>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-black/8 pt-8 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-sans text-sm text-[#171411]/56">
                    Saved applications immediately continue in WhatsApp.
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

export default Panache360RegisterPage;
