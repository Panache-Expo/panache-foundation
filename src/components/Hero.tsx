import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-beauty.png";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";


export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Panache Expo Beauty Event" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-rose-gold/70"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground mb-6 animate-fade-in">
          Panache <span className="text-rose-gold">Expo</span>
        </h1>
        {/* Event Date - prominent placement */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in">
          <Calendar className="w-6 h-6 text-rose-gold" />
          <span className="text-2xl md:text-3xl font-semibold text-primary-foreground">July 16th 2026</span>
        </div>
        <p className="text-xl md:text-2xl lg:text-3xl text-primary-foreground/90 mb-6 font-light leading-relaxed animate-fade-in">
          Celebrating Beauty, Fashion and Skincare through 
        </p>
        <p className="text-lg md:text-xl text-primary-foreground/80 mb-12 animate-fade-in">
          Workshops • Pageants • Prestigious Awards
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/workshops">
            <Button variant="hero" size="lg">
              Explore Workshops
            </Button>
          </Link>
          <Link to="/panache-dor">
            <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              Panache D'or Winners
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-3 h-3 bg-rose-gold rounded-full animate-float opacity-60"></div>
      <div className="absolute bottom-32 right-16 w-2 h-2 bg-primary-foreground rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/3 right-8 w-4 h-4 bg-rose-gold/60 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
    </section>
  );
};