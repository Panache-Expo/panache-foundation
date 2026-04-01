import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { competitionRegistrationLinks } from "@/lib/registration-links";
import { ArrowRight, Crown, Scissors, Sparkles, Store } from "lucide-react";
import { Link } from "react-router-dom";

const registrationOptions = [
  {
    title: competitionRegistrationLinks.missPanache.title,
    description: competitionRegistrationLinks.missPanache.description,
    path: competitionRegistrationLinks.missPanache.path,
    icon: Crown,
    accent: "text-rose-gold",
  },
  {
    title: competitionRegistrationLinks.fashionNight.title,
    description: competitionRegistrationLinks.fashionNight.description,
    path: competitionRegistrationLinks.fashionNight.path,
    icon: Scissors,
    accent: "text-primary",
  },
  {
    title: competitionRegistrationLinks.panache360.title,
    description: competitionRegistrationLinks.panache360.description,
    path: competitionRegistrationLinks.panache360.path,
    icon: Sparkles,
    accent: "text-rose-gold",
  },
];

export const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-24 pb-16 px-6 bg-gradient-card">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-gold mb-4">
            Official Registration
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
            Choose Your <span className="text-rose-gold">Competition</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Start your application on the website first. Once your details are saved, you will continue to Ayati to complete payment.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-3">
          {registrationOptions.map((option) => (
            <Card key={option.title} className="border-border/60 shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 flex h-full flex-col">
                <div className={`w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 ${option.accent}`}>
                  <option.icon className="w-7 h-7" />
                </div>
                <h2 className="font-display text-2xl font-semibold text-primary mb-3">
                  {option.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {option.description}
                </p>
                <Button asChild variant="hero" className="mt-auto w-full">
                  <Link to={option.path}>
                    Start Application
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto rounded-3xl border border-border/60 bg-card p-8 md:p-10 shadow-soft text-center">
          <h2 className="font-display text-3xl font-bold text-primary mb-4">
            Looking for another registration?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            For CYES attendance, workshop interest, sponsorships, or general event questions, use the pages below and the Panache team will direct you properly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero" size="lg">
              <Link to={competitionRegistrationLinks.exhibitionStands.path}>
                <Store className="w-4 h-4" />
                Book Exhibition Stand
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/cyes/register">Register for CYES</Link>
            </Button>
            <Button asChild variant="default" size="lg">
              <Link to="/contact">Contact the Team</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
