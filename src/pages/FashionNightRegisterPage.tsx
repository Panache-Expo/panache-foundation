import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { competitionRegistrationLinks } from "@/lib/registration-links";
import { ExternalLink, Shirt } from "lucide-react";

export const FashionNightRegisterPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-24 pb-16 px-6 bg-gradient-card">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Shirt className="w-8 h-8 text-rose-gold" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
            Panache <span className="text-rose-gold">Fashion Night</span> Registration
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Designer applications are now hosted on our official Ayati registration page.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto rounded-3xl border border-border/60 bg-card p-8 md:p-10 shadow-soft text-center">
          <p className="text-muted-foreground mb-8">
            Use the link below to complete your Panache Fashion Night registration and submit your application through Ayati.
          </p>
          <Button asChild variant="hero" size="lg">
            <a
              href={competitionRegistrationLinks.fashionNight.href}
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

export default FashionNightRegisterPage;
