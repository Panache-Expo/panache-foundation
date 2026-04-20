import type { ReactNode } from "react";

import cyesFrameLogo from "@/assets/CYESFrameLogo.svg";
import { motion, useReducedMotion } from "motion/react";

export type CYESHeroCard = {
  image: string;
  alt: string;
  className: string;
};

export type CYESHeroChip = {
  label: string;
  value: string;
  accentClassName?: string;
};

export const getCYESHeadingRevealProps = (shouldReduceMotion: boolean) => ({
  initial: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 34 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.65 } as const,
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
});

export const cyesSurfaceClasses =
  "rounded-[2rem] border border-black/8 bg-white/72 shadow-[0_20px_50px_rgba(17,16,14,0.06)] backdrop-blur-sm";

export const cyesInputClasses =
  "mt-2 h-12 rounded-[1rem] border-black/10 bg-white/76 px-4 font-sans text-[#171411] shadow-none placeholder:text-[#171411]/38 focus-visible:ring-1 focus-visible:ring-[#156D3B]";

export const cyesTextareaClasses =
  "mt-2 min-h-[9rem] rounded-[1.1rem] border-black/10 bg-white/76 px-4 py-3 font-sans text-[#171411] shadow-none placeholder:text-[#171411]/38 focus-visible:ring-1 focus-visible:ring-[#156D3B]";

export const cyesSelectTriggerClasses =
  "mt-2 h-12 rounded-[1rem] border-black/10 bg-white/76 px-4 font-sans text-[#171411] shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-1 focus-visible:ring-[#156D3B]";

export const CYESFloatingLogo = () => (
  <div className="absolute left-0 top-0 z-20 px-6 py-4 md:px-24 md:py-6">
    <img
      src={cyesFrameLogo}
      alt="CYES logo"
      className="pointer-events-none h-10 w-auto object-contain md:h-12"
    />
  </div>
);

export const CYESPhotoCard = ({
  image,
  alt,
  className,
}: CYESHeroCard) => (
  <div
    className={`absolute aspect-[4/5] overflow-hidden rounded-[1.2rem] bg-white shadow-[0_24px_56px_rgba(17,16,14,0.14)] md:rounded-[1.45rem] ${className}`}
  >
    <img src={image} alt={alt} className="h-full w-full object-cover" />
  </div>
);

type CYESInnerHeroProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  actions?: ReactNode;
  chips?: CYESHeroChip[];
  cards: CYESHeroCard[];
  stageClassName?: string;
  mobileImage?: string;
  mobileImageAlt?: string;
  mobileImageClassName?: string;
  panel?: ReactNode;
};

export const CYESInnerHero = ({
  eyebrow,
  title,
  description,
  actions,
  chips,
  cards,
  stageClassName,
  mobileImage,
  mobileImageAlt,
  mobileImageClassName,
  panel,
}: CYESInnerHeroProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden px-6 pb-14 pt-28 md:px-24 md:pb-18 md:pt-36">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_12%_20%,rgba(21,109,59,0.12),transparent_26%),radial-gradient(circle_at_84%_24%,rgba(24,117,210,0.14),transparent_28%),radial-gradient(circle_at_56%_90%,rgba(255,178,0,0.12),transparent_24%),linear-gradient(180deg,#f8f9f3_0%,#f7f8f3_100%)]" />
      <CYESFloatingLogo />

      <div className="relative grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div className="max-w-[35rem]">
          <p className="font-sans text-[0.92rem] font-semibold uppercase tracking-[0.08em] text-[#156D3B]">
            {eyebrow}
          </p>

          <motion.h1
            {...getCYESHeadingRevealProps(shouldReduceMotion)}
            className="mt-5 font-sans text-[clamp(2.4rem,7.8vw,5.2rem)] font-semibold leading-[0.9] tracking-[-0.08em] text-[#171411]"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={
              shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.55 }}
            transition={{ duration: 0.72, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-[32rem] font-sans text-[1.05rem] leading-[1.45] tracking-[-0.025em] text-[#171411]/74 md:text-[1.14rem]"
          >
            {description}
          </motion.p>

          {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}

          {chips?.length ? (
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {chips.map((chip) => (
                <div
                  key={`${chip.label}-${chip.value}`}
                  className={`${cyesSurfaceClasses} px-4 py-4`}
                >
                  <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#171411]/46">
                    {chip.label}
                  </p>
                  <p
                    className={`mt-2 font-sans text-base font-semibold leading-tight tracking-[-0.04em] text-[#171411] ${chip.accentClassName ?? ""}`}
                  >
                    {chip.value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {mobileImage ? (
            <div className="relative mt-12 flex h-[19rem] items-center justify-center md:hidden">
              <div
                className={`absolute h-[17rem] w-[min(74vw,17rem)] overflow-hidden rounded-[1.05rem] bg-white shadow-[0_24px_56px_rgba(17,16,14,0.16)] ${mobileImageClassName ?? "rotate-[10deg]"}`}
              >
                <img
                  src={mobileImage}
                  alt={mobileImageAlt ?? "CYES feature image"}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ) : null}
        </div>

        <div
          className={`relative hidden w-full overflow-visible md:block ${stageClassName ?? "h-[30rem] lg:h-[36rem]"}`}
        >
          {cards.map((card) => (
            <CYESPhotoCard key={`${card.alt}-${card.className}`} {...card} />
          ))}
          {panel}
        </div>
      </div>
    </section>
  );
};

type CYESSectionIntroProps = {
  eyebrow?: string;
  title: ReactNode;
  description: string;
  titleClassName?: string;
  descriptionClassName?: string;
  align?: "start" | "center";
};

export const CYESSectionIntro = ({
  eyebrow,
  title,
  description,
  titleClassName,
  descriptionClassName,
  align = "start",
}: CYESSectionIntroProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={`grid gap-8 lg:grid-cols-[0.88fr_1.12fr] ${align === "center" ? "items-center" : "items-start"}`}
    >
      <div>
        {eyebrow ? (
          <p className="font-sans text-[0.92rem] font-semibold uppercase tracking-[0.08em] text-[#156D3B]">
            {eyebrow}
          </p>
        ) : null}

        <motion.h2
          {...getCYESHeadingRevealProps(shouldReduceMotion)}
          className={`mt-4 font-sans text-[clamp(2.1rem,4vw,3.5rem)] font-semibold leading-[0.92] tracking-[-0.07em] text-[#171411] ${titleClassName ?? ""}`}
        >
          {title}
        </motion.h2>
      </div>

      <p
        className={`max-w-[40rem] font-sans text-[clamp(1.08rem,2vw,1.45rem)] leading-[1.35] tracking-[-0.03em] text-[#171411]/74 lg:ml-auto ${descriptionClassName ?? ""}`}
      >
        {description}
      </p>
    </div>
  );
};
