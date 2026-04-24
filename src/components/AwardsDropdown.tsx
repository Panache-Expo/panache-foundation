import { useRef, useState } from "react";

import panacheAwardNight01 from "@/assets/panache-award-night/panache-award-night-2025-01.jpg";
import panacheAwardNight02 from "@/assets/panache-award-night/panache-award-night-2025-02.jpg";
import panacheAwardNight03 from "@/assets/panache-award-night/panache-award-night-2025-03.jpg";
import panacheAwardNight04 from "@/assets/panache-award-night/panache-award-night-2025-04.jpg";
import panacheAwardNight05 from "@/assets/panache-award-night/panache-award-night-2025-05.jpg";
import { Button } from "@/components/ui/button";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Link } from "react-router-dom";

type AwardHighlight = {
  title: string;
  description: string;
  image: string;
};

type AwardCardProps = AwardHighlight & {
  featuredIndex: number;
  index: number;
  progress: MotionValue<number>;
  shouldReduceMotion: boolean;
};

const awardHighlights: AwardHighlight[] = [
  {
    title: "Award night",
    description: "Real ceremony moments from Panache Award Night 2025.",
    image: panacheAwardNight01,
  },
  {
    title: "Winning moment",
    description: "Recognition captured on stage instead of flyer graphics.",
    image: panacheAwardNight02,
  },
  {
    title: "Stage recognition",
    description: "The atmosphere of the prize presentation as it happened live.",
    image: panacheAwardNight03,
  },
  {
    title: "Celebration",
    description: "A closer look at the people Panache actually celebrated that night.",
    image: panacheAwardNight04,
  },
  {
    title: "Panache prestige",
    description: "Award-night photography from the official Panache Expo Instagram archive.",
    image: panacheAwardNight05,
  },
];

const shuffleAwards = (awards: AwardHighlight[]) => {
  const shuffledAwards = [...awards];

  for (let index = shuffledAwards.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffledAwards[index], shuffledAwards[swapIndex]] = [
      shuffledAwards[swapIndex],
      shuffledAwards[index],
    ];
  }

  return shuffledAwards;
};

const springOptions = {
  stiffness: 180,
  damping: 24,
  mass: 0.3,
};

const baseCardFlexBasis = "clamp(16rem, 22vw, 21rem)";

const clampProgress = (value: number) => Math.min(1, Math.max(0, value));

const mapScrollToFeaturedFlexBasis = (progress: number, shouldReduceMotion: boolean) => {
  if (shouldReduceMotion) {
    return baseCardFlexBasis;
  }

  const normalized = clampProgress((progress - 0.08) / 0.78);

  return `calc(${baseCardFlexBasis} + ${normalized} * (100vw - ${baseCardFlexBasis}))`;
};

const AwardCard = ({
  title,
  description,
  image,
  featuredIndex,
  index,
  progress,
  shouldReduceMotion,
}: AwardCardProps) => {
  const distance = index - featuredIndex;
  const isFeatured = distance === 0;
  const direction = distance === 0 ? 0 : distance / Math.abs(distance);
  const smoothProgress = useSpring(progress, springOptions);
  const featuredFlexBasis = useTransform(smoothProgress, (value) =>
    mapScrollToFeaturedFlexBasis(value, shouldReduceMotion),
  );

  const cardX = useSpring(
    useTransform(smoothProgress, (value) => {
      if (shouldReduceMotion || isFeatured) {
        return 0;
      }

      const normalized = clampProgress((value - 0.18) / 0.68);
      const travel = Math.abs(distance) === 1 ? 120 : 260;

      return direction * travel * normalized;
    }),
    springOptions,
  );
  const cardY = useSpring(
    useTransform(
      smoothProgress,
      [0, 0.26, 0.74, 1],
      shouldReduceMotion ? [0, 0, 0, 0] : isFeatured ? [0, -8, -18, -22] : [0, 0, 10, 18],
    ),
    springOptions,
  );
  const cardOpacity = useSpring(
    useTransform(
      smoothProgress,
      [0, 0.42, 0.7, 1],
      shouldReduceMotion ? [1, 1, 1, 1] : isFeatured ? [1, 1, 1, 1] : [1, 1, 0.22, 0],
    ),
    springOptions,
  );
  const imageScale = useSpring(
    useTransform(
      smoothProgress,
      [0, 0.3, 0.74, 1],
      shouldReduceMotion ? [1, 1, 1, 1] : isFeatured ? [1, 1.02, 1.08, 1.1] : [1, 1, 1.02, 1.04],
    ),
    springOptions,
  );
  const captionOpacity = useSpring(
    useTransform(
      smoothProgress,
      [0, 0.46, 0.74, 1],
      shouldReduceMotion ? [1, 1, 1, 1] : isFeatured ? [1, 1, 0.32, 0] : [1, 0.8, 0.1, 0],
    ),
    springOptions,
  );

  return (
    <motion.div
      style={{
        flexBasis: isFeatured ? featuredFlexBasis : baseCardFlexBasis,
        x: cardX,
        y: cardY,
        opacity: cardOpacity,
        zIndex: isFeatured ? 30 : 20 - Math.abs(distance),
      }}
      className="relative aspect-video shrink-0 grow-0 overflow-hidden bg-black"
    >
      <Link to="/panache-expo/panache-dor" className="group block h-full w-full">
        <motion.img
          src={image}
          alt={title}
          style={{ scale: imageScale }}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/18 to-transparent" />
        <motion.div
          style={{ opacity: captionOpacity }}
          className="absolute inset-x-0 bottom-0 z-10 p-4 text-left text-white sm:p-5"
        >
          <h3 className="font-sans text-base font-semibold leading-tight sm:text-lg">{title}</h3>
          <p className="mt-1 max-w-[18rem] font-sans text-xs leading-snug text-white/84 sm:text-[0.82rem]">
            {description}
          </p>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export const AwardsDropdown = () => {
  const sceneRef = useRef<HTMLElement | null>(null);
  const [shuffledAwards] = useState(() => shuffleAwards(awardHighlights));
  const featuredIndex = Math.floor(shuffledAwards.length / 2);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  return (
    <section className="relative z-20 bg-[#f4f3ef] px-0 py-24 md:py-28 lg:py-32">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="font-display text-[clamp(2.75rem,5vw,4.8rem)] font-bold leading-[0.95] tracking-[-0.04em] text-[#13110f]">
          Panache D&apos;or Awards
        </h2>
        <p className="mx-auto mt-6 max-w-3xl font-sans text-[clamp(1.2rem,2.2vw,2rem)] font-medium leading-[1.28] tracking-[-0.03em] text-[#1d1a18]">
          Honoring excellence in beauty, fashion, and skincare through our prestigious awards
          program.
        </p>
      </div>

      <div
        ref={sceneRef}
        className={[
          "relative mt-14",
          shouldReduceMotion ? "h-auto" : "h-[205svh] md:h-[220svh] lg:h-[235svh]",
        ].join(" ")}
      >
        <div
          className={[
            "overflow-hidden",
            shouldReduceMotion ? "min-h-[32rem]" : "sticky top-0 h-screen",
          ].join(" ")}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#f4f3ef] to-transparent md:h-28" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f4f3ef] to-transparent md:h-32" />

          <div className="relative flex h-full w-full items-center justify-center gap-4">
            {shuffledAwards.map((award, index) => (
              <AwardCard
                key={award.title}
                {...award}
                featuredIndex={featuredIndex}
                index={index}
                progress={scrollYProgress}
                shouldReduceMotion={shouldReduceMotion}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl justify-end px-6">
        <div className="max-w-md">
              <p className="font-sans text-lg font-medium leading-[1.35] text-[#171411] md:text-[1.55rem]">
                Creativity for every stage. Join us and be part of our winners.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link to="/panache-expo/register">
                  <Button className="h-12 rounded-full bg-black px-7 font-sans text-sm font-semibold text-white hover:bg-black/85">
                Nominate for Awards
              </Button>
            </Link>
            {/* <Link
              to="/panache-expo/panache-dor"
              className="font-sans text-sm font-semibold text-[#171411] underline-offset-4 transition-colors hover:text-black/70 hover:underline"
            >
              View All Winners
            </Link> */}
          </div>
        </div>
      </div>
    </section>
  );
};
