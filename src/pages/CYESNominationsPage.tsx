import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, CalendarX2, Clock3, Info, User } from "lucide-react";
import honDonald from "@/assets/HonDonald.jpeg";
import nshala from "@/assets/Nshala.jpeg";
import felix from "@/assets/felix.jpg";
import nervis from "@/assets/nervis.png";
import chuo from "@/assets/chuo.png";
import steve from "@/assets/stevenjang.png";
import angwi from "@/assets/angwi.png";
import nanalynn from "@/assets/nanalynn.png";
import godlove from "@/assets/godlove.png";
import { Link } from "react-router-dom";

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

const honoraryCategories = [
  "Lifetime Achievement Award",
  "National Impact Award",
  "Entrepreneurial Legacy Award",
  "Youth Champion Award",
  "Presidential Honor Award",
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

const CYESNominationsPage = () => {
  return (
    <div className="min-h-screen">
      <Header />

      <section className="pt-24 pb-16 bg-gradient-to-br from-cyes-green/20 via-cyes-blue/10 to-cyes-yellow/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-cyes-red rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Award className="w-8 h-8 text-cyes-white" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            CYECD Awards <span className="text-cyes-red">Nominations Closed</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The deadline for CYECD Awards 2026 nominations has been reached.
            Thank you to everyone who submitted nominations before the closing date.
          </p>
        </div>
      </section>

      <section className="py-10 px-6">
        <Card className="max-w-4xl mx-auto bg-background shadow-lg border border-cyes-red/20">
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl bg-cyes-red/10 p-5">
                <CalendarX2 className="w-7 h-7 text-cyes-red mb-3" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  Deadline reached
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  New nominations are no longer being accepted for the 2026 CYECD Awards cycle.
                </p>
              </div>
              <div className="rounded-2xl bg-cyes-green/10 p-5">
                <Clock3 className="w-7 h-7 text-cyes-green mb-3" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  What happens now
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The jury committee continues with review, validation, and final award decisions.
                </p>
              </div>
              <div className="rounded-2xl bg-cyes-blue/10 p-5">
                <Info className="w-7 h-7 text-cyes-blue mb-3" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  Stay involved
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You can still register to attend and follow the awards program as it moves toward the event day.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="py-16 px-6">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-8">
              <div>
                <h2 className="font-display text-2xl text-foreground mb-3">Awards Categories</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The nominations window is closed, but the 2026 awards categories remain below for reference.
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="font-display text-lg font-semibold text-cyes-green mb-4">
                    Competitive Categories
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {competitiveCategories.map((category) => (
                      <li key={category} className="rounded-xl bg-cyes-green/5 px-4 py-3">
                        {category}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-display text-lg font-semibold text-cyes-yellow mb-4">
                    Honorary Categories
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {honoraryCategories.map((category) => (
                      <li key={category} className="rounded-xl bg-cyes-yellow/10 px-4 py-3">
                        {category}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to="/cyes/awards">
                  <Button className="bg-cyes-green hover:bg-cyes-green/90 text-cyes-white font-bold">
                    Back to Awards
                  </Button>
                </Link>
                <Link to="/cyes/register">
                  <Button variant="outline">Register to Attend</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="py-24 px-6 bg-cyes-green/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-cyes-green font-medium text-lg">CYECD Awards 2026</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
              Meet the <span className="text-cyes-green">Jury Committee</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our distinguished panel of judges brings expertise, integrity, and passion to evaluating Cameroon&apos;s brightest young entrepreneurs.
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

      <Footer />
    </div>
  );
};

export default CYESNominationsPage;
