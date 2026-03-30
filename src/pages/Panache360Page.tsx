import { Header } from "@/components/Header";
import { Workshops } from "@/components/Workshops";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Heart } from "lucide-react";
import { competitionRegistrationLinks } from "@/lib/registration-links";
import panache3601 from "@/assets/panache360-1.jpeg";
import panache3603 from "@/assets/panache360-2.jpeg";
import panache3602 from "@/assets/panache360-3.jpeg";
const Panache360Page = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 relative min-h-[600px] overflow-hidden" style={{ backgroundColor: "#1a1100" }}>
        {/* 3-image collage background */}
        <div className="absolute inset-0 grid grid-cols-3 h-full" style={{ filter: "blur(.5px) brightness(0.85)", transform: "scale(1.01)" }}>
          <div
            className="h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${panache3601})` }}
          />
          <div
            className="h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${panache3602})` }}
          />
          <div
            className="h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${panache3603})` }}
          />
        </div>
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(10, 5, 0, 0.5)" }} />
        <div className="relative max-w-7xl mx-auto px-6 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="inline-flex items-center gap-2 bg-rose-gold/20 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-rose-gold" />
            <span className="text-rose-gold text-sm font-medium">Part of Panache Expo</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
            Panache <span className="text-rose-gold">360</span> Beauty <span className="text-rose-gold">Competition</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8">
            A flagship highlight of Panache Expo celebrating creativity, technical excellence, and innovation within the beauty industry. Compete on stage before a live audience and industry judges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default" size="lg">
              <a
                href={competitionRegistrationLinks.panache360.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                Register for Competition
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
              About the <span className="text-rose-gold">Competition</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The Panache 360 Beauty Competition brings together talented professionals from different sectors of the beauty world to compete on one stage, showcasing their skills, creativity, and artistry before a live audience and a panel of industry judges.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary mb-2">
                8 Categories
              </h3>
              <p className="text-muted-foreground text-sm">
                Compete in Barbing, Beauty Makeup, SFX Makeup, Braiding, Artistic Hairstyling, Wig Installation, Nail Installation, or Lash Installation
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary mb-2">
                Over 2.4M FCFA
              </h3>
              <p className="text-muted-foreground text-sm">
                Cash prizes, trophies, and industry recognition for winners
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary mb-2">
                Grand Champion
              </h3>
              <p className="text-muted-foreground text-sm">
                Category champions compete for the ultimate Panache 360 Grand Champion title
              </p>
            </div>
          </div>

          <div className="bg-gradient-card p-8 rounded-2xl">
            <h3 className="font-display text-2xl font-bold text-primary mb-4 text-center">Competition Format</h3>
            <div className="grid md:grid-cols-2 gap-6 text-muted-foreground">
              <div>
                <h4 className="font-semibold text-primary mb-2">Participation</h4>
                <p className="text-sm leading-relaxed">
                  Only 7 registered competitors selected per category. Perform live creative demonstrations before judges and audience.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Winners</h4>
                <p className="text-sm leading-relaxed">
                  Three winners per category: Category Champion, First Runner-Up, and Second Runner-Up receive cash prizes and trophies.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Judging Criteria</h4>
                <p className="text-sm leading-relaxed">
                  Technical Skill, Creativity & Originality, Clean Execution, Transformation & Impact, and Professional Presentation.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">People's Choice</h4>
                <p className="text-sm leading-relaxed">
                  Public online voting determines the People's Choice Award winner, recognizing audience favorites.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workshops Component */}
      <Workshops />

      <Footer />
    </div>
  );
};

export default Panache360Page;
