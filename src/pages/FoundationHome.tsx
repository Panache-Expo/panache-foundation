import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";
import foundationLogo from "@/assets/foundationlogo.jpeg";
import cyesLogo from "@/assets/CYESLogo.jpeg";
import panache from "@/assets/PanacheExpoLogo.png";

const FoundationHome = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-rose-gold/80">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10"></div>
        <div className="absolute top-32 left-10 w-3 h-3 bg-rose-gold rounded-full animate-float opacity-60"></div>
        <div className="absolute bottom-32 right-16 w-2 h-2 bg-primary-foreground rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <img
            src={foundationLogo}
            alt="Panache Expo Foundation logo"
            className="w-44 h-44 md:w-56 md:h-56 object-cover mx-auto mb-6 rounded-full border-4 border-primary-foreground/30 shadow-elegant"
          />
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6">
            Panache Expo <span className="text-rose-gold">Foundation</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/85 max-w-3xl mx-auto mb-8 leading-relaxed">
            Empowering communities through excellence in beauty, fashion, and youth entrepreneurship.
            Choose your path to discover our impactful initiatives.
          </p>
        </div>
      </section>

      {/* Event Selection Cards */}
      <section className="py-20 px-6 bg-gradient-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
              Our <span className="text-rose-gold">Flagship Events</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our transformative initiatives that celebrate talent and drive positive change.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Panache Expo Card */}
            <Link to="/panache-expo" className="group">
              <Card className="h-full overflow-hidden border-2 border-transparent hover:border-rose-gold transition-all duration-500 hover:shadow-elegant hover:-translate-y-2">
                <CardContent className="p-8 md:p-10">
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-primary rounded-full flex items-center justify-center mb-6 shadow-elegant border border-border group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                    <img
                      src={panache}
                      alt="Panache Expo logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-3">
                    Panache Expo
                  </h2>
                  <p className="text-rose-gold font-medium mb-4">6th Edition – 2026</p>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Celebrating Beauty, Fashion and Skincare through Workshops, Pageants and Prestigious Awards.
                    Join us for an unforgettable experience of excellence.
                  </p>
                  <div className="flex items-center text-primary font-medium group-hover:text-rose-gold transition-colors">
                    Explore Panache Expo
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* CYES Card */}
            <Link to="/cyes" className="group">
              <Card className="h-full overflow-hidden border-2 border-transparent hover:border-rose-gold transition-all duration-500 hover:shadow-elegant hover:-translate-y-2">
                <CardContent className="p-8 md:p-10">
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-secondary rounded-full flex items-center justify-center mb-6 shadow-rose border border-border group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                    <img
                      src={cyesLogo}
                      alt="CYES logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-3">
                    CYES
                  </h2>
                  <p className="text-rose-gold font-medium mb-4">Cameroon Youths Entrepreneurial Summit & Awards</p>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Empowering the next generation of Cameroonian entrepreneurs through mentorship,
                    networking, and recognition of outstanding youth achievements.
                  </p>
                  <div className="flex items-center text-primary font-medium group-hover:text-rose-gold transition-colors">
                    Explore CYES
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-secondary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-rose">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="font-display text-3xl md:text-4xl font-bold text-primary mb-6">
            Our <span className="text-rose-gold">Mission</span>
          </h3>
          <p className="text-muted-foreground text-lg leading-relaxed">
            The Panache Expo Foundation is dedicated to fostering excellence, creativity, and entrepreneurship
            across Cameroon and beyond. Through our flagship events, we create platforms that celebrate talent,
            provide education, and build communities that drive positive change.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FoundationHome;
