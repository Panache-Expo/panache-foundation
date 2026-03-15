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

const TARGET_EMAIL = "thepanacheexpo@gmail.com";

const categories = [
  "BARBING",
  "BEAUTY MAKEUP",
  "SFX MAKEUP",
  "BRAIDING",
  "ARTISTIC HAIRSTYLING",
  "WIG INSTALLATION",
  "NAILS INSTALLATION",
  "LASH EXTENSIONS INSTALLATION",
];

export const Panache360RegisterPage = () => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [newsletterSubscription, setNewsletterSubscription] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast({ title: "Please agree to the terms and conditions", variant: "destructive" });
      return;
    }
    if (!selectedCategory) {
      toast({ title: "Please select a competition category", variant: "destructive" });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const details = formData.get('details') as string;

    const subject = encodeURIComponent(`Panache 360 Competition Registration - ${selectedCategory}`);
    const body = encodeURIComponent(
      `PANACHE 360 BEAUTY COMPETITION REGISTRATION\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone}\nCategory: ${selectedCategory}\nAdditional Details: ${details || "None"}\nNewsletter: ${newsletterSubscription ? "Yes" : "No"}\n`
    );

    window.location.href = `mailto:${TARGET_EMAIL}?subject=${subject}&body=${body}`;
    toast({ title: "Registration prepared!", description: "Your email client will open. Please send the email to complete your registration." });

    e.currentTarget.reset();
    setAgreedToTerms(false);
    setNewsletterSubscription(false);
    setSelectedCategory("");
  };
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-24 pb-16 px-6 bg-gradient-card">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
              Register for the <span className="text-rose-gold">Competition</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Join the Panache 360 Beauty Competition. Select your category and register below.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-elegant">
            <form className="space-y-6" onSubmit={handleSubmit}>
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

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" name="email" type="email" className="mt-2" placeholder="your.email@example.com" required />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" name="phone" type="tel" className="mt-2" placeholder="+237 6XX XXX XXX" required />
              </div>

              <div>
                <Label>Competition Category *</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="details">Additional Details</Label>
                <Textarea id="details" name="details" className="mt-2" rows={3} placeholder="Any additional information you'd like to share..." />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked === true)} />
                <Label htmlFor="terms" className="text-sm">I agree to the terms and conditions and privacy policy</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="newsletter" checked={newsletterSubscription} onCheckedChange={(checked) => setNewsletterSubscription(checked === true)} />
                <Label htmlFor="newsletter" className="text-sm">Subscribe to our newsletter for updates and exclusive offers</Label>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Register for Competition
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Panache360RegisterPage;
