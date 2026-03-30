import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SponsorsMarquee } from "@/components/SponsorsMarquee";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Shirt, Camera, Calendar, MapPin, Star, Scissors } from "lucide-react";
import { competitionRegistrationLinks } from "@/lib/registration-links";
import fashionNight from "@/assets/FashionNight.jpg";

const highlights = [
  {
    icon: Shirt,
    title: "Limited Selection",
    description: "Only selected designers chosen through application review for quality and exclusivity",
  },
  {
    icon: Scissors,
    title: "Professional Runway",
    description: "Cohesive collections presented with professional models and styling",
  },
  {
    icon: Camera,
    title: "Media Exposure",
    description: "Full media coverage providing valuable brand visibility and recognition",
  },
  {
    icon: Star,
    title: "Industry Networking",
    description: "Connect with designers, stylists, photographers, and fashion professionals",
  },
];

const FashionNightPage = () => {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden" style={{ backgroundImage: `url(${fashionNight})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/70 to-rose-gold/70"></div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-20">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6">
            Panache <span className="text-rose-gold">Fashion Night</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-4 font-light">
            A Competitive Runway Experience
          </p>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            One of the most anticipated highlights of Panache Expo, celebrating creativity, innovation, and excellence within the fashion industry through a prestigious competitive runway.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button asChild variant="hero" size="lg">
              <a
                href={competitionRegistrationLinks.fashionNight.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                Register Now
              </a>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-primary-foreground/80 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>July 18th 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Chariot Hotel - Buea, Cameroon</span>
            </div>
          </div>
        </div>

        <div className="absolute top-32 left-10 w-3 h-3 bg-rose-gold rounded-full animate-float opacity-60"></div>
        <div className="absolute bottom-32 right-16 w-2 h-2 bg-primary-foreground rounded-full animate-float opacity-40" style={{ animationDelay: "1s" }}></div>
      </section>

      {/* About Section */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
              About <span className="text-rose-gold">Fashion Night</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Panache Fashion Night brings together talented fashion designers, models, stylists, and fashion enthusiasts for an unforgettable evening of creativity, style, and artistic expression. Selected designers present their collections on a competitive runway before a live audience, industry professionals, and media.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-primary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-elegant group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-primary mb-4">Competitive Platform</h3>
              <p className="text-muted-foreground leading-relaxed">
                Selected designers present collections on a competitive runway before judges and industry professionals.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-secondary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-rose group-hover:scale-110 transition-transform duration-300">
                <Shirt className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-primary mb-4">Creative Showcase</h3>
              <p className="text-muted-foreground leading-relaxed">
                Professional runway presentations highlighting creativity, originality, and design philosophy.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-primary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-elegant group-hover:scale-110 transition-transform duration-300">
                <Star className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-primary mb-4">Awards & Recognition</h3>
              <p className="text-muted-foreground leading-relaxed">
                Outstanding designers recognized for creativity, innovation, and craftsmanship excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-24 px-6 bg-gradient-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
              Event <span className="text-rose-gold">Highlights</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, index) => (
              <Card key={index} className="text-center hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <item.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-primary mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Don't Miss Panache Fashion Night
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Experience the finest in African fashion. Secure your spot today.
          </p>
          <Button asChild variant="hero" size="lg">
            <a
              href={competitionRegistrationLinks.fashionNight.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Your Ticket
            </a>
          </Button>
        </div>
      </section>

      <SponsorsMarquee />
      <Footer />
    </div>
  );
};

export default FashionNightPage;
