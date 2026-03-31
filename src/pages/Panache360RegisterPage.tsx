import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
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
import {
  buildCompetitionApplicationCode,
  competitionRegistrationLinks,
} from "@/lib/registration-links";
import { sendCompetitionRegistrationEmail } from "@/lib/send-registration-email";
import { Sparkles } from "lucide-react";
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
        payment_status: "pending",
        payment_platform: "ayatickets",
        review_status: "submitted",
        form_payload: {
          current_role: currentRole,
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
          category: selectedCategory,
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
      setSelectedCategory("");
      setSubmittedApplicationCode(applicationCode);

      toast({
        title: "Application saved",
        description: emailWarning
          ? `${emailWarning} Your application was still saved and you are being redirected to Ayati.`
          : "A confirmation email has been sent. Redirecting you to Ayati to complete payment.",
      });
    } catch (error) {
      console.log(error)
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

      <section className="pt-24 pb-16 px-6 bg-gradient-card">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-rose-gold" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
            Panache <span className="text-rose-gold">360</span> Registration
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Submit your competition details here first. Once your application is saved, you will continue to Ayati to complete payment.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        {submittedApplicationCode ? (
          <CompetitionPaymentRedirect
            applicationCode={submittedApplicationCode}
            paymentHref={paymentConfig.paymentHref}
            title="Panache 360 Application Received"
            description="Your details are now stored in the Panache registration system. Complete your Ayati payment to finish the registration flow."
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

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" name="city" className="mt-2" placeholder="Buea" required />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" name="country" className="mt-2" placeholder="Cameroon" required />
                </div>
              </div>

              <div>
                <Label>Competition Category *</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="mt-2">
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

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentRole">Current Role</Label>
                  <Input
                    id="currentRole"
                    name="currentRole"
                    className="mt-2"
                    placeholder="Professional barber, student, salon owner..."
                  />
                </div>
                <div>
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <Input
                    id="yearsExperience"
                    name="yearsExperience"
                    type="number"
                    min="0"
                    className="mt-2"
                    placeholder="e.g. 4"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagramHandle">Instagram Handle</Label>
                  <Input
                    id="instagramHandle"
                    name="instagramHandle"
                    className="mt-2"
                    placeholder="@yourhandle"
                  />
                </div>
                <div>
                  <Label htmlFor="portfolioUrl">Portfolio / Work Link</Label>
                  <Input
                    id="portfolioUrl"
                    name="portfolioUrl"
                    type="url"
                    className="mt-2"
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="motivation">Why do you want to compete? *</Label>
                <Textarea
                  id="motivation"
                  name="motivation"
                  className="mt-2 min-h-[120px]"
                  placeholder="Tell us why you want to join Panache 360 and what makes your work stand out."
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
                  placeholder="Anything else the Panache team should know before reviewing your application."
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
                  Keep me updated about Panache Expo announcements and competition information.
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
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

export default Panache360RegisterPage;
