import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Trophy, MapPin, Calendar, AlertTriangle, Globe, Video, Star, Users } from "lucide-react";
import businessCompBg from "@/assets/businesscomp.jpeg";

const TARGET_EMAIL = "info.cyescyecdawards@gmail.com";

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
  "6 months – 1 year",
  "1 – 2 years",
  "2 – 5 years",
  "More than 5 years",
];

export const CYESPitchCompetitionPage = () => {
  const [agreedToDeclaration, setAgreedToDeclaration] = useState(false);
  const [isOperating, setIsOperating] = useState("");
  const [runningDuration, setRunningDuration] = useState("");
  const [industry, setIndustry] = useState("");
  const [availablePhysically, setAvailablePhysically] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!agreedToDeclaration) {
      toast({ title: "Please confirm the declaration before submitting", variant: "destructive" });
      return;
    }
    if (!industry) {
      toast({ title: "Please select your industry / sector", variant: "destructive" });
      return;
    }
    if (!isOperating) {
      toast({ title: "Please indicate whether your business is currently operating", variant: "destructive" });
      return;
    }
    if (!availablePhysically) {
      toast({ title: "Please confirm your availability to pitch in Buea on July 16, 2026", variant: "destructive" });
      return;
    }

    const formData = new FormData(e.currentTarget);

    // Personal info
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const city = formData.get("city") as string;

    // Business info
    const businessName = formData.get("businessName") as string;

    // Business details
    const oneSentence = formData.get("oneSentence") as string;
    const problemSolved = formData.get("problemSolved") as string;
    const uniqueness = formData.get("uniqueness") as string;
    const targetCustomers = formData.get("targetCustomers") as string;
    const revenueModel = formData.get("revenueModel") as string;

    // Impact & Vision
    const impact = formData.get("impact") as string;
    const vision = formData.get("vision") as string;

    // Pitch Readiness
    const whySelected = formData.get("whySelected") as string;

    const subject = encodeURIComponent(`CYES Business Pitch Competition Application - ${businessName}`);
    const body = encodeURIComponent(
      `CYES 2026 BUSINESS PITCH COMPETITION APPLICATION\n\n` +
      `=== PERSONAL INFORMATION ===\n` +
      `Full Name: ${fullName}\n` +
      `Phone Number: ${phone}\n` +
      `Email Address: ${email}\n` +
      `City / Location: ${city}\n\n` +
      `=== BUSINESS INFORMATION ===\n` +
      `Business Name: ${businessName}\n` +
      `Industry / Sector: ${industry}\n` +
      `Currently Operating: ${isOperating}\n` +
      `How Long Running: ${runningDuration || "Not specified"}\n\n` +
      `=== BUSINESS DETAILS ===\n` +
      `Business in One Sentence: ${oneSentence}\n` +
      `Problem Solved: ${problemSolved}\n` +
      `What Makes It Unique: ${uniqueness}\n` +
      `Target Customers: ${targetCustomers}\n` +
      `Revenue Model: ${revenueModel}\n\n` +
      `=== IMPACT & VISION ===\n` +
      `Impact: ${impact}\n` +
      `Vision (1–3 years): ${vision}\n\n` +
      `=== PITCH READINESS ===\n` +
      `Why Should Be Selected: ${whySelected}\n` +
      `Available Physically in Buea on July 16, 2026: ${availablePhysically}\n\n` +
      `=== DECLARATION ===\n` +
      `Applicant confirms all information is accurate and is available to participate if selected.\n`
    );

    window.location.href = `mailto:${TARGET_EMAIL}?subject=${subject}&body=${body}`;
    toast({
      title: "Application prepared!",
      description: "Your email client will open. Please send the email to complete your application.",
    });

    e.currentTarget.reset();
    setAgreedToDeclaration(false);
    setIsOperating("");
    setRunningDuration("");
    setIndustry("");
    setAvailablePhysically("");
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden" style={{ backgroundImage: `url(${businessCompBg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-cyes-green/80 via-cyes-blue/80 to-cyes-green/80" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_35px,rgba(255,255,255,0.03)_35px,rgba(255,255,255,0.03)_70px)]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-20">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-cyes-yellow rounded-full px-4 py-2 text-sm font-semibold mb-6 backdrop-blur-sm">
            <Trophy className="w-4 h-4" />
            CYES 2026
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            CYES Business Pitch{" "}
            <span className="text-cyes-yellow">Competition</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/75 font-medium mb-10">
            Pitch Your Business. Win Funding. Get Visibility.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2 text-white">
              <MapPin className="w-5 h-5 text-cyes-green" />
              <span className="font-medium">Buea, Cameroon</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2 text-white">
              <Calendar className="w-5 h-5 text-cyes-yellow" />
              <span className="font-medium">July 16, 2026</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-cyes-red/90 backdrop-blur-sm border border-cyes-red text-white rounded-xl px-6 py-3 font-bold text-lg shadow-lg">
            <AlertTriangle className="w-5 h-5" />
            Only 20 Slots Available
          </div>
        </div>

        {/* Floating accent dots */}
        <div className="absolute top-32 left-10 w-3 h-3 bg-cyes-yellow rounded-full animate-float opacity-60" />
        <div className="absolute bottom-32 right-16 w-2 h-2 bg-cyes-red rounded-full animate-float opacity-40" style={{ animationDelay: "1s" }} />
        <div className="absolute top-48 right-20 w-2 h-2 bg-cyes-white rounded-full animate-float opacity-30" style={{ animationDelay: "2s" }} />
      </section>

      {/* About Section */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-foreground mb-6">
            About the Competition
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            The <strong className="text-foreground">CYES Business Pitch Competition</strong> is a platform designed to empower young entrepreneurs by giving them the opportunity to present their business ideas, gain visibility, and access real growth opportunities.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            This is more than just a competition — it is a chance to{" "}
            <strong className="text-cyes-green">position your business, attract attention, and unlock new opportunities</strong>.
          </p>
        </div>
      </section>

      {/* Winner's Package */}
      <section className="py-16 px-6 bg-gradient-to-br from-cyes-green/5 to-cyes-yellow/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="w-8 h-8 text-cyes-yellow" />
            <h2 className="font-display text-3xl font-bold text-foreground">
              What You Stand to Win
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: "💰", label: "300,000 CFA Cash Prize" },
              { icon: <Globe className="w-5 h-5 text-cyes-blue" />, label: "Free Professional Business Website" },
              { icon: <Video className="w-5 h-5 text-cyes-red" />, label: "Free Professional Video Advert for Your Business" },
              { icon: <Star className="w-5 h-5 text-cyes-yellow" />, label: "Feature on Our Official Website" },
              { icon: "📲", label: "Weekly Promotion of Your Business for 6 Months" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-card rounded-xl p-5 shadow-soft border border-border">
                <span className="text-2xl mt-0.5 flex-shrink-0">
                  {typeof item.icon === "string" ? item.icon : item.icon}
                </span>
                <p className="font-semibold text-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-muted-foreground text-center italic">
            Designed to give you real exposure, credibility, and business growth support.
          </p>
        </div>
      </section>

      {/* Who Can Apply */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-8 h-8 text-cyes-blue" />
            <h2 className="font-display text-3xl font-bold text-foreground">
              Who Can Apply
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-3">
            {[
              "Young entrepreneurs",
              "Startup founders",
              "Small business owners",
              "Innovators with viable business ideas",
              "Individuals building scalable and impactful solutions",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 bg-cyes-blue/5 border border-cyes-blue/20 rounded-lg px-4 py-3">
                <div className="w-2 h-2 rounded-full bg-cyes-blue flex-shrink-0" />
                <span className="text-foreground text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-gradient-to-br from-cyes-green/5 to-cyes-blue/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-foreground mb-10 text-center">
            How It Works
          </h2>
          <div className="space-y-4">
            {[
              "Submit your application",
              "Applications will be reviewed",
              "Only 20 candidates will be selected",
              "Selected participants will pitch live at the Summit",
              "A panel of judges will evaluate each pitch",
              "The best business idea wins",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4 bg-card rounded-xl p-5 shadow-soft border border-border">
                <div className="w-10 h-10 rounded-full bg-cyes-green text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-foreground font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We're Looking For */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-foreground mb-8 text-center">
            What We Are Looking For
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4">
            {[
              "Innovative ideas",
              "Clear business models",
              "Scalable solutions",
              "Strong vision and passion",
              "Real impact potential",
            ].map((item) => (
              <div key={item} className="bg-gradient-to-br from-cyes-green/10 to-cyes-yellow/10 border border-cyes-green/20 rounded-xl px-5 py-4 text-center">
                <p className="font-semibold text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Fee Notice */}
      <section className="py-12 px-6 bg-cyes-green text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg font-medium mb-2 opacity-90">Registration Fee</p>
          <p className="text-4xl font-bold font-display mb-3">20,000 CFA</p>
          <p className="opacity-80">Your registration confirms your interest and commitment to participate.</p>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 px-6 bg-gradient-to-br from-cyes-green/10 via-cyes-blue/5 to-cyes-yellow/10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-full px-4 py-2 text-sm font-semibold mb-4">
              <AlertTriangle className="w-4 h-4" />
              Only 20 slots available. Selection is competitive.
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Apply Now
            </h2>
            <p className="text-muted-foreground">
              Submit your application today and take your business to the next level.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg">
            <form className="space-y-8" onSubmit={handleSubmit}>

              {/* Personal Information */}
              <div>
                <h3 className="font-display text-xl font-bold text-foreground mb-5 pb-2 border-b border-border">
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" name="fullName" className="mt-2" placeholder="Your full name" required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" name="phone" type="tel" className="mt-2" placeholder="+237 6XX XXX XXX" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" name="email" type="email" className="mt-2" placeholder="your.email@example.com" required />
                  </div>
                  <div>
                    <Label htmlFor="city">City / Location *</Label>
                    <Input id="city" name="city" className="mt-2" placeholder="e.g. Buea, Douala, Yaoundé..." required />
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="font-display text-xl font-bold text-foreground mb-5 pb-2 border-b border-border">
                  Business Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input id="businessName" name="businessName" className="mt-2" placeholder="Your business name" required />
                  </div>
                  <div>
                    <Label>Industry / Sector *</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((ind) => (
                          <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Are you currently operating? *</Label>
                    <Select value={isOperating} onValueChange={setIsOperating}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Yes / No" />
                      </SelectTrigger>
                      <SelectContent>
                        {operatingOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>How long has your business been running?</Label>
                    <Select value={runningDuration} onValueChange={setRunningDuration}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {runningDurationOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div>
                <h3 className="font-display text-xl font-bold text-foreground mb-5 pb-2 border-b border-border">
                  Business Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="oneSentence">Describe your business in one sentence *</Label>
                    <Input id="oneSentence" name="oneSentence" className="mt-2" placeholder="e.g. We connect local farmers to urban buyers through a mobile app." required />
                  </div>
                  <div>
                    <Label htmlFor="problemSolved">What problem does your business solve? *</Label>
                    <Textarea id="problemSolved" name="problemSolved" className="mt-2" rows={3} placeholder="Describe the problem clearly..." required />
                  </div>
                  <div>
                    <Label htmlFor="uniqueness">What makes your business unique? *</Label>
                    <Textarea id="uniqueness" name="uniqueness" className="mt-2" rows={3} placeholder="What sets you apart from others?" required />
                  </div>
                  <div>
                    <Label htmlFor="targetCustomers">Who are your target customers? *</Label>
                    <Input id="targetCustomers" name="targetCustomers" className="mt-2" placeholder="e.g. Young women aged 18–35 in urban Cameroon" required />
                  </div>
                  <div>
                    <Label htmlFor="revenueModel">How do you make money (or plan to)? *</Label>
                    <Textarea id="revenueModel" name="revenueModel" className="mt-2" rows={3} placeholder="Describe your revenue model..." required />
                  </div>
                </div>
              </div>

              {/* Impact & Vision */}
              <div>
                <h3 className="font-display text-xl font-bold text-foreground mb-5 pb-2 border-b border-border">
                  Impact & Vision
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="impact">What impact is your business creating (or aims to create)? *</Label>
                    <Textarea id="impact" name="impact" className="mt-2" rows={3} placeholder="Social, economic, environmental impact..." required />
                  </div>
                  <div>
                    <Label htmlFor="vision">Where do you see your business in the next 1–3 years? *</Label>
                    <Textarea id="vision" name="vision" className="mt-2" rows={3} placeholder="Your growth vision..." required />
                  </div>
                </div>
              </div>

              {/* Pitch Readiness */}
              <div>
                <h3 className="font-display text-xl font-bold text-foreground mb-5 pb-2 border-b border-border">
                  Pitch Readiness
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="whySelected">Why should you be selected for this competition? *</Label>
                    <Textarea id="whySelected" name="whySelected" className="mt-2" rows={4} placeholder="Make your case — why you and your business?" required />
                  </div>
                  <div>
                    <Label>Are you available to pitch physically in Buea on July 16, 2026? *</Label>
                    <Select value={availablePhysically} onValueChange={setAvailablePhysically}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Yes / No" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Declaration */}
              <div className="bg-cyes-green/5 border border-cyes-green/20 rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-3">Declaration</h3>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="declaration"
                    checked={agreedToDeclaration}
                    onCheckedChange={(checked) => setAgreedToDeclaration(checked === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="declaration" className="text-sm leading-relaxed cursor-pointer">
                    I confirm that all information provided is accurate and I am available to participate if selected.
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-cyes-green hover:bg-cyes-green/90 text-white font-bold text-lg py-6"
                size="lg"
              >
                Submit Application
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Registration Fee: <strong className="text-foreground">20,000 CFA</strong> — payable upon selection confirmation.
              </p>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CYESPitchCompetitionPage;
