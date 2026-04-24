import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  ExpoPageHero,
  ExpoSurface,
} from "@/components/registration/ExpoPageShell";
import { Button } from "@/components/ui/button";
import { competitionRegistrationLinks } from "@/lib/registration-links";
import heroImage from "@/assets/hero-beauty.png";
import { motion } from "motion/react";
import {
  ArrowRight,
  Crown,
  Scissors,
  Sparkles,
  Store,
  Ticket,
} from "lucide-react";
import { Link } from "react-router-dom";

const registrationOptions = [
  {
    title: competitionRegistrationLinks.missPanache.title,
    description: competitionRegistrationLinks.missPanache.description,
    path: competitionRegistrationLinks.missPanache.path,
    icon: Crown,
    meta: "Contestant application",
    accent: "from-[#f4e93f]/28 to-[#8241B6]/20",
  },
  {
    title: competitionRegistrationLinks.fashionNight.title,
    description: competitionRegistrationLinks.fashionNight.description,
    path: competitionRegistrationLinks.fashionNight.path,
    icon: Scissors,
    meta: "Designer application",
    accent: "from-[#8241B6]/18 to-[#171411]/8",
  },
  {
    title: competitionRegistrationLinks.panache360.title,
    description: competitionRegistrationLinks.panache360.description,
    path: competitionRegistrationLinks.panache360.path,
    icon: Sparkles,
    meta: "Competition application",
    accent: "from-[#f4e93f]/24 to-[#171411]/10",
  },
];

export const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-[#f4f3ef]">
      <Header />

      <ExpoPageHero
        eyebrow="Panache registration"
        title={
          <>
            Choose Your
            <br />
            <span className="font-display text-[#f4e93f]">Stage</span>
          </>
        }
        description="Start your application on the website first, then continue through our WhatsApp registration flow. Every competition now uses the same simple two-step journey."
        image={heroImage}
        panelLabel="Registration Flow"
        panelTitle="Start here. Continue on WhatsApp."
        panelDescription="Pick the experience that fits you, save your application details, and continue straight into WhatsApp once your form is confirmed."
        panelItems={[
          { label: "Step 1", value: "Choose competition" },
          { label: "Step 2", value: "Save application" },
          { label: "Step 3", value: "Confirm on WhatsApp" },
        ]}
      />

      <section className="px-6 pb-20 pt-10 md:pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-3 text-center md:mb-10">
            <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.26em] text-[#8241B6]">
              Active entries
            </p>
            <h2 className="font-sans text-[clamp(2rem,4vw,3.8rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-[#171411]">
              Applications built for beauty, fashion, and stage presence.
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {registrationOptions.map((option, index) => (
              <motion.article
                key={option.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <ExpoSurface className="flex h-full flex-col overflow-hidden">
                  <div className={`absolute inset-x-6 top-0 h-32 rounded-b-[2rem] bg-gradient-to-b ${option.accent} opacity-80`} />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#171411]/46">
                        0{index + 1}
                      </span>
                      <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-[#171411] text-white shadow-[0_18px_35px_rgba(23,20,17,0.16)]">
                        <option.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-8 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#8241B6]">
                      {option.meta}
                    </p>
                    <h3 className="mt-3 font-sans text-[clamp(1.8rem,3vw,2.5rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
                      {option.title}
                    </h3>
                    <p className="mt-4 font-sans text-[0.98rem] leading-relaxed text-[#171411]/68">
                      {option.description}
                    </p>
                  </div>

                  <div className="mt-8 flex items-end justify-between gap-4 border-t border-black/8 pt-6">
                    <span className="font-sans text-sm text-[#171411]/56">
                      Website application first.
                    </span>
                    <Button
                      asChild
                      className="h-12 rounded-full bg-[#171411] px-6 font-sans text-sm font-semibold text-white shadow-none hover:bg-[#171411]/92"
                    >
                      <Link to={option.path}>
                        Start now
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </ExpoSurface>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <ExpoSurface className="overflow-hidden">
            <div className="grid gap-8 lg:grid-cols-[1fr,auto] lg:items-end">
              <div>
                <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.26em] text-[#8241B6]">
                  Need another route?
                </p>
                <h2 className="mt-3 font-sans text-[clamp(2rem,3vw,2.9rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-[#171411]">
                  Not applying for a competition?
                </h2>
                <p className="mt-3 max-w-2xl font-sans text-[0.98rem] leading-relaxed text-[#171411]/68">
                  Use these direct paths for exhibition stands, CYES participation, or a quick conversation with the Panache team.
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-[#171411] text-white">
                <Ticket className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-[#171411] px-6 font-sans text-sm font-semibold text-white shadow-none hover:bg-[#171411]/92"
              >
                <Link to={competitionRegistrationLinks.exhibitionStands.path}>
                  <Store className="h-4 w-4" />
                  Book Exhibition Stand
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-black/12 bg-white/70 px-6 font-sans text-sm font-semibold text-[#171411] hover:bg-white"
              >
                <Link to="/cyes/register">Register for CYES</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-black/12 bg-white/70 px-6 font-sans text-sm font-semibold text-[#171411] hover:bg-white"
              >
                <Link to="/panache-expo/contact">Contact the Team</Link>
              </Button>
            </div>
          </ExpoSurface>
        </div>
      </section>

      <Footer />
    </div>
  );
};
