import { useState } from "react";
import { ChevronDown, Award, Trophy, Crown, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const awardCategories = [
  {
    icon: Crown,
    title: "Miss Panache D'or",
    description: "Celebrating elegance, intelligence, and grace"
  },
  {
    icon: Trophy,
    title: "Best Makeup Artist",
    description: "Excellence in makeup artistry and creativity"
  },
  {
    icon: Star,
    title: "Best Hair Stylist",
    description: "Outstanding achievement in hair styling"
  },
  {
    icon: Award,
    title: "Best Nail Technician",
    description: "Mastery in nail art and design"
  },
  {
    icon: Sparkles,
    title: "Best Skincare Specialist",
    description: "Excellence in skincare and beauty treatments"
  },
  {
    icon: Trophy,
    title: "Rising Star Award",
    description: "Recognizing emerging talents in the beauty industry"
  }
];

export const AwardsDropdown = () => {
  return (
    <section className="py-24 px-6 bg-gradient-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
            Panache D'or <span className="text-rose-gold">Awards</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Honoring excellence in beauty, fashion, and skincare through our prestigious awards program.
          </p>

          {/* Awards Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg" className="min-w-[280px]">
                <Award className="w-5 h-5 mr-2" />
                View Award Categories
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 bg-background border border-border shadow-elegant z-50">
              <DropdownMenuLabel className="text-primary font-display text-lg">
                Award Categories
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {awardCategories.map((category, index) => (
                <DropdownMenuItem key={index} className="py-3 cursor-pointer hover:bg-muted">
                  <category.icon className="w-5 h-5 mr-3 text-rose-gold" />
                  <div>
                    <p className="font-medium text-foreground">{category.title}</p>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <div className="p-2">
                <Link to="/panache-dor">
                  <Button variant="rose" size="sm" className="w-full">
                    View All Winners
                  </Button>
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Award Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {awardCategories.map((category, index) => (
            <div
              key={index}
              className="group bg-background rounded-2xl p-6 shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 border border-border"
            >
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <category.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary mb-2">
                {category.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {category.description}
              </p>
            </div>
          ))}
        </div>

        {/* Register CTA */}
        <div className="text-center mt-12">
          <Link to="/register">
            <Button variant="default" size="lg">
              Register for Awards
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
