import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  ExpoPageHero,
  ExpoSurface,
} from "@/components/registration/ExpoPageShell";
import { Button } from "@/components/ui/button";
import AwardMomentImage from "@/assets/Award1.jpeg";
import PanacheAwards from "@/assets/PanacheAwards.jpeg";
import BusinessFeatureImage from "@/assets/businesscomp.jpeg";
import MissPanacheImage from "@/assets/misspanache-subject-mask.png";
import WinnersListImage from "@/assets/PanacheDorWinners.jpeg";
import MediaTourImage from "@/assets/panache-award-night/panache-award-night-2025-01.jpg";
import VideoAdvertImage from "@/assets/panache-award-night/panache-award-night-2025-04.jpg";
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

const peoplesChoiceHighlights = [
  {
    title: "Free business website",
    image: BusinessFeatureImage,
    alt: "Panache business summit and brand visibility moment",
    imageClassName: "object-[center_42%]",
  },
  {
    title: "Professional video advert",
    image: VideoAdvertImage,
    alt: "Panache award presentation moment captured for promotion",
    imageClassName: "object-[center_36%]",
  },
  {
    title: "Media tours",
    image: MediaTourImage,
    alt: "Panache red carpet media backdrop",
    imageClassName: "object-[center_45%]",
  },
  {
    title: "Feature on our official website",
    image: WinnersListImage,
    alt: "Panache D'or winners archive collage",
    imageClassName: "object-[center_30%]",
  },
  {
    title: "Official Panache D'or ambassador status",
    image: MissPanacheImage,
    alt: "Miss Panache D'or titleholder portrait",
    imageClassName: "object-contain object-bottom",
  },
  {
    title: "DJI Pocket 3 vlogging camera",
    image: AwardMomentImage,
    alt: "Panache stage recognition moment for creator visibility",
    imageClassName: "object-[center_38%]",
  },
];

const juryEvaluationItems = [
  "Professionalism",
  "Impact",
  "Creativity",
  "Consistency",
  "Achievements",
  "Industry/community contribution",
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
          { label: "Voting", value: "Ayati-powered links" },
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

            <div className="relative mt-7 h-[28rem] overflow-hidden rounded-[1.8rem] border border-black/8 bg-[radial-gradient(circle_at_50%_32%,rgba(244,233,63,0.2),transparent_32%),linear-gradient(180deg,#f8f2e8_0%,#f4f3ef_100%)]">
              <img
                src={MissPanacheImage}
                alt="Miss Panache D'or 2025"
                className="absolute bottom-0 left-1/2 h-[29rem] w-auto max-w-none -translate-x-1/2 object-contain drop-shadow-[0_18px_34px_rgba(17,16,14,0.18)]"
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
                  Browse the nominee directory and use each nominee&apos;s Ayati link
                  to vote officially.
                </p>
              </div>
            </div>
          </ExpoSurface>
        </section>

        <section className="mx-auto mt-10 max-w-6xl">
          <ExpoSurface className="overflow-hidden">
            <div className="grid gap-8 lg:grid-cols-[0.78fr,1.22fr] lg:items-start">
              <div>
                <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                  About Panache D&apos;or Awards
                </p>
                <h2 className="mt-3 font-sans text-[clamp(2rem,3vw,2.85rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                  A recognition platform for excellence, creativity, and industry impact.
                </h2>
                <p className="mt-4 font-sans text-[1rem] leading-relaxed text-[#171411]/68">
                  The Panache D&apos;or Awards is a prestigious recognition
                  platform under Panache Expo created to celebrate outstanding
                  individuals, brands, creatives, entrepreneurs, and
                  professionals making remarkable impact within the beauty,
                  fashion, media, lifestyle, and creative industries.
                </p>
                <p className="mt-3 font-sans text-[1rem] leading-relaxed text-[#171411]/68">
                  The awards recognise excellence, innovation, leadership,
                  consistency, and community influence while creating visibility
                  and opportunity for talented individuals and businesses across
                  Africa and beyond.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.45rem] border border-black/8 bg-[#f8f2e8] px-5 py-5">
                  <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-[#8241B6]">
                    Online public paid votes
                  </p>
                  <p className="mt-4 font-sans text-4xl font-semibold tracking-[-0.08em] text-[#171411]">
                    70%
                  </p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/68">
                    Public votes make up 70% of the final winner selection
                    score for Panache D&apos;or award categories.
                  </p>
                </div>

                <div className="rounded-[1.45rem] border border-black/8 bg-[#fcfbf8] px-5 py-5">
                  <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-[#8241B6]">
                    Jury committee decision
                  </p>
                  <p className="mt-4 font-sans text-4xl font-semibold tracking-[-0.08em] text-[#171411]">
                    30%
                  </p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/68">
                    The jury committee contributes 30% through professional
                    review and category-based evaluation.
                  </p>
                </div>

                <div className="rounded-[1.45rem] border border-black/8 bg-white px-5 py-5 md:col-span-2">
                  <p className="font-sans text-sm font-semibold text-[#171411]">
                    Online vote cost
                  </p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/66">
                    Each online vote costs 100 CFA. Supporters can vote
                    multiple times throughout the voting period to increase
                    their nominee&apos;s public vote score.
                  </p>
                </div>

                <div className="rounded-[1.45rem] border border-black/8 bg-white px-5 py-5 md:col-span-2">
                  <p className="font-sans text-sm font-semibold text-[#171411]">
                    Jury evaluation areas
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {juryEvaluationItems.map((item) => (
                      <div
                        key={item}
                        className="rounded-full border border-black/8 bg-[#f8f2e8] px-4 py-2 font-sans text-sm font-medium text-[#171411]/72"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 font-sans text-sm leading-relaxed text-[#171411]/66">
                    Jury review considers professionalism, impact, creativity,
                    consistency, achievements, and contribution to the nominee&apos;s
                    industry or community.
                  </p>
                </div>
              </div>
            </div>
          </ExpoSurface>
        </section>

        <section className="mx-auto mt-10 max-w-6xl">
          <div className="grid gap-6 overflow-hidden rounded-[1.8rem] border border-black/8 bg-white p-6 md:grid-cols-[0.82fr_1.18fr] md:p-8 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                Panache People&apos;s Choice Award
              </p>
              <h2 className="mt-3 font-sans text-[clamp(2rem,3.1vw,2.8rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                The nominee with the most votes receives a visibility and business-growth package.
              </h2>
              <p className="mt-4 max-w-[40ch] font-sans text-[1rem] leading-relaxed text-[#171411]/72">
                The Panache People&apos;s Choice Award is for the Panache D&apos;or
                nominee with the highest number of online votes. The winner
                receives a visibility and business-growth package designed to
                extend their recognition beyond the award night itself.
              </p>
              <p className="mt-3 font-sans text-[0.98rem] leading-relaxed text-[#171411]/72">
                This special recognition is 100% based on online votes and is
                structured to support brand growth, media exposure, content
                creation, and the winner&apos;s position as one of the public faces
                of Panache.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {peoplesChoiceHighlights.map((item) => (
                <div
                  key={item.title}
                  className="group relative min-h-[13rem] overflow-hidden rounded-[1.35rem] border border-black/8 bg-[#171411] shadow-[0_18px_42px_rgba(17,16,14,0.08)]"
                >
                  <img
                    src={item.image}
                    alt={item.alt}
                    loading="lazy"
                    className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${item.imageClassName}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171411]/82 via-[#171411]/18 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="max-w-[16rem] font-sans text-base font-semibold leading-tight tracking-[-0.04em] text-white">
                      {item.title}
                    </p>
                  </div>
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
                  Ready to support a Panache D&apos;or nominee?
                </h2>
              </div>

              <div className="lg:ml-auto lg:max-w-[38rem]">
                <p className="font-sans text-[1rem] leading-relaxed text-[#171411]/68">
                  Public nominations are closed for this Panache D&apos;or cycle.
                  The nominee directory now sends each supporter to the correct
                  Ayati vote/payment link, while official counts remain hidden
                  unless Panache connects an official Ayati data source.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
                  >
                    <Link to="/panache-expo/panache-dor/vote">
                      View nominees
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-12 rounded-full border-black/12 bg-white/74 px-7 font-sans text-sm font-semibold text-[#171411] hover:bg-white"
                  >
                    <Link to="/panache-expo/panache-dor/leaderboard">
                      Leaderboard
                    </Link>
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
