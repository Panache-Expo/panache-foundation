import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import {
  PANACHE_SUPPORT_WHATSAPP_HREF,
  PANACHE_SUPPORT_WHATSAPP_NUMBER,
} from "@/lib/registration-links";
import foundationLogo from "@/assets/foundationlogo.jpeg";
import flagshipLeftArt from "@/assets/foundation-flagship-left.svg";
import flagshipRightArt from "@/assets/foundation-flagship-right.svg";
import kovrLogo from "@/assets/sponsors/kovr-cosmetics.svg";
import kemLogo from "@/assets/sponsors/kem-logo-blanc.png";

const flagshipEvents = [
  {
    eyebrow: "Panache",
    title: "EXPO",
    meta: "6th Edition - 2026",
    description:
      "Panache Expo is a charitable organization dedicated to celebrating and advancing the beauty industry through education, recognition, and community empowerment.",
    ctaLabel: "Explore Expo",
    to: "/panache-expo",
    accentClassName: "from-[#f4e93f]/28 to-[#8241B6]/12",
  },
  {
    eyebrow: "Panache",
    title: "CYES",
    meta: "Cameroon Youth Entrepreneurial Summit & Awards",
    description:
      "Empowering the next generation of Cameroonian entrepreneurs through mentorship, networking, and recognition of outstanding achievements.",
    ctaLabel: "Explore CYES",
    to: "/cyes",
    accentClassName: "from-[#1875D2]/16 to-[#156D3B]/12",
  },
];

const foundationPillars = [
  {
    label: "Beauty Excellence",
    description: "Competitions, workshops, and recognition built with taste and structure.",
  },
  {
    label: "Youth Enterprise",
    description: "Programs that make entrepreneurship more visible, useful, and reachable.",
  },
  {
    label: "Direct Access",
    description: "Website routes and WhatsApp support designed for fast decision-making.",
  },
];

const officialPanacheSponsors = [
  { name: "KOVR Cosmetics", logo: kovrLogo, className: "bg-[#faf6ef]" },
  { name: "KEM", logo: kemLogo, className: "bg-[#171411]" },
];

const FoundationHome = () => {
  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#14110f]">
      <main className="relative overflow-hidden">
        <a
          href={PANACHE_SUPPORT_WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 rounded-full bg-[#171411] px-5 py-3 font-sans text-sm font-semibold text-white shadow-[0_18px_42px_rgba(17,16,14,0.24)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#171411]/92"
        >
          <MessageCircle className="h-5 w-5 text-[#25D366]" />
          Chat on WhatsApp
        </a>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(130,65,182,0.08),transparent_24%),radial-gradient(circle_at_85%_16%,rgba(24,117,210,0.08),transparent_22%),linear-gradient(180deg,#f9fbfd_0%,#f4f6f9_48%,#edf1f5_100%)]" />

        <div className="mx-auto w-full bg-[linear-gradient(180deg,#f8fafc_0%,#f5f7fa_56%,#eff2f6_100%)]">
          <div className="max-w-full px-10 sm:px-14 lg:px-18">
            <div className="flex items-start justify-start pt-6 sm:pt-8">
              <div className="inline-flex items-center gap-4 rounded-[1.65rem] border border-black/8 bg-white/78 px-4 py-3 shadow-[0_18px_42px_rgba(17,16,14,0.06)] backdrop-blur-sm sm:px-5 sm:py-4">
                <img
                  src={foundationLogo}
                  alt="Panache Foundation logo"
                  className="h-16 w-auto object-contain sm:h-20"
                />
                <div className="hidden min-w-[12rem] text-left sm:block">
                  <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#11100e]/52">
                    Panache Foundation
                  </p>
                  <p className="mt-1 font-sans text-sm font-medium leading-snug text-[#11100e]/70">
                    Beauty, culture, and youth enterprise under one foundation.
                  </p>
                </div>
              </div>
            </div>

            <section className="relative pb-16 pt-4 sm:pb-20 lg:pt-8">
              

              <div className="relative grid gap-8 lg:grid-cols-[1.04fr,0.96fr] lg:items-end">
                <div className="max-w-[42rem]">
                  <p className="font-sans text-[0.76rem] font-semibold uppercase tracking-[0.24em] text-[#11100e]/56">
                    Panache Foundation
                  </p>
                  <h1 className="mt-4 text-[#11100e]">
                    <span className="block font-sans text-[clamp(2.8rem,6vw,5.3rem)] font-semibold leading-[0.9] tracking-[-0.07em]">
                      Beauty, culture,
                    </span>
                    <span className="block font-display text-[clamp(3rem,6.4vw,5.8rem)] font-bold leading-[0.88] tracking-[-0.06em]">
                      and youth enterprise
                    </span>
                    <span className="block font-sans text-[clamp(2.8rem,6vw,5.3rem)] font-semibold leading-[0.9] tracking-[-0.07em]">
                      under one foundation.
                    </span>
                  </h1>

                  <p className="mt-6 max-w-[36rem] font-sans text-[clamp(1.04rem,1.9vw,1.32rem)] leading-[1.5] text-[#11100e]/72">
                    Panache Foundation brings together platforms that celebrate
                    beauty excellence, entrepreneurial ambition, and community
                    impact through experiences that feel thoughtful, visible, and
                    useful.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link to="/panache-expo" className="inline-flex">
                      <Button className="h-12 rounded-full bg-[#171411] px-6 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92">
                        Explore Panache Expo
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Button>
                    </Link>

                    <a
                      href={PANACHE_SUPPORT_WHATSAPP_HREF}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button
                        variant="outline"
                        className="h-12 rounded-full border-black/10 bg-white/80 px-6 font-sans text-sm font-semibold text-[#11100e] hover:bg-white"
                      >
                        <MessageCircle className="mr-2 h-4 w-4 text-[#25D366]" />
                        Talk on WhatsApp
                      </Button>
                    </a>
                  </div>

                  <div className="mt-9 grid gap-3 sm:grid-cols-3">
                    {foundationPillars.map((pillar) => (
                      <div
                        key={pillar.label}
                        className="rounded-[1.45rem] border border-black/8 bg-white/72 px-4 py-4 shadow-[0_14px_30px_rgba(17,16,14,0.05)]"
                      >
                        <p className="font-sans text-sm font-semibold tracking-[-0.03em] text-[#11100e]">
                          {pillar.label}
                        </p>
                        <p className="mt-2 font-sans text-sm leading-relaxed text-[#11100e]/64">
                          {pillar.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[2rem] border border-black/8 bg-white/76 p-6 shadow-[0_20px_48px_rgba(17,16,14,0.06)]">
                    <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.22em] text-[#8241B6]">
                      Official Panache Expo Sponsors
                    </p>
                    <p className="mt-3 max-w-[28rem] font-sans text-sm leading-relaxed text-[#11100e]/66">
                      The brands directly backing the Panache Expo 2026 experience.
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {officialPanacheSponsors.map((sponsor) => (
                        <div
                          key={sponsor.name}
                          className={`flex overflow-hidden min-h-[7rem] max-h-[20rem] items-center justify-center rounded-[1.5rem] border border-black/8 ${sponsor.className}`}
                        >
                          <img
                            src={sponsor.logo}
                            alt={sponsor.name}
                            className=" w-full object-contain "
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-black/8 bg-[#171411] px-6 py-6 text-white shadow-[0_20px_48px_rgba(17,16,14,0.1)]">
                    <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.22em] text-white/56">
                      Prefer the fast route?
                    </p>
                    <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[0.94] tracking-[-0.05em]">
                      Go straight to the WhatsApp bot.
                    </h2>
                    <p className="mt-4 max-w-[28rem] font-sans text-sm leading-relaxed text-white/72 md:text-base">
                      If someone does not want to browse, they can still register,
                      ask questions, and get directed quickly through WhatsApp.
                    </p>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <a
                        href={PANACHE_SUPPORT_WHATSAPP_HREF}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex"
                      >
                        <Button className="h-11 rounded-full bg-white px-5 font-sans text-sm font-semibold text-[#171411] hover:bg-white/92">
                          <MessageCircle className="mr-2 h-4 w-4 text-[#25D366]" />
                          Open WhatsApp bot
                        </Button>
                      </a>
                      <span className="font-sans text-sm font-medium text-white/68">
                        {PANACHE_SUPPORT_WHATSAPP_NUMBER}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="relative py-6 sm:py-10">
              <img
                src={flagshipLeftArt}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute left-[-4rem] top-[6rem] hidden h-[34rem] w-auto opacity-28 lg:block xl:h-[39rem]"
              />
              <img
                src={flagshipRightArt}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -right-[2rem] top-[7rem] hidden h-[24rem] w-auto opacity-40 lg:block xl:h-[30rem]"
              />
              <div className="text-center">
                <p className="font-sans text-[0.76rem] font-semibold uppercase tracking-[0.24em] text-[#11100e]/54">
                  Flagship Platforms
                </p>
                <h2 className="mt-3 font-display text-[clamp(2.1rem,4.4vw,4.2rem)] font-bold leading-[0.94] tracking-[-0.05em] text-[#11100e]">
                  Our flagship events
                </h2>
                <p className="mx-auto mt-3 max-w-2xl font-sans text-sm font-medium leading-relaxed text-[#11100e]/70 sm:text-base">
                  Two distinct routes, one shared ambition: build visibility,
                  opportunity, and a stronger creative and entrepreneurial ecosystem.
                </p>
              </div>

              <div className="mt-12 grid gap-6 lg:grid-cols-2">
                {flagshipEvents.map((event) => (
                  <article
                    key={event.title}
                    className="relative overflow-hidden rounded-[2rem] border border-black/8 bg-white/80 p-7 shadow-[0_18px_42px_rgba(17,16,14,0.06)]"
                  >
                    <div
                      className={`absolute inset-x-6 top-0 h-24 rounded-b-[1.75rem] bg-gradient-to-b ${event.accentClassName} opacity-90`}
                    />
                    <div className="relative">
                      <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#11100e]/54">
                        {event.eyebrow}
                      </p>
                      <h3 className="mt-2 font-sans text-[clamp(2.2rem,4.8vw,4.1rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-[#11100e]">
                        {event.title}
                      </h3>
                      <p className="mt-2 max-w-[24rem] font-sans text-[0.84rem] font-medium leading-snug text-[#11100e]/70 sm:text-sm">
                        {event.meta}
                      </p>
                      <p className="mt-5 max-w-[30rem] font-sans text-sm leading-relaxed text-[#11100e]/74 sm:text-[0.98rem]">
                        {event.description}
                      </p>

                      <Link to={event.to} className="mt-6 inline-flex">
                        <Button className="h-11 rounded-full bg-[#171411] px-5 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92">
                          {event.ctaLabel}
                          <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="relative py-16 sm:py-24">
              <div className="rounded-[2.4rem] border border-black/8 bg-[#171411] px-6 py-10 text-center text-white shadow-[0_26px_70px_rgba(17,16,14,0.14)] md:px-10 md:py-12">
                <p className="font-sans text-[0.76rem] font-semibold uppercase tracking-[0.22em] text-white/54">
                  Our Mission
                </p>
                <h2 className="mt-4 font-display text-[clamp(2.3rem,4.8vw,4.6rem)] font-bold leading-[0.94] tracking-[-0.05em]">
                  Panache Expo Foundation
                </h2>
                <p className="mx-auto mt-5 max-w-4xl font-sans text-[clamp(1.05rem,2vw,1.45rem)] font-medium leading-[1.4] tracking-[-0.02em] text-white/74">
                  The Panache Expo Foundation is dedicated to fostering excellence,
                  creativity, and entrepreneurship across Cameroon and beyond.
                  Through our flagship events, we create platforms that celebrate
                  talent, provide education, and build communities that drive
                  positive change.
                </p>
              </div>
            </section>  
          </div>

          <Footer variant="cyes" />
        </div>
      </main>
    </div>
  );
};

export default FoundationHome;
