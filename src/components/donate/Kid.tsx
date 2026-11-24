import type { CSSProperties } from "react";
import { INK } from "@/components/donate/kid-crew";

// Flat cartoon kids for the donate pages, in the style of the borehole video's people:
// big heads, short limbs, thick dark outlines. Each kid is an SVG <g> drawn on a 100×150 grid
// (feet at y≈148) and placed in a parent <svg> scene by its feet. Motion is all CSS (index.css)
// and only runs when the visitor allows motion.


export type KidHair = "puffs" | "braids" | "cap" | "short" | "afro";
export type KidPose = "stand" | "wave" | "cheer";
export type KidMotion = "bob" | "jump" | "hop" | "none";
export type KidProp = "bucket" | "jerrycan" | "none";

export type KidProps = {
  x: number; // centre of the feet in the scene
  y: number; // ground line in the scene
  size?: number; // height in scene units
  skin: string;
  top: string;
  bottom: string;
  skirt?: boolean;
  hair: KidHair;
  hairColor?: string;
  accent?: string; // cap, hair ties or braid beads
  pose?: KidPose;
  motion?: KidMotion;
  prop?: KidProp;
  flip?: boolean;
  delay?: number; // seconds, so a group doesn't move in sync
};

const Limb = ({ color, x2 = 0, y2 = 24 }: { color: string; x2?: number; y2?: number }) => (
  <>
    <line x1="0" y1="0" x2={x2} y2={y2} stroke={INK} strokeWidth="12.5" strokeLinecap="round" />
    <line x1="0" y1="0" x2={x2} y2={y2} stroke={color} strokeWidth="7.5" strokeLinecap="round" />
  </>
);

const Arm = ({ at, angle, color, skin, waving }: { at: [number, number]; angle: number; color: string; skin: string; waving?: boolean }) => (
  <g transform={`translate(${at[0]} ${at[1]})`}>
    <g className={waving ? "kid-wave" : "kid-arm"} style={{ transform: `rotate(${angle}deg)` }}>
      <Limb color={color} y2={22} />
      <circle cx="0" cy="27" r="6" fill={skin} stroke={INK} strokeWidth="3" />
    </g>
  </g>
);

const HairBehind = ({ hair, color, accent }: { hair: KidHair; color: string; accent: string }) => {
  if (hair === "afro") return <circle cx="50" cy="38" r="37" fill={color} stroke={INK} strokeWidth="3.5" />;
  if (hair === "puffs")
    return (
      <>
        <circle cx="21" cy="21" r="14" fill={color} stroke={INK} strokeWidth="3.5" />
        <circle cx="79" cy="21" r="14" fill={color} stroke={INK} strokeWidth="3.5" />
        <rect x="27" y="25" width="8" height="6" rx="2" fill={accent} stroke={INK} strokeWidth="2" transform="rotate(-35 31 28)" />
        <rect x="65" y="25" width="8" height="6" rx="2" fill={accent} stroke={INK} strokeWidth="2" transform="rotate(35 69 28)" />
      </>
    );
  if (hair === "braids")
    return (
      <>
        {[18, 82].map((bx) => (
          <g key={bx}>
            {[44, 54, 64, 74].map((by, i) => (
              <circle key={by} cx={bx + (bx < 50 ? -i * 0.8 : i * 0.8)} cy={by} r="6" fill={color} stroke={INK} strokeWidth="2.5" />
            ))}
            <circle cx={bx < 50 ? bx - 3.5 : bx + 3.5} cy="84" r="4.5" fill={accent} stroke={INK} strokeWidth="2.5" />
          </g>
        ))}
      </>
    );
  return null;
};

const HairFront = ({ hair, color, accent }: { hair: KidHair; color: string; accent: string }) => {
  if (hair === "cap")
    return (
      <>
        <path d="M19 40 Q20 11 50 11 Q80 11 81 40 Z" fill={accent} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M50 38 H95 Q99 45 92 46 H50 Z" fill={accent} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <circle cx="50" cy="12" r="3.5" fill={INK} />
      </>
    );
  if (hair === "afro") return <path d="M20 42 Q24 22 50 22 Q76 22 80 42 Q66 32 50 33 Q34 32 20 42 Z" fill={color} />;
  // puffs, braids and short share a neat hairline over the top of the head
  return <path d="M20 44 Q21 15 50 14 Q79 15 80 44 Q68 30 50 31 Q32 30 20 44 Z" fill={color} stroke={INK} strokeWidth="3" strokeLinejoin="round" />;
};

const GroundProp = ({ prop }: { prop: KidProp }) => {
  if (prop === "bucket")
    return (
      <g>
        <path d="M84 123 Q97 104 110 123" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <path d="M82 123 H112 L108 146 H86 Z" fill="#1875D2" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <ellipse cx="97" cy="124" rx="13" ry="3.5" fill="#8fd3ff" stroke={INK} strokeWidth="2.5" />
      </g>
    );
  if (prop === "jerrycan")
    return (
      <g>
        <path d="M88 118 V111 H97 V118" fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <rect x="83" y="117" width="27" height="30" rx="5" fill="#FFB200" stroke={INK} strokeWidth="3.5" />
        <rect x="101" y="110" width="8" height="8" rx="2" fill="#CC2129" stroke={INK} strokeWidth="2.5" />
        <path d="M89 128 H104 M89 136 H104" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      </g>
    );
  return null;
};

export const Kid = ({
  x,
  y,
  size = 150,
  skin,
  top,
  bottom,
  skirt = false,
  hair,
  hairColor = "#1B1B1B",
  accent = "#CC2129",
  pose = "stand",
  motion = "bob",
  prop = "none",
  flip = false,
  delay = 0,
}: KidProps) => {
  const s = size / 150;
  const cheer = pose === "cheer";
  const leftArm = cheer ? 128 : 14;
  const rightArm = cheer ? -128 : pose === "wave" ? -124 : -14;
  const timing: CSSProperties = { animationDelay: `${delay}s` };

  return (
    <g transform={`translate(${x - 50 * s} ${y - 148 * s}) scale(${s})`}>
      <g transform={flip ? "translate(100 0) scale(-1 1)" : undefined}>
        <ellipse cx="50" cy="147" rx="27" ry="4.5" fill="rgba(17,16,14,0.16)" />
        <GroundProp prop={prop} />

        <g className={`kid-body ${motion === "none" ? "" : `kid-${motion}`}`} style={timing}>
          {/* legs and shoes */}
          {[42, 58].map((lx) => (
            <g key={lx} transform={`translate(${lx} 110)`}>
              <Limb color={skin} y2={24} />
            </g>
          ))}
          <ellipse cx="39" cy="140" rx="9.5" ry="5.5" fill={INK} />
          <ellipse cx="61" cy="140" rx="9.5" ry="5.5" fill={INK} />

          {/* shorts or skirt, then the shirt */}
          {skirt ? (
            <path d="M31 100 H69 L76 122 Q50 129 24 122 Z" fill={bottom} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          ) : (
            <path d="M33 102 H67 V117 Q67 121 63 121 H54 L50 114 L46 121 H37 Q33 121 33 117 Z" fill={bottom} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          )}
          <path d="M31 80 Q50 71 69 80 L72 107 Q50 113 28 107 Z" fill={top} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />

          {/* head */}
          <HairBehind hair={hair} color={hairColor} accent={accent} />
          <circle cx="50" cy="46" r="30" fill={skin} stroke={INK} strokeWidth="3.5" />
          <HairFront hair={hair} color={hairColor} accent={accent} />

          {/* face */}
          <g className="kid-eyes" style={{ animationDelay: `${delay * 1.7}s` }}>
            <circle cx="39" cy="51" r="3.8" fill={INK} />
            <circle cx="61" cy="51" r="3.8" fill={INK} />
            <circle cx="40.2" cy="49.8" r="1.2" fill="#fff" />
            <circle cx="62.2" cy="49.8" r="1.2" fill="#fff" />
          </g>
          <circle cx="31" cy="61" r="4.5" fill="#F28B82" opacity="0.55" />
          <circle cx="69" cy="61" r="4.5" fill="#F28B82" opacity="0.55" />
          {cheer ? (
            <path d="M40 61 Q50 77 60 61 Z" fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          ) : (
            <path d="M42 62 Q50 70 58 62" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          )}

          {/* arms last, so raised arms sit in front of the big head */}
          <Arm at={[33, 84]} angle={leftArm} color={top} skin={skin} />
          <Arm at={[67, 84]} angle={rightArm} color={top} skin={skin} waving={pose === "wave"} />
        </g>
      </g>
    </g>
  );
};
