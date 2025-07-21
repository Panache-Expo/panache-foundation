import { Button } from "@/components/ui/button";
import { Instagram, ExternalLink } from "lucide-react";

export const Founder = () => {
  return (
    <section className="py-24 px-6 bg-gradient-card">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Founder Image */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-elegant">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop"
                alt="Ekie Walters - Founder of Panache Expo"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Floating decoration */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-primary rounded-2xl opacity-20 animate-float"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-secondary rounded-full opacity-30 animate-float" style={{animationDelay: '1s'}}></div>
          </div>
          
          {/* Founder Content */}
          <div>
            <div className="mb-6">
              <span className="text-rose-gold font-medium text-lg">Meet Our Founder</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mt-2 mb-4">
                Ekie Walters
              </h2>
              <div className="flex items-center gap-2 mb-6">
                <Instagram className="w-5 h-5 text-rose-gold" />
                <a 
                  href="https://instagram.com/ekie_walters" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-rose-gold hover:text-primary transition-colors font-medium"
                >
                  @ekiewalters
                </a>
                <ExternalLink className="w-4 h-4 text-rose-gold" />
              </div>
            </div>
            
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Ekie Walters founded Panache Expo with a vision to elevate beauty standards and empower professionals 
                across Cameroon and beyond.
              </p>
              
              <p>
                His passion for excellence and commitment to education has transformed countless 
                lives, creating a platform where beauty professionals can learn, grow, and 
                celebrate their craft together.
              </p>
              
              <p>
                Through Panache Expo, he continues to bridge the gap between traditional 
                beauty practices and modern techniques, fostering a community that celebrates 
                diversity, creativity, and professional excellence.
              </p>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a 
                href="https://instagram.com/ekie_walters" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="default" size="lg" className="w-full sm:w-auto">
                  <Instagram className="w-5 h-5 mr-2" />
                  Follow on Instagram
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
