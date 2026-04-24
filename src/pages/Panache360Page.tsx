import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import panache360A from "@/assets/panache360-1.jpeg";
import panache360B from "@/assets/panache360-2.jpeg";
import panache360C from "@/assets/panache360-3.jpeg";
import { competitionRegistrationLinks } from "@/lib/registration-links";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const heroFacts = [
  { value: "8", label: "live contest categories" },
  { value: "Live", label: "judged under pressure" },
  { value: "WhatsApp", label: "confirmation after site submission" },
];

const contestTracks = [
  {
    number: "01",
    title: "Barbing",
    description:
      "Clean fades, shape control, finishing discipline, and composure under time pressure.",
  },
  {
    number: "02",
    title: "Beauty Makeup",
    description:
      "Skin finish, balance, color control, and polished execution built for stage visibility.",
  },
  {
    number: "03",
    title: "SFX Makeup",
    description:
      "Transformative thinking, texture play, and bold technical decisions that still read cleanly.",
  },
  {
    number: "04",
    title: "Braiding",
    description:
      "Parting precision, grip consistency, neatness, and speed across a complete live presentation.",
  },
  {
    number: "05",
    title: "Artistic Hairstyling",
    description:
      "Shape, editorial form, finish, and the ability to create a strong visual statement quickly.",
  },
  {
    number: "06",
    title: "Wig Installation",
    description:
      "Melt, placement, blend, and refinement that can withstand close public scrutiny on the day.",
  },
  {
    number: "07",
    title: "Nails Installation",
    description:
      "Structure, shape, detailing, and control from base work through the final beauty finish.",
  },
  {
    number: "08",
    title: "Lash Extensions Installation",
    description:
      "Placement symmetry, lash direction, density balance, and a clean, elegant final result.",
  },
];

const formatSteps = [
  {
    number: "01",
    title: "Choose the category that matches your strongest craft.",
    description:
      "Start with the discipline where your work is sharpest. A clearer application always reads stronger than a vague one.",
  },
  {
    number: "02",
    title: "Submit your profile, links, and motivation on the site.",
    description:
      "We save your application first so your details are already in the system before you continue to WhatsApp confirmation.",
  },
  {
    number: "03",
    title: "Submit details and continue to WhatsApp.",
    description:
      "Once the form is in, you are routed directly to WhatsApp to confirm your contest entry.",
  },
];

const judgingPillars = [
  "Technical precision and finish",
  "Creative interpretation and originality",
  "Control under time pressure",
  "Presentation quality on the day",
  "Consistency from start to final reveal",
];

const editorialMotion = {
  ease: [0.22, 1, 0.36, 1] as const,
  duration: 0.9,
};

const lightSurfaceClasses =
  "rounded-[2rem] border border-black/10 bg-white/70 shadow-[0_24px_60px_rgba(17,16,14,0.08)] backdrop-blur-sm";

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#8241B6]">
    {children}
  </p>
);

const Panache360Page = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-[#f4f3ef] text-[#171411]">
      <Header />

      <main className="overflow-hidden">
        <section className="relative px-4 pb-20 pt-32 md:px-6 md:pb-24 md:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_14%_16%,rgba(130,65,182,0.18),transparent_31%),radial-gradient(circle_at_84%_12%,rgba(214,176,106,0.14),transparent_22%),linear-gradient(180deg,#f7f5f1_0%,#f4f3ef_100%)]" />
          <div className="pointer-events-none absolute right-[-12rem] top-[11rem] h-[25rem] w-[25rem] rounded-full bg-[radial-gradient(circle,rgba(130,65,182,0.12),transparent_70%)] blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl gap-10 xl:grid-cols-[0.94fr,1.06fr] xl:items-end">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 38 }}
              animate={{ opacity: 1, y: 0 }}
              transition={editorialMotion}
              className="max-w-[40rem]"
            >
              <SectionLabel>Panache 360 Beauty Contest</SectionLabel>

              <h1 className="mt-5 font-sans text-[clamp(3.8rem,8vw,7.4rem)] font-semibold leading-[0.84] tracking-[-0.08em] text-[#171411]">
                PANACHE 360
                <span className="block font-display text-[0.94em] tracking-[-0.06em] text-[#24172B]">
                  Beauty Contest
                </span>
              </h1>

              <p className="mt-7 max-w-[34rem] font-sans text-[clamp(1.08rem,2vw,1.38rem)] leading-[1.45] text-[#171411]/72">
                A premium live platform for beauty specialists ready to prove
                technique, control, and creative range in front of judges, audience,
                and industry attention.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to={competitionRegistrationLinks.panache360.path}>
                  <Button className="h-14 rounded-full bg-[#171411] px-8 font-sans text-base font-semibold text-white hover:bg-[#171411]/92">
                    Register for Panache 360
                  </Button>
                </Link>

                <a
                  href="#tracks"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-black/12 bg-white/55 px-7 font-sans text-base font-semibold text-[#171411] backdrop-blur-sm transition-colors hover:bg-white/78"
                >
                  Explore categories
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {heroFacts.map((fact, index) => (
                  <motion.div
                    key={fact.label}
                    initial={
                      shouldReduceMotion
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 24 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      ...editorialMotion,
                      delay: shouldReduceMotion ? 0 : 0.1 + index * 0.08,
                    }}
                    className={`${lightSurfaceClasses} px-5 py-5`}
                  >
                    <p className="font-sans text-[1.95rem] font-semibold leading-none tracking-[-0.06em] text-[#171411]">
                      {fact.value}
                    </p>
                    <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/58">
                      {fact.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 34 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...editorialMotion, delay: shouldReduceMotion ? 0 : 0.12 }}
              className="mx-auto w-full max-w-[44rem]"
            >
              <div className="grid gap-4 lg:grid-cols-[0.72fr,1fr]">
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...editorialMotion, delay: shouldReduceMotion ? 0 : 0.18 }}
                  className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/70 shadow-[0_28px_80px_rgba(17,16,14,0.12)]"
                >
                  <img
                    src={panache360C}
                    alt="Panache 360 barbering moment"
                    className="h-full w-full object-cover"
                  />
                </motion.div>

                <div className="flex flex-col gap-4">
                  <motion.div
                    initial={
                      shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...editorialMotion, delay: shouldReduceMotion ? 0 : 0.24 }}
                    className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/70 shadow-[0_28px_80px_rgba(17,16,14,0.12)]"
                  >
                    <img
                      src={panache360B}
                      alt="Panache 360 beauty makeup showcase"
                      className="h-full w-full object-cover"
                    />
                  </motion.div>

                  <div className="grid gap-4 sm:grid-cols-[1.08fr,0.92fr]">
                    <motion.div
                      initial={
                        shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        ...editorialMotion,
                        delay: shouldReduceMotion ? 0 : 0.3,
                      }}
                      className="overflow-hidden rounded-[2rem] bg-[#24172B] px-6 py-6 text-white shadow-[0_30px_90px_rgba(36,23,43,0.34)]"
                    >
                      <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[#d6b06a]">
                        Structured entry
                      </p>
                      <h2 className="mt-4 font-sans text-[clamp(1.5rem,2vw,2rem)] font-semibold leading-[1] tracking-[-0.05em]">
                        Cleaner journey. Stronger signal.
                      </h2>
                      <p className="mt-4 font-sans text-[0.98rem] leading-relaxed text-white/72">
                        Submit your details on the site first, then continue in
                        WhatsApp. The flow is simpler, faster, and easier to review.
                      </p>

                      <div className="mt-6 flex items-center gap-2 font-sans text-sm font-semibold text-white">
                        <span>Contest entry now open</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={
                        shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        ...editorialMotion,
                        delay: shouldReduceMotion ? 0 : 0.36,
                      }}
                      className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/70 shadow-[0_28px_80px_rgba(17,16,14,0.12)]"
                    >
                      <img
                        src={panache360A}
                        alt="Panache 360 tattooing and detailing work"
                        className="h-full w-full object-cover"
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.94fr,1.06fr]">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={editorialMotion}
            >
              <SectionLabel>The proposition</SectionLabel>
              <h2 className="mt-4 max-w-[11ch] font-sans text-[clamp(2.8rem,5vw,4.9rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-[#171411]">
                Built for live pressure and visible craft.
              </h2>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2">
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ ...editorialMotion, delay: shouldReduceMotion ? 0 : 0.06 }}
                className={`${lightSurfaceClasses} p-7`}
              >
                <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#8241B6]">
                  Why this contest exists
                </p>
                <p className="mt-5 font-sans text-[1.25rem] font-medium leading-[1.28] tracking-[-0.04em] text-[#171411]">
                  Panache 360 is meant to reward technique that still holds up when the room
                  is watching, the clock is running, and the final reveal has to speak for
                  itself.
                </p>
              </motion.div>

              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ ...editorialMotion, delay: shouldReduceMotion ? 0 : 0.12 }}
                className="rounded-[2rem] bg-[#24172B] px-7 py-7 text-white shadow-[0_26px_80px_rgba(36,23,43,0.18)]"
              >
                <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#d6b06a]">
                  Who should enter
                </p>
                <p className="mt-5 font-sans text-[1.25rem] font-medium leading-[1.28] tracking-[-0.04em] text-white">
                  Specialists with a clear lane, a solid body of work, and the confidence to
                  turn practice into performance on a Panache stage.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="tracks" className="px-4 py-20 md:px-6 md:py-24">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={editorialMotion}
              className="grid gap-5 lg:grid-cols-[0.82fr,1.18fr] lg:items-end"
            >
              <div>
                <SectionLabel>Eight ways to prove mastery</SectionLabel>
                <h2 className="mt-4 max-w-[12ch] font-sans text-[clamp(2.8rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-[#171411]">
                  The contest is broad, but every lane is sharply defined.
                </h2>
              </div>

              <p className="max-w-[36rem] font-sans text-[1.05rem] leading-relaxed text-[#171411]/66 lg:ml-auto">
                No filler categories. Each track is meant to reward a specific beauty skill
                under public pressure, with clarity around what great execution actually looks
                like.
              </p>
            </motion.div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {contestTracks.map((track, index) => (
                <motion.article
                  key={track.title}
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.18 }}
                  transition={{
                    ...editorialMotion,
                    delay: shouldReduceMotion ? 0 : index * 0.04,
                  }}
                  className={`${lightSurfaceClasses} min-h-[16rem] p-6`}
                >
                  <p className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-[#8241B6]/78">
                    {track.number}
                  </p>
                  <h3 className="mt-4 font-sans text-[1.5rem] font-semibold leading-[1.02] tracking-[-0.05em] text-[#171411]">
                    {track.title}
                  </h3>
                  <p className="mt-4 font-sans text-[0.98rem] leading-relaxed text-[#171411]/62">
                    {track.description}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-6 md:py-24">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.22 }}
            transition={editorialMotion}
            className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-[#24172B] px-6 py-8 text-white shadow-[0_34px_120px_rgba(36,23,43,0.28)] md:px-10 md:py-12"
          >
            <div className="grid gap-10 lg:grid-cols-[0.88fr,1.12fr]">
              <div className="max-w-[24rem]">
                <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#d6b06a]">
                  Competition format
                </p>
                <h2 className="mt-4 font-sans text-[clamp(2.7rem,4.4vw,4.7rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-white">
                  A cleaner route from application to stage.
                </h2>
                <p className="mt-5 font-sans text-[1rem] leading-relaxed text-white/70">
                  From first submission to final reveal, the process is meant to feel
                  simple, direct, and completely focused on the competition itself.
                </p>
              </div>

              <div className="grid gap-4">
                {formatSteps.map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial={
                      shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 28 }
                    }
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.28 }}
                    transition={{
                      ...editorialMotion,
                      delay: shouldReduceMotion ? 0 : index * 0.06,
                    }}
                    className="grid gap-4 rounded-[1.65rem] border border-white/12 bg-white/[0.06] p-5 md:grid-cols-[auto,1fr]"
                  >
                    <p className="font-sans text-[1.4rem] font-semibold leading-none tracking-[-0.05em] text-[#d6b06a]">
                      {step.number}
                    </p>
                    <div>
                      <h3 className="font-sans text-[1.16rem] font-semibold leading-[1.2] tracking-[-0.04em] text-white">
                        {step.title}
                      </h3>
                      <p className="mt-3 max-w-[44rem] font-sans text-[0.95rem] leading-relaxed text-white/66">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="px-4 py-20 md:px-6 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.98fr,1.02fr] lg:items-center">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={editorialMotion}
              className="overflow-hidden rounded-[2.2rem] border border-black/10 bg-white/70 shadow-[0_26px_90px_rgba(17,16,14,0.1)]"
            >
              <img
                src={panache360A}
                alt="Panache 360 detailed beauty artistry"
                className="h-full w-full object-cover"
              />
            </motion.div>

            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ ...editorialMotion, delay: shouldReduceMotion ? 0 : 0.08 }}
            >
              <SectionLabel>What judges reward</SectionLabel>
              <h2 className="mt-4 max-w-[11ch] font-sans text-[clamp(2.8rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-[#171411]">
                Strong work, not noise.
              </h2>
              <p className="mt-5 max-w-[34rem] font-sans text-[1.05rem] leading-relaxed text-[#171411]/68">
                The competition should feel elevated, but the judging still comes back to the
                work itself. Finish, control, originality, and how well the result holds up
                under direct inspection.
              </p>

              <div className="mt-8 grid gap-3">
                {judgingPillars.map((pillar, index) => (
                  <motion.div
                    key={pillar}
                    initial={
                      shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }
                    }
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      ...editorialMotion,
                      delay: shouldReduceMotion ? 0 : index * 0.04,
                    }}
                    className={`${lightSurfaceClasses} flex items-center gap-4 px-5 py-4`}
                  >
                    <CheckCircle2 className="h-5 w-5 text-[#8241B6]" />
                    <p className="font-sans text-[1rem] font-medium leading-relaxed text-[#171411]">
                      {pillar}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 pb-20 pt-8 md:px-6 md:pb-28">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={editorialMotion}
            className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-black/10 bg-white/72 px-6 py-8 shadow-[0_30px_120px_rgba(17,16,14,0.08)] md:px-10 md:py-12"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_18%_20%,rgba(130,65,182,0.13),transparent_34%),radial-gradient(circle_at_84%_86%,rgba(214,176,106,0.12),transparent_24%)]" />

            <div className="relative grid gap-8 lg:grid-cols-[0.95fr,1.05fr] lg:items-end">
              <div>
                <SectionLabel>Final call</SectionLabel>
                <h2 className="mt-4 max-w-[10ch] font-sans text-[clamp(2.8rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-[#171411]">
                  Ready to compete with clarity?
                </h2>
              </div>

              <div className="lg:ml-auto lg:max-w-[38rem]">
                <p className="font-sans text-[1.08rem] leading-relaxed text-[#171411]/68">
                  Panache 360 is built for specialists who want a sharper stage, a
                  cleaner application flow, and a contest experience that lets the work
                  lead the conversation.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link to={competitionRegistrationLinks.panache360.path}>
                    <Button className="h-14 rounded-full bg-[#171411] px-8 font-sans text-base font-semibold text-white hover:bg-[#171411]/92">
                      Start application
                    </Button>
                  </Link>

                  <Link
                    to="/panache-expo/contact"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-black/12 bg-white/60 px-7 font-sans text-base font-semibold text-[#171411] backdrop-blur-sm transition-colors hover:bg-white/80"
                  >
                    Contact the team
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <div className={`${lightSurfaceClasses} px-4 py-4`}>
                    <Sparkles className="h-5 w-5 text-[#8241B6]" />
                    <p className="mt-3 font-sans text-sm font-medium text-[#171411]/66">
                      Subtle purple atmosphere
                    </p>
                  </div>
                  <div className={`${lightSurfaceClasses} px-4 py-4`}>
                    <Users className="h-5 w-5 text-[#8241B6]" />
                    <p className="mt-3 font-sans text-sm font-medium text-[#171411]/66">
                      Cleaner stage-first structure
                    </p>
                  </div>
                  <div className={`${lightSurfaceClasses} px-4 py-4`}>
                    <Trophy className="h-5 w-5 text-[#8241B6]" />
                    <p className="mt-3 font-sans text-sm font-medium text-[#171411]/66">
                      Sharper competition positioning
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Panache360Page;
