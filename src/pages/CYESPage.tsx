import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Sponsors } from "@/components/Sponsors";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, Lightbulb, Target, Award, Mic, Calendar, MapPin } from "lucide-react";
import speaker1 from "@/assets/speaker1.jpeg";
import speaker2 from "@/assets/speaker2.jpeg";
import speaker3 from "@/assets/speaker3.jpeg";
import speaker4 from "@/assets/speaker4.jpeg";

const speakers = [
  { image: speaker1 },
  { image: speaker2 },
  { image: speaker3 },
  { image: speaker4 },
];

const summitHighlights = [
  { icon: Mic, title: "Keynote Sessions", description: "Learn from successful entrepreneurs and industry leaders" },
  { icon: Users, title: "Networking", description: "Connect with fellow young entrepreneurs and mentors" },
  { icon: Lightbulb, title: "Workshops", description: "Hands-on sessions on business development and innovation" },
  { icon: Award, title: "Awards Ceremony", description: "Recognition for outstanding youth entrepreneurs" },
];

const CYESPage = () => {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section - CYES Colors */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-cyes-green via-cyes-blue to-cyes-green">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_35px,rgba(255,255,255,0.03)_35px,rgba(255,255,255,0.03)_70px)]"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-20">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-cyes-white mb-6">
            CYES <span className="text-cyes-yellow">2026</span>
          </h1>
          <p className="text-xl md:text-2xl text-cyes-white/90 mb-4 font-light">
            Cameroon Youths Entrepreneurial Summit & Awards
          </p>
          <p className="text-lg text-cyes-white/80 mb-8 max-w-2xl mx-auto">
            Empowering the next generation of Cameroonian entrepreneurs through mentorship,
            networking, and recognition of outstanding achievements.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/cyes/register">
              <Button size="lg" className="bg-cyes-yellow text-foreground hover:bg-cyes-yellow/90 font-bold">
                Register Now
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-cyes-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>July 16th 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Cameroon</span>
            </div>
          </div>
        </div>

        <div className="absolute top-32 left-10 w-3 h-3 bg-cyes-yellow rounded-full animate-float opacity-60"></div>
        <div className="absolute bottom-32 right-16 w-2 h-2 bg-cyes-red rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-48 right-20 w-2 h-2 bg-cyes-white rounded-full animate-float opacity-30" style={{ animationDelay: '2s' }}></div>
      </section>

      {/* About CYES */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              About <span className="text-cyes-green">CYES</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The Cameroon Youths Entrepreneurial Summit & Awards is a flagship initiative dedicated
              to nurturing entrepreneurial talent, fostering innovation, and celebrating the achievements
              of young Cameroonian entrepreneurs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-cyes-green rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Lightbulb className="w-10 h-10 text-cyes-white" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground mb-4">Innovation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Inspiring creative solutions and innovative thinking among young entrepreneurs.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-cyes-red rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="w-10 h-10 text-cyes-white" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground mb-4">Empowerment</h3>
              <p className="text-muted-foreground leading-relaxed">
                Providing tools, knowledge, and networks to help youth succeed in business.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-cyes-blue rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Award className="w-10 h-10 text-cyes-white" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground mb-4">Recognition</h3>
              <p className="text-muted-foreground leading-relaxed">
                Celebrating and rewarding outstanding entrepreneurial achievements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Summit Highlights */}
      <section className="py-24 px-6 bg-cyes-green/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Summit <span className="text-cyes-yellow">Highlights</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summitHighlights.map((highlight, index) => {
              const colors = ['bg-cyes-green', 'bg-cyes-blue', 'bg-cyes-red', 'bg-cyes-yellow'];
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-t-4" style={{ borderTopColor: `var(--cyes-${['green','blue','red','yellow'][index]})` }}>
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 ${colors[index]} rounded-xl mx-auto mb-4 flex items-center justify-center`}>
                      <highlight.icon className="w-7 h-7 text-cyes-white" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">{highlight.title}</h3>
                    <p className="text-muted-foreground text-sm">{highlight.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Speakers Section */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Featured <span className="text-cyes-blue">Speakers</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Learn from industry leaders and successful entrepreneurs who will share their insights and experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {speakers.map((speaker, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    <img
                      src={speaker.image}
                      alt={`Speaker ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Speaker lineup coming soon!</p>
          </div>
        </div>
      </section>

      {/* Register CTA */}
      <section className="py-16 px-6 bg-gradient-to-r from-cyes-green via-cyes-blue to-cyes-green">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cyes-white mb-6">
            Ready to Join CYES 2026?
          </h2>
          <p className="text-cyes-white/80 mb-8 text-lg">
            Be part of Cameroon's premier youth entrepreneurship event.
          </p>
          <Link to="/cyes/register">
            <Button size="lg" className="bg-cyes-yellow text-foreground hover:bg-cyes-yellow/90 font-bold">
              Register Now
            </Button>
          </Link>
        </div>
      </section>

      <Sponsors variant="cyes" />
      <Footer />
    </div>
  );
};

export default CYESPage;
