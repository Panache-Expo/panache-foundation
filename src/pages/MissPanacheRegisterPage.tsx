import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CompetitionPaymentRedirect } from "@/components/registration/CompetitionPaymentRedirect";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitCompetitionApplication } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";
import {
  buildCompetitionApplicationCode,
  competitionRegistrationLinks,
} from "@/lib/registration-links";
import { sendCompetitionRegistrationEmail } from "@/lib/send-registration-email";
import { Crown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const paymentConfig = competitionRegistrationLinks.missPanache;

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
        payment_status: "pending",
        payment_platform: "ayatickets",
        review_status: "submitted",
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

      let emailWarning: string | null = null;

      try {
        await sendCompetitionRegistrationEmail({
          applicantEmail: email,
          applicantFirstName: firstName,
          competitionTitle: paymentConfig.title,
          applicationCode,
          paymentHref: paymentConfig.paymentHref,
          category: "Contestant",
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
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-24 pb-16 px-6 bg-gradient-to-br from-primary/20 to-secondary/20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
            Register for <span className="text-rose-gold">Miss Panache Expo</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Submit your contestant application here first. Once your details are saved, you will continue to Ayati to complete payment.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        {submittedApplicationCode ? (
          <CompetitionPaymentRedirect
            applicationCode={submittedApplicationCode}
            paymentHref={paymentConfig.paymentHref}
            title="Miss Panache Application Received"
            description="Your contestant application is now stored in the Panache registration system. Complete your Ayati payment to finish the registration flow."
          />
        ) : (
          <div className="max-w-3xl mx-auto rounded-3xl border border-border/60 bg-card p-8 md:p-10 shadow-soft">
            <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" name="firstName" className="mt-2" placeholder="Your first name" required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" name="lastName" className="mt-2" placeholder="Your last name" required />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" name="email" type="email" className="mt-2" placeholder="your.email@example.com" required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" name="phone" type="tel" className="mt-2" placeholder="+237 6XX XXX XXX" required />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input id="age" name="age" type="number" min="18" max="28" className="mt-2" placeholder="18-28" required />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" name="city" className="mt-2" placeholder="Buea" required />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" name="country" className="mt-2" placeholder="Cameroon" required />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="occupation">Occupation *</Label>
                  <Input id="occupation" name="occupation" className="mt-2" placeholder="Student, entrepreneur, model..." required />
                </div>
                <div>
                  <Label htmlFor="education">Education / Current Schooling</Label>
                  <Input id="education" name="education" className="mt-2" placeholder="University, college, professional training..." />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagramHandle">Instagram Handle</Label>
                  <Input id="instagramHandle" name="instagramHandle" className="mt-2" placeholder="@yourhandle" />
                </div>
                <div>
                  <Label htmlFor="tiktokHandle">TikTok Handle</Label>
                  <Input id="tiktokHandle" name="tiktokHandle" className="mt-2" placeholder="@yourhandle" />
                </div>
              </div>

              <div>
                <Label htmlFor="portfolioUrl">Portfolio / Public Profile Link</Label>
                <Input
                  id="portfolioUrl"
                  name="portfolioUrl"
                  type="url"
                  className="mt-2"
                  placeholder="https://instagram.com/..., Linktree, or portfolio page"
                />
              </div>

              <div>
                <Label htmlFor="leadershipExperience">Leadership / Community Experience</Label>
                <Textarea
                  id="leadershipExperience"
                  name="leadershipExperience"
                  className="mt-2"
                  rows={4}
                  placeholder="Tell us about any leadership roles, volunteering, advocacy, or community work you have done."
                />
              </div>

              <div>
                <Label htmlFor="motivation">Why do you want to be Miss Panache Expo? *</Label>
                <Textarea
                  id="motivation"
                  name="motivation"
                  className="mt-2 min-h-[120px]"
                  placeholder="Tell us why you want to compete and what kind of ambassador you would be."
                  required
                />
              </div>

              <div>
                <Label htmlFor="details">Additional Details</Label>
                <Textarea
                  id="details"
                  name="details"
                  className="mt-2"
                  rows={4}
                  placeholder="Anything else the Panache team should know during application review."
                />
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm leading-6">
                  I confirm that the information provided is accurate and I understand that payment is required on Ayati after this form is submitted.
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="newsletter"
                  checked={newsletterSubscription}
                  onCheckedChange={(checked) => setNewsletterSubscription(checked === true)}
                />
                <Label htmlFor="newsletter" className="text-sm leading-6">
                  Keep me updated about Miss Panache Expo announcements and contestant information.
                </Label>
              </div>

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={
                  submitCompetitionApplication.isPending || isFinalizingSubmission
                }
              >
                {submitCompetitionApplication.isPending || isFinalizingSubmission
                  ? "Saving application..."
                  : "Save Application & Continue to Payment"}
              </Button>
            </form>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default MissPanacheRegisterPage;
