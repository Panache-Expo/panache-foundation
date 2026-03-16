import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Linkedin } from "lucide-react";
import logoImage from "@/assets/Panache Expo logo-01.png";

export const Footer = () => {
  return (
    <footer className="bg-primary/95 text-primary-foreground py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-display text-2xl font-bold mb-4">
              Panache <span className="text-rose-gold">Foundation</span>
            </h3>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Empowering communities through excellence in beauty, fashion, and youth entrepreneurship. Choose your path to discover our impactful initiatives.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  Foundation Home
                </Link>
              </li>
              <li>
                <Link to="/panache-expo" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  Panache Expo 2026
                </Link>
              </li>
              <li>
                <Link to="/cyes" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  CYES
                </Link>
              </li>
              <li>
                <Link to="/panache-360" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  Panache 360 Beauty
                </Link>
              </li>
              <li>
                <Link to="/panache-dor" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  Panache D'or
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
                  Register
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-sm text-primary-foreground/80">
                <Mail className="w-4 h-4 mr-3" />
                thepanacheexpo@gmail.com 
              </li>
              <li className="flex items-center text-sm text-primary-foreground/80">
                <Mail className="w-4 h-4 mr-3" />
                info.cyescyecdawards@gmail.com
              </li>
              <li className="flex items-center text-sm text-primary-foreground/80">
                <Phone className="w-4 h-4 mr-3" />
                +237 673 594 931
              </li>
              <li className="flex items-center text-sm text-primary-foreground/80">
                <MapPin className="w-4 h-4 mr-3" />
                  Cameroon
              </li>
            </ul>
          </div>
          
          {/* Social Media */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Follow Us - Panache Expo</h4>
            <div className="flex space-x-4 mb-4">
              <a 
                href="https://instagram.com/panache_expo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.facebook.com/share/1BvgGo9hXL/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com/@panacheexpo?si=a39zrVH0tJojj38N" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a 
                href="https://www.linkedin.com/company/thepanacheexpo/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            <h4 className="font-semibold text-lg mb-4">Follow Us - CYES</h4>
            <div className="flex space-x-4 mb-4">
              <a 
                href="https://www.instagram.com/cyes_awards?igsh=bTN5eGdqcWR6ODk3&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.facebook.com/share/1BiZNSBN2q/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.linkedin.com/company/cyes-youth-summit-awards/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Stay updated with our latest events and workshops
            </p>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-foreground/60 text-sm">
              © 2025 Panache Expo. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};