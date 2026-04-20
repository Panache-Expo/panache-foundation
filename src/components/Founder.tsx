import { useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { PeopleSpreadShowcase, type SpreadShowcaseMember } from "@/components/PeopleSpreadShowcase";
import { Instagram } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import FounderImage from "@/assets/Founder.jpeg";
import FounderCutout from "@/assets/FounderCutout.png";
import tony from "@/assets/tony.jpeg";
import ramiims from "@/assets/ramiims.jpg";
import akwo from "@/assets/akwo.jpeg";
import prince from "@/assets/prince.jpeg";
import sharon from "@/assets/sharon.jpeg";
import yannick from "@/assets/yannick.jpeg";
import victor from "@/assets/victor.png";
import nana from "@/assets/nana.jpeg";

type TeamMember = {
  name: string;
  title: string;
  organization: string;
  photo: string;
};

type TeamShowcaseMember = TeamMember & {
  targetX: number;
  targetY: number;
  targetRotate: number;
  layer: number;
  isPrimary?: boolean;
  alwaysShowCopy?: boolean;
  ctaContent?: ReactNode;
};

const teamMembers = [
  {
    name: "Tony Awah",
    title: "Vice President",
    organization: "Panache Expo",
    photo: tony,
  },
  {
    name: "Teko Racheal (Ramiims)",
    title: "Project Manager & Financial Secretary",
    organization: "Panache Expo",
    photo: ramiims,
  },
  {
    name: "Dr. Akwo Charles Ekie",
    title: "Treasurer",
    organization: "Panache Expo",
    photo: akwo,
  },
  {
    name: "Prince Enobi Mykel",
    title: "Founder/President CIMFEST",
    organization: "Panache D'Or Awards",
    photo: prince,
  },
  {
    name: "Sharon Enobi",
    title: "Event Planner",
    organization: "Panache Expo",
    photo: sharon,
  },
  {
    name: "Tegueboug Yannick Cabrel",
    title: "Graphic Designer",
    organization: "Panache Expo",
    photo: yannick,
  },
  {
    name: "Barr. Mafany Victor (Kinsman) Ngando",
    title: "Founder/CEO Kinsmen Advocates Law Firm",
    organization: "Panache Expo",
    photo: victor,
  },
  {
    name: "Nana Sechere",
    title: "Business and Marketing Strategist",
    organization: "Panache Expo",
    photo: nana,
  },
];

const teamShowcaseMembers: SpreadShowcaseMember[] = [
  {
    ...teamMembers[5],
    targetX: -520,
    targetY: 146,
    targetRotate: -24,
    layer: 10,
  },
  {
    ...teamMembers[3],
    targetX: -400,
    targetY: 112,
    targetRotate: -18,
    layer: 12,
  },
  {
    ...teamMembers[4],
    targetX: -265,
    targetY: 82,
    targetRotate: -13,
    layer: 14,
  },
  {
    ...teamMembers[1],
    targetX: -135,
    targetY: 52,
    targetRotate: -6,
    layer: 16,
  },
  {
    name: "Ekie Walters",
    title: "Founder, Panache Expo",
    organization: "Panache Expo",
    photo: FounderImage,
    targetX: 0,
    targetY: 50,
    targetRotate: 0,
    layer: 30,
    isPrimary: true,
    alwaysShowCopy: true,
    ctaContent: (
      <a
        href="https://instagram.com/ekie_walters"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button className="h-11 rounded-full bg-white px-6 font-sans text-sm font-semibold text-[#171411] hover:bg-white/90">
          <Instagram className="mr-2 h-5 w-5" />
          Follow on Instagram
        </Button>
      </a>
    ),
  },
  {
    ...teamMembers[0],
    targetX: 135,
    targetY: 52,
    targetRotate: 6,
    layer: 16,
  },
  {
    ...teamMembers[2],
    targetX: 265,
    targetY: 82,
    targetRotate: 13,
    layer: 14,
  },
  {
    ...teamMembers[6],
    targetX: 400,
    targetY: 112,
    targetRotate: 18,
    layer: 12,
  },
  {
    ...teamMembers[7],
    targetX: 520,
    targetY: 146,
    targetRotate: 24,
    layer: 10,
  },
];

const stackedOffsets = [-14, -10, -6, -3, 0, 3, 6, 10, 14];

const founderRoleLabel = "Founder & CEO";
const founderNameParts = ["Walters", "Ekie"] as const;
const founderBio = [
  "Ekie Walters founded Panache Expo with a vision to elevate beauty standards and empower professionals across Cameroon and beyond.",
  "His passion for excellence and commitment to education has transformed countless lives, creating a platform where beauty professionals can learn, grow, and celebrate their craft together.",
  "Through Panache Expo, he continues to bridge the gap between traditional beauty practices and modern techniques, fostering a community that celebrates diversity, creativity, and professional excellence.",
];

export const Founder = () => {
  const founderIntroRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress: founderIntroProgress } = useScroll({
    target: founderIntroRef,
    offset: ["start end", "end start"],
  });
  const founderLabelY = useTransform(
    founderIntroProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [18, -38],
  );
  const founderLeftNameY = useTransform(
    founderIntroProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [32, -96],
  );
  const founderRightNameY = useTransform(
    founderIntroProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [76, -24],
  );
  const founderLeftCopyY = useTransform(
    founderIntroProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [22, -42],
  );
  const founderRightCopyY = useTransform(
    founderIntroProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [12, -54],
  );
  const founderBadgeY = useTransform(
    founderIntroProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [28, -34],
  );
  const founderRevealInitial = shouldReduceMotion
    ? { opacity: 1, y: 0, scale: 1 }
    : { opacity: 0, y: 56, scale: 0.9 };
  const founderRevealTarget = { opacity: 1, y: 0, scale: 1 };
  const founderRevealTransition = {
    duration: 0.95,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <section className="relative py-24 bg-accent overflow-x-clip">
      <div className="w-full">
        {/* Founder Section */}
        <div className="mb-24">
          <div className="mx-auto max-w-3xl text-center md:hidden">
            <span className="font-sans text-sm font-semibold uppercase tracking-[0.28em] text-[#8b7f78]">
              Meet Our Team
            </span>
            <p className="mt-4 font-sans text-sm font-semibold uppercase tracking-[0.16em] text-[#171411]/68">
              {founderRoleLabel}
            </p>
            <h2 className="mt-3 font-display text-[clamp(3.25rem,18vw,6rem)] font-bold leading-[0.84] tracking-[-0.08em] text-[#13110f]">
              {founderNameParts[1]} {founderNameParts[0]}
            </h2>
            <div className="relative mx-auto mt-8 aspect-[5/6] w-full max-w-[24rem]">
              <img
                src={FounderCutout}
                alt="Ekie Walters - Founder of Panache Expo"
                className="h-full w-full object-contain"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-accent via-accent/78 to-transparent" />
            </div>
            <div className="mt-8 space-y-4 text-left font-sans text-base leading-relaxed text-[#2a2521]/84">
              {founderBio.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <a
              href="https://instagram.com/ekie_walters"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex"
            >
              <Button className="h-11 rounded-full bg-[#171411] px-6 font-sans text-sm font-semibold text-white hover:bg-[#171411]/88">
                <Instagram className="mr-2 h-5 w-5" />
                Follow on Instagram
              </Button>
            </a>
          </div>

          <div
            ref={founderIntroRef}
            className="relative hidden min-h-[100svh] w-full md:block lg:min-h-[100svh]"
          >
            <motion.div
              style={shouldReduceMotion ? undefined : { y: founderLabelY }}
              className="absolute left-1/2 -top-10 z-20 -translate-x-1/2 text-center"
              initial={founderRevealInitial}
              whileInView={founderRevealTarget}
              viewport={{ once: true, amount: 0.18 }}
              transition={founderRevealTransition}
            >
              <div className="mt-3 inline-flex px-4 ">
                <p className="font-sans text-[1.05rem] font-semibold leading-[1.15] tracking-[-0.03em] text-[#171411]">
                  {founderRoleLabel}
                  <br />
                  Panache Expo
                </p>
              </div>
            </motion.div>

            <motion.div
              style={shouldReduceMotion ? undefined : { y: founderLeftNameY }}
              className="pointer-events-none absolute left-0 top-[7rem] z-0"
              initial={founderRevealInitial}
              whileInView={founderRevealTarget}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ ...founderRevealTransition, delay: 0.06 }}
            >
              <h2 className="font-display text-[clamp(8rem,17vw,14rem)] font-bold leading-[0.82] tracking-[-0.09em] text-[#13110f]">
                {founderNameParts[0]}
              </h2>
            </motion.div>
            <motion.div
              style={shouldReduceMotion ? undefined : { y: founderRightNameY }}
              className="pointer-events-none absolute right-[1%] top-[20rem] z-0"
              initial={founderRevealInitial}
              whileInView={founderRevealTarget}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ ...founderRevealTransition, delay: 0.14 }}
            >
              <h2 className="font-display text-[clamp(8rem,17vw,14rem)] font-bold leading-[0.82] tracking-[-0.09em] text-[#13110f]">
                {founderNameParts[1]}
              </h2>
            </motion.div>

            <div className="absolute left-1/2 top-0 z-10 flex-col h-[100svh] -translate-x-1/2 items-end justify-center">
              <img
                src={FounderCutout}
                alt="Ekie Walters - Founder of Panache Expo"
                className="h-full w-auto max-w-none object-contain"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[24vh] bg-gradient-to-t from-accent to-transparent" />
            </div>

            <motion.div
              style={shouldReduceMotion ? undefined : { y: founderLeftCopyY }}
              className="absolute left-[2%] top-[21rem] z-20 max-w-[19rem] space-y-6"
              initial={founderRevealInitial}
              whileInView={founderRevealTarget}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ ...founderRevealTransition, delay: 0.22 }}
            >
              <p className="font-sans text-[1.45rem] font-semibold leading-[1.05] tracking-[-0.04em] text-[#171411]/86">
                Ekie Walters founded Panache Expo with a vision to elevate
                beauty standards and empower professionals across Cameroon and
                beyond.
              </p>
              <p className="font-sans text-[1.15rem] leading-[1.28] text-[#2a2521]/78">
                His passion for excellence and commitment to education has
                transformed countless lives, creating a platform where beauty
                professionals can learn, grow, and celebrate their craft
                together.
              </p>
            </motion.div>

            <motion.div
              style={shouldReduceMotion ? undefined : { y: founderRightCopyY }}
              className="absolute right-[1.5%] top-[37rem] z-20 max-w-[21rem] text-right"
              initial={founderRevealInitial}
              whileInView={founderRevealTarget}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ ...founderRevealTransition, delay: 0.3 }}
            >
              <p className="font-sans text-[1.18rem] leading-[1.28] text-[#2a2521]/78">
                Through Panache Expo, he continues to bridge the gap between
                traditional beauty practices and modern techniques, fostering a
                community that celebrates diversity, creativity, and
                professional excellence.
              </p>
              <a
                href="https://instagram.com/ekie_walters"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex"
              >
                <Button className="h-11 rounded-full bg-[#171411] px-6 font-sans text-sm font-semibold text-white shadow-[0_16px_30px_rgba(15,11,8,0.15)] hover:bg-[#171411]/88">
                  <Instagram className="mr-2 h-5 w-5" />
                  Follow on Instagram
                </Button>
              </a>
            </motion.div>

            {/* <div className="pointer-events-none absolute left-1/2 top-[39.5rem] z-0 h-36 w-[min(46rem,58vw)] -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95),rgba(255,255,255,0.62)_42%,rgba(255,255,255,0)_72%)]" /> */}
          </div>
        </div>

        {/* Team Section */}
        <div>
          <div className="text-center">
            <span className="font-sans text-sm font-semibold uppercase tracking-[0.28em] text-[#8b7f78]">
              Our Leadership
            </span>
            <h2 className="mt-4 text-[#13110f]">
              <span className="block font-display text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.05em]">
                The Team
              </span>
              <span className="mt-1 block font-sans text-[clamp(2rem,4.2vw,3.45rem)] font-semibold leading-[0.96] tracking-[-0.05em]">
                Behind Panache
              </span>
            </h2>
          </div>

          <div className="mt-12 space-y-4 md:hidden">
            {teamMembers.map((member) => (
              <article
                key={member.name}
                className="rounded-[2rem] border border-black/8 bg-white/74 p-5 shadow-[0_16px_40px_rgba(17,16,14,0.06)]"
              >
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[1.4rem] bg-[#eef2f6]">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="font-sans text-[1.2rem] font-semibold leading-[1.08] tracking-[-0.045em] text-[#171411]">
                      {member.name}
                    </h3>
                    <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/66">
                      {member.title}
                    </p>
                    <p className="mt-1 font-sans text-xs uppercase tracking-[0.08em] text-[#171411]/46">
                      {member.organization}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden md:block">
            <PeopleSpreadShowcase
              members={teamShowcaseMembers}
              shouldReduceMotion={shouldReduceMotion}
              stackedOffsets={stackedOffsets}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
