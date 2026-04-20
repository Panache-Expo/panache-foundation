import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  ExpoPageHero,
  ExpoSurface,
} from "@/components/registration/ExpoPageShell";
import { Button } from "@/components/ui/button";
import BraidingWorkshop from "@/assets/BraidingWorkshop.jpeg";
import { Link } from "react-router-dom";

const workshops = [
  {
    title: "Barber Workshops",
    description:
      "Precision cutting, styling discipline, beard grooming, and cleaner finishing work under guided instruction.",
    features: ["Classic cuts", "Modern styling", "Beard grooming", "Tool mastery"],
  },
  {
    title: "Nail Tech Workshops",
    description:
      "Advanced nail artistry, hygiene fundamentals, trend-led execution, and technical refinement.",
    features: ["Nail art", "Gel techniques", "Extensions", "Health and safety"],
  },
  {
    title: "Wig Installation",
    description:
      "Professional fitting, installation, blending, and styling for stronger and more natural-looking results.",
    features: ["Lace fronts", "Custom fitting", "Styling tips", "Maintenance"],
  },
  {
    title: "Lash Installation",
    description:
      "Application technique, volume building, clean placement, and aftercare knowledge for elegant lash work.",
    features: ["Classic lashes", "Volume sets", "Hybrid techniques", "Aftercare"],
  },
  {
    title: "Makeup Workshops",
    description:
      "Beauty and corrective technique, finish control, color decisions, and stronger work for real clients or stage.",
    features: ["Color theory", "Contouring", "Editorial finish", "Bridal makeup"],
  },
  {
    title: "Braiding Workshops",
    description:
      "Protective styles, pattern discipline, neatness, and contemporary braiding built on strong foundations.",
    features: ["Protective styles", "Patterning", "Creative finishes", "Hair health"],
  },
];

const valuePoints = [
  "Hands-on learning with practical beauty and fashion-adjacent disciplines.",
  "Sessions built for people who want to sharpen craft, not just observe trends.",
  "A workshop route that fits both working professionals and ambitious learners.",
];

export const WorkshopsPage = () => {
  return (
    <div className="min-h-screen bg-[#f4f3ef]">
      <Header />

      <ExpoPageHero
        eyebrow="Panache workshops"
        title={
          <>
            Master Your
            <br />
            <span className="font-display text-[#f4e93f]">Craft</span>
          </>
        }
        description="Panache workshops are designed for people who want more than passive attendance. The sessions focus on useful technique, clearer execution, and the kind of skill-building that shows up in real work."
        image={BraidingWorkshop}
        panelLabel="Workshop focus"
        panelTitle="Built for practical growth."
        panelDescription="Each workshop lane is meant to sharpen a specific craft area through guided demonstrations, stronger technique framing, and more intentional skill development."
        panelItems={[
          { label: "Tracks", value: "6 workshop areas" },
          { label: "Best for", value: "Professionals + learners" },
          { label: "Entry route", value: "Panache registration" },
        ]}
      />

      <main className="px-6 pb-20 pt-10 md:pb-24">
        <section className="mx-auto max-w-6xl">
          <ExpoSurface className="overflow-hidden">
            <div className="grid gap-8 lg:grid-cols-[0.82fr,1.18fr] lg:items-start">
              <div>
                <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                  Why these sessions matter
                </p>
                <h2 className="mt-3 max-w-[10ch] font-sans text-[clamp(2rem,3.5vw,3rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                  Skill feels different when the room is built for practice.
                </h2>
              </div>

              <div className="grid gap-4">
                {valuePoints.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.5rem] border border-black/8 bg-white/74 px-5 py-5"
                  >
                    <p className="font-sans text-[1rem] leading-relaxed text-[#171411]/72">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ExpoSurface>
        </section>

        <section className="mx-auto mt-10 max-w-6xl">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workshops.map((workshop) => (
              <ExpoSurface key={workshop.title} className="h-full">
                <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#8241B6]">
                  Workshop track
                </p>
                <h2 className="mt-4 font-sans text-[1.55rem] font-semibold leading-[1.02] tracking-[-0.05em] text-[#171411]">
                  {workshop.title}
                </h2>
                <p className="mt-4 font-sans text-[0.98rem] leading-relaxed text-[#171411]/68">
                  {workshop.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {workshop.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-black/10 bg-white/74 px-3 py-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-[#171411]/70"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </ExpoSurface>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-6xl">
          <ExpoSurface className="overflow-hidden">
            <div className="grid gap-8 lg:grid-cols-[0.92fr,1.08fr] lg:items-end">
              <div>
                <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                  Final call
                </p>
                <h2 className="mt-3 font-sans text-[clamp(2rem,3.5vw,3rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                  Join the workshop route that fits your craft.
                </h2>
              </div>

              <div className="lg:ml-auto lg:max-w-[38rem]">
                <p className="font-sans text-[1rem] leading-relaxed text-[#171411]/68">
                  Whether you are building fundamentals or refining existing
                  practice, the Panache workshops are built to move your work
                  forward in a more useful way.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
                  >
                    <Link to="/panache-expo/register">Register for workshops</Link>
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
