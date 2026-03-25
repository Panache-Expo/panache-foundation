import { Button } from "@/components/ui/button";
import { Instagram, ExternalLink, User } from "lucide-react";
import FounderImage from "@/assets/Founder.jpeg";
import tony from "@/assets/tony.jpeg";
import ramiims from "@/assets/ramiims.jpg";
import akwo from "@/assets/akwo.jpeg";
import prince from "@/assets/prince.jpeg";
import sharon from "@/assets/sharon.jpeg";
import yannick from "@/assets/yannick.jpeg";
import victor from "@/assets/victor.png";
import nana from "@/assets/nana.jpeg";

const teamMembers = [
  {
    name: "Tony Awah",
    title: "Vice President",
    organization: "Panache Expo",
    photo: tony,
  },
  {
    name: "Teko Racheal (Ramiims)",
    title: "Project Manager & Financial Secretary",
    organization: "Panache Expo",
    photo: ramiims,
  },
  {
    name: "Dr. Akwo Charles Ekie",
    title: "Treasurer",
    organization: "Panache Expo",
    photo: akwo,
  },
  {
    name: "Prince Enobi Mykel",
    title: "Founder/President CIMFEST",
    organization: "Panache D'Or Awards",
    photo: prince,
  },
  {
    name: "Sharon Enobi",
    title: "Event Planner",
    organization: "Panache Expo",
    photo: sharon,
  },
  {
    name: "Tegueboug Yannick Cabrel",
    title: "Graphic Designer",
    organization: "Panache Expo",
    photo: yannick,
  },
  {
    name: "Barr. Mafany Victor (Kinsman) Ngando",
    title: "Founder/CEO Kinsmen Advocates Law Firm",
    organization: "Panache Expo",
    photo: victor,
  },
  {
    name: "Nana Sechere",
    title: "Business and Marketing Strategist",
    organization: "Panache Expo",
    photo: nana,
  },
];

export const Founder = () => {
  return (
    <section className="py-24 px-6 bg-gradient-card">
      <div className="max-w-6xl mx-auto">
        {/* Founder Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          {/* Founder Image */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-elegant">
              <img
                src={FounderImage}
                alt="Ekie Walters - Founder of Panache Expo"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating decoration */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-primary rounded-2xl opacity-20 animate-float"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-secondary rounded-full opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Founder Content */}
          <div>
            <div className="mb-6">
              <span className="text-rose-gold font-medium text-lg">Meet Our Team</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mt-2 mb-4">
                Ekie Walters
              </h2>
              <p className="text-muted-foreground font-medium mb-3">Founder, Panache Expo</p>
              <div className="flex items-center gap-2 mb-6">
                <Instagram className="w-5 h-5 text-rose-gold" />
                <a
                  href="https://instagram.com/ekie_walters"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-gold hover:text-primary transition-colors font-medium"
                >
                  @ekie_walters
                </a>
                <ExternalLink className="w-4 h-4 text-rose-gold" />
              </div>
            </div>

            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Ekie Walters founded Panache Expo with a vision to elevate beauty standards and empower professionals
                across Cameroon and beyond.
              </p>
              <p>
                His passion for excellence and commitment to education has transformed countless
                lives, creating a platform where beauty professionals can learn, grow, and
                celebrate their craft together.
              </p>
              <p>
                Through Panache Expo, he continues to bridge the gap between traditional
                beauty practices and modern techniques, fostering a community that celebrates
                diversity, creativity, and professional excellence.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href="https://instagram.com/ekie_walters"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="default" size="lg" className="w-full sm:w-auto">
                  <Instagram className="w-5 h-5 mr-2" />
                  Follow on Instagram
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div>
          <div className="text-center mb-12">
            <span className="text-rose-gold font-medium text-lg">Our Leadership</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mt-2">
              The Team Behind Panache
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-background shadow-elegant border border-border/40 hover:shadow-lg transition-shadow"
              >
                {/* Photo placeholder */}
                <div className="w-28 h-28 rounded-full overflow-hidden mb-4 bg-muted flex items-center justify-center border-2 border-rose-gold/30">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-muted-foreground/40" />
                  )}
                </div>

                <h3 className="font-display text-xl font-bold text-primary mb-1">
                  {member.name}
                </h3>
                <p className="text-rose-gold font-medium text-sm mb-1">{member.title}</p>
                <p className="text-muted-foreground text-sm">{member.organization}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
