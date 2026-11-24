import { useMemo, type CSSProperties } from "react";

// A one-off confetti burst. Change `burst` to fire a new one; 0 shows nothing.
// The pieces are invisible unless motion is allowed (see .confetti-piece in index.css).

const COLORS = ["#1875D2", "#156D3B", "#CC2129", "#FFB200", "#8FD3FF"];

// Small seeded random, so a burst is stable across re-renders.
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Props = { burst: number; count?: number; top?: string };

export const ConfettiBurst = ({ burst, count = 30, top = "35%" }: Props) => {
  const pieces = useMemo(() => {
    const rand = seeded(burst * 9973 + 1);
    return Array.from({ length: count }, (_, i) => {
      const angle = rand() * Math.PI * 2;
      const dist = 90 + rand() * 120;
      return {
        id: i,
        color: COLORS[i % COLORS.length],
        w: 6 + rand() * 5,
        h: 9 + rand() * 7,
        round: rand() > 0.7,
        delay: rand() * 0.12,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist * 0.7 + 50,
        rot: (rand() > 0.5 ? 1 : -1) * (240 + rand() * 360),
      };
    });
  }, [burst, count]);

  if (!burst) return null;

  return (
    <div key={burst} className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute left-1/2 block"
          style={
            {
              top,
              width: p.w,
              height: p.round ? p.w : p.h,
              background: p.color,
              borderRadius: p.round ? "999px" : "2px",
              animationDelay: `${p.delay}s`,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              "--rot": `${p.rot}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
};

export default ConfettiBurst;
