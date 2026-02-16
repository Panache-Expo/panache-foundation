import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Award, Trophy, Star, Users, Calendar, MapPin } from "lucide-react";

const awardCategories = [
  "Young Entrepreneur of the Year",
  "Best Startup Innovation",
  "Social Impact Award",
  "Tech Excellence Award",
  "Best Female Entrepreneur",
  "Community Leadership Award",
  "Best Business Growth",
  "Creative Industries Award",
];

const CYESAwardsPage = () => {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-rose-gold/80">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10"></div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-20">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6">
            CYESCD <span className="text-rose-gold">Awards</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-4 font-light">
            Celebrating Youth Entrepreneurial Excellence
          </p>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Recognizing and honoring outstanding young entrepreneurs who are shaping
            the future of Cameroon through innovation, leadership, and impact.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/cyes/nominations">
              <Button variant="hero" size="lg">
                Nominate Now
              </Button>
            </Link>
            <Link to="/register">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 text-primary-foreground border-primary-foreground/20 hover:bg-white/20"
              >
                Register to Attend
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-primary-foreground/80 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Coming Soon 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Cameroon</span>
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
              About the <span className="text-rose-gold">CYESCD Awards</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The CYESCD Awards celebrate the brightest young entrepreneurs in Cameroon.
              From tech innovators to social impact leaders, we recognize those who are
              driving change and building a better future for their communities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-primary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-elegant group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-primary mb-4">Recognition</h3>
              <p className="text-muted-foreground leading-relaxed">
                Honoring exceptional achievements in youth entrepreneurship across multiple categories.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-secondary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-rose group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-primary mb-4">Community</h3>
              <p className="text-muted-foreground leading-relaxed">
                Building a network of inspiring young leaders and changemakers across Cameroon.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-primary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-elegant group-hover:scale-110 transition-transform duration-300">
                <Star className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-primary mb-4">Excellence</h3>
              <p className="text-muted-foreground leading-relaxed">
                Setting the standard for entrepreneurial excellence and innovation in Cameroon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Award Categories */}
      <section className="py-24 px-6 bg-gradient-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
              Award <span className="text-rose-gold">Categories</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nominations are open across multiple categories celebrating different aspects of entrepreneurship.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {awardCategories.map((category, index) => (
              <Card key={index} className="text-center hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <Award className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-primary">{category}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Nomination CTA */}
      <section className="py-16 px-6 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Know Someone Who Deserves Recognition?
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Submit your nomination today and help us celebrate outstanding young entrepreneurs.
          </p>
          <Link to="/cyes/nominations">
            <Button variant="hero" size="lg">
              Submit a Nomination
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CYESAwardsPage;
