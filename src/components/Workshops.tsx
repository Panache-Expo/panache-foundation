import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const workshops = [
  {
    title: "Barber Workshops",
    description: "Master the art of precision cutting, styling, and traditional barbering techniques.",
    icon: "✂️",
    features: ["Classic Cuts", "Modern Styling", "Beard Grooming", "Tool Mastery"]
  },
  {
    title: "Nail Tech Workshops", 
    description: "Learn advanced nail artistry, techniques, and the latest trends in nail design.",
    icon: "💅",
    features: ["Nail Art", "Gel Techniques", "Extensions", "Health & Safety"]
  },
  {
    title: "Wig Installation",
    description: "Professional wig fitting, installation, and styling for natural-looking results.",
    icon: "🎭",
    features: ["Lace Fronts", "Custom Fitting", "Styling Tips", "Maintenance"]
  },
  {
    title: "Lash Installation",
    description: "Expert eyelash extension techniques for volume, length, and natural beauty.",
    icon: "👁️",
    features: ["Classic Lashes", "Volume Sets", "Hybrid Techniques", "Aftercare"]
  },
  {
    title: "Makeup Workshops",
    description: "Comprehensive makeup artistry training from basic to advanced techniques.",
    icon: "💄",
    features: ["Color Theory", "Contouring", "Special Effects", "Bridal Makeup"]
  },
  {
    title: "Braiding Workshops",
    description: "Traditional and contemporary braiding styles for all hair types and textures.",
    icon: "🌾",
    features: ["Protective Styles", "Cultural Techniques", "Creative Patterns", "Hair Health"]
  }
];

export const Workshops = () => {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
            Master Your <span className="text-rose-gold">Craft</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover our comprehensive workshops designed to elevate your skills 
            and unlock your creative potential in the beauty industry.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workshops.map((workshop, index) => (
            <div 
              key={workshop.title}
              className="group relative p-8 bg-card rounded-3xl shadow-soft hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 border border-border/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {workshop.icon}
              </div>
              
              <h3 className="font-display text-2xl font-semibold text-primary mb-4">
                {workshop.title}
              </h3>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {workshop.description}
              </p>
              
              <ul className="space-y-2 mb-8">
                {workshop.features.map((feature) => (
                  <li key={feature} className="flex items-center text-sm text-muted-foreground">
                    <span className="w-2 h-2 bg-rose-gold rounded-full mr-3"></span>
                    {feature}
                  </li>
                ))}
              </ul>
              
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <Link to="/panache-expo/register">
            <Button variant="hero" size="lg">
              Register for Workshops
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
