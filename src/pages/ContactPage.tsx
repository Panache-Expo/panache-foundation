import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Footer } from "@/components/Footer";

export const ContactPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="pt-24 pb-16 px-6 bg-gradient-hero">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Contact <span className="text-rose-gold">Us</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Ready to elevate your beauty skills? Get in touch with us today.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="text-center md:text-left">
                <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl mx-auto md:mx-0 mb-4 flex items-center justify-center">
                  <span className="text-2xl">📧</span>
                </div>
                <h3 className="font-semibold text-primary-foreground mb-2">Email Us</h3>
                <p className="text-primary-foreground/80">info@panacheexpo.org</p>
              </div>
              
              <div className="text-center md:text-left">
                <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl mx-auto md:mx-0 mb-4 flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="font-semibold text-primary-foreground mb-2">Call Us</h3>
                <p className="text-primary-foreground/80">+1 (555) 123-4567</p>
              </div>
              
              <div className="text-center md:text-left">
                <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl mx-auto md:mx-0 mb-4 flex items-center justify-center">
                  <span className="text-2xl">📍</span>
                </div>
                <h3 className="font-semibold text-primary-foreground mb-2">Visit Us</h3>
                <p className="text-primary-foreground/80">Beauty District, NYC</p>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="bg-background/10 backdrop-blur-sm rounded-2xl p-8">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-primary-foreground">First Name</Label>
                    <Input id="firstName" className="mt-2" placeholder="Your first name" />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-primary-foreground">Last Name</Label>
                    <Input id="lastName" className="mt-2" placeholder="Your last name" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-primary-foreground">Email</Label>
                  <Input id="email" type="email" className="mt-2" placeholder="your.email@example.com" />
                </div>
                
                <div>
                  <Label htmlFor="subject" className="text-primary-foreground">Subject</Label>
                  <Input id="subject" className="mt-2" placeholder="What can we help you with?" />
                </div>
                
                <div>
                  <Label htmlFor="message" className="text-primary-foreground">Message</Label>
                  <Textarea id="message" className="mt-2" rows={4} placeholder="Tell us more about your inquiry..." />
                </div>
                
                <Button type="submit" className="w-full" size="lg">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};