import { useId, type CSSProperties } from "react";
import { Kid } from "@/components/donate/Kid";
import { INK, KID_CREW } from "@/components/donate/kid-crew";

// The donate page's progress: a water tank that fills as money comes in, with CIYES kids around it.
// `level` is 0..1. When `cheering`, the kids throw their arms up and jump.

const W = 560;
const H = 320;
const GROUND = 300;
const INNER = { x: 212, y: 76, w: 136, h: 180 };
const WAVE = 56; // one wave period; matches the tank-wave keyframes in index.css

const wavePath = (amp: number, depth: number) => {
  const x0 = INNER.x - 4;
  const x1 = INNER.x + INNER.w + WAVE * 2;
  let d = `M${x0} 0`;
  for (let x = x0; x < x1; x += WAVE) d += ` q${WAVE / 4} ${-amp} ${WAVE / 2} 0 q${WAVE / 4} ${amp} ${WAVE / 2} 0`;
  return `${d} V${depth} H${x0} Z`;
};

const BUBBLES = [
  { x: 236, r: 4, delay: 0 },
  { x: 268, r: 3, delay: 1.3 },
  { x: 300, r: 5, delay: 0.6 },
  { x: 328, r: 3.5, delay: 2.2 },
];

type Props = {
  level: number;
  cheering: boolean;
  percentLabel?: string | null;
  label: string;
};

export const WaterTankScene = ({ level, cheering, percentLabel, label }: Props) => {
  const clipId = `tank-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const lvl = Math.max(0, Math.min(1, level));
  const surfaceY = INNER.y + INNER.h * (1 - lvl);
  const depth = INNER.y + INNER.h - surfaceY;
  const pose = cheering ? "cheer" : undefined;
  const motion = cheering ? "jump" : "bob";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" role="img" aria-label={label}>
      {/* ground */}
      <ellipse cx={W / 2} cy={GROUND + 2} rx="262" ry="15" fill="#156D3B" opacity="0.1" />
      {[60, 180, 400, 520].map((gx) => (
        <path key={gx} d={`M${gx} ${GROUND + 1} q2 -9 5 0 q2 -12 5 0 q2 -8 5 0`} fill="none" stroke="#156D3B" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      ))}

      {/* stand */}
      <rect x="206" y="266" width="148" height="20" rx="6" fill="#E4DED3" stroke={INK} strokeWidth="3.5" />
      <path d="M222 286 V298 M338 286 V298" stroke={INK} strokeWidth="6" strokeLinecap="round" />

      {/* tank body */}
      <rect x="200" y="62" width="160" height="206" rx="26" fill="#EEF6FD" stroke={INK} strokeWidth="4" />
      <rect x="250" y="46" width="60" height="20" rx="7" fill="#1875D2" stroke={INK} strokeWidth="3.5" />

      {/* water */}
      <defs>
        <clipPath id={clipId}>
          <rect x={INNER.x} y={INNER.y} width={INNER.w} height={INNER.h} rx="18" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <g className="tank-level" style={{ transform: `translateY(${surfaceY}px)` }}>
          <g className="tank-wave-back">
            <path d={wavePath(4, INNER.h + 40)} fill="#8FD3FF" transform="translate(-20 -5)" />
          </g>
          <g className="tank-wave">
            <path d={wavePath(5, INNER.h + 40)} fill="#1875D2" />
          </g>
          {BUBBLES.map((b) => (
            <circle
              key={b.x}
              className="tank-bubble"
              cx={b.x}
              cy={depth - 8}
              r={b.r}
              fill="#fff"
              style={{ animationDelay: `${b.delay}s`, "--rise": `${-Math.max(0, depth - 16)}px` } as CSSProperties}
            />
          ))}
        </g>
      </g>

      {/* level marks, ribs and shine on top of the water */}
      {[0.25, 0.5, 0.75].map((m) => (
        <line key={m} x1={INNER.x} x2={INNER.x + 14} y1={INNER.y + INNER.h * (1 - m)} y2={INNER.y + INNER.h * (1 - m)} stroke={INK} strokeWidth="2.5" opacity="0.45" />
      ))}
      <path d="M201 140 H359 M201 204 H359" stroke={INK} strokeWidth="2" opacity="0.14" />
      <rect x="222" y="90" width="10" height="120" rx="5" fill="#fff" opacity="0.5" />
      <rect x="200" y="62" width="160" height="206" rx="26" fill="none" stroke={INK} strokeWidth="4" />

      {percentLabel ? (
        <g>
          <rect x="244" y="88" width="72" height="32" rx="16" fill="#fff" stroke={INK} strokeWidth="3" />
          <text x="280" y="110" textAnchor="middle" fontFamily="inherit" fontSize="17" fontWeight="800" fill={INK}>
            {percentLabel}
          </text>
        </g>
      ) : null}

      {/* tap, dripping into Nadia's jerrycan */}
      <path d="M358 232 H382 Q390 232 390 240 V248" fill="none" stroke={INK} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M358 232 H382 Q390 232 390 240 V248" fill="none" stroke="#A9B4C0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="374" y="222" width="12" height="7" rx="2" fill="#CC2129" stroke={INK} strokeWidth="2.5" />
      <path className="tank-drip" d="M390 254 q-3.5 5 0 7.5 q3.5 -2.5 0 -7.5 Z" fill="#1875D2" stroke={INK} strokeWidth="1.5" />

      {/* the kids */}
      <Kid x={62} y={GROUND} size={124} {...KID_CREW.junior} pose={pose ?? "stand"} motion={motion} delay={0.4} />
      <Kid x={146} y={GROUND} size={140} {...KID_CREW.amara} pose={pose ?? "wave"} motion={motion} prop="bucket" delay={0} />
      <Kid x={432} y={GROUND} size={136} {...KID_CREW.nadia} pose={pose ?? "stand"} motion={motion} prop="jerrycan" flip delay={0.9} />
      <Kid x={510} y={GROUND} size={118} {...KID_CREW.kofi} pose={pose ?? "wave"} motion={motion} flip delay={1.3} />
    </svg>
  );
};

export default WaterTankScene;
