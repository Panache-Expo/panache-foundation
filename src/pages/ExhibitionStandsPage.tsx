import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CompetitionPaymentRedirect } from "@/components/registration/CompetitionPaymentRedirect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "@/lib/registration-links";
import { sendCompetitionRegistrationEmail } from "@/lib/send-registration-email";
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

const standOptions = [
  {
    title: "Corporate Booth",
    value: "Corporate Booth",
    price: "200,000 FCFA",
    description: "Perfect for established brands and companies.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Food / Drinks",
    value: "Food / Drinks",
    price: "150,000 FCFA",
    description: "Sell meals, beverages, and refreshments.",
    icon: UtensilsCrossed,
  },
  {
    title: "Small Chops & Snacks",
    value: "Small Chops & Snacks",
    price: "70,000 FCFA",
    description: "Quick sales, high demand, and fast turnover.",
    icon: ShoppingBag,
  },
  {
    title: "General Business",
    value: "General Business (Fashion, Wigs, Beauty, etc)",
    price: "50,000 FCFA",
    description: "Perfect for growing brands and vendors.",
    icon: Store,
  },
] as const;

const eventTraffic = [
  "Day 1: Entrepreneur Summit",
  "Day 2: Panache 360 Beauty Competition",
  "Day 3: Awards Night, Fashion Night, Miss Panache",
];

const reasonsToBook = [
  "Reach 5,000+ potential customers",
  "Sell directly and grow your brand",
  "Network with businesses and partners",
  "Gain massive visibility for 3 full days",
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
      window.location.assign(paymentConfig.paymentHref);
    }, 1600);

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
        payment_status: "pending",
        payment_platform: "ayatickets",
        review_status: "submitted",
        form_payload: {
          business_name: businessName,
          agreed_to_terms: agreedToTerms,
          contact_number: "+237652587170",
          registration_type: "exhibition_stand",
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
          category: selectedStandType,
        });
      } catch (error) {
        emailWarning =
          error instanceof Error
            ? error.message
            : "We could not send the confirmation email.";
      }

      formRef.current?.reset();
      setSelectedStandType("");
      setAgreedToTerms(false);
      setSubmittedApplicationCode(applicationCode);

      toast({
        title: "Stand request saved",
        description: emailWarning
          ? `${emailWarning} Your stand request was still saved and you are being redirected to Ayati.`
          : "Your stand request has been saved. Redirecting you to Ayati to complete payment.",
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
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-24 pb-16 px-6 bg-gradient-card">
        <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-gold mb-4">
              Panache Expo 2026 Exhibition Stands
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
              Put Your Business in Front of <span className="text-rose-gold">5,000+ People</span> in Just 3 Days
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mb-8">
              Panache Expo 2026 is bringing together entrepreneurs, beauty brands,
              fashion businesses, and consumers. Reserve your stand here first, then
              continue to Ayati to lock in your space.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="hero" size="lg">
                <a href="#quick-registration">
                  Book Your Stand Now
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="https://wa.me/237652587170" target="_blank" rel="noopener noreferrer">
                  <PhoneCall className="w-4 h-4" />
                  Call / WhatsApp
                </a>
              </Button>
            </div>
          </div>

          <Card className="border-border/60 shadow-elegant">
            <CardContent className="p-8">
              <p className="text-xs uppercase tracking-[0.24em] text-rose-gold mb-4">
                Why You Should Book
              </p>
              <div className="space-y-4">
                {reasonsToBook.map((reason) => (
                  <div key={reason} className="flex items-start gap-3">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Users className="w-4 h-4" />
                    </div>
                    <p className="text-muted-foreground">{reason}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-2xl border border-border/60 bg-muted/20 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-gold mb-2">
                  Limited spaces available
                </p>
                <p className="text-sm text-muted-foreground">
                  Stands are going fast. Once all available booths are filled, registration closes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-gold mb-4">
              Choose Your Stand
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
              Booth options for every brand stage
            </h2>
            <p className="text-muted-foreground">
              Pick the stand type that fits your business, then complete the quick registration below.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {standOptions.map((option) => (
              <Card key={option.value} className="border-border/60 shadow-soft h-full">
                <CardContent className="p-7 flex h-full flex-col">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                    <option.icon className="w-7 h-7" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.22em] text-rose-gold mb-3">
                    {option.price}
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-primary mb-3">
                    {option.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {option.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto rounded-3xl border border-border/60 bg-card p-8 md:p-10 shadow-soft">
          <div className="max-w-3xl mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-gold mb-4">
              3 Days. Non-Stop Traffic.
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
              Your stand stays visible across the biggest moments of the expo
            </h2>
            <p className="text-muted-foreground">
              The full event weekend is designed to keep people moving through the venue and discovering new brands.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {eventTraffic.map((item) => (
              <div key={item} className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                <p className="text-sm font-medium text-primary leading-7">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="quick-registration" className="px-6 pb-20">
        {submittedApplicationCode ? (
          <CompetitionPaymentRedirect
            applicationCode={submittedApplicationCode}
            paymentHref={paymentConfig.paymentHref}
            title="Exhibition Stand Request Received"
            description="Your stand request is now saved in the Panache registration system. Complete the Ayati payment to secure your booth."
          />
        ) : (
          <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[0.95fr,1.05fr]">
            <Card className="border-border/60 shadow-soft">
              <CardContent className="p-8 md:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-gold mb-4">
                  Book Your Stand Now
                </p>
                <h2 className="font-display text-3xl font-bold text-primary mb-4">
                  Quick registration
                </h2>
                <p className="text-muted-foreground mb-8">
                  Complete this quick form first. Once your request is saved, you will continue to Ayati to complete payment.
                </p>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">
                      Contact Number
                    </p>
                    <a
                      href="tel:+237652587170"
                      className="text-lg font-semibold text-primary hover:text-rose-gold transition-colors"
                    >
                      +237 652 587 170
                    </a>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">
                      What we need from you
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>Full name</li>
                      <li>Business name</li>
                      <li>Phone number</li>
                      <li>Stand type</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-3xl border border-border/60 bg-card p-8 md:p-10 shadow-soft">
              <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      className="mt-2"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      className="mt-2"
                      placeholder="Your brand or business name"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      className="mt-2"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="mt-2"
                      placeholder="+237 6XX XXX XXX"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Stand Type *</Label>
                  <Select value={selectedStandType} onValueChange={setSelectedStandType}>
                    <SelectTrigger className="mt-2">
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

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="standTerms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  />
                  <Label htmlFor="standTerms" className="text-sm leading-6">
                    I confirm that this booking request is accurate and I understand that my stand remains pending until Ayati payment is completed.
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
                    ? "Saving request..."
                    : "Save Request & Continue to Payment"}
                </Button>
              </form>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default ExhibitionStandsPage;
