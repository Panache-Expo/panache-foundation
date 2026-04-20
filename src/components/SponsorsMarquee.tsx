import { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import sponsor1 from "@/assets/sponsors/sponsor1.jpeg";
import sponsor2 from "@/assets/sponsors/sponsor2.jpeg";
import sponsor3 from "@/assets/sponsors/sponsor3.jpeg";
import sponsor4 from "@/assets/sponsors/sponsor4.jpeg";
import sponsor5 from "@/assets/sponsors/sponsor5.jpeg";
import sponsor6 from "@/assets/sponsors/sponsor6.jpeg";
import sponsor7 from "@/assets/sponsors/sponsor7.jpeg";
import sponsor8 from "@/assets/sponsors/sponsor8.jpeg";
import sponsor9 from "@/assets/sponsors/sponsor9.jpeg";
import sponsor10 from "@/assets/sponsors/sponsor10.jpeg";
import sponsor11 from "@/assets/sponsors/sponsor11.jpeg";
import sponsor12 from "@/assets/sponsors/sponsor12.jpeg";
import sponsor13 from "@/assets/sponsors/sponsor13.jpeg";
import sponsor14 from "@/assets/sponsors/sponsor14.jpeg";
import sponsor15 from "@/assets/sponsors/sponsor15.jpeg";

const sponsors = [
  { name: "Sponsor 1", logo: sponsor1 },
  { name: "Sponsor 2", logo: sponsor2 },
  { name: "Sponsor 3", logo: sponsor3 },
  { name: "Sponsor 4", logo: sponsor4 },
  { name: "Sponsor 5", logo: sponsor5 },
  { name: "Sponsor 6", logo: sponsor6 },
  { name: "Sponsor 7", logo: sponsor7 },
  { name: "Sponsor 8", logo: sponsor8 },
  { name: "Sponsor 9", logo: sponsor9 },
  { name: "Sponsor 10", logo: sponsor10 },
  { name: "Sponsor 11", logo: sponsor11 },
  { name: "Sponsor 12", logo: sponsor12 },
  { name: "Sponsor 13", logo: sponsor13 },
  { name: "Sponsor 14", logo: sponsor14 },
  { name: "Sponsor 15", logo: sponsor15 },
];

const sponsorsLoop = [...sponsors, ...sponsors];

type SponsorsMarqueeVariant = "panache" | "cyes";

type SponsorsMarqueeProps = {
  variant?: SponsorsMarqueeVariant;
};

export const SponsorsMarquee = ({
  variant = "panache",
}: SponsorsMarqueeProps) => {
  const shouldReduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [singleLoopWidth, setSingleLoopWidth] = useState(0);
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 42,
    stiffness: 280,
  });
  const velocityFactor = useTransform(
    smoothVelocity,
    [-2800, -1600, 0, 1600, 2800],
    [-2.8, -1.35, 0, 1.35, 2.8],
  );
  const directionFactor = useRef(1);
  const x = useTransform(baseX, (value) => {
    if (!singleLoopWidth) {
      return "0px";
    }

    const wrappedOffset =
      ((value % singleLoopWidth) + singleLoopWidth) % singleLoopWidth;

    return `${-wrappedOffset}px`;
  });
  const isCyesVariant = variant === "cyes";
  const sectionBackgroundClassName = isCyesVariant
    ? "bg-[#f7f8f3]"
    : "bg-accent";
  const fadeGradientClassName = isCyesVariant
    ? "from-[#f7f8f3] to-transparent"
    : "from-muted/30 to-transparent";
  const sponsorCardClassName = isCyesVariant
    ? "bg-white/88 shadow-[0_16px_36px_rgba(17,16,14,0.07)]"
    : "bg-white";

  useEffect(() => {
    if (!trackRef.current) {
      return;
    }

    const track = trackRef.current;
    let frame = 0;

    const syncLoopWidth = () => {
      setSingleLoopWidth(track.scrollWidth / 2);
    };

    const queueLoopWidth = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncLoopWidth);
    };

    const resizeObserver = new ResizeObserver(queueLoopWidth);

    queueLoopWidth();
    resizeObserver.observe(track);
    window.addEventListener("resize", queueLoopWidth);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", queueLoopWidth);
    };
  }, []);

  useAnimationFrame((_, delta) => {
    if (shouldReduceMotion || !singleLoopWidth) {
      return;
    }

    const velocity = velocityFactor.get();

    if (velocity < -0.05) {
      directionFactor.current = -1;
    } else if (velocity > 0.05) {
      directionFactor.current = 1;
    }

    const speed = Math.abs(velocity + directionFactor.current*0.5) * 145;

    if (speed < 2) {
      return;
    }

    const moveBy = directionFactor.current * speed * (delta / 1000);
    const next = baseX.get() + moveBy;

    if (next <= -singleLoopWidth) {
      baseX.set(next + singleLoopWidth);
    } else if (next >= singleLoopWidth) {
      baseX.set(next - singleLoopWidth);
    } else {
      baseX.set(next);
    }
  });

  return (
    <section
      className={`relative overflow-hidden py-16 ${sectionBackgroundClassName}`}
    >
      {/* {isCyesVariant ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(21,109,59,0.1),transparent_24%),radial-gradient(circle_at_83%_22%,rgba(24,117,210,0.12),transparent_26%),radial-gradient(circle_at_48%_88%,rgba(255,178,0,0.1),transparent_22%),linear-gradient(180deg,rgba(247,248,243,0.92)_0%,rgba(247,248,243,1)_100%)]" />
      ) : null} */}
      <div className="mx-auto mb-14 flex max-w-7xl flex-col gap-8 px-6 md:mb-16 md:flex-row md:items-start md:justify-between md:gap-16">
        <div className="max-w-[34rem]">
          <h2 className="text-[#11100e]">
            <span className="block font-sans text-[clamp(3rem,7vw,4.75rem)] font-semibold leading-[0.92] tracking-[-0.05em]">
              Sponsors
            </span>
            <span className="block font-display text-[clamp(3.1rem,7.2vw,5rem)] font-bold leading-[0.88] tracking-[-0.045em]">
              &amp; Partners
            </span>
          </h2>
        </div>

        <p className="max-w-[34rem] font-sans text-[clamp(1.35rem,2.8vw,2rem)] font-medium leading-[1.2] tracking-[-0.03em] text-[#11100e] md:pt-2">
          Proudly supported by leading organizations championing beauty,
          fashion, and youth empowerment.
        </p>
      </div>

      <div className="relative">
        {/* Gradient fades on edges */}
        <div
          className={`pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-24 bg-gradient-to-r ${fadeGradientClassName}`}
        />
        <div
          className={`pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-24 bg-gradient-to-l ${fadeGradientClassName}`}
        />

        <motion.div
          ref={trackRef}
          className="flex w-max"
          style={shouldReduceMotion ? undefined : { x }}
        >
          {sponsorsLoop.map((sponsor, index) => (
            <div
              key={index}
              className={`mx-6 flex h-24 w-36 flex-shrink-0 items-center justify-center rounded-xl p-2 opacity-70 grayscale transition-all duration-150 hover:opacity-100 hover:grayscale-0 ${sponsorCardClassName}`}
            >
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
