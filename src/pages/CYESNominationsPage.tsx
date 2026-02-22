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
import { Award } from "lucide-react";

const CYES_EMAIL = "dhruvroshan10@gmail.com";

const categories = [
  "Young Entrepreneur of the Year",
  "Best Startup Innovation",
  "Social Impact Award",
  "Tech Excellence Award",
  "Best Female Entrepreneur",
  "Community Leadership Award",
  "Best Business Growth",
  "Creative Industries Award",
];

const CYESNominationsPage = () => {
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

    const subject = encodeURIComponent(`CYESCD Awards Nomination - ${formData.category}`);
    const body = encodeURIComponent(
      `CYESCD AWARDS NOMINATION\n\n` +
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

    window.open(`mailto:${CYES_EMAIL}?subject=${subject}&body=${body}`, "_blank");

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
            <Award className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
            CYESCD Awards <span className="text-rose-gold">Nominations</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nominate an outstanding young entrepreneur for the CYESCD Awards.
            Fill in the form below and submit your nomination.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 px-6">
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
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

export default CYESNominationsPage;
