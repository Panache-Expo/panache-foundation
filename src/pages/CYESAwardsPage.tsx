import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Award, Trophy, Star, Users, Calendar, MapPin, User } from "lucide-react";
import cyesCDAwards from "@/assets/CYESCDAwards.jpeg";
import honDonald from "@/assets/HonDonald.jpeg";
import nshala from "@/assets/Nshala.jpeg";
import felix from "@/assets/felix.jpg";
import nervis from "@/assets/nervis.png";
import chuo from "@/assets/chuo.png";
import steve from "@/assets/stevenjang.png";
import angwi from "@/assets/angwi.png";
import nanalynn from "@/assets/nanalynn.png";
import godlove from "@/assets/godlove.png";

const competitiveCategories = [
  "Youth Entrepreneur of the Year",
  "Startup of the Year",
  "Technology Innovator of the Year",
  "Agribusiness of the Year",
  "Creative Entrepreneur of the Year",
  "Social Impact Business of the Year",
  "Community Leader of the Year",
  "NGO of the Year",
  "Youth Empowerment Initiative of the Year",
  "Education Impact of the Year",
  "Health Impact of the Year",
  "Environmental Impact of the Year",
  "Corporate Impact of the Year",
  "SME of the Year",
  "Financial Institution of the Year",
  "Woman in Business of the Year",
  "Diaspora Impact of the Year",
  "Emerging Youth Leader of the Year",
  "Media & Advocacy of the Year",
  "Voice of the Generation Award",
];

const juryMembers = [
  {
    name: "Hon Donald Malomba Esembe",
    title: "MP Buea Urban Constituency",
    photo: honDonald,
  },
  {
    name: "Mr Nshal Mpeng Abwa Bernard Takang",
    title: "Regional President Cameroon National Youth Council Southwest",
    photo: nshala,
  },
  {
    name: "Felix Fomengia",
    title: "Digital Innovation Expert and Cybersecurity Professional",
    photo: felix,
  },
  {
    name: "Nzometiah Nervis",
    title: "CEO, Nervtek",
    photo: nervis,
  },
  {
    name: "Barr. Chuo Angabua ",
    title: "Founding Partner | Prime Time Law offices",
    photo: chuo,
  },
  {
    name: "Steve Njang",
    title: "Founder of Nexdim Empire, Award-winning Blogger/ Content creator",
    photo: steve,
  },
  {
    name: "Angwi Njamah",
    title: "Journalist /Public Relations Officer PCC Business Units/Certified Virtual Assistant",
    photo: angwi,
  },
  {
    name: "Miss Nana Lynn ",
    title: "LinkedIn & Personal Brand Coach",
    photo: nanalynn,
  },
  {
      name: "Godlove Njisong",
      title: "Founder GoMAD",
      photo: godlove, 
    },
];

const honoraryCategories = [
  "Lifetime Achievement Award",
  "National Impact Award",
  "Entrepreneurial Legacy Award",
  "Youth Champion Award",
  "Presidential Honor Award",
];

const CYESAwardsPage = () => {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden" style={{ backgroundImage: `url(${cyesCDAwards})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-cyes-green/80 via-cyes-blue/80 to-cyes-green/80"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_35px,rgba(255,255,255,0.03)_35px,rgba(255,255,255,0.03)_70px)]"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-20">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-cyes-white mb-6">
            CYECD <span className="text-cyes-yellow">Awards</span>
          </h1>
          <p className="text-xl md:text-2xl text-cyes-white/90 mb-4 font-light">
            Cameroon Youths Entrepreneurial & Community Development Awards 2026
          </p>
          <p className="text-lg text-cyes-white/80 mb-8 max-w-2xl mx-auto">
            Recognizing outstanding individuals, businesses, institutions, and initiatives contributing
            to youth empowerment, entrepreneurship, innovation, and community development.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/cyes/nominations">
              <Button size="lg" className="bg-cyes-yellow text-foreground hover:bg-cyes-yellow/90 font-bold">
                Nominations Closed
              </Button>
            </Link>
            <Link to="/cyes/register">
              <Button variant="outline" size="lg" className="bg-cyes-white/10 text-cyes-white border-cyes-white/20 hover:bg-cyes-white/20">
                Register to Attend
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
              <span>Chariot Hotel - Buea, Cameroon</span>
            </div>
          </div>
        </div>

        <div className="absolute top-32 left-10 w-3 h-3 bg-cyes-yellow rounded-full animate-float opacity-60"></div>
        <div className="absolute bottom-32 right-16 w-2 h-2 bg-cyes-red rounded-full animate-float opacity-40" style={{ animationDelay: "1s" }}></div>
      </section>

      {/* About Section */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              About the <span className="text-cyes-green">CYECD Awards</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The CYECD Awards celebrate the brightest young entrepreneurs in Cameroon.
              From tech innovators to social impact leaders, we recognize those who are
              driving change and building a better future for their communities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-cyes-green rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-10 h-10 text-cyes-white" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground mb-4">Recognition</h3>
              <p className="text-muted-foreground leading-relaxed">
                Honoring exceptional achievements in youth entrepreneurship across multiple categories.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-cyes-red rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-cyes-white" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground mb-4">Community</h3>
              <p className="text-muted-foreground leading-relaxed">
                Building a network of inspiring young leaders and changemakers across Cameroon.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-cyes-blue rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Star className="w-10 h-10 text-cyes-white" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground mb-4">Excellence</h3>
              <p className="text-muted-foreground leading-relaxed">
                Setting the standard for entrepreneurial excellence and innovation in Cameroon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Categories */}
      <section className="py-24 px-6 bg-cyes-green/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Competitive <span className="text-cyes-green">Categories</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              20 categories celebrating different aspects of entrepreneurship and community development.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {competitiveCategories.map((category, index) => {
              const colors = ['bg-cyes-green', 'bg-cyes-blue', 'bg-cyes-red', 'bg-cyes-yellow'];
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 ${colors[index % 4]} rounded-xl mx-auto mb-4 flex items-center justify-center`}>
                      <Award className="w-7 h-7 text-cyes-white" />
                    </div>
                    <h3 className="font-display text-sm font-semibold text-foreground">{category}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Honorary Categories */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Honorary <span className="text-cyes-yellow">Categories</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              5 special awards selected by the Board for outstanding lifetime contributions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {honoraryCategories.map((category, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-cyes-yellow/30">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-cyes-yellow rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-foreground" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground">{category}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Jury Committee Section */}
      <section className="py-24 px-6 bg-cyes-green/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-cyes-green font-medium text-lg">CYECD Awards 2026</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
              Meet the <span className="text-cyes-green">Jury Committee</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our distinguished panel of judges brings expertise, integrity, and passion to evaluating Cameroon's brightest young entrepreneurs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {juryMembers.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-background shadow-lg border border-border/40 hover:shadow-xl transition-shadow"
              >
                <div className="w-28 h-28 rounded-full overflow-hidden mb-4 bg-muted flex items-center justify-center border-2 border-cyes-green/30">
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
                <h3 className="font-display text-xl font-bold text-foreground mb-1">
                  {member.name}
                </h3>
                <p className="text-cyes-green font-medium text-sm mb-1">{member.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nomination CTA */}
      <section className="py-16 px-6 bg-gradient-to-r from-cyes-green via-cyes-blue to-cyes-green">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cyes-white mb-6">
            Nominations Have Now Closed
          </h2>
          <p className="text-cyes-white/80 mb-8 text-lg">
            The CYECD Awards nomination deadline has been reached. Thank you to everyone who submitted entries.
          </p>
          <Link to="/cyes/nominations">
            <Button size="lg" className="bg-cyes-yellow text-foreground hover:bg-cyes-yellow/90 font-bold">
              View deadline notice
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CYESAwardsPage;
