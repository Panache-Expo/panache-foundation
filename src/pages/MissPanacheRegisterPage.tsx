import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { competitionRegistrationLinks } from "@/lib/registration-links";
import { Crown, ExternalLink } from "lucide-react";

const MissPanacheRegisterPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-24 pb-16 px-6 bg-gradient-to-br from-primary/20 to-secondary/20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
            Register for <span className="text-rose-gold">Miss Panache Expo</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Contestant applications are now handled through our official Ayati registration page.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto rounded-3xl border border-border/60 bg-card p-8 md:p-10 shadow-soft text-center">
          <p className="text-muted-foreground mb-8">
            Use the official registration link below to submit your application and continue your Miss Panache journey.
          </p>
          <Button asChild variant="hero" size="lg">
            <a
              href={competitionRegistrationLinks.missPanache.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              Continue to Registration
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MissPanacheRegisterPage;
