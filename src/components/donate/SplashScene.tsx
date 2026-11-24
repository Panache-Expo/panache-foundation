import type { CSSProperties } from "react";
import { Kid } from "@/components/donate/Kid";
import { INK, KID_CREW } from "@/components/donate/kid-crew";

// Thank-you scene: three CIYES kids hopping in a puddle of clean water, splashing.

const DROPS = [
  { x: 92, dx: -22, up: -46, delay: 0 },
  { x: 118, dx: 16, up: -58, delay: 0.5 },
  { x: 168, dx: -14, up: -52, delay: 0.25 },
  { x: 196, dx: 20, up: -64, delay: 0.8 },
  { x: 238, dx: -18, up: -50, delay: 0.4 },
  { x: 266, dx: 24, up: -44, delay: 1.05 },
];

export const SplashScene = ({ label }: { label: string }) => (
  <svg viewBox="0 0 360 200" className="mx-auto block h-auto w-full max-w-[22rem] overflow-visible" role="img" aria-label={label}>
    <ellipse cx="180" cy="186" rx="150" ry="13" fill="#8FD3FF" stroke={INK} strokeWidth="3" />
    <ellipse cx="150" cy="184" rx="40" ry="3.5" fill="#fff" opacity="0.6" />
    {DROPS.map((d) => (
      <path
        key={d.x}
        className="splash-drop"
        d={`M${d.x} 172 q-4.5 6.5 0 9.5 q4.5 -3 0 -9.5 Z`}
        fill="#1875D2"
        stroke={INK}
        strokeWidth="1.5"
        style={{ animationDelay: `${d.delay}s`, "--dx": `${d.dx}px`, "--up": `${d.up}px` } as CSSProperties}
      />
    ))}
    <Kid x={96} y={186} size={132} {...KID_CREW.amara} pose="cheer" motion="hop" delay={0} />
    <Kid x={180} y={186} size={146} {...KID_CREW.kofi} pose="cheer" motion="hop" delay={0.35} />
    <Kid x={264} y={186} size={132} {...KID_CREW.nadia} pose="cheer" motion="hop" flip delay={0.7} />
  </svg>
);

export default SplashScene;
