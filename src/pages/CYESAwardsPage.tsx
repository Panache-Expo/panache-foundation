import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  CYESInnerHero,
  CYESSectionIntro,
  cyesSurfaceClasses,
} from "@/components/cyes/CYESPageShell";
import { Button } from "@/components/ui/button";
import cyesCDAwards from "@/assets/CYESCDAwards.jpeg";
import cyesEvent from "@/assets/CYES.jpeg";
import honDonald from "@/assets/HonDonald.jpeg";
import nshala from "@/assets/Nshala.jpeg";
import felix from "@/assets/felix.jpg";
import nervis from "@/assets/nervis.png";
import chuo from "@/assets/chuo.png";
import steve from "@/assets/stevenjang.png";
import angwi from "@/assets/angwi.png";
import nanalynn from "@/assets/nanalynn.png";
import godlove from "@/assets/godlove.png";
import { Award, Calendar, CheckCircle2, MapPin, Trophy, User, Users } from "lucide-react";
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
    name: "Barr. Chuo Angabua",
    title: "Founding Partner | Prime Time Law Offices",
    photo: chuo,
  },
  {
    name: "Steve Njang",
    title: "Founder of Nexdim Empire",
    photo: steve,
  },
  {
    name: "Angwi Njamah",
    title: "Journalist and Public Relations Officer",
    photo: angwi,
  },
  {
    name: "Miss Nana Lynn",
    title: "LinkedIn & Personal Brand Coach",
    photo: nanalynn,
  },
  {
    name: "Godlove Njisong",
    title: "Founder, GoMAD",
    photo: godlove,
  },
];

const awardValueCards = [
  {
    icon: Trophy,
    title: "Recognition",
    description:
      "A platform that spotlights youth entrepreneurship, leadership, and visible community impact.",
  },
  {
    icon: Users,
    title: "Credibility",
    description:
      "A jury-led process that gives the awards real weight and puts strong work in front of the right audience.",
  },
  {
    icon: Award,
    title: "Visibility",
    description:
      "A public stage for entrepreneurs, institutions, and changemakers whose work deserves wider attention.",
  },
];

const awardHeroCards = [
  {
    image: cyesCDAwards,
    alt: "CYECD Awards audience",
    className: "left-[18%] top-[8%] z-20 w-[43%] rotate-[-4deg]",
  },
  {
    image: honDonald,
    alt: "Jury member portrait",
    className: "left-[60%] top-[18%] z-10 w-[28%] rotate-[7deg]",
  },
  {
    image: felix,
    alt: "Committee portrait",
    className: "left-[28%] top-[60%] z-30 w-[23%] rotate-[-8deg]",
  },
  {
    image: cyesEvent,
    alt: "Awards atmosphere",
    className: "left-[52%] top-[56%] z-20 w-[34%] rotate-[9deg]",
  },
];

const categoryCardClasses =
  "rounded-[1.6rem] border border-black/8 bg-white/74 px-5 py-5 shadow-[0_16px_38px_rgba(17,16,14,0.05)]";

const CYESAwardsPage = () => {
  return (
    <div className="min-h-screen bg-[#f7f8f3] text-[#171411]">
      <Header />

      <main className="pb-20 md:pb-24">
        <CYESInnerHero
          eyebrow="CYECD Awards 2026"
          title={
            <>
              Awards that honour
              <br />
              <span className="font-display text-[#156D3B]">
                enterprise, leadership,
              </span>
              <br />
              and community impact.
            </>
          }
          description="The CYECD Awards recognise outstanding young entrepreneurs, community leaders, businesses, and institutions shaping meaningful change across Cameroon. Nominations are now closed, but the awards platform and live event remain open to the public."
          actions={
            <>
              <Link to="/cyes/register">
                <Button className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92">
                  Register to Attend
                </Button>
              </Link>
              <Link
                to="/cyes/contact"
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white/76 px-7 font-sans text-sm font-semibold text-[#171411] transition-colors hover:bg-white"
              >
                Contact the team
              </Link>
            </>
          }
          chips={[
            { label: "Event Date", value: "16 July 2026", accentClassName: "text-[#156D3B]" },
            { label: "Venue", value: "Chariot Hotel, Buea", accentClassName: "text-[#1875D2]" },
            { label: "Awards", value: "25 total categories", accentClassName: "text-[#CC2129]" },
          ]}
          cards={awardHeroCards}
          mobileImage={cyesCDAwards}
          mobileImageAlt="CYECD Awards event"
          mobileImageClassName="rotate-[14deg]"
        />

        <section className="mx-auto mt-16 max-w-6xl px-6 md:px-24">
          <CYESSectionIntro
            eyebrow="Awards overview"
            title={
              <>
                What the
                <span className="block font-display">platform recognises</span>
              </>
            }
            description="CYECD is designed to reward visible excellence, measurable community contribution, and the kind of youth-led ambition that creates real momentum. It is not just a ceremony. It is a public recognition structure."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {awardValueCards.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.title} className={cyesSurfaceClasses + " px-6 py-7"}>
                  <Icon className="h-9 w-9 text-[#156D3B]" />
                  <h3 className="mt-6 font-sans text-[1.35rem] font-semibold leading-[1.05] tracking-[-0.05em] text-[#171411]">
                    {item.title}
                  </h3>
                  <p className="mt-4 font-sans text-[0.98rem] leading-relaxed text-[#171411]/72">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-6xl px-6 md:px-24">
          <CYESSectionIntro
            eyebrow="20 categories"
            title={
              <>
                Competitive
                <span className="block font-display">categories</span>
              </>
            }
            description="The main awards field honours a broad range of youth entrepreneurship, innovation, social impact, and institution-building across Cameroon."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {competitiveCategories.map((category) => (
              <article key={category} className={categoryCardClasses}>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5fb]">
                  <Award className="h-5 w-5 text-[#1875D2]" />
                </div>
                <h3 className="mt-5 font-sans text-[1.05rem] font-semibold leading-[1.12] tracking-[-0.04em] text-[#171411]">
                  {category}
                </h3>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-6xl px-6 md:px-24">
          <CYESSectionIntro
            eyebrow="Board selected"
            title={
              <>
                Honorary
                <span className="block font-display">awards</span>
              </>
            }
            description="These special recognitions celebrate sustained influence, exceptional service, and national or generational impact beyond standard nomination categories."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {honoraryCategories.map((category) => (
              <article
                key={category}
                className="rounded-[1.7rem] border border-[#FFB200]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,242,204,0.72))] px-5 py-6 shadow-[0_16px_38px_rgba(17,16,14,0.05)]"
              >
                <Trophy className="h-8 w-8 text-[#FFB200]" />
                <h3 className="mt-5 font-sans text-[1.02rem] font-semibold leading-[1.12] tracking-[-0.04em] text-[#171411]">
                  {category}
                </h3>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-6xl px-6 md:px-24">
          <CYESSectionIntro
            eyebrow="Jury committee"
            title={
              <>
                Meet the
                <span className="block font-display">jury</span>
              </>
            }
            description="Our jury brings together public leadership, entrepreneurship, innovation, media, and professional expertise to evaluate nominees with credibility and context."
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {juryMembers.map((member) => (
              <article
                key={member.name}
                className="rounded-[2rem] border border-black/8 bg-white/74 p-6 shadow-[0_16px_40px_rgba(17,16,14,0.06)]"
              >
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[1.4rem] bg-[#eef2f6]">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-8 w-8 text-[#171411]/35" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-sans text-[1.2rem] font-semibold leading-[1.08] tracking-[-0.045em] text-[#171411]">
                      {member.name}
                    </h3>
                    <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/66">
                      {member.title}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="px-6 md:px-24">
          <div className="mx-auto mt-20 max-w-6xl rounded-[2.2rem] border border-black/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(238,245,251,0.92))] px-6 py-8 shadow-[0_20px_50px_rgba(17,16,14,0.06)] md:px-8 md:py-10">
            <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
              <div>
                <p className="font-sans text-[0.92rem] font-semibold uppercase tracking-[0.08em] text-[#CC2129]">
                  Nominations closed
                </p>
                <h2 className="mt-4 font-sans text-[clamp(2rem,4vw,3rem)] font-semibold leading-[0.93] tracking-[-0.065em] text-[#171411]">
                  The deadline has been reached, but you can still be in the room.
                </h2>
              </div>

              <div>
                <p className="font-sans text-[1rem] leading-relaxed text-[#171411]/72">
                  Public nominations for CYECD Awards 2026 are now closed. You can
                  still register for the summit and awards event, or contact the
                  team for partnership, media, or attendance enquiries.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/cyes/register">
                    <Button className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92">
                      Register for CYES
                    </Button>
                  </Link>
                  <Link
                    to="/cyes/contact"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-7 font-sans text-sm font-semibold text-[#171411] transition-colors hover:bg-[#f5f7f3]"
                  >
                    Contact the team
                  </Link>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-[1.1rem] border border-black/8 bg-white/80 px-4 py-3">
                    <Calendar className="h-4 w-4 text-[#156D3B]" />
                    <span className="font-sans text-sm text-[#171411]/76">16 July 2026</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-[1.1rem] border border-black/8 bg-white/80 px-4 py-3">
                    <MapPin className="h-4 w-4 text-[#1875D2]" />
                    <span className="font-sans text-sm text-[#171411]/76">Buea</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-[1.1rem] border border-black/8 bg-white/80 px-4 py-3">
                    <CheckCircle2 className="h-4 w-4 text-[#CC2129]" />
                    <span className="font-sans text-sm text-[#171411]/76">Awards Night</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CYESAwardsPage;
