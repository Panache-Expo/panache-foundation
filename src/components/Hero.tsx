import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-beauty.png";
import { Calendar, MapPin } from "lucide-react";
import panacheLogo from "@/assets/PanacheHeroLogo.svg";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="bg-[#2d2a28] sticky top-0">
      <div className="mx-auto">
        <div className="relative overflow-hidden bg-[#161311] ">
          <img
            src={heroImage}
            alt="Panache Expo audience celebrating beauty, fashion, and entrepreneurship"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/65" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_34%)]" />

          <div className="relative flex min-h-screen flex-col p-2 pb-24 md:p-4 md:pb-28 lg:p-6 lg:pb-32">
            <div className="flex items-start gap-4">
              <img
                src={panacheLogo}
                alt="Panache Expo logo"
                className="h-14 w-auto object-contain md:h-16"
              />

              <div className="space-y-1 pt-1 text-white">
                <p className="text-lg font-semibold md:text-xl">Panache Expo</p>
                <div className="flex items-center gap-2 text-sm text-white/88 md:text-base">
                  <Calendar className="h-4 w-4" />
                  <span>July 16th - 18th 2026</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/80 md:text-base">
                  <MapPin className="h-4 w-4" />
                  <span>Chariot Hotel - Buea Cameroon</span>
                </div>
              </div>
            </div>

            <div className="mt-auto max-w-3xl pt-20 md:pt-28">
              <h1 className=" font-sans text-5xl font-bold leading-[0.92] tracking-[-0.03em] text-white md:text-7xl lg:text-[5.4rem]">
                Celebrating <span className="font-display text-[#f4e93f]">Beauty,</span>
                <br />
                <span className=" font-display text-[#f4e93f]">Fashion &amp; Entrepreneurship</span>
              </h1>

              {/* <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
                Workshops, pageants, prestigious awards, and unforgettable live moments
                for beauty professionals, fashion creatives, and skincare lovers.
              </p> */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/panache-expo/register">
                  <Button
                    size="lg"
                    className="h-12 w-52 rounded-full bg-white px-7 text-base font-semibold text-[#211d1b] shadow-none hover:bg-white/90"
                  >
                    Secure Your Spot
                  </Button>
                </Link>
                <Link to="/panache-expo/panache-dor">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-52 rounded-full border-white/60 bg-white/15 px-7 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#211d1b] hover:border-white hover:shadow-lg hover:shadow-white/20"
                  >
                    Explore
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          {/* <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-black/90" /> */}
        </div>

      </div>
    </section>
  );
};
