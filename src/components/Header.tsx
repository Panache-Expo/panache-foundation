import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logoImage from "@/assets/Panache Expo logo-01.png";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logoImage} alt="Panache Expo" className="h-10 md:h-12" />
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/workshops" className="text-foreground hover:text-primary transition-colors">
            Workshops
          </Link>
          <Link to="/panache-dor" className="text-foreground hover:text-primary transition-colors">
            Panache D'or
          </Link>
          <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
            Contact
          </Link>
          <Link to="/register">
            <Button variant="default" size="sm">
              Register
            </Button>
          </Link>
        </nav>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border md:hidden">
            <nav className="flex flex-col p-6 gap-4">
              <Link 
                to="/" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/workshops" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Workshops
              </Link>
              <Link 
                to="/panache-dor" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Panache D'or
              </Link>
              <Link 
                to="/contact" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="default" size="sm" className="w-fit">
                  Register
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};