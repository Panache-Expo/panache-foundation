import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  CYESInnerHero,
  CYESSectionIntro,
  cyesSurfaceClasses,
} from "@/components/cyes/CYESPageShell";
import { Button } from "@/components/ui/button";
import cyesAwards from "@/assets/CYESCDAwards.jpeg";
import cyesEvent from "@/assets/CYES.jpeg";
import honDonald from "@/assets/HonDonald.jpeg";
import speaker2 from "@/assets/speaker2.jpeg";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const nominationHeroCards = [
  {
    image: cyesAwards,
    alt: "CYES awards atmosphere",
    className: "left-[20%] top-[8%] z-20 w-[42%] rotate-[-4deg]",
  },
  {
    image: speaker2,
    alt: "CYES portrait card",
    className: "left-[60%] top-[16%] z-10 w-[28%] rotate-[7deg]",
  },
  {
    image: honDonald,
    alt: "Jury portrait",
    className: "left-[30%] top-[58%] z-30 w-[23%] rotate-[-8deg]",
  },
  {
    image: cyesEvent,
    alt: "CYES summit moment",
    className: "left-[54%] top-[54%] z-20 w-[33%] rotate-[9deg]",
  },
];

const statusCards = [
  {
    icon: Clock3,
    title: "Deadline reached",
    description:
      "Public nominations for CYECD Awards 2026 are now closed and no new entries are being accepted.",
    accent: "text-[#CC2129]",
  },
  {
    icon: ShieldCheck,
    title: "Review continues",
    description:
      "Submitted nominations continue through internal review and jury evaluation ahead of the awards programme.",
    accent: "text-[#156D3B]",
  },
  {
    icon: Users,
    title: "The event is still open",
    description:
      "Attendance, partnership, media, and general summit participation remain open through the CYES registration flow.",
    accent: "text-[#1875D2]",
  },
];

const nextSteps = [
  {
    icon: Calendar,
    title: "Register for the summit",
    description:
      "Secure your place for the summit and awards experience, including networking, sessions, and the recognition night.",
    to: "/cyes/register",
    cta: "Register now",
  },
  {
    icon: Trophy,
    title: "Review the awards platform",
    description:
      "See the award categories, honorary recognitions, and jury structure behind the CYECD Awards programme.",
    to: "/cyes/awards",
    cta: "View awards",
  },
  {
    icon: CheckCircle2,
    title: "Contact the team",
    description:
      "Reach us for partnership, press, sponsorship, or clarification on the current nomination and awards timeline.",
    to: "/cyes/contact",
    cta: "Contact CYES",
  },
];

const CYESNominationsPage = () => {
  return (
    <div className="min-h-screen bg-[#f7f8f3] text-[#171411]">
      <Header />

      <main className="pb-20 md:pb-24">
        <CYESInnerHero
          eyebrow="CYECD nominations"
          title={
            <>
              Nominations are
              <br />
              <span className="font-display text-[#CC2129]">now closed.</span>
            </>
          }
          description="Sir Walters has closed public nominations for the CYECD Awards. The submission deadline has been reached, but the wider CYES experience is still active for registration, attendance, and direct enquiries."
          actions={
            <>
              <Link to="/cyes/register">
                <Button className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92">
                  Register for CYES
                </Button>
              </Link>
              <Link
                to="/cyes/awards"
                className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white/80 px-7 font-sans text-sm font-semibold text-[#171411] transition-colors hover:bg-white"
              >
                View awards
              </Link>
            </>
          }
          chips={[
            {
              label: "Status",
              value: "Nominations closed",
              accentClassName: "text-[#CC2129]",
            },
            {
              label: "Awards date",
              value: "16 July 2026",
              accentClassName: "text-[#156D3B]",
            },
            {
              label: "Venue",
              value: "Chariot Hotel, Buea",
              accentClassName: "text-[#1875D2]",
            },
          ]}
          cards={nominationHeroCards}
          mobileImage={cyesAwards}
          mobileImageAlt="CYES awards crowd"
          mobileImageClassName="rotate-[10deg]"
        />

        <section className="mx-auto mt-16 max-w-6xl px-6 md:px-24">
          <CYESSectionIntro
            eyebrow="Current status"
            title={
              <>
                What this
                <span className="block font-display">means now</span>
              </>
            }
            description="The nomination window is no longer open, but the awards platform is still moving forward. Existing entries remain under review, and the summit itself still offers multiple ways to participate."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {statusCards.map((card) => {
              const Icon = card.icon;

              return (
                <article key={card.title} className={cyesSurfaceClasses + " px-6 py-7"}>
                  <Icon className={`h-9 w-9 ${card.accent}`} />
                  <h3 className="mt-6 font-sans text-[1.28rem] font-semibold leading-[1.05] tracking-[-0.05em] text-[#171411]">
                    {card.title}
                  </h3>
                  <p className="mt-4 font-sans text-[0.98rem] leading-relaxed text-[#171411]/72">
                    {card.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-6xl px-6 md:px-24">
          <CYESSectionIntro
            eyebrow="Still open"
            title={
              <>
                Choose your
                <span className="block font-display">next step</span>
              </>
            }
            description="If you were planning to engage with CYES through nominations, the best next move is to shift into attendance, visibility, or direct contact with the team."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {nextSteps.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[2rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(238,245,251,0.9))] px-6 py-7 shadow-[0_18px_44px_rgba(17,16,14,0.06)]"
                >
                  <Icon className="h-9 w-9 text-[#156D3B]" />
                  <h3 className="mt-6 font-sans text-[1.3rem] font-semibold leading-[1.05] tracking-[-0.05em] text-[#171411]">
                    {item.title}
                  </h3>
                  <p className="mt-4 font-sans text-[0.98rem] leading-relaxed text-[#171411]/72">
                    {item.description}
                  </p>
                  <Link
                    to={item.to}
                    className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-[#171411] px-6 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#171411]/92"
                  >
                    {item.cta}
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="px-6 md:px-24">
          <div className="mx-auto mt-20 max-w-6xl rounded-[2.2rem] border border-black/8 bg-white/70 px-6 py-8 shadow-[0_18px_44px_rgba(17,16,14,0.05)] md:px-8 md:py-10">
            <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
              <div>
                <p className="font-sans text-[0.92rem] font-semibold uppercase tracking-[0.08em] text-[#156D3B]">
                  Need clarification?
                </p>
                <h2 className="mt-4 font-sans text-[clamp(2rem,4vw,3rem)] font-semibold leading-[0.93] tracking-[-0.065em] text-[#171411]">
                  We can still help you navigate the awards and summit flow.
                </h2>
              </div>

              <div>
                <p className="font-sans text-[1rem] leading-relaxed text-[#171411]/72">
                  If you need help understanding the nomination closure, jury
                  process, registration, or event participation, the CYES team can
                  point you in the right direction quickly.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/cyes/contact">
                    <Button className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92">
                      Contact the team
                    </Button>
                  </Link>
                  <Link
                    to="/cyes/register"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white px-7 font-sans text-sm font-semibold text-[#171411] transition-colors hover:bg-[#f5f7f3]"
                  >
                    Register for CYES
                  </Link>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <div className="rounded-[1.1rem] border border-black/8 bg-white/80 px-4 py-3">
                    <p className="font-sans text-sm text-[#171411]/76">
                      Awards ceremony
                    </p>
                    <p className="mt-1 font-sans text-sm font-semibold text-[#171411]">
                      16 July 2026
                    </p>
                  </div>
                  <div className="rounded-[1.1rem] border border-black/8 bg-white/80 px-4 py-3">
                    <p className="font-sans text-sm text-[#171411]/76">Location</p>
                    <p className="mt-1 font-sans text-sm font-semibold text-[#171411]">
                      Buea
                    </p>
                  </div>
                  <div className="rounded-[1.1rem] border border-black/8 bg-white/80 px-4 py-3">
                    <p className="font-sans text-sm text-[#171411]/76">Status</p>
                    <p className="mt-1 font-sans text-sm font-semibold text-[#171411]">
                      Closed submissions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="cyes" />
    </div>
  );
};

export default CYESNominationsPage;
