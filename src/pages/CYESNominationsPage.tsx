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
import { Award, User } from "lucide-react";
import honDonald from "@/assets/HonDonald.jpeg";
import nshala from "@/assets/Nshala.jpeg";
import felix from "@/assets/felix.jpg";
import nervis from "@/assets/nervis.png";
import chuo from "@/assets/chuo.png";
import steve from "@/assets/stevenjang.png";
import angwi from "@/assets/angwi.png";
import nanalynn from "@/assets/nanalynn.png";
import godlove from "@/assets/godlove.png";

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
const juryMembers = [
  {
    name: "Hon Donald Malomba Esembe",
    title: "MP Buea Urban Constituency",
    photo: honDonald,
  },
  {
    name: "Mr Nshal Mpeng Abwa Bernard Takang",
    title: "Regional President Cameroon National Youth Council Southwest",
    photo: nshala,
  },
  {
    name: "Felix Fomengia",
    title: "Digital Innovation Expert and Cybersecurity Professional",
    photo: felix,
  },
  {
    name: "Nzometiah Nervis",
    title: "CEO, Nervtek",
    photo: nervis,
  },
  {
    name: "Barr. Chuo Angabua ",
    title: "Founding Partner | Prime Time Law offices",
    photo: chuo,
  },
  {
    name: "Steve Njang",
    title: "Founder of Nexdim Empire, Award-winning Blogger/ Content creator",
    photo: steve,
  },
  {
    name: "Angwi Njamah",
    title: "Journalist /Public Relations Officer PCC Business Units/Certified Virtual Assistant",
    photo: angwi,
  },
  {
    name: "Miss Nana Lynn ",
    title: "LinkedIn & Personal Brand Coach",
    photo: nanalynn,
  },
  {
    name: "Godlove Njisong",
    title: "Founder GoMAD",
    photo: godlove, 
  },
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

      {/* Eligibility */}
      <section className="py-8 px-6">
        <Card className="max-w-3xl mx-auto bg-muted/30">
          <CardContent className="pt-6">
            <h3 className="font-display text-lg font-semibold text-cyes-green mb-3">General Eligibility Requirements</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Nominee must be a Cameroonian (by nationality or origin) or an individual/organization making a verifiable impact in Cameroon.</li>
              <li>Nominee must be between 18 – 45 years old (except for special/honorary categories where applicable).</li>
              <li>Nominee must be actively involved in entrepreneurship, business, innovation, leadership, or community development.</li>
              <li>The nominee's work must demonstrate measurable impact, such as job creation, community transformation, innovation, or social value.</li>
              <li>Achievements considered must fall within the last 12–24 months, unless otherwise specified.</li>
              <li>Nominee must provide verifiable proof of work, including business registration (if applicable), portfolio, media presence, testimonials, or documented results.</li>
              <li>Nominee must accept the nomination and submit all required documents within 72 hours of notification.</li>
              <li>Nominee must uphold good ethical standards and must not be involved in any serious misconduct that could affect the credibility of the awards.</li>
              <li>Organizations and startups must be operational for at least 6–12 months prior to nomination.</li>
              <li>Nominees can apply or be nominated in multiple categories, but must meet the specific criteria for each category.</li>
            </ul>
          </CardContent>
        </Card>
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
      {/* Jury Committee Section */}
      <section className="py-24 px-6 bg-cyes-green/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-cyes-green font-medium text-lg">CYECD Awards 2026</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
              Meet the <span className="text-cyes-green">Jury Committee</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our distinguished panel of judges brings expertise, integrity, and passion to evaluating Cameroon's brightest young entrepreneurs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {juryMembers.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-background shadow-lg border border-border/40 hover:shadow-xl transition-shadow"
              >
                <div className="w-28 h-28 rounded-full overflow-hidden mb-4 bg-muted flex items-center justify-center border-2 border-cyes-green/30">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-muted-foreground/40" />
                  )}
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-1">
                  {member.name}
                </h3>
                <p className="text-cyes-green font-medium text-sm mb-1">{member.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CYESNominationsPage;
