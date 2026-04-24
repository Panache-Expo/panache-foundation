import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  ExpoPageHero,
  ExpoSurface,
} from "@/components/registration/ExpoPageShell";
import { Button } from "@/components/ui/button";
import PanacheAwards from "@/assets/PanacheAwards.jpeg";
import MissPanacheImage from "@/assets/misspanacheupdate.jpg";
import WinnersListImage from "@/assets/PanacheDorWinners.jpeg";
import { Award, ArrowRight, Crown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const recognitionCards = [
  {
    icon: Crown,
    title: "Miss Panache D'or",
    description:
      "The crown that carries the public face of Panache elegance, discipline, and ambassadorial presence.",
  },
  {
    icon: Award,
    title: "Craft winners",
    description:
      "Beauty, fashion, and creative professionals recognised for the kind of work that stands out across the industry.",
  },
  {
    icon: Sparkles,
    title: "Visible prestige",
    description:
      "Panache D'or exists to make excellent work feel seen, documented, and remembered beyond one event night.",
  },
];

const winnerPackageItems = [
  "1.5 million FCFA cash package",
  "Free business website",
  "Pro video advert",
  "Media tours",
  "Featured on the official website",
  "Official Panache ambassador status",
  "DJI Pocket 3 vlogging camera",
];

const PanacheDorPage = () => {
  return (
    <div className="min-h-screen bg-[#f4f3ef]">
      <Header />

      <ExpoPageHero
        eyebrow="Panache D'or"
        title={
          <>
            Panache D&apos;or
            <br />
            <span className="font-display text-[#f4e93f]">Winners</span>
          </>
        }
        description="A clearer archive of the faces, titles, and recognitions that define Panache prestige. This is where the crown, the winners, and the wider awards story all sit together."
        image={PanacheAwards}
        panelLabel="Awards Archive"
        panelTitle="Where excellence is made visible."
        panelDescription="Panache D'or celebrates winners who represent more than one good night. The platform is meant to document beauty leadership, creative discipline, and brand visibility over time."
        panelItems={[
          { label: "Flagship crown", value: "Miss Panache D'or" },
          { label: "Focus", value: "Beauty, fashion, craft" },
          { label: "Use this page for", value: "Winners + archive" },
        ]}
      />

      <main className="px-6 pb-20 pt-10 md:pb-24">
        <section className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-3">
            {recognitionCards.map((card) => {
              const Icon = card.icon;

              return (
                <ExpoSurface key={card.title} className="h-full">
                  <Icon className="h-9 w-9 text-[#8241B6]" />
                  <h2 className="mt-6 font-sans text-[1.45rem] font-semibold leading-[1.02] tracking-[-0.05em] text-[#171411]">
                    {card.title}
                  </h2>
                  <p className="mt-4 font-sans text-[0.98rem] leading-relaxed text-[#171411]/68">
                    {card.description}
                  </p>
                </ExpoSurface>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-10 grid max-w-6xl gap-8 lg:grid-cols-2">
          <ExpoSurface className="overflow-hidden">
            <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
              Current titleholder
            </p>
            <h2 className="mt-3 font-sans text-[clamp(2rem,3.2vw,2.8rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-[#171411]">
              Miss Panache D&apos;or 2025
            </h2>

            <div className="mt-7 overflow-hidden rounded-[1.8rem] border border-black/8">
              <img
                src={MissPanacheImage}
                alt="Miss Panache D'or 2025"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-7 space-y-4">
              <p className="font-sans text-[1rem] leading-relaxed text-[#171411]/72">
                Djoulhida Soule represents the Panache vision with a mix of
                technical beauty knowledge, stage presence, and brand leadership.
                As CEO of Charisma Beauty Skincare, she reflects the Panache
                ideal that elegance should still be grounded in real work,
                discipline, and ambition.
              </p>
              <p className="font-sans text-[1rem] leading-relaxed text-[#171411]/72">
                The Miss Panache D&apos;or title is not only ceremonial. It
                signals visibility, responsibility, and the ability to carry the
                wider Panache story into the public eye with confidence.
              </p>
            </div>
          </ExpoSurface>

          <ExpoSurface className="overflow-hidden">
            <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
              Winners archive
            </p>
            <h2 className="mt-3 font-sans text-[clamp(2rem,3.2vw,2.8rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-[#171411]">
              A visual record of the people Panache has recognised.
            </h2>

            <div className="mt-7 overflow-hidden rounded-[1.8rem] border border-black/8 bg-white">
              <img
                src={WinnersListImage}
                alt="Panache D'or winners collage"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.3rem] border border-black/8 bg-[#f8f2e8] px-4 py-4">
                <p className="font-sans text-sm font-semibold text-[#171411]">
                  Recognition scope
                </p>
                <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/66">
                  Winners span beauty, fashion, entrepreneurship, and category-specific craft.
                </p>
              </div>
              <div className="rounded-[1.3rem] border border-black/8 bg-[#f8f2e8] px-4 py-4">
                <p className="font-sans text-sm font-semibold text-[#171411]">
                  Next action
                </p>
                <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/66">
                  Explore nominations or contact the team if you want award clarification.
                </p>
              </div>
            </div>
          </ExpoSurface>
        </section>

        <section className="mx-auto mt-10 max-w-6xl">
          <div className="grid gap-6 overflow-hidden rounded-[1.8rem] border border-black/8 bg-white p-6 md:grid-cols-[0.82fr_1.18fr] md:p-8 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                Winner package
              </p>
              <h2 className="mt-3 font-sans text-[clamp(2rem,3.1vw,2.8rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                Panache D&apos;or comes with a full visibility and growth package.
              </h2>
              <p className="mt-4 max-w-[40ch] font-sans text-[1rem] leading-relaxed text-[#171411]/72">
                The Panache D&apos;or winner goes with 1.5 million FCFA and a
                business-building prize package designed to extend visibility
                beyond the award night itself.
              </p>
              <p className="mt-3 font-sans text-[0.98rem] leading-relaxed text-[#171411]/72">
                It is structured to support brand growth, media exposure,
                content creation, and the winner&apos;s position as one of the
                public faces of Panache.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {winnerPackageItems.map((item, index) => (
                <div
                  key={item}
                  className={[
                    "rounded-[1.35rem] border border-black/8 px-4 py-4",
                    index === 0 || index === 6
                      ? "bg-[#f8f2e8]"
                      : "bg-[#fcfbf8]",
                  ].join(" ")}
                >
                  <p className="font-sans text-sm font-semibold leading-relaxed text-[#171411]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-6xl">
          <ExpoSurface className="overflow-hidden">
            <div className="grid gap-8 lg:grid-cols-[0.92fr,1.08fr] lg:items-end">
              <div>
                <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                  Keep following the awards story
                </p>
                <h2 className="mt-3 font-sans text-[clamp(2rem,3.2vw,2.9rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                  Looking for the next recognition cycle?
                </h2>
              </div>

              <div className="lg:ml-auto lg:max-w-[38rem]">
                <p className="font-sans text-[1rem] leading-relaxed text-[#171411]/68">
                  Use the nominations route to submit outstanding work, or contact
                  the team if you need clarification about categories, eligibility,
                  or how the Panache D&apos;or platform is structured.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
                  >
                    <Link to="/panache-expo/nominations">
                      Open nominations
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-12 rounded-full border-black/12 bg-white/74 px-7 font-sans text-sm font-semibold text-[#171411] hover:bg-white"
                  >
                    <Link to="/panache-expo/contact">Contact the team</Link>
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

export default PanacheDorPage;
