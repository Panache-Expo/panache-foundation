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
import fashionBackdrop from "@/assets/FashionNight.jpg";
import {
  buildCompetitionApplicationCode,
  competitionRegistrationLinks,
} from "@/lib/registration-links";
import { sendCompetitionRegistrationEmail } from "@/lib/send-registration-email";
import { ArrowUpRight, Shirt } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const paymentConfig = competitionRegistrationLinks.fashionNight;

export const FashionNightRegisterPage = () => {
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
      window.location.assign(paymentConfig.paymentHref);
    }, 1600);

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
    const yearsExperienceValue = formData.get("yearsExperience") as string;
    const numberOfLooksValue = formData.get("numberOfLooks") as string;
    const designSpecialty = ((formData.get("designSpecialty") as string) || "").trim();
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
    const brandName = ((formData.get("brandName") as string) || "").trim() || null;
    const collectionTitle =
      ((formData.get("collectionTitle") as string) || "").trim() || null;
    const additionalDetails = ((formData.get("details") as string) || "").trim() || null;

    try {
      setIsFinalizingSubmission(true);

      await submitCompetitionApplication.mutateAsync({
        application_code: applicationCode,
        competition_slug: paymentConfig.competitionSlug,
        category: designSpecialty || null,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        city,
        country,
        instagram_handle: instagramHandle,
        tiktok_handle: tiktokHandle,
        portfolio_url: portfolioUrl,
        years_experience: yearsExperienceValue ? Number(yearsExperienceValue) : null,
        motivation,
        payment_status: "pending",
        payment_platform: "ayatickets",
        review_status: "submitted",
        form_payload: {
          brand_name: brandName,
          collection_title: collectionTitle,
          number_of_looks: numberOfLooksValue ? Number(numberOfLooksValue) : null,
          additional_details: additionalDetails,
          newsletter_subscription: newsletterSubscription,
          agreed_to_terms: agreedToTerms,
        },
      });

      let emailWarning: string | null = null;

      try {
        await sendCompetitionRegistrationEmail({
          applicantEmail: email,
          applicantFirstName: firstName,
          competitionTitle: paymentConfig.title,
          applicationCode,
          paymentHref: paymentConfig.paymentHref,
          category: designSpecialty || undefined,
        });
      } catch (error) {
        emailWarning =
          error instanceof Error
            ? error.message
            : "We could not send the confirmation email.";
      }

      formRef.current?.reset();
      setAgreedToTerms(false);
      setNewsletterSubscription(false);
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
    <div className="min-h-screen bg-[#f4f3ef]">
      <Header />

      <ExpoPageHero
        eyebrow="Panache Fashion Night"
        title={
          <>
            Present Your
            <br />
            <span className="font-display text-[#f4e93f]">Collection Live</span>
          </>
        }
        description="This is the designer entry point for Panache Fashion Night. Save your application here first, then continue to Ayati to confirm your place."
        image={fashionBackdrop}
        panelLabel="Designer Entry"
        panelTitle="Collections with a stage."
        panelDescription="Tell us about your label, your specialty, and the collection you want to put in front of the Panache audience."
        panelItems={[
          { label: "Who applies", value: "Designers & labels" },
          { label: "Required", value: "Collection concept + looks" },
          { label: "Payment", value: "Ayati after submit" },
        ]}
      />

      <section className="px-6 pb-20 pt-10 md:pb-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.84fr,1.16fr]">
          <ExpoSidebarCard
            eyebrow="Designer notes"
            title="Make the first impression count."
            description="Your entry should help the Panache team understand your creative identity fast: your brand, your category, and what makes this collection worth selecting."
            points={[
              "Use the brand and specialty fields to position your design voice immediately.",
              "Include portfolio or lookbook links so the team can review your visual range quickly.",
              "Use your statement to explain the concept, production readiness, and why your work belongs on the Panache runway.",
            ]}
            footer={
              <div className="rounded-[1.25rem] border border-black/10 bg-white/72 px-4 py-4">
                <div className="flex items-start gap-3">
                  <Shirt className="mt-0.5 h-4 w-4 text-[#8241B6]" />
                  <div>
                    <p className="font-sans text-sm font-semibold text-[#171411]">
                      Submission flow
                    </p>
                    <p className="mt-1 font-sans text-sm leading-relaxed text-[#171411]/64">
                      Save the form, receive your application code, then complete
                      payment on Ayati.
                    </p>
                  </div>
                </div>
              </div>
            }
          />

          {submittedApplicationCode ? (
            <CompetitionPaymentRedirect
              applicationCode={submittedApplicationCode}
              paymentHref={paymentConfig.paymentHref}
              title="Fashion Night Application Received"
              description="Your designer application is now stored in the Panache registration system. Complete your Ayati payment to finish the registration flow."
            />
          ) : (
            <ExpoSurface>
              <div className="mb-8">
                <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                  Designer form
                </p>
                <h2 className="mt-3 font-sans text-[clamp(2rem,3vw,2.8rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                  Save your designer entry.
                </h2>
                <p className="mt-3 max-w-2xl font-sans text-[0.98rem] leading-relaxed text-[#171411]/68">
                  Enter your contact details, collection information, and creative
                  statement so the selection team can review your submission.
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
                        Phone Number
                      </Label>
                      <Input id="phone" name="phone" type="tel" className={expoInputClasses} placeholder="+237 6XX XXX XXX" required />
                    </div>
                  </div>
                </div>

                <div className="border-t border-black/8 pt-8">
                  <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-[#171411]/44">
                    Brand & collection
                  </p>
                  <div className="mt-5 grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="brandName" className="font-sans text-sm font-semibold text-[#171411]">
                        Brand / Label Name
                      </Label>
                      <Input id="brandName" name="brandName" className={expoInputClasses} placeholder="Your fashion brand name" required />
                    </div>
                    <div>
                      <Label htmlFor="designSpecialty" className="font-sans text-sm font-semibold text-[#171411]">
                        Design Specialty
                      </Label>
                      <Input id="designSpecialty" name="designSpecialty" className={expoInputClasses} placeholder="Menswear, womenswear, couture, streetwear..." required />
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
                      <Label htmlFor="collectionTitle" className="font-sans text-sm font-semibold text-[#171411]">
                        Collection Title
                      </Label>
                      <Input id="collectionTitle" name="collectionTitle" className={expoInputClasses} placeholder="Title of the collection you want to present" required />
                    </div>
                    <div>
                      <Label htmlFor="numberOfLooks" className="font-sans text-sm font-semibold text-[#171411]">
                        Number of Looks
                      </Label>
                      <Input id="numberOfLooks" name="numberOfLooks" type="number" min="1" className={expoInputClasses} placeholder="e.g. 8" required />
                    </div>
                  </div>
                </div>

                <div className="border-t border-black/8 pt-8">
                  <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-[#171411]/44">
                    Digital presence & story
                  </p>
                  <div className="mt-5 grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="instagramHandle" className="font-sans text-sm font-semibold text-[#171411]">
                        Instagram Handle
                      </Label>
                      <Input id="instagramHandle" name="instagramHandle" className={expoInputClasses} placeholder="@yourbrand" />
                    </div>
                    <div>
                      <Label htmlFor="tiktokHandle" className="font-sans text-sm font-semibold text-[#171411]">
                        TikTok Handle
                      </Label>
                      <Input id="tiktokHandle" name="tiktokHandle" className={expoInputClasses} placeholder="@yourbrand" />
                    </div>
                    <div>
                      <Label htmlFor="portfolioUrl" className="font-sans text-sm font-semibold text-[#171411]">
                        Portfolio / Lookbook Link
                      </Label>
                      <Input id="portfolioUrl" name="portfolioUrl" type="url" className={expoInputClasses} placeholder="https://drive.google.com/..." />
                    </div>
                    <div>
                      <Label htmlFor="yearsExperience" className="font-sans text-sm font-semibold text-[#171411]">
                        Years of Experience
                      </Label>
                      <Input id="yearsExperience" name="yearsExperience" type="number" min="0" className={expoInputClasses} placeholder="e.g. 3" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="motivation" className="font-sans text-sm font-semibold text-[#171411]">
                        Why should your collection be selected?
                      </Label>
                      <Textarea
                        id="motivation"
                        name="motivation"
                        className={expoTextareaClasses}
                        placeholder="Tell us what makes your collection, concept, and brand stand out."
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
                        placeholder="Production notes, model requirements, collection inspiration, or anything else the Panache team should know."
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
                      I confirm that the information provided is accurate and I understand that payment is required on Ayati after this form is submitted.
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
                      Keep me updated about Panache Expo announcements and fashion competition information.
                    </Label>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-black/8 pt-8 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-sans text-sm text-[#171411]/56">
                    Your application code appears right after save.
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
                        : "Save Application & Continue to Payment"}
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="h-12 rounded-full border-black/12 bg-white/72 px-6 font-sans text-sm font-semibold text-[#171411] hover:bg-white"
                    >
                      <a href={paymentConfig.paymentHref} target="_blank" rel="noopener noreferrer">
                        View Ayati Page
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

export default FashionNightRegisterPage;
