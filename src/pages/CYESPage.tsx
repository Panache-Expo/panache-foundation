import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SponsorsMarquee } from "@/components/SponsorsMarquee";
import { Button } from "@/components/ui/button";
import cyesAwards from "@/assets/CYESCDAwards.jpeg";
import cyesBackground from "@/assets/CYESBackground.jpeg";
import cyesLogo from "@/assets/CYESLogo.jpeg";
import speaker1 from "@/assets/speaker1.jpeg";
import speaker2 from "@/assets/speaker2.jpeg";
import speaker3 from "@/assets/speaker3.jpeg";
import speaker4 from "@/assets/speaker4.jpeg";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Calendar,
  Lightbulb,
  MapPin,
  Mic,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const heroFacts = [
  { value: "16 July", label: "summit and awards day" },
  { value: "Buea", label: "Chariot Hotel venue" },
  { value: "Youth", label: "entrepreneurship at the center" },
];

const summitPillars = [
  {
    icon: Mic,
    title: "Keynote sessions",
    description:
      "Direct insight from builders, business leaders, and voices shaping the next generation of enterprise in Cameroon.",
    accent: "text-cyes-blue",
    surface: "bg-cyes-blue/8",
  },
  {
    icon: Users,
    title: "Real networking",
    description:
      "Founders, students, operators, partners, and mentors in one room with enough structure to create useful connections.",
    accent: "text-cyes-green",
    surface: "bg-cyes-green/8",
  },
  {
    icon: Lightbulb,
    title: "Practical workshops",
    description:
      "Focused conversations around growth, visibility, digital opportunity, and what it takes to turn ideas into traction.",
    accent: "text-cyes-yellow",
    surface: "bg-cyes-yellow/10",
  },
  {
    icon: Award,
    title: "Recognition on stage",
    description:
      "The summit culminates in awards that spotlight youth entrepreneurship, community leadership, and impact.",
    accent: "text-cyes-red",
    surface: "bg-cyes-red/8",
  },
];

const pathways = [
  {
    label: "Awards",
    title: "Honor the voices and ventures moving youth enterprise forward.",
    description:
      "Explore the CYECD Awards, categories, jury structure, and what the recognition platform stands for this year.",
    to: "/cyes/awards",
    cta: "Explore awards",
    tone:
      "border-cyes-green/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0.7))]",
    accent: "text-cyes-green",
  },
  {
    label: "Pitch Competition",
    title: "Step into the sharper competitive lane for founders with ideas to prove.",
    description:
      "The CYES pitch competition gives emerging businesses a more focused path into attention, structure, and opportunity.",
    to: "/cyes/pitch-competition",
    cta: "View pitch competition",
    tone:
      "border-cyes-blue/20 bg-[linear-gradient(180deg,rgba(17,88,211,0.08),rgba(255,255,255,0.86))]",
    accent: "text-cyes-blue",
  },
  {
    label: "Nominations",
    title: "Put forward the people and organizations making meaningful impact.",
    description:
      "From entrepreneurs to community leaders, nominations help the platform reflect the people actually building the future.",
    to: "/cyes/nominations",
    cta: "Open nominations",
    tone:
      "border-cyes-yellow/25 bg-[linear-gradient(180deg,rgba(223,171,8,0.12),rgba(255,255,255,0.86))]",
    accent: "text-cyes-yellow",
  },
];

const speakers = [
  { image: speaker1, label: "Speaker" },
  { image: speaker2, label: "Speaker" },
  { image: speaker3, label: "Speaker" },
  { image: speaker4, label: "Speaker" },
];

const editorialMotion = {
  ease: [0.22, 1, 0.36, 1] as const,
  duration: 0.9,
};

const lightSurfaceClasses =
  "rounded-[2rem] border border-black/10 bg-white/72 shadow-[0_24px_60px_rgba(17,16,14,0.08)] backdrop-blur-sm";

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-cyes-green">
    {children}
  </p>
);

const CYESPage = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#f4f6f1] text-[#171411]">
      <Header />

      <main className="overflow-hidden">
        <section className="relative px-4 pb-20 pt-32 md:px-6 md:pb-24 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[46rem] bg-[radial-gradient(circle_at_10%_18%,rgba(37,175,95,0.18),transparent_28%),radial-gradient(circle_at_90%_16%,rgba(17,88,211,0.16),transparent_26%),radial-gradient(circle_at_72%_56%,rgba(223,171,8,0.13),transparent_16%),linear-gradient(180deg,#f8faf5_0%,#f4f6f1_100%)]" />
          <div className="pointer-events-none absolute right-0 top-0 h-[40rem] w-[38rem] bg-[linear-gradient(270deg,rgba(17,88,211,0.08),transparent_70%)]" />
          <div className="pointer-events-none absolute right-[-10rem] top-[7rem] h-[30rem] w-[30rem] overflow-hidden rounded-full blur-3xl opacity-20">
            <img
              src={cyesBackground}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-10 xl:grid-cols-[0.9fr,1.1fr] xl:items-center">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={editorialMotion}
              className="max-w-[42rem]"
            >
              <div className="inline-flex items-center gap-3 rounded-full border border-black/8 bg-white/70 px-3 py-3 shadow-[0_20px_50px_rgba(17,16,14,0.06)] backdrop-blur-sm">
                <img
                  src={cyesLogo}
                  alt="CYES logo"
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div className="text-left">
                  <p className="font-sans text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyes-green">
                    Cameroon Youths
                  </p>
                  <p className="font-sans text-sm font-semibold tracking-[-0.03em] text-[#171411]">
                    Entrepreneurial Summit & Awards
                  </p>
                </div>
              </div>

              <h1 className="mt-6 font-sans text-[clamp(3.7rem,8vw,7.4rem)] font-semibold leading-[0.82] tracking-[-0.085em] text-[#171411]">
                CAMEROON
                <span className="block text-cyes-red">YOUTH</span>
                <span className="block font-display text-[0.82em] tracking-[-0.05em] text-cyes-blue">
                  Summit & Awards
                </span>
              </h1>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-cyes-yellow/14 px-4 py-2 font-sans text-sm font-semibold text-[#171411]">
                <span className="h-2.5 w-2.5 rounded-full bg-cyes-yellow" />
                CYES 2026
              </div>

              <p className="mt-7 max-w-[35rem] font-sans text-[clamp(1.08rem,2vw,1.35rem)] leading-[1.45] text-[#171411]/72">
                A sharper platform for youth entrepreneurship, ambition, and recognition
                in Cameroon, built around summit conversations, live networking, and an
                awards program that celebrates visible impact.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/cyes/register">
                  <Button className="h-14 rounded-full bg-[#171411] px-8 font-sans text-base font-semibold text-white hover:bg-[#171411]/92">
                    Register for CYES
                  </Button>
                </Link>

                <Link
                  to="/cyes/pitch-competition"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-black/12 bg-white/58 px-7 font-sans text-base font-semibold text-[#171411] backdrop-blur-sm transition-colors hover:bg-white/82"
                >
                  Explore pitch competition
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {heroFacts.map((fact, index) => (
                  <motion.div
                    key={fact.label}
                    initial={
                      shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      ...editorialMotion,
                      delay: shouldReduceMotion ? 0 : 0.08 + index * 0.08,
                    }}
                    className={`${lightSurfaceClasses} px-5 py-5`}
                  >
                    <p className="font-sans text-[1.9rem] font-semibold leading-none tracking-[-0.06em] text-[#171411]">
                      {fact.value}
                    </p>
                    <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/58">
                      {fact.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-9 flex flex-wrap gap-6 text-sm font-medium text-[#171411]/64">
                <div className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-cyes-green" />
                  July 16th 2026
                </div>
                <div className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cyes-blue" />
                  Chariot Hotel, Buea
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 34 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...editorialMotion, delay: shouldReduceMotion ? 0 : 0.12 }}
              className="mx-auto w-full max-w-[46rem]"
            >
              <div className="grid gap-4 lg:grid-cols-[1.08fr,0.92fr]">
                <div className="relative flex flex-col gap-4">
                  <motion.div
                    initial={
                      shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...editorialMotion, delay: shouldReduceMotion ? 0 : 0.18 }}
                    className="relative overflow-hidden rounded-[2.25rem] border border-black/10 bg-white/70 shadow-[0_30px_90px_rgba(17,16,14,0.14)]"
                  >
                    <img
                      src={cyesAwards}
                      alt="CYES community and summit moment"
                      className="h-full min-h-[24rem] w-full object-cover md:min-h-[30rem]"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 via-black/20 to-transparent px-6 pb-6 pt-14 text-white">
                      <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cyes-yellow">
                        Summit atmosphere
                      </p>
                      <p className="mt-3 max-w-[22rem] font-sans text-[1.05rem] font-medium leading-[1.28] tracking-[-0.03em]">
                        A room built for visibility, ambition, and the public celebration of youth enterprise.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={
                      shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...editorialMotion, delay: shouldReduceMotion ? 0 : 0.28 }}
                    className="rounded-[2rem] bg-[#171411] px-6 py-6 text-white shadow-[0_28px_80px_rgba(17,16,14,0.24)]"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-cyes-yellow">
                          This year
                        </p>
                        <p className="mt-4 font-sans text-[1.55rem] font-semibold leading-[1.02] tracking-[-0.05em]">
                          A clearer room for founders, students, operators, and impact voices.
                        </p>
                      </div>
                      <div className="grid gap-3 sm:pl-4">
                        <div className="rounded-[1.2rem] border border-white/12 bg-white/[0.06] px-4 py-4">
                          <p className="font-sans text-sm font-semibold text-white">Summit</p>
                          <p className="mt-1 font-sans text-sm leading-relaxed text-white/66">
                            Keynotes, networking, workshops, and community energy.
                          </p>
                        </div>
                        <div className="rounded-[1.2rem] border border-white/12 bg-white/[0.06] px-4 py-4">
                          <p className="font-sans text-sm font-semibold text-white">Awards</p>
                          <p className="mt-1 font-sans text-sm leading-relaxed text-white/66">
                            Recognition for youth entrepreneurship and visible impact.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="flex flex-col gap-4">
                  <motion.div
                    initial={
                      shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...editorialMotion, delay: shouldReduceMotion ? 0 : 0.24 }}
                    className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/70 shadow-[0_28px_80px_rgba(17,16,14,0.12)]"
                  >
                    <img
                      src={speaker3}
                      alt="CYES speaker moment"
                      className="h-full min-h-[17rem] w-full object-cover"
                    />
                  </motion.div>

                  <div className="grid gap-4 sm:grid-cols-[1fr,0.88fr] lg:grid-cols-1">
                    <motion.div
                      initial={
                        shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...editorialMotion, delay: shouldReduceMotion ? 0 : 0.3 }}
                      className="overflow-hidden rounded-[2rem] bg-cyes-blue px-6 py-6 text-white shadow-[0_28px_80px_rgba(17,88,211,0.22)]"
                    >
                      <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-cyes-yellow">
                        Venue & timing
                      </p>
                      <h2 className="mt-4 font-sans text-[clamp(1.45rem,2vw,1.95rem)] font-semibold leading-[1] tracking-[-0.05em]">
                        Chariot Hotel, Buea.
                      </h2>
                      <p className="mt-4 font-sans text-[0.96rem] leading-relaxed text-white/76">
                        July 16th 2026. Built as a full summit day, not just a brief ceremony.
                      </p>
                    </motion.div>

                    <motion.div
                      initial={
                        shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...editorialMotion, delay: shouldReduceMotion ? 0 : 0.36 }}
                      className="flex flex-col justify-between rounded-[2rem] border border-black/10 bg-white/72 px-6 py-6 shadow-[0_28px_80px_rgba(17,16,14,0.12)]"
                    >
                      <div>
                        <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-cyes-green">
                          Identity
                        </p>
                        <p className="mt-4 font-sans text-[1.45rem] font-semibold leading-[1.05] tracking-[-0.05em] text-[#171411]">
                          Entrepreneurial energy, national context, and youth-first visibility.
                        </p>
                      </div>
                      <img
                        src={cyesLogo}
                        alt="CYES identity"
                        className="mt-6 h-28 w-28 rounded-full object-cover"
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr,1.1fr]">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.28 }}
              transition={editorialMotion}
            >
              <SectionLabel>Why CYES matters</SectionLabel>
              <h2 className="mt-4 max-w-[11ch] font-sans text-[clamp(2.8rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-[#171411]">
                Not just another event. A youth-enterprise platform.
              </h2>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2">
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.28 }}
                transition={{ ...editorialMotion, delay: shouldReduceMotion ? 0 : 0.06 }}
                className={`${lightSurfaceClasses} p-7`}
              >
                <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-cyes-green">
                  Mission
                </p>
                <p className="mt-5 font-sans text-[1.25rem] font-medium leading-[1.28] tracking-[-0.04em] text-[#171411]">
                  CYES exists to give young Cameroonian entrepreneurs a stronger public
                  stage for growth, learning, and visibility.
                </p>
              </motion.div>

              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.28 }}
                transition={{ ...editorialMotion, delay: shouldReduceMotion ? 0 : 0.12 }}
                className="rounded-[2rem] bg-[linear-gradient(180deg,rgba(37,175,95,0.1),rgba(17,88,211,0.14))] px-7 py-7 shadow-[0_26px_80px_rgba(17,88,211,0.1)]"
              >
                <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-cyes-blue">
                  What it creates
                </p>
                <p className="mt-5 font-sans text-[1.25rem] font-medium leading-[1.28] tracking-[-0.04em] text-[#171411]">
                  A live meeting point between ambition, opportunity, policy, community,
                  and recognition.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-6 md:py-24">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={editorialMotion}
              className="grid gap-5 lg:grid-cols-[0.82fr,1.18fr] lg:items-end"
            >
              <div>
                <SectionLabel>The summit structure</SectionLabel>
                <h2 className="mt-4 max-w-[12ch] font-sans text-[clamp(2.8rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-[#171411]">
                  Four reasons the room matters.
                </h2>
              </div>

              <p className="max-w-[36rem] font-sans text-[1.05rem] leading-relaxed text-[#171411]/66 lg:ml-auto">
                CYES should feel energetic, but also useful. The goal is not noise. It is
                gathering the right people, ideas, and recognition structures in one place.
              </p>
            </motion.div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summitPillars.map((pillar, index) => {
                const Icon = pillar.icon;

                return (
                  <motion.article
                    key={pillar.title}
                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.18 }}
                    transition={{
                      ...editorialMotion,
                      delay: shouldReduceMotion ? 0 : index * 0.04,
                    }}
                    className={`${lightSurfaceClasses} min-h-[16rem] p-6`}
                  >
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${pillar.surface}`}>
                      <Icon className={`h-7 w-7 ${pillar.accent}`} />
                    </div>
                    <h3 className="mt-5 font-sans text-[1.4rem] font-semibold leading-[1.02] tracking-[-0.05em] text-[#171411]">
                      {pillar.title}
                    </h3>
                    <p className="mt-4 font-sans text-[0.98rem] leading-relaxed text-[#171411]/62">
                      {pillar.description}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-6 md:py-24">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={editorialMotion}
            >
              <SectionLabel>Main pathways</SectionLabel>
              <h2 className="mt-4 max-w-[11ch] font-sans text-[clamp(2.8rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-[#171411]">
                Enter through the lane that fits your role.
              </h2>
            </motion.div>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {pathways.map((pathway, index) => (
                <motion.article
                  key={pathway.title}
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.22 }}
                  transition={{
                    ...editorialMotion,
                    delay: shouldReduceMotion ? 0 : index * 0.05,
                  }}
                  className={`rounded-[2rem] border p-7 shadow-[0_24px_60px_rgba(17,16,14,0.08)] ${pathway.tone}`}
                >
                  <p className={`font-sans text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${pathway.accent}`}>
                    {pathway.label}
                  </p>
                  <h3 className="mt-4 font-sans text-[1.55rem] font-semibold leading-[1.05] tracking-[-0.05em] text-[#171411]">
                    {pathway.title}
                  </h3>
                  <p className="mt-4 font-sans text-[0.98rem] leading-relaxed text-[#171411]/64">
                    {pathway.description}
                  </p>
                  <Link
                    to={pathway.to}
                    className="mt-8 inline-flex items-center gap-2 font-sans text-sm font-semibold text-[#171411] transition-opacity hover:opacity-65"
                  >
                    {pathway.cta}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-6 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.86fr,1.14fr] lg:items-start">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.28 }}
              transition={editorialMotion}
            >
              <SectionLabel>Faces in the room</SectionLabel>
              <h2 className="mt-4 max-w-[10ch] font-sans text-[clamp(2.8rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-[#171411]">
                A summit feels different when the people shaping it are visible.
              </h2>
              <p className="mt-5 max-w-[31rem] font-sans text-[1.05rem] leading-relaxed text-[#171411]/68">
                Speakers, partners, jury voices, and youth participants all contribute to the
                event’s credibility. The page should show that CYES is built around people, not
                just program text.
              </p>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              {speakers.map((speaker, index) => (
                <motion.div
                  key={`${speaker.label}-${index}`}
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    ...editorialMotion,
                    delay: shouldReduceMotion ? 0 : index * 0.04,
                  }}
                  className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/72 shadow-[0_24px_60px_rgba(17,16,14,0.08)]"
                >
                  <div className="aspect-[0.98/1]">
                    <img
                      src={speaker.image}
                      alt={`CYES speaker ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 pt-8 md:px-6 md:pb-28">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={editorialMotion}
            className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-cyes-blue/12 bg-white/72 px-6 py-8 shadow-[0_30px_120px_rgba(17,16,14,0.08)] md:px-10 md:py-12"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_12%_22%,rgba(37,175,95,0.13),transparent_36%),radial-gradient(circle_at_84%_20%,rgba(17,88,211,0.13),transparent_28%),radial-gradient(circle_at_62%_90%,rgba(223,171,8,0.1),transparent_22%)]" />

            <div className="relative grid gap-8 lg:grid-cols-[0.95fr,1.05fr] lg:items-end">
              <div>
                <SectionLabel>Final call</SectionLabel>
                <h2 className="mt-4 max-w-[10ch] font-sans text-[clamp(2.8rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-[#171411]">
                  Join the summit. Enter the room prepared.
                </h2>
              </div>

              <div className="lg:ml-auto lg:max-w-[38rem]">
                <p className="font-sans text-[1.08rem] leading-relaxed text-[#171411]/68">
                  Whether you are coming to learn, connect, nominate, pitch, or be recognized,
                  CYES should feel like a platform with direction, not just another event date.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link to="/cyes/register">
                    <Button className="h-14 rounded-full bg-[#171411] px-8 font-sans text-base font-semibold text-white hover:bg-[#171411]/92">
                      Register now
                    </Button>
                  </Link>

                  <Link
                    to="/cyes/contact"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-black/12 bg-white/60 px-7 font-sans text-base font-semibold text-[#171411] backdrop-blur-sm transition-colors hover:bg-white/82"
                  >
                    Contact the team
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <div className={`${lightSurfaceClasses} px-4 py-4`}>
                    <Target className="h-5 w-5 text-cyes-green" />
                    <p className="mt-3 font-sans text-sm font-medium text-[#171411]/66">
                      Better summit structure
                    </p>
                  </div>
                  <div className={`${lightSurfaceClasses} px-4 py-4`}>
                    <Users className="h-5 w-5 text-cyes-blue" />
                    <p className="mt-3 font-sans text-sm font-medium text-[#171411]/66">
                      Clearer youth-enterprise focus
                    </p>
                  </div>
                  <div className={`${lightSurfaceClasses} px-4 py-4`}>
                    <Trophy className="h-5 w-5 text-cyes-yellow" />
                    <p className="mt-3 font-sans text-sm font-medium text-[#171411]/66">
                      Stronger pathways into action
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <SponsorsMarquee />
      <Footer />
    </div>
  );
};

export default CYESPage;
