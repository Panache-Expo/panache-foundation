import { Button } from "@/components/ui/button";

export const Contact = () => {
  return (
    <section className="py-24 px-6 bg-gradient-hero">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-8">
          Join the <span className="text-rose-gold">Excellence</span>
        </h2>
        
        <p className="text-lg md:text-xl text-primary-foreground/90 mb-12 leading-relaxed max-w-2xl mx-auto">
          Ready to elevate your beauty skills and be part of a community that celebrates excellence? 
          Contact us today to learn more about our upcoming workshops and events.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📧</span>
            </div>
            <h3 className="font-semibold text-primary-foreground mb-2">Email Us</h3>
            <p className="text-primary-foreground/80 text-sm">info@panacheexpo.org</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="font-semibold text-primary-foreground mb-2">Call Us</h3>
            <p className="text-primary-foreground/80 text-sm">+1 (555) 123-4567</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📍</span>
            </div>
            <h3 className="font-semibold text-primary-foreground mb-2">Visit Us</h3>
            <p className="text-primary-foreground/80 text-sm">Cameroon</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
            Schedule Consultation
          </Button>
          <Button variant="secondary" size="lg">
            Download Brochure
          </Button>
        </div>
      </div>
    </section>
  );
};