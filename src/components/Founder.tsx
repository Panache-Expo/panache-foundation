import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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
  isFounder?: boolean;
  instagramHref?: string;
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

const teamShowcaseMembers: TeamShowcaseMember[] = [
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
    isFounder: true,
    instagramHref: "https://instagram.com/ekie_walters",
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

type TeamSpreadCardProps = {
  member: TeamShowcaseMember;
  index: number;
  startX: number;
  shouldReduceMotion: boolean;
  delay: number;
  hoveredMemberName: string | null;
  hoveredMemberIndex: number | null;
  onHoverChange: (name: string | null) => void;
};

const TeamSpreadCard = ({
  member,
  index,
  startX,
  shouldReduceMotion,
  delay,
  hoveredMemberName,
  hoveredMemberIndex,
  onHoverChange,
}: TeamSpreadCardProps) => {
  const isHovered = hoveredMemberName === member.name;
  const isDimmed =
    hoveredMemberName !== null && hoveredMemberName !== member.name;
  const hoverDistance =
    hoveredMemberIndex === null ? null : Math.abs(index - hoveredMemberIndex);
  const hoverDirection =
    hoveredMemberIndex === null ? 0 : Math.sign(index - hoveredMemberIndex);
  const hoverPush =
    hoverDistance === null || hoverDistance === 0
      ? 0
      : hoverDirection * (52 / hoverDistance);
  const hoverScale = shouldReduceMotion
    ? 1
    : isHovered
      ? member.isFounder
        ? 1.05
        : 1.08
      : isDimmed
        ? 0.965
        : 1;
  const hoverY = shouldReduceMotion
    ? 0
    : isHovered
      ? member.isFounder
        ? -12
        : -18
      : isDimmed
        ? Math.min(10, hoverDistance ? hoverDistance * 2 : 0)
        : 0;
  const hoverOpacity = shouldReduceMotion
    ? 1
    : isDimmed
      ? Math.max(0.6, 0.92 - (hoverDistance ?? 0) * 0.08)
      : 1;
  const hoverFilter =
    shouldReduceMotion || !isDimmed
      ? "none"
      : `saturate(${Math.max(0.72, 0.9 - (hoverDistance ?? 0) * 0.06)}) brightness(${Math.max(0.78, 0.95 - (hoverDistance ?? 0) * 0.05)})`;
  const initialRotate = useMemo(
    () =>
      member.isFounder ? 0 : Math.round((Math.random() * 16 - 8) * 10) / 10,
    [member.isFounder],
  );
  const spreadState = {
    x: member.targetX,
    y: member.targetY,
    rotate: member.targetRotate,
    opacity: 1,
    scale: 1,
  };
  const stackedState = shouldReduceMotion
    ? spreadState
    : {
        x: startX,
        y: 48,
        rotate: initialRotate,
        opacity: 1,
        scale: 0.94,
      };

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div
        className="pointer-events-auto h-[clamp(15rem,49vw,34rem)] aspect-[336/589]"
        style={{ zIndex: isHovered ? 60 : member.layer }}
        initial={stackedState}
        whileInView={spreadState}
        viewport={{ once: true, amount: 0.95 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                duration: 0.95,
                delay,
                ease: [0.22, 1, 0.36, 1],
              }
        }
        onHoverStart={() => onHoverChange(member.name)}
        onHoverEnd={() => onHoverChange(null)}
        onFocus={() => onHoverChange(member.name)}
        onBlur={() => onHoverChange(null)}
      >
        <motion.div
          className="relative h-full w-full overflow-hidden rounded-[2.35rem] bg-[#d9d2c8]"
          animate={
            shouldReduceMotion
              ? { x: 0, scale: 1, y: 0, opacity: 1, filter: "none" }
              : {
                  x: hoverPush,
                  scale: hoverScale,
                  y: hoverY,
                  opacity: hoverOpacity,
                  filter: hoverFilter,
                }
          }
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={member.photo}
            alt={member.name}
            className="h-full w-full object-cover"
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/12 to-transparent"
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : isHovered
                  ? { opacity: 0.88 }
                  : isDimmed
                    ? { opacity: 0.72 }
                    : { opacity: 1 }
            }
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4 text-left text-white md:p-5"
            animate={
              shouldReduceMotion || member.isFounder
                ? { opacity: 1, y: 0 }
                : isHovered
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 10 }
            }
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <p
              className={
                member.isFounder
                  ? "font-sans text-[clamp(1.6rem,2vw,2.6rem)] font-semibold tracking-[-0.03em]"
                  : "font-sans text-sm font-semibold md:text-base"
              }
            >
              {member.name}
            </p>
            <p
              className={
                member.isFounder
                  ? "mt-2 font-sans text-sm text-white/82 md:text-base"
                  : "mt-1 font-sans text-xs text-white/78 md:text-sm"
              }
            >
              {member.title}
            </p>
            {member.isFounder && member.instagramHref ? (
              <a
                href={member.instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex"
              >
                <Button className="h-11 rounded-full bg-white px-6 font-sans text-sm font-semibold text-[#171411] hover:bg-white/90">
                  Follow on Instagram
                </Button>
              </a>
            ) : null}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Founder = () => {
  const founderIntroRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [hoveredTeamMemberName, setHoveredTeamMemberName] = useState<
    string | null
  >(null);
  const hoveredTeamMemberIndex =
    hoveredTeamMemberName === null
      ? null
      : teamShowcaseMembers.findIndex(
          (member) => member.name === hoveredTeamMemberName,
        );
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

          <div
            className="relative left-1/2 mt-14 h-[34rem] w-[min(190vw-1rem,104rem)] -translate-x-1/2 overflow-hidden sm:h-[38rem] md:h-[46rem] lg:h-[54rem] xl:h-[56rem]"
            onPointerLeave={() => setHoveredTeamMemberName(null)}
          >
            {teamShowcaseMembers.map((member, index) => (
              <TeamSpreadCard
                key={member.name}
                member={member}
                index={index}
                startX={stackedOffsets[index]}
                shouldReduceMotion={shouldReduceMotion}
                delay={index * 0.01}
                hoveredMemberName={hoveredTeamMemberName}
                hoveredMemberIndex={hoveredTeamMemberIndex}
                onHoverChange={setHoveredTeamMemberName}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
