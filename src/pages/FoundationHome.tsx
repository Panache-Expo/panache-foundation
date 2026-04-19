import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import foundationLogo from "@/assets/foundationlogo.jpeg";
import flagshipLeftArt from "@/assets/foundation-flagship-left.svg";
import flagshipRightArt from "@/assets/foundation-flagship-right.svg";

const flagshipEvents = [
  {
    eyebrow: "Panache",
    title: "EXPO",
    meta: "6th Edition - 2026",
    description:
      "Panache Expo is a charitable organization dedicated to celebrating and advancing the beauty industry through education, recognition, and community empowerment.",
    ctaLabel: "Explore Expo",
    to: "/panache-expo",
  },
  {
    eyebrow: "Panache",
    title: "CYES",
    meta: "Cameroon Youth Entrepreneurial Summit & Awards",
    description:
      "Empowering the next generation of Cameroonian entrepreneurs through mentorship, networking, and recognition of outstanding achievements.",
    ctaLabel: "Explore CYES",
    to: "/cyes",
  },
];

const FoundationHome = () => {
  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#14110f]">
      <main className="relative overflow-hidden">
        <div className="mx-auto w-full bg-[#f7f9fc] pb-16 lg:pb-24 ">
          <div className="flex items-start justify-start px-12">
            <img
              src={foundationLogo}
              alt="Panache Expo Foundation logo"
              className="h-48 w-auto object-contain sm:h-52"
            />
          </div>

          <section className="relative mx-auto flex min-h-[50svh] max-w-5xl items-center justify-center py-14 text-center sm:min-h-[58svh] lg:min-h-[62svh]">
            <div className="max-w-4xl">
              <h1 className="font-display text-[clamp(2.4rem,5vw,4.9rem)] font-bold leading-[0.92] tracking-[-0.055em] text-[#11100e]">
                Panache Expo Foundation
              </h1>
              <p className="mx-auto mt-4 max-w-3xl font-sans text-[clamp(1.15rem,2vw,2rem)] font-medium leading-[1.18] tracking-[-0.03em] text-[#11100e]/92">
                Empowering communities through excellence in beauty, fashion, and
                youth entrepreneurship. Choose your path to discover our impactful
                initiatives.
              </p>
            </div>
          </section>

          <section className="relative py-14 sm:py-20">
            <img
              src={flagshipLeftArt}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute left-0 -bottom-8 hidden h-[36rem] w-auto opacity-40 lg:block xl:h-[41rem]"
            />
            <img
              src={flagshipRightArt}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute right-0 bottom-4 hidden h-[28rem] w-auto opacity-55 lg:block xl:h-[33rem]"
            />

            <div className="relative text-center">
              <h2 className="font-display text-[clamp(2rem,4.2vw,4rem)] font-bold leading-[0.94] tracking-[-0.05em] text-[#11100e]">
                Our Flagship Events
              </h2>
              <p className="mx-auto mt-3 max-w-2xl font-sans text-sm font-medium leading-relaxed text-[#11100e]/72 sm:text-base">
                Discover our transformative initiatives that celebrate talent and
                drive positive change.
              </p>
            </div>

            <div className="relative mt-14 grid gap-10 md:grid-cols-2 md:gap-16">
              {flagshipEvents.map((event, index) => (
                <article
                  key={event.title}
                  className="relative flex flex-col items-center text-center"
                >
                  <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#11100e]/58">
                    {event.eyebrow}
                  </p>
                  <h3 className="mt-1 font-sans text-[clamp(2.2rem,5vw,4.35rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-[#11100e]">
                    {event.title}
                  </h3>
                  <p className="mt-2 max-w-[24rem] font-sans text-[0.82rem] font-medium leading-snug text-[#11100e]/72 sm:text-sm">
                    {event.meta}
                  </p>
                  <p className="mt-4 max-w-[25rem] font-sans text-sm leading-relaxed text-[#11100e]/74 sm:text-[0.96rem]">
                    {event.description}
                  </p>

                  <Link to={event.to} className="mt-5 inline-flex">
                    <Button className="h-10 rounded-full bg-black px-5 font-sans text-sm font-semibold text-white hover:bg-black/90">
                      {event.ctaLabel}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-5xl py-16 text-center sm:py-24">
            <h2 className="font-display text-[clamp(2.2rem,4.6vw,4.2rem)] font-bold leading-[0.94] tracking-[-0.05em] text-[#11100e]">
              Our Mission
            </h2>
            <p className="mx-auto mt-5 max-w-4xl font-sans text-[clamp(1.15rem,2.2vw,2rem)] font-medium leading-[1.2] tracking-[-0.03em] text-[#11100e]/92">
              The Panache Expo Foundation is dedicated to fostering excellence,
              creativity, and entrepreneurship across Cameroon and beyond. Through
              our flagship events, we create platforms that celebrate talent,
              provide education, and build communities that drive positive change.
            </p>
          </section>

          {/* <Footer /> */}
        </div>
      </main>
    </div>
  );
};

export default FoundationHome;
