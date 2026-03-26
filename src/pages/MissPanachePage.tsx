import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Crown, Star, Users, Sparkles, Award, Heart, Camera, Mic } from "lucide-react";
import MissPanacheImage from "@/assets/misspanacheupdate.jpg";

const stages = [
  {
    number: "01",
    title: "Application & Screening",
    description:
      "Complete the official registration form with your personal profile, photos, social media details, and motivation statement. The organizing committee reviews and selects qualified contestants.",
    icon: Users,
  },
  {
    number: "02",
    title: "Official Contestant Selection",
    description:
      "Selected applicants are officially announced and begin preparation including orientation sessions, promotional photoshoots, media introductions, and publicity campaigns.",
    icon: Camera,
  },
  {
    number: "03",
    title: "Pre-Pageant Activities",
    description:
      "Contestants participate in media interviews, public speaking sessions, community engagement, social media promotion, and brand ambassador training.",
    icon: Mic,
  },
  {
    number: "04",
    title: "The Grand Finale Night",
    description:
      "Contestants compete in the Introduction Round, Runway Presentation, and Question & Answer Round before the judges during the final day of Panache Expo.",
    icon: Crown,
  },
];

const eligibility = [
  "Minimum age: 18 years",
  "Maximum age: 28 years",
  "Must be confident, presentable, and passionate about representing the Panache Expo brand",
  "Must be available to participate in pageant activities and the grand finale",
  "Must demonstrate good communication and leadership qualities",
  "Must respect the rules and guidelines of the competition",
];

const MissPanachePage = () => {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-20 relative overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-6">
                <Crown className="w-4 h-4" />
                Part of Panache Expo
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
                Miss Panache <span className="text-rose-gold">Expo</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                The official beauty and leadership pageant of Panache Expo, celebrating confident, intelligent, and inspiring women who represent the creativity, elegance, and strength of the African beauty and fashion industry.
              </p>
              <p className="text-muted-foreground mb-8">
                More than a traditional beauty contest — a platform designed to empower women, promote leadership, and showcase ambassadors who represent the vision of Panache Expo.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/miss-panache/register">
                  <Button variant="hero" size="lg">
                    <Sparkles className="w-5 h-5 mr-2" /> Register Now
                  </Button>
                </Link>
                <Link to="/panache-expo">
                  <Button variant="outline" size="lg">
                    Back to Panache Expo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-elegant">
                <img
                  src={MissPanacheImage}
                  alt="Miss Panache Expo"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competition Format */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
              The Pageant Journey
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Contestants compete through public presentations, runway showcases, interviews, and creative challenges before a panel of judges.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stages.map((stage) => (
              <Card key={stage.number} className="relative overflow-hidden group hover:shadow-elegant transition-shadow">
                <CardContent className="p-6">
                  <div className="text-5xl font-bold text-primary/10 mb-2">{stage.number}</div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <stage.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-primary mb-3">{stage.title}</h3>
                  <p className="text-muted-foreground text-sm">{stage.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
              Eligibility Requirements
            </h2>
          </div>
          <Card>
            <CardContent className="p-8">
              <ul className="space-y-4">
                {eligibility.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-rose-gold mt-0.5 shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Grand Finale */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
              The Grand Finale Night
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The pageant reaches its peak during the final day of Panache Expo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold text-primary mb-2">Introduction Round</h3>
                <p className="text-muted-foreground text-sm">Contestants present their personality and confidence</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Heart className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold text-primary mb-2">Runway Presentation</h3>
                <p className="text-muted-foreground text-sm">Demonstrating elegance and stage presence</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Mic className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold text-primary mb-2">Q&A Round</h3>
                <p className="text-muted-foreground text-sm">Demonstrating intelligence and leadership potential</p>
              </CardContent>
            </Card>
          </div>

          {/* Crown & Awards */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/10">
            <CardContent className="p-8 text-center">
              <Crown className="w-12 h-12 text-rose-gold mx-auto mb-4" />
              <h3 className="font-display text-2xl font-bold text-primary mb-6">Crown & Awards</h3>
              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl mb-2">👑</div>
                  <h4 className="font-semibold text-primary">Miss Panache Expo</h4>
                  <p className="text-muted-foreground text-sm">Official crown, sash & brand ambassador for one year</p>
                </div>
                <div>
                  <div className="text-3xl mb-2">🥈</div>
                  <h4 className="font-semibold text-primary">First Runner-Up</h4>
                  <p className="text-muted-foreground text-sm">Recognition and awards</p>
                </div>
                <div>
                  <div className="text-3xl mb-2">🥉</div>
                  <h4 className="font-semibold text-primary">Second Runner-Up</h4>
                  <p className="text-muted-foreground text-sm">Recognition and awards</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Award className="w-12 h-12 text-rose-gold mx-auto mb-4" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-4">
            Become the Next Miss Panache Expo
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Miss Panache Expo is more than a crown — it is an opportunity to become a leader, ambassador, and inspiration within the beauty and fashion community.
          </p>
          <Link to="/miss-panache/register">
            <Button variant="hero" size="lg">
              <Sparkles className="w-5 h-5 mr-2" /> Register Now
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MissPanachePage;
