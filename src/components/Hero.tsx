import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-beauty.png";
import { Link } from "react-router-dom";
import logoImage from "@/assets/Panache Expo logo-01.png";

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
        <div className="animate-fade-in mb-8">
          <img src={logoImage} alt="Panache Expo" className="mx-auto max-w-[320px] md:max-w-[500px] mb-6" />
        </div>
        
        <p className="text-xl md:text-2xl lg:text-3xl text-primary-foreground/90 font-light leading-relaxed animate-fade-in mb-1">
          Celebrating Beauty, Fashion and Skincare through 
        </p>
        
        <p className="text-lg md:text-xl text-primary-foreground/80 animate-fade-in mb-4">
          Workshops • Pageants • Prestigious Awards
        </p>
        
        <Link to="/workshops">
          <Button variant="hero" size="lg">
            Explore Workshops
          </Button>
        </Link>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-3 h-3 bg-rose-gold rounded-full animate-float opacity-60"></div>
      <div className="absolute bottom-32 right-16 w-2 h-2 bg-primary-foreground rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/3 right-8 w-4 h-4 bg-rose-gold/60 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
    </section>
  );
};