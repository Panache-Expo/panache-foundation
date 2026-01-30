import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, ChevronDown, Home } from "lucide-react";
import logoImage from "@/assets/Panache Expo logo-01.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Determine if we're in CYES context
  const isCYES = location.pathname.startsWith("/cyes");
  const isPanacheExpo = location.pathname.startsWith("/panache-expo") || 
                        location.pathname.startsWith("/panache-360") ||
                        location.pathname.startsWith("/workshops") ||
                        location.pathname.startsWith("/panache-dor");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-primary transition-colors" title="Foundation Home">
            <Home className="w-5 h-5" />
          </Link>
          <Link to="/panache-expo" className="font-display text-2xl font-bold text-primary">
            Panache <span className="text-rose-gold">Expo</span> 
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          {/* Panache Expo Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
              Panache Expo
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border border-border shadow-elegant z-50">
              <DropdownMenuItem asChild>
                <Link to="/panache-expo" className="cursor-pointer">
                  6th Edition 2026
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/panache-360" className="cursor-pointer">
                  Panache 360 Beauty
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/workshops" className="cursor-pointer">
                  Workshops
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/panache-dor" className="cursor-pointer">
                  Panache D'or Winners
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/cyes" className="text-foreground hover:text-primary transition-colors">
            CYES
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
                className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                Foundation Home
              </Link>
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">Panache Expo</p>
                <Link 
                  to="/panache-expo" 
                  className="block text-foreground hover:text-primary transition-colors py-1 pl-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  6th Edition 2026
                </Link>
                <Link 
                  to="/panache-360" 
                  className="block text-foreground hover:text-primary transition-colors py-1 pl-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Panache 360 Beauty
                </Link>
                <Link 
                  to="/workshops" 
                  className="block text-foreground hover:text-primary transition-colors py-1 pl-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Workshops
                </Link>
                <Link 
                  to="/panache-dor" 
                  className="block text-foreground hover:text-primary transition-colors py-1 pl-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Panache D'or Winners
                </Link>
              </div>
              <Link 
                to="/cyes" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                CYES
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
