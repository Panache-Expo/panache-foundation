import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  ExpoPageHero,
  ExpoSidebarCard,
  ExpoSurface,
} from "@/components/registration/ExpoPageShell";
import { Button } from "@/components/ui/button";
import charityNight from "@/assets/CharityNight.jpg";
import { ArrowRight, Heart, Music, Sparkles, Star, Utensils, Users } from "lucide-react";
import { Link } from "react-router-dom";

const highlightCards = [
  {
    icon: Heart,
    title: "Charitable giving",
    description:
      "The night is built to raise support for youth-focused entrepreneurial programmes and opportunities.",
  },
  {
    icon: Music,
    title: "Live entertainment",
    description:
      "Guests experience a full evening atmosphere with performances, culture, and thoughtful programming.",
  },
  {
    icon: Utensils,
    title: "Gala dinner",
    description:
      "A more polished social setting where conversation, hospitality, and contribution all share the room.",
  },
  {
    icon: Star,
    title: "Recognition moments",
    description:
      "The night honours people and organisations creating real movement around youth empowerment.",
  },
];

const eveningFlow = [
  {
    step: "01",
    title: "Guests gather for an elevated social room.",
    description:
      "The tone is warm, intentional, and built around the people who care about impact, visibility, and support.",
  },
  {
    step: "02",
    title: "Programming mixes dining, performance, and recognition.",
    description:
      "The night should feel elegant without losing the purpose behind why everyone came into the room.",
  },
  {
    step: "03",
    title: "The giving remains tied to real youth-focused work.",
    description:
      "What matters is not only the event itself, but what it helps create after the evening is over.",
  },
];

const CharityNightPage = () => {
  return (
    <div className="min-h-screen bg-[#f4f3ef]">
      <Header />

      <ExpoPageHero
        eyebrow="Panache Charity Night"
        title={
          <>
            Panache
            <br />
            <span className="font-display text-[#f4e93f]">Charity Night</span>
          </>
        }
        description="An evening built around generosity, elegance, and practical impact. Panache Charity Night brings together guests, supporters, and partners around youth-focused entrepreneurial support."
        image={charityNight}
        panelLabel="Evening overview"
        panelTitle="A social room with a real purpose."
        panelDescription="The night is designed to feel elevated, but the point remains clear: create visibility and support around the people and programmes shaping opportunity."
        panelItems={[
          { label: "Date", value: "16 July 2026" },
          { label: "Venue", value: "Chariot Hotel, Buea" },
          { label: "Best for", value: "Guests, partners, supporters" },
        ]}
      />

      <main className="px-6 pb-20 pt-10 md:pb-24">
        <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.82fr,1.18fr]">
          <ExpoSidebarCard
            eyebrow="Why the night matters"
            title="Elegance should still lead somewhere."
            description="Panache Charity Night is not built as decorative programming. The event exists to gather the right people, create visibility around the work, and direct support toward meaningful youth-focused entrepreneurship."
            points={[
              "The room is social, but the purpose stays visible.",
              "Guests, partners, and supporters all share the same live setting.",
              "The evening should feel memorable because the impact is real.",
            ]}
            footer={
              <Button
                asChild
                className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
              >
                <Link to="/panache-expo/register">
                  Reserve your seat
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            }
          />

          <div className="grid gap-4 md:grid-cols-2">
            {highlightCards.map((item) => {
              const Icon = item.icon;

              return (
                <ExpoSurface key={item.title} className="h-full">
                  <Icon className="h-9 w-9 text-[#8241B6]" />
                  <h2 className="mt-6 font-sans text-[1.45rem] font-semibold leading-[1.02] tracking-[-0.05em] text-[#171411]">
                    {item.title}
                  </h2>
                  <p className="mt-4 font-sans text-[0.98rem] leading-relaxed text-[#171411]/68">
                    {item.description}
                  </p>
                </ExpoSurface>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-6xl">
          <ExpoSurface className="overflow-hidden">
            <div className="grid gap-8 lg:grid-cols-[0.86fr,1.14fr] lg:items-start">
              <div>
                <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                  Evening flow
                </p>
                <h2 className="mt-3 max-w-[10ch] font-sans text-[clamp(2rem,3.5vw,3rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                  The format is simple, but the room should feel full.
                </h2>
              </div>

              <div className="grid gap-4">
                {eveningFlow.map((item) => (
                  <div
                    key={item.step}
                    className="rounded-[1.6rem] border border-black/8 bg-white/74 px-5 py-5"
                  >
                    <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-[#8241B6]/78">
                      {item.step}
                    </p>
                    <h3 className="mt-3 font-sans text-[1.18rem] font-semibold leading-[1.14] tracking-[-0.04em] text-[#171411]">
                      {item.title}
                    </h3>
                    <p className="mt-3 font-sans text-[0.95rem] leading-relaxed text-[#171411]/66">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ExpoSurface>
        </section>

        <section className="mx-auto mt-10 max-w-6xl">
          <ExpoSurface className="overflow-hidden">
            <div className="grid gap-8 lg:grid-cols-[0.92fr,1.08fr] lg:items-end">
              <div>
                <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                  Join the evening
                </p>
                <h2 className="mt-3 font-sans text-[clamp(2rem,3.5vw,3rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                  Come into the room with purpose.
                </h2>
              </div>

              <div className="lg:ml-auto lg:max-w-[38rem]">
                <p className="font-sans text-[1rem] leading-relaxed text-[#171411]/68">
                  Charity Night works best when the audience includes people who
                  are ready to support, connect, and help the wider Panache story
                  become more useful beyond the event itself.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
                  >
                    <Link to="/panache-expo/register">
                      Reserve your seat
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-12 rounded-full border-black/12 bg-white/74 px-7 font-sans text-sm font-semibold text-[#171411] hover:bg-white"
                  >
                    <Link to="/panache-expo/contact">Talk to the team</Link>
                  </Button>
                </div>
              </div>
            </div>
          </ExpoSurface>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CharityNightPage;
