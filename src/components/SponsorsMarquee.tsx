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

export const SponsorsMarquee = () => {
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
    <section className="relative py-16 bg-accent overflow-hidden">
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
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none" />

        <motion.div
          ref={trackRef}
          className="flex w-max"
          style={shouldReduceMotion ? undefined : { x }}
        >
          {sponsorsLoop.map((sponsor, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-6 w-36 h-24 rounded-xl flex items-center justify-center p-2 grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-150 bg-white"
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
