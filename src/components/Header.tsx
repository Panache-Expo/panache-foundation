import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, ChevronDown, Home } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 font-display text-2xl font-bold text-primary">
            Panache Expo <span className="text-rose-gold">Foundation</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          {/* Panache Expo Dropdown */}
          <div className="flex items-center gap-1">
            <Link to="/panache-expo" className="text-foreground hover:text-primary transition-colors">
              Panache Expo
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-foreground hover:text-primary transition-colors p-1">
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
                  <Link to="/panache-fashion-night" className="cursor-pointer">
                    Panache Fashion Night
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/panache-expo/exhibition-stands" className="cursor-pointer">
                    Exhibition Stands
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/panache-expo/charity-night" className="cursor-pointer">
                    Charity Activities
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/panache-dor" className="cursor-pointer">
                    Panache D'or Winners
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/miss-panache" className="cursor-pointer">
                    Miss Panache Expo
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/panache-expo/nominations" className="cursor-pointer">
                    Nominations
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* CYES Dropdown */}
          <div className="flex items-center gap-1">
            <Link to="/cyes" className="text-foreground hover:text-primary transition-colors">
              CYES
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-foreground hover:text-primary transition-colors p-1">
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border border-border shadow-elegant z-50">
                <DropdownMenuItem asChild>
                  <Link to="/cyes/awards" className="cursor-pointer">
                    CYECD Awards
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/cyes/nominations" className="cursor-pointer">
                    Nominations
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/cyes/pitch-competition" className="cursor-pointer">
                    CYES Business Pitch Competition
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

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
                <Link to="/panache-expo" className="block text-foreground hover:text-primary transition-colors py-1 pl-2" onClick={() => setIsMobileMenuOpen(false)}>
                  6th Edition 2026
                </Link>
                <Link to="/panache-360" className="block text-foreground hover:text-primary transition-colors py-1 pl-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Panache 360 Beauty
                </Link>
                <Link to="/panache-fashion-night" className="block text-foreground hover:text-primary transition-colors py-1 pl-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Panache Fashion Night
                </Link>
                <Link to="/panache-expo/exhibition-stands" className="block text-foreground hover:text-primary transition-colors py-1 pl-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Exhibition Stands
                </Link>
                <Link to="/panache-expo/charity-night" className="block text-foreground hover:text-primary transition-colors py-1 pl-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Charity Night
                </Link>
                <Link to="/workshops" className="block text-foreground hover:text-primary transition-colors py-1 pl-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Workshops
                </Link>
                <Link to="/panache-dor" className="block text-foreground hover:text-primary transition-colors py-1 pl-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Panache D'or Winners
                </Link>
                <Link to="/miss-panache" className="block text-foreground hover:text-primary transition-colors py-1 pl-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Miss Panache Expo
                </Link>
                <Link to="/panache-expo/nominations" className="block text-foreground hover:text-primary transition-colors py-1 pl-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Nominations
                </Link>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">CYES</p>
                <Link to="/cyes" className="block text-foreground hover:text-primary transition-colors py-1 pl-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Summit & Awards
                </Link>
                <Link to="/cyes/awards" className="block text-foreground hover:text-primary transition-colors py-1 pl-2" onClick={() => setIsMobileMenuOpen(false)}>
                  CYESCD Awards
                </Link>
                <Link to="/cyes/nominations" className="block text-foreground hover:text-primary transition-colors py-1 pl-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Nominations
                </Link>
                <Link to="/cyes/pitch-competition" className="block text-foreground hover:text-primary transition-colors py-1 pl-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Business Pitch Competition
                </Link>
              </div>
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
