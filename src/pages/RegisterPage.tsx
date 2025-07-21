import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Footer } from "@/components/Footer";

export const RegisterPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="pt-24 pb-16 px-6 bg-gradient-card">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
              Register for <span className="text-rose-gold">Workshops</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Join our exclusive beauty workshops and elevate your skills with industry experts.
            </p>
          </div>
          
          <div className="bg-card rounded-2xl p-8 shadow-elegant">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" className="mt-2" placeholder="Your first name" required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" className="mt-2" placeholder="Your last name" required />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" className="mt-2" placeholder="your.email@example.com" required />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" className="mt-2" placeholder="+1 (555) 123-4567" required />
              </div>
              
              <div>
                <Label htmlFor="workshop">Select Workshop *</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose your workshop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="barber">Professional Barber Techniques</SelectItem>
                    <SelectItem value="nails">Advanced Nail Technology</SelectItem>
                    <SelectItem value="wigs">Wig Installation & Styling</SelectItem>
                    <SelectItem value="lashes">Lash Extension Mastery</SelectItem>
                    <SelectItem value="makeup">Professional Makeup Artistry</SelectItem>
                    <SelectItem value="braiding">Creative Braiding Techniques</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the terms and conditions and privacy policy
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="newsletter" />
                <Label htmlFor="newsletter" className="text-sm">
                  Subscribe to our newsletter for updates and exclusive offers
                </Label>
              </div>
              
              <Button type="submit" className="w-full" size="lg">
                Register for Workshop
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};