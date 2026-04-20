import { useMemo, useState, type ReactNode } from "react";

import { motion } from "motion/react";

type SpreadShowcaseMember = {
  name: string;
  title: string;
  photo: string;
  targetX: number;
  targetY: number;
  targetRotate: number;
  layer: number;
  isPrimary?: boolean;
  alwaysShowCopy?: boolean;
  ctaContent?: ReactNode;
};

type PeopleSpreadShowcaseProps = {
  members: SpreadShowcaseMember[];
  shouldReduceMotion: boolean;
  stackedOffsets?: number[];
  stageClassName?: string;
  cardHeightClassName?: string;
};

const defaultStackedOffsets = [-14, -10, -6, -3, 0, 3, 6, 10, 14];

const SpreadShowcaseCard = ({
  member,
  index,
  startX,
  shouldReduceMotion,
  delay,
  hoveredMemberName,
  hoveredMemberIndex,
  onHoverChange,
  cardHeightClassName,
}: {
  member: SpreadShowcaseMember;
  index: number;
  startX: number;
  shouldReduceMotion: boolean;
  delay: number;
  hoveredMemberName: string | null;
  hoveredMemberIndex: number | null;
  onHoverChange: (name: string | null) => void;
  cardHeightClassName: string;
}) => {
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
      ? member.isPrimary
        ? 1.05
        : 1.08
      : isDimmed
        ? 0.965
        : 1;
  const hoverY = shouldReduceMotion
    ? 0
    : isHovered
      ? member.isPrimary
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
    () => (member.isPrimary ? 0 : Math.round((Math.random() * 16 - 8) * 10) / 10),
    [member.isPrimary],
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
        className={`${cardHeightClassName} aspect-[336/589] pointer-events-auto`}
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
              shouldReduceMotion || member.alwaysShowCopy || member.isPrimary
                ? { opacity: 1, y: 0 }
                : isHovered
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 10 }
            }
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <p
              className={
                member.isPrimary
                  ? "font-sans text-[clamp(1.6rem,2vw,2.6rem)] font-semibold tracking-[-0.03em]"
                  : "font-sans text-sm font-semibold md:text-base"
              }
            >
              {member.name}
            </p>
            <p
              className={
                member.isPrimary
                  ? "mt-2 font-sans text-sm text-white/82 md:text-base"
                  : "mt-1 font-sans text-xs text-white/78 md:text-sm"
              }
            >
              {member.title}
            </p>
            {member.ctaContent ? (
              <div className="pointer-events-auto mt-5 inline-flex">
                {member.ctaContent}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export const PeopleSpreadShowcase = ({
  members,
  shouldReduceMotion,
  stackedOffsets = defaultStackedOffsets,
  stageClassName = "relative left-1/2 mt-14 h-[34rem] w-[min(190vw-1rem,104rem)] -translate-x-1/2 overflow-hidden sm:h-[38rem] md:h-[46rem] lg:h-[54rem] xl:h-[56rem]",
  cardHeightClassName = "h-[clamp(15rem,49vw,34rem)]",
}: PeopleSpreadShowcaseProps) => {
  const [hoveredMemberName, setHoveredMemberName] = useState<string | null>(null);
  const hoveredMemberIndex =
    hoveredMemberName === null
      ? null
      : members.findIndex((member) => member.name === hoveredMemberName);

  return (
    <div
      className={stageClassName}
      onPointerLeave={() => setHoveredMemberName(null)}
    >
      {members.map((member, index) => (
        <SpreadShowcaseCard
          key={member.name}
          member={member}
          index={index}
          startX={stackedOffsets[index] ?? 0}
          shouldReduceMotion={shouldReduceMotion}
          delay={index * 0.01}
          hoveredMemberName={hoveredMemberName}
          hoveredMemberIndex={hoveredMemberIndex}
          onHoverChange={setHoveredMemberName}
          cardHeightClassName={cardHeightClassName}
        />
      ))}
    </div>
  );
};

export type { SpreadShowcaseMember };
