import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Crown } from "lucide-react";

const TARGET_EMAIL = "thepanacheexpo@gmail.com";

const MissPanacheRegisterPage = () => {
  const { toast } = useToast();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [newsletterSubscription, setNewsletterSubscription] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions before submitting.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const age = formData.get("age") as string;
    const socialMedia = formData.get("socialMedia") as string;
    const motivation = formData.get("motivation") as string;

    const subject = encodeURIComponent(`Miss Panache Expo Registration - ${name}`);
    const body = encodeURIComponent(
      `Miss Panache Expo Registration\n\n` +
      `Name: ${name}\n` +
      `Email: ${email}\n` +
      `Phone: ${phone}\n` +
      `Age: ${age}\n` +
      `Social Media: ${socialMedia}\n\n` +
      `Motivation Statement:\n${motivation}\n\n` +
      `Newsletter Subscription: ${newsletterSubscription ? "Yes" : "No"}`
    );

    window.location.href = `mailto:${TARGET_EMAIL}?subject=${subject}&body=${body}`;

    toast({
      title: "Registration Initiated!",
      description: "Your email client should open with the registration details.",
    });

    (e.target as HTMLFormElement).reset();
    setAgreedToTerms(false);
    setNewsletterSubscription(false);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/20 to-secondary/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
            Register for <span className="text-rose-gold">Miss Panache Expo</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Begin your journey to becoming the next Miss Panache Expo
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" required placeholder="Your full name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" name="email" type="email" required placeholder="your@email.com" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" name="phone" type="tel" required placeholder="+237..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input id="age" name="age" type="number" required min="18" max="28" placeholder="18-28" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="socialMedia">Social Media Handles</Label>
              <Input id="socialMedia" name="socialMedia" placeholder="@instagram, @tiktok, etc." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivation">Motivation Statement *</Label>
              <Textarea
                id="motivation"
                name="motivation"
                required
                placeholder="Tell us why you want to be the next Miss Panache Expo and what makes you a great ambassador..."
                className="min-h-[120px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the terms and conditions and the rules of the competition *
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="newsletter"
                checked={newsletterSubscription}
                onCheckedChange={(checked) => setNewsletterSubscription(checked as boolean)}
              />
              <Label htmlFor="newsletter" className="text-sm">
                Subscribe to Panache Expo updates
              </Label>
            </div>

            <Button type="submit" variant="hero" className="w-full">
              <Crown className="w-5 h-5 mr-2" /> Submit Registration
            </Button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MissPanacheRegisterPage;
