import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  ExpoPageHero,
  ExpoSidebarCard,
  ExpoSurface,
} from "@/components/registration/ExpoPageShell";
import { Button } from "@/components/ui/button";
import fashionNight from "@/assets/FashionNight.jpg";
import { competitionRegistrationLinks } from "@/lib/registration-links";
import { ArrowRight, Camera, Scissors, Shirt, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

const runwayHighlights = [
  {
    icon: Shirt,
    title: "Designer selection",
    description:
      "Applications are reviewed before entry, so the runway keeps a stronger level of coherence and quality.",
  },
  {
    icon: Scissors,
    title: "Collection presentation",
    description:
      "Designers are judged on concept strength, styling discipline, silhouette control, and stage execution.",
  },
  {
    icon: Camera,
    title: "Press and media value",
    description:
      "The night creates visuals, audience memory, and useful content for designers building public visibility.",
  },
  {
    icon: Users,
    title: "Industry room",
    description:
      "Fashion Night gathers designers, stylists, photographers, buyers, and fashion-interested audiences in one space.",
  },
];

const runwayFlow = [
  {
    step: "01",
    title: "Apply with the collection you want the room to remember.",
    description:
      "A clearer point of view always reads better than trying to show everything at once.",
  },
  {
    step: "02",
    title: "Prepare the final runway edit with styling and model direction.",
    description:
      "The strongest presentations look considered from silhouette to pace to final reveal.",
  },
  {
    step: "03",
    title: "Present live at Panache and let the collection speak.",
    description:
      "This is where craftsmanship, styling discipline, and brand clarity come under real attention.",
  },
];

const FashionNightPage = () => {
  return (
    <div className="min-h-screen bg-[#f4f3ef]">
      <Header />

      <ExpoPageHero
        eyebrow="Panache Runway Show"
        title={
          <>
            Panache
            <br />
            <span className="font-display text-[#f4e93f]">Runway Show</span>
          </>
        }
        description="A sharper runway format built for collections that deserve real attention. Panache Runway Show brings designers into a competitive stage where presentation, coherence, and creative conviction all matter."
        image={fashionNight}
        panelLabel="Runway Night"
        panelTitle="Collections, judged in the room."
        panelDescription="This is not a loose showcase. Designers are selected, the presentation has structure, and the room is built to notice both styling and discipline."
        panelItems={[
          { label: "Date", value: "18 July 2026" },
          { label: "Venue", value: "Chariot Hotel, Buea" },
          { label: "Entry route", value: "Designer application" },
        ]}
      />

      <main className="px-6 pb-20 pt-10 md:pb-24">
        <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.82fr,1.18fr]">
          <ExpoSidebarCard
            eyebrow="What the night rewards"
            title="Runway clarity, not noise."
            description="Panache Runway Show is for designers who want more than a photo opportunity. The night is built to reward cohesive collections, clear styling decisions, and work that can hold public attention from first look to last walk."
            points={[
              "Collections need a visible point of view, not random look-building.",
              "Presentation quality matters as much as garment detail.",
              "The room should understand your design language before the night ends.",
            ]}
            footer={
              <Button
                asChild
                className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
              >
                <Link to={competitionRegistrationLinks.fashionNight.path}>
                  Apply as a designer
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            }
          />

          <div className="grid gap-4 md:grid-cols-2">
            {runwayHighlights.map((item) => {
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
                  Runway format
                </p>
                <h2 className="mt-3 max-w-[10ch] font-sans text-[clamp(2rem,3.5vw,3rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                  A cleaner route from application to final walk.
                </h2>
              </div>

              <div className="grid gap-4">
                {runwayFlow.map((item) => (
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
                  Final call
                </p>
                <h2 className="mt-3 font-sans text-[clamp(2rem,3.5vw,3rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                  If the collection is ready, the stage is ready too.
                </h2>
              </div>

              <div className="lg:ml-auto lg:max-w-[38rem]">
                <p className="font-sans text-[1rem] leading-relaxed text-[#171411]/68">
                  Panache Runway Show is where your collection meets an audience,
                  a judging room, and the kind of visibility that can push a brand
                  into its next phase.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
                  >
                    <Link to={competitionRegistrationLinks.fashionNight.path}>
                      Start application
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

export default FashionNightPage;
