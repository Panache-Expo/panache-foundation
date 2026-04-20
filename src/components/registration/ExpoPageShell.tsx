import type { ReactNode } from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const revealTransition = {
  duration: 0.72,
  ease: [0.22, 1, 0.36, 1] as const,
};

export const expoInputClasses =
  "mt-2 h-12 rounded-[1.35rem] border border-black/10 bg-white/88 px-4 text-[15px] text-[#171411] shadow-none placeholder:text-[#171411]/42 focus-visible:ring-2 focus-visible:ring-[#8241B6]/25 focus-visible:ring-offset-0";

export const expoTextareaClasses =
  "mt-2 min-h-[120px] rounded-[1.35rem] border border-black/10 bg-white/88 px-4 py-3 text-[15px] text-[#171411] shadow-none placeholder:text-[#171411]/42 focus-visible:ring-2 focus-visible:ring-[#8241B6]/25 focus-visible:ring-offset-0";

export const expoSelectTriggerClasses =
  "mt-2 h-12 rounded-[1.35rem] border border-black/10 bg-white/88 px-4 text-left text-[15px] text-[#171411] shadow-none focus:ring-2 focus:ring-[#8241B6]/25 focus:ring-offset-0";

export const expoCheckboxClasses =
  "mt-1 h-5 w-5 rounded-md border-black/20 data-[state=checked]:border-[#171411] data-[state=checked]:bg-[#171411] data-[state=checked]:text-white";

interface ExpoPageHeroProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
  image?: string;
  panelLabel: string;
  panelTitle: string;
  panelDescription: string;
  panelItems: Array<{ label: string; value: string }>;
}

export const ExpoPageHero = ({
  eyebrow,
  title,
  description,
  image,
  panelLabel,
  panelTitle,
  panelDescription,
  panelItems,
}: ExpoPageHeroProps) => {
  return (
    <section className="relative overflow-hidden bg-[#161311] text-white">
      {image ? (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/66 to-[#271a18]/88" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,233,63,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(130,65,182,0.22),transparent_30%)]" />

      <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-28 sm:pb-16 sm:pt-32 lg:grid lg:grid-cols-[1.12fr,0.88fr] lg:gap-10 lg:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={revealTransition}
          className="max-w-3xl"
        >
          <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.28em] text-[#f4e93f]/90">
            {eyebrow}
          </p>
          <h1 className="mt-5 font-sans text-[clamp(3rem,7vw,6.3rem)] font-bold leading-[0.9] tracking-[-0.055em] text-white">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl font-sans text-[clamp(1rem,1.8vw,1.3rem)] leading-[1.45] text-white/80">
            {description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 42, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...revealTransition, delay: 0.08 }}
          className="mt-10 lg:mt-0 lg:self-end"
        >
          <div className="rounded-[2rem] border border-white/14 bg-white/10 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-white/62">
              {panelLabel}
            </p>
            <h2 className="mt-3 font-sans text-[1.7rem] font-semibold leading-tight tracking-[-0.045em] text-white">
              {panelTitle}
            </h2>
            <p className="mt-3 font-sans text-sm leading-relaxed text-white/74">
              {panelDescription}
            </p>
            <div className="mt-7 space-y-3">
              {panelItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start justify-between gap-4 rounded-[1.2rem] border border-white/10 bg-black/10 px-4 py-3"
                >
                  <span className="font-sans text-sm text-white/66">{item.label}</span>
                  <span className="text-right font-sans text-sm font-semibold text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

interface ExpoSidebarCardProps {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  footer?: ReactNode;
  className?: string;
}

export const ExpoSidebarCard = ({
  eyebrow,
  title,
  description,
  points,
  footer,
  className,
}: ExpoSidebarCardProps) => {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={revealTransition}
      className={cn(
        "rounded-[2rem] border border-black/10 bg-white/82 p-6 shadow-[0_30px_80px_rgba(25,17,12,0.08)] backdrop-blur-sm md:p-7 lg:sticky lg:top-28",
        className,
      )}
    >
      <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.26em] text-[#8241B6]">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-sans text-[clamp(2rem,3vw,2.8rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#171411]">
        {title}
      </h2>
      <p className="mt-4 font-sans text-[0.98rem] leading-relaxed text-[#171411]/70">
        {description}
      </p>
      <div className="mt-7 space-y-3">
        {points.map((point) => (
          <div key={point} className="flex items-start gap-3 rounded-[1.15rem] bg-[#f8f2e8] px-4 py-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8241B6]" />
            <p className="font-sans text-sm leading-relaxed text-[#171411]/78">{point}</p>
          </div>
        ))}
      </div>
      {footer ? <div className="mt-7">{footer}</div> : null}
    </motion.aside>
  );
};

interface ExpoSurfaceProps {
  children: ReactNode;
  className?: string;
}

export const ExpoSurface = ({ children, className }: ExpoSurfaceProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={revealTransition}
      className={cn(
        "relative rounded-[2rem] border border-black/10 bg-white/84 p-6 shadow-[0_30px_80px_rgba(25,17,12,0.08)] backdrop-blur-sm md:p-8",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};
