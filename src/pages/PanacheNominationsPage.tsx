import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

const PANACHE_EMAIL = "thepanacheexpo@gmail.com";

const categories = [
  { value: "Barber of the Year", description: "Must demonstrate consistent professional barbering excellence, client base growth, technical skill, and visible industry impact." },
  { value: "Hairstylist of the Year", description: "Must show creativity, professional service delivery, portfolio consistency, and strong client or event presence." },
  { value: "Braider of the Year", description: "Must demonstrate advanced braiding techniques, originality, consistency, and strong cultural or market relevance." },
  { value: "Makeup Artist of the Year (Including SFX)", description: "Must show versatility in beauty and/or special effects makeup, portfolio strength, and professional recognition." },
  { value: "Nail Artist of the Year", description: "Must demonstrate creativity, hygiene standards, technique precision, and strong visual portfolio." },
  { value: "Lash Artist of the Year", description: "Must show expertise in lash extensions, design precision, safety standards, and consistent client results." },
  { value: "Wig Installation Specialist of the Year", description: "Must demonstrate advanced wig construction or installation techniques, finishing quality, and professional delivery." },
  { value: "Fashion Designer of the Year", description: "Must show original collections, runway or commercial presence, brand identity, and creative consistency." },
  { value: "Emerging Fashion Designer of the Year", description: "Must have less than 5 years of active professional practice and show strong growth trajectory and innovation." },
  { value: "Model of the Year", description: "Must demonstrate professional modeling portfolio, runway/editorial experience, brand collaborations, and industry conduct." },
  { value: "Fashion Stylist of the Year", description: "Must show creative direction skills, styling portfolio, media or event presence, and industry impact." },
  { value: "Beauty Educator of the Year", description: "Must have trained students professionally through workshops, academies, or masterclasses with verifiable impact." },
  { value: "Content Creator of the Year", description: "Must produce consistent beauty or fashion content with measurable engagement, originality, and industry influence." },
  { value: "Beauty Brand of the Year", description: "Must operate as a registered or structured beauty-related brand with visible market presence and product/service consistency." },
  { value: "Creative Entrepreneur of the Year", description: "Must demonstrate business leadership, growth strategy, employment or collaboration impact, and innovation." },
  { value: "Emerging Creative Talent of the Year", description: "Must be within early professional stage (recommended under 5 years active) and show rapid industry growth and recognition." },
  { value: "Creative Photographer of the Year", description: "Must have demonstrated excellence in fashion or beauty photography within the last 24 months, supported by a strong professional portfolio with creative originality and clear industry impact." },
];

const PanacheNominationsPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nomineeName: "",
    nomineeEmail: "",
    nomineePhone: "",
    category: "",
    nominatorName: "",
    nominatorEmail: "",
    reason: "",
  });

  const selectedCategoryInfo = categories.find(c => c.value === formData.category);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nomineeName || !formData.category || !formData.nominatorName || !formData.nominatorEmail || !formData.reason) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const subject = encodeURIComponent(`Panache D'or Nomination - ${formData.category}`);
    const body = encodeURIComponent(
      `PANACHE D'OR NOMINATION\n\n` +
      `Category: ${formData.category}\n\n` +
      `--- Nominee Details ---\n` +
      `Name: ${formData.nomineeName}\n` +
      `Email: ${formData.nomineeEmail}\n` +
      `Phone: ${formData.nomineePhone}\n\n` +
      `--- Nominator Details ---\n` +
      `Name: ${formData.nominatorName}\n` +
      `Email: ${formData.nominatorEmail}\n\n` +
      `--- Reason for Nomination ---\n` +
      `${formData.reason}`
    );

    window.open(`mailto:${PANACHE_EMAIL}?subject=${subject}&body=${body}`, "_blank");

    toast({
      title: "Nomination prepared!",
      description: "Your email client will open with the nomination details. Please send it to complete your submission.",
    });
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/20 to-secondary/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
            Panache D'or <span className="text-rose-gold">Nominations</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Panache D'or 2026 — Nominate an outstanding beauty or fashion professional.
            Achievements must fall within the last 24 months.
          </p>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-8 px-6">
        <Card className="max-w-3xl mx-auto bg-muted/30">
          <CardContent className="pt-6">
            <h3 className="font-display text-lg font-semibold text-primary mb-3">General Eligibility Requirements</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Nominee must be actively practicing within the beauty, fashion, or creative industry.</li>
              <li>Achievements considered must fall within the last 24 months unless otherwise stated.</li>
              <li>Nominee must provide verifiable portfolio, social presence, or documented proof of work.</li>
              <li>Nominee must accept nomination and submit required documentation within 72 hours of request.</li>
              <li>Nominee must not have ongoing serious misconduct allegations that could damage event integrity.</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Form */}
      <section className="py-8 pb-16 px-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="font-display text-2xl text-primary">
              Nomination Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <Label>Award Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategoryInfo && (
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 mt-2">
                    <strong>Eligibility:</strong> {selectedCategoryInfo.description}
                  </p>
                )}
              </div>

              {/* Nominee Details */}
              <div>
                <h3 className="font-display text-lg font-semibold text-primary mb-4">Nominee Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={formData.nomineeName}
                      onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                      placeholder="Nominee's full name"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.nomineeEmail}
                      onChange={(e) => setFormData({ ...formData, nomineeEmail: e.target.value })}
                      placeholder="Nominee's email"
                      maxLength={255}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Phone Number</Label>
                    <Input
                      value={formData.nomineePhone}
                      onChange={(e) => setFormData({ ...formData, nomineePhone: e.target.value })}
                      placeholder="Nominee's phone number"
                      maxLength={20}
                    />
                  </div>
                </div>
              </div>

              {/* Nominator Details */}
              <div>
                <h3 className="font-display text-lg font-semibold text-primary mb-4">Your Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Your Name *</Label>
                    <Input
                      value={formData.nominatorName}
                      onChange={(e) => setFormData({ ...formData, nominatorName: e.target.value })}
                      placeholder="Your full name"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Your Email *</Label>
                    <Input
                      type="email"
                      value={formData.nominatorEmail}
                      onChange={(e) => setFormData({ ...formData, nominatorEmail: e.target.value })}
                      placeholder="Your email"
                      maxLength={255}
                    />
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label>Reason for Nomination *</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Explain why this person deserves to be nominated..."
                  rows={5}
                  maxLength={2000}
                />
              </div>

              <Button type="submit" variant="hero" className="w-full">
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

export default PanacheNominationsPage;
