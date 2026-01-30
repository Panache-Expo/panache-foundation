import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Sponsors } from "@/components/Sponsors";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, Lightbulb, Target, Award, Mic, Calendar, MapPin } from "lucide-react";

const speakers = [
  {
    name: "Speaker Name",
    role: "Entrepreneur & CEO",
    topic: "Building Sustainable Businesses in Cameroon",
    image: null
  },
  {
    name: "Speaker Name",
    role: "Tech Innovator",
    topic: "Digital Transformation for Youth Entrepreneurs",
    image: null
  },
  {
    name: "Speaker Name",
    role: "Investment Expert",
    topic: "Securing Funding for Your Startup",
    image: null
  },
  {
    name: "Speaker Name",
    role: "Business Mentor",
    topic: "From Idea to Impact: Your Entrepreneurial Journey",
    image: null
  }
];

const summitHighlights = [
  {
    icon: Mic,
    title: "Keynote Sessions",
    description: "Learn from successful entrepreneurs and industry leaders"
  },
  {
    icon: Users,
    title: "Networking",
    description: "Connect with fellow young entrepreneurs and mentors"
  },
  {
    icon: Lightbulb,
    title: "Workshops",
    description: "Hands-on sessions on business development and innovation"
  },
  {
    icon: Award,
    title: "Awards Ceremony",
    description: "Recognition for outstanding youth entrepreneurs"
  }
];

const CYESPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-rose-gold/80">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10"></div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-20">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6">
            CYES <span className="text-rose-gold">2026</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-4 font-light">
            Cameroon Youths Entrepreneurial Summit & Awards
          </p>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Empowering the next generation of Cameroonian entrepreneurs through mentorship, 
            networking, and recognition of outstanding achievements.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/register">
              <Button variant="hero" size="lg">
                Register Now
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              Learn More
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-primary-foreground/80 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Coming Soon 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Cameroon</span>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-32 left-10 w-3 h-3 bg-rose-gold rounded-full animate-float opacity-60"></div>
        <div className="absolute bottom-32 right-16 w-2 h-2 bg-primary-foreground rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
      </section>

      {/* About CYES */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
              About <span className="text-rose-gold">CYES</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The Cameroon Youths Entrepreneurial Summit & Awards is a flagship initiative dedicated 
              to nurturing entrepreneurial talent, fostering innovation, and celebrating the achievements 
              of young Cameroonian entrepreneurs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-primary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-elegant group-hover:scale-110 transition-transform duration-300">
                <Lightbulb className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-primary mb-4">
                Innovation
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Inspiring creative solutions and innovative thinking among young entrepreneurs.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-secondary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-rose group-hover:scale-110 transition-transform duration-300">
                <Target className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-primary mb-4">
                Empowerment
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Providing tools, knowledge, and networks to help youth succeed in business.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-primary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-elegant group-hover:scale-110 transition-transform duration-300">
                <Award className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-primary mb-4">
                Recognition
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Celebrating and rewarding outstanding entrepreneurial achievements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Summit Highlights */}
      <section className="py-24 px-6 bg-gradient-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
              Summit <span className="text-rose-gold">Highlights</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summitHighlights.map((highlight, index) => (
              <Card key={index} className="text-center hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-gradient-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <highlight.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-primary mb-2">
                    {highlight.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {highlight.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Speakers Section */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
              Featured <span className="text-rose-gold">Speakers</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Learn from industry leaders and successful entrepreneurs who will share their insights and experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {speakers.map((speaker, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <Mic className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-semibold text-primary mb-1">
                      {speaker.name}
                    </h3>
                    <p className="text-rose-gold text-sm font-medium mb-2">
                      {speaker.role}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {speaker.topic}
                    </p>
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
      <section className="py-16 px-6 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Join CYES 2026?
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Be part of Cameroon's premier youth entrepreneurship event.
          </p>
          <Link to="/register">
            <Button variant="hero" size="lg">
              Register Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Sponsors */}
      <Sponsors variant="cyes" />

      <Footer />
    </div>
  );
};

export default CYESPage;
