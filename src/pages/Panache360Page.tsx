import { Header } from "@/components/Header";
import { Workshops } from "@/components/Workshops";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Star, Heart } from "lucide-react";

const Panache360Page = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/20 via-secondary/10 to-rose-gold/20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-rose-gold/20 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-rose-gold" />
            <span className="text-rose-gold text-sm font-medium">Part of Panache Expo</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-primary mb-6">
            Panache <span className="text-rose-gold">360</span> Beauty
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Comprehensive beauty education covering every aspect of the industry. 
            From makeup to hair styling, nail art to skincare – master it all.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="default" size="lg">
                Register for Workshops
              </Button>
            </Link>
            <Link to="/panache-expo">
              <Button variant="outline" size="lg">
                Back to Panache Expo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary mb-2">
                Expert Training
              </h3>
              <p className="text-muted-foreground text-sm">
                Learn from industry professionals with years of experience
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary mb-2">
                Certification
              </h3>
              <p className="text-muted-foreground text-sm">
                Receive recognized certificates upon completion
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary mb-2">
                Community
              </h3>
              <p className="text-muted-foreground text-sm">
                Join a supportive network of beauty professionals
              </p>
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
