import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Handshake, Building2, Heart } from "lucide-react";

interface SponsorsProps {
  variant?: "panache" | "cyes";
}

export const Sponsors = ({ variant = "panache" }: SponsorsProps) => {
  const title = variant === "panache" 
    ? "Sponsors & Partners" 
    : "Our Sponsors & Partners";

  const description = variant === "panache"
    ? "Join hands with Panache Expo to celebrate beauty excellence and empower communities."
    : "Partner with CYES to empower the next generation of Cameroonian entrepreneurs.";

  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {description}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary mb-3">
                Corporate Sponsors
              </h3>
              <p className="text-muted-foreground text-sm">
                Leading organizations supporting excellence and community development.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-secondary rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Handshake className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary mb-3">
                Strategic Partners
              </h3>
              <p className="text-muted-foreground text-sm">
                Collaborative partnerships driving innovation and impact.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-primary mb-3">
                Community Partners
              </h3>
              <p className="text-muted-foreground text-sm">
                Local organizations amplifying our mission and reach.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-6">
            Interested in becoming a sponsor or partner?
          </p>
          <Link to="/contact">
            <Button variant="rose" size="lg">
              Become a Partner
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
