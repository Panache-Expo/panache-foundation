import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { Footer } from "@/components/Footer";

const FoundationHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary mb-6">
            Panache Expo <span className="text-rose-gold">Foundation</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            Empowering communities through excellence in beauty, fashion, and youth entrepreneurship. 
            Choose your path to discover our impactful initiatives.
          </p>
        </div>
      </section>

      {/* Event Selection Cards */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Panache Expo Card */}
            <Link to="/panache-expo" className="group">
              <Card className="h-full overflow-hidden border-2 border-transparent hover:border-rose-gold transition-all duration-500 hover:shadow-elegant hover:-translate-y-2">
                <CardContent className="p-8 md:p-10">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-4">
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
                  <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-4">
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
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="font-display text-2xl md:text-3xl font-bold text-primary mb-6">
            Our Mission
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
