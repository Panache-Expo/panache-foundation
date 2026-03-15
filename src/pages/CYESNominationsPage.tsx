import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Award } from "lucide-react";

const CYES_EMAIL = "info.cyescyecdawards@gmail.com";

const competitiveCategories = [
  { value: "Youth Entrepreneur of the Year", description: "Outstanding young entrepreneur (under 35) who has built a sustainable and impactful business demonstrating leadership, measurable growth, and innovation." },
  { value: "Startup of the Year", description: "Promising startup (less than 5 years old) showing innovation, scalability, strong market traction, and potential for long-term success." },
  { value: "Technology Innovator of the Year", description: "Individual or company leveraging technology to solve problems, improve systems, or drive digital transformation with measurable impact." },
  { value: "Agribusiness of the Year", description: "Business or entrepreneur making significant contributions to agriculture, agritech, food production, or rural economic development." },
  { value: "Creative Entrepreneur of the Year", description: "Creative industry professional running a structured and impactful business in fashion, media, art, design, photography, or entertainment." },
  { value: "Social Impact Business of the Year", description: "Business that combines profitability with purpose, actively addressing social or community challenges." },
  { value: "Community Leader of the Year", description: "Individual who has demonstrated exceptional leadership in driving positive change within their community." },
  { value: "NGO of the Year", description: "Registered non-profit organization making measurable and sustainable contributions to community development." },
  { value: "Youth Empowerment Initiative of the Year", description: "Project or organization empowering young people through skills development, mentorship, or opportunity creation." },
  { value: "Education Impact of the Year", description: "Individual or organization improving access to education, academic excellence, or mentorship programs." },
  { value: "Health Impact of the Year", description: "Impactful work in healthcare, public health awareness, humanitarian medical support, or health innovation." },
  { value: "Environmental Impact of the Year", description: "Initiatives promoting sustainability, environmental protection, climate awareness, or eco-friendly innovation." },
  { value: "Corporate Impact of the Year", description: "Corporate organization demonstrating strong social responsibility, community investment, and sustainable impact." },
  { value: "SME of the Year", description: "Small or medium-sized enterprise with strong growth, operational excellence, and measurable contribution to the economy." },
  { value: "Financial Institution of the Year", description: "Financial institution supporting entrepreneurship, community development, and economic empowerment." },
  { value: "Woman in Business of the Year", description: "Female business leader demonstrating excellence, resilience, and measurable business impact." },
  { value: "Diaspora Impact of the Year", description: "Diaspora individual or organization contributing significantly to development and investment back home." },
  { value: "Emerging Youth Leader of the Year", description: "Young leader demonstrating influence, integrity, and positive impact within their sector or community." },
  { value: "Media & Advocacy of the Year", description: "Media personality or platform using their voice to promote awareness, development, or social change." },
  { value: "Voice of the Generation Award", description: "Spoken word artist, poet, or youth voice using creative expression to inspire change and influence society." },
];

const honoraryCategories = [
  { value: "Lifetime Achievement Award", description: "Individual with decades of sustained impact and outstanding contribution to community or national development." },
  { value: "National Impact Award", description: "Distinguished personality whose work has significantly influenced national growth and transformation." },
  { value: "Entrepreneurial Legacy Award", description: "Visionary business leader whose long-term work has shaped industries and inspired future generations." },
  { value: "Youth Champion Award", description: "Individual or institution consistently supporting and advancing youth empowerment initiatives." },
  { value: "Presidential Honor Award", description: "Special recognition presented by the Founder to an exceptional personality for outstanding service and strategic impact." },
];

const allCategories = [...competitiveCategories, ...honoraryCategories];

const CYESNominationsPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nomineeName: "", nomineeEmail: "", nomineePhone: "", category: "",
    nominatorName: "", nominatorEmail: "", reason: "",
  });

  const selectedCategoryInfo = allCategories.find(c => c.value === formData.category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomineeName || !formData.category || !formData.nominatorName || !formData.nominatorEmail || !formData.reason) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    const subject = encodeURIComponent(`CYECD Awards Nomination - ${formData.category}`);
    const body = encodeURIComponent(
      `CYECD AWARDS NOMINATION\n\nCategory: ${formData.category}\n\n--- Nominee Details ---\nName: ${formData.nomineeName}\nEmail: ${formData.nomineeEmail}\nPhone: ${formData.nomineePhone}\n\n--- Nominator Details ---\nName: ${formData.nominatorName}\nEmail: ${formData.nominatorEmail}\n\n--- Reason for Nomination ---\n${formData.reason}`
    );
    window.location.href = `mailto:${CYES_EMAIL}?subject=${subject}&body=${body}`;
    toast({ title: "Nomination prepared!", description: "Your email client will open. Please send to complete your submission." });
  };
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-cyes-green/20 via-cyes-blue/10 to-cyes-yellow/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-cyes-green rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Award className="w-8 h-8 text-cyes-white" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            CYECD Awards <span className="text-cyes-green">Nominations</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cameroon Youths Entrepreneurial & Community Development Awards (CYECD) 2026.
            Nominate an outstanding individual, business, or initiative below.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 px-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="font-display text-2xl text-foreground">Nomination Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Award Category *</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem disabled value="__competitive_header__" className="font-bold text-cyes-green">— Competitive Categories —</SelectItem>
                    {competitiveCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.value}</SelectItem>
                    ))}
                    <SelectItem disabled value="__honorary_header__" className="font-bold text-cyes-yellow">— Honorary Categories (Board Selected) —</SelectItem>
                    {honoraryCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategoryInfo && (
                  <p className="text-sm text-muted-foreground bg-cyes-green/5 border border-cyes-green/20 rounded-lg p-3 mt-2">
                    <strong>Description:</strong> {selectedCategoryInfo.description}
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">Nominee Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={formData.nomineeName} onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })} placeholder="Nominee's full name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={formData.nomineeEmail} onChange={(e) => setFormData({ ...formData, nomineeEmail: e.target.value })} placeholder="Nominee's email" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Phone Number</Label>
                    <Input value={formData.nomineePhone} onChange={(e) => setFormData({ ...formData, nomineePhone: e.target.value })} placeholder="Nominee's phone number" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">Your Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Your Name *</Label>
                    <Input value={formData.nominatorName} onChange={(e) => setFormData({ ...formData, nominatorName: e.target.value })} placeholder="Your full name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Your Email *</Label>
                    <Input type="email" value={formData.nominatorEmail} onChange={(e) => setFormData({ ...formData, nominatorEmail: e.target.value })} placeholder="Your email" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason for Nomination *</Label>
                <Textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Explain why this person deserves to be nominated..." rows={5} />
              </div>

              <Button type="submit" className="w-full bg-cyes-green hover:bg-cyes-green/90 text-cyes-white font-bold" size="lg">
                Submit Nomination
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default CYESNominationsPage;
