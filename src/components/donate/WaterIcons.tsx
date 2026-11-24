import type { SVGProps } from "react";

// Little water containers for the donation amount chips. The outline follows the text colour
// (currentColor), so they read on the dark chips and on the yellow selected chip.

type IconProps = SVGProps<SVGSVGElement>;

const Base = ({ children, ...props }: IconProps) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true" focusable="false" {...props}>
    {children}
  </svg>
);

export const CupIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M8 9 H24 L21.5 27 H10.5 Z" fill="#8FD3FF" />
    <path d="M9 13.5 H23" />
  </Base>
);

export const BucketIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M6.5 12 Q16 1 25.5 12" />
    <path d="M5.5 12 H26.5 L23.5 28 H8.5 Z" fill="#1875D2" />
    <ellipse cx="16" cy="12.5" rx="9" ry="2" fill="#8FD3FF" />
  </Base>
);

export const JerrycanIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M10 9 V5 H16 V9" />
    <rect x="6.5" y="9" width="19" height="19" rx="3.5" fill="#FFB200" />
    <rect x="20" y="4" width="5.5" height="5.5" rx="1.2" fill="#CC2129" />
  </Base>
);

export const DrumIcon = (props: IconProps) => (
  <Base {...props}>
    <rect x="8" y="4.5" width="16" height="24" rx="3.5" fill="#156D3B" />
    <path d="M8 12 H24 M8 21 H24" />
  </Base>
);

export const TankIcon = (props: IconProps) => (
  <Base {...props}>
    <rect x="12" y="3" width="8" height="4" rx="1.2" fill="#1875D2" />
    <rect x="5.5" y="6.5" width="21" height="19" rx="5" fill="#EEF6FD" />
    <path d="M6 16 Q11 14 16 16 T26 16 V21 Q26 25.5 21.5 25.5 H10.5 Q6 25.5 6 21 Z" fill="#1875D2" stroke="none" />
    <rect x="5.5" y="6.5" width="21" height="19" rx="5" />
    <path d="M9 25.5 V29 M23 25.5 V29" />
  </Base>
);

export const DropPlusIcon = (props: IconProps) => (
  <Base {...props}>
    <path d="M16 3.5 C11 10 7.5 14.5 7.5 19 A8.5 8.5 0 0 0 24.5 19 C24.5 14.5 21 10 16 3.5 Z" fill="#8FD3FF" />
    <path d="M16 15 V23 M12 19 H20" />
  </Base>
);
