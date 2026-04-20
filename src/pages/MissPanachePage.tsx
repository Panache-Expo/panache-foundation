import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  ExpoPageHero,
  ExpoSidebarCard,
  ExpoSurface,
} from "@/components/registration/ExpoPageShell";
import { Button } from "@/components/ui/button";
import { competitionRegistrationLinks } from "@/lib/registration-links";
import MissPanacheImage from "@/assets/misspanacheupdate.jpg";
import { ArrowRight, Camera, Crown, Mic, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

const stages = [
  {
    number: "01",
    title: "Application and screening",
    description:
      "Contestants submit their profiles, photos, social links, and motivation before selection is announced.",
  },
  {
    number: "02",
    title: "Official contestant preparation",
    description:
      "Selected participants move into orientation, media visibility, image preparation, and public introductions.",
  },
  {
    number: "03",
    title: "Pre-pageant activities",
    description:
      "Interviews, public speaking, campaign moments, and community-facing visibility all help shape the final presence.",
  },
  {
    number: "04",
    title: "Grand finale night",
    description:
      "The pageant comes to life on stage through the introduction round, runway presentation, and the final Q&A.",
  },
];

const eligibility = [
  "Applicants should be between 18 and 28 years old.",
  "Contestants should be available for pageant activities, media moments, and the final event programme.",
  "Strong communication, confidence, and leadership presence matter as much as image.",
  "Participants must be ready to represent the wider Panache Expo brand publicly and professionally.",
];

const crownBenefits = [
  {
    icon: Crown,
    title: "Official crown and sash",
    description:
      "The winner becomes the visible face of the title and carries the official Panache distinction for the year.",
  },
  {
    icon: Sparkles,
    title: "Ambassador platform",
    description:
      "Miss Panache is not only ceremonial. The title is built around visibility, presentation, and representation.",
  },
  {
    icon: Users,
    title: "Brand presence",
    description:
      "The crown signals someone who can hold attention, carry the platform, and stand confidently in public space.",
  },
];

const MissPanachePage = () => {
  return (
    <div className="min-h-screen bg-[#f4f3ef]">
      <Header />

      <ExpoPageHero
        eyebrow="Mademoiselle Panache"
        title={
          <>
            Mademoiselle
            <br />
            <span className="font-display text-[#f4e93f]">Panache</span>
          </>
        }
        description="The official pageant and ambassador platform within Panache Expo. Mademoiselle Panache celebrates poise, intelligence, media confidence, and the kind of presence that can carry the Panache story with credibility."
        image={MissPanacheImage}
        panelLabel="Pageant overview"
        panelTitle="A crown built for visibility."
        panelDescription="The title is designed for women who can represent more than image alone. It rewards confidence, communication, and the ability to hold a public platform with grace."
        panelItems={[
          { label: "Format", value: "Pageant + ambassador role" },
          { label: "Core rounds", value: "Intro, runway, Q&A" },
          { label: "Entry route", value: "Contestant application" },
        ]}
      />

      <main className="px-6 pb-20 pt-10 md:pb-24">
        <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.82fr,1.18fr]">
          <ExpoSidebarCard
            eyebrow="What this crown represents"
            title="Beauty still has to speak."
            description="Mademoiselle Panache is for contestants who can combine confidence with communication, presentation with discipline, and personal image with the ability to represent a wider creative platform."
            points={[
              "The winner should look strong on stage and sound strong in the room.",
              "Public presence, composure, and communication all matter.",
              "The title is built around visibility, not just ceremony.",
            ]}
            footer={
              <Button
                asChild
                className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
              >
                <Link to={competitionRegistrationLinks.missPanache.path}>
                  Register now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            }
          />

          <ExpoSurface className="overflow-hidden">
            <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
              The pageant journey
            </p>
            <h2 className="mt-3 font-sans text-[clamp(2rem,3.2vw,2.8rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
              Four moments shape the final stage.
            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {stages.map((stage) => (
                <div
                  key={stage.number}
                  className="rounded-[1.6rem] border border-black/8 bg-white/74 px-5 py-5"
                >
                  <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-[#8241B6]/78">
                    {stage.number}
                  </p>
                  <h3 className="mt-3 font-sans text-[1.2rem] font-semibold leading-[1.14] tracking-[-0.04em] text-[#171411]">
                    {stage.title}
                  </h3>
                  <p className="mt-3 font-sans text-[0.95rem] leading-relaxed text-[#171411]/66">
                    {stage.description}
                  </p>
                </div>
              ))}
            </div>
          </ExpoSurface>
        </section>

        <section className="mx-auto mt-10 grid max-w-6xl gap-8 lg:grid-cols-2">
          <ExpoSurface>
            <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
              Eligibility
            </p>
            <h2 className="mt-3 font-sans text-[clamp(2rem,3.2vw,2.8rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
              Who should apply?
            </h2>
            <div className="mt-7 grid gap-3">
              {eligibility.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.3rem] border border-black/8 bg-[#f8f2e8] px-4 py-4"
                >
                  <p className="font-sans text-sm leading-relaxed text-[#171411]/72">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </ExpoSurface>

          <ExpoSurface>
            <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
              What the winner receives
            </p>
            <h2 className="mt-3 font-sans text-[clamp(2rem,3.2vw,2.8rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
              The title carries more than one moment.
            </h2>

            <div className="mt-8 grid gap-4">
              {crownBenefits.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[1.6rem] border border-black/8 bg-white/74 px-5 py-5"
                  >
                    <Icon className="h-8 w-8 text-[#8241B6]" />
                    <h3 className="mt-5 font-sans text-[1.2rem] font-semibold leading-[1.08] tracking-[-0.04em] text-[#171411]">
                      {item.title}
                    </h3>
                    <p className="mt-3 font-sans text-[0.95rem] leading-relaxed text-[#171411]/66">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </ExpoSurface>
        </section>

        <section className="mx-auto mt-10 max-w-6xl">
          <ExpoSurface className="overflow-hidden">
            <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr] lg:items-end">
              <div>
                <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                  Finale night
                </p>
                <h2 className="mt-3 font-sans text-[clamp(2rem,3.5vw,3rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                  The stage brings everything into focus.
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.45rem] border border-black/8 bg-white/74 px-4 py-5">
                  <Users className="h-8 w-8 text-[#8241B6]" />
                  <p className="mt-4 font-sans text-sm font-semibold text-[#171411]">
                    Introduction round
                  </p>
                </div>
                <div className="rounded-[1.45rem] border border-black/8 bg-white/74 px-4 py-5">
                  <Camera className="h-8 w-8 text-[#8241B6]" />
                  <p className="mt-4 font-sans text-sm font-semibold text-[#171411]">
                    Runway presentation
                  </p>
                </div>
                <div className="rounded-[1.45rem] border border-black/8 bg-white/74 px-4 py-5">
                  <Mic className="h-8 w-8 text-[#8241B6]" />
                  <p className="mt-4 font-sans text-sm font-semibold text-[#171411]">
                    Final Q&amp;A
                  </p>
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

export default MissPanachePage;
