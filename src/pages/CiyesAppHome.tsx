import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  Calculator,
  ChartColumn,
  Check,
  ClipboardList,
  Clock3,
  Globe,
  HeartHandshake,
  Languages,
  MessageCircleQuestion,
  Play,
  Receipt,
  Repeat2,
  Rocket,
  Share2,
  Smartphone,
  Sparkles,
  Store,
  Ticket,
  Users,
  Vote,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Footer } from "@/components/Footer";
import { WhatsAppLogo } from "@/components/WhatsAppLogo";
import ciyesMark from "@/assets/ciyes-mark.svg";
import { trackEvent } from "@/lib/analytics";
import { PANACHE_SUPPORT_WHATSAPP_HREF } from "@/lib/registration-links";
import {
  CIYES_HOME_CONTENT,
  CIYES_PRO_PLANS,
  CIYES_WAITLIST_URL,
  detectCiyesLang,
  formatCiyesPrice,
  normalizeWhatsAppNumber,
  saveCiyesLang,
  type CiyesLang,
  type CiyesPhoneOs,
  type CiyesWaitlistRole,
} from "@/lib/ciyes-home-content";

const WAITLIST_API_URL =
  import.meta.env.VITE_CIYES_WAITLIST_API_URL || "/api/ciyes-waitlist";

const GREEN = "#156D3B";
const BLUE = "#1875D2";
const RED = "#CC2129";
const YELLOW = "#FFB200";
const ACCENTS = [GREEN, BLUE, RED, YELLOW];

const PROBLEM_ICONS: LucideIcon[] = [Clock3, MessageCircleQuestion, Receipt, ClipboardList];
const FEATURE_ICONS: LucideIcon[] = [Store, Wallet, Ticket, Share2, ChartColumn, Vote, BadgeCheck];
const SOON_ICONS: LucideIcon[] = [Globe, CalendarCheck, Calculator, Repeat2];
const WHO_ICONS: LucideIcon[] = [Rocket, Sparkles, CalendarDays, HeartHandshake, Users];
const ROLES: CiyesWaitlistRole[] = ["entrepreneur", "organiser", "ngo", "customer"];
const PHONE_OPTIONS: { value: CiyesPhoneOs; label: string }[] = [
  { value: "android", label: "Android" },
  { value: "iphone", label: "iPhone" },
];

const surface =
  "rounded-[1.75rem] border border-black/8 bg-white/80 shadow-[0_18px_44px_rgba(17,16,14,0.06)]";
const inputClasses =
  "mt-2 h-12 rounded-[1rem] border-black/10 bg-white px-4 font-sans text-base text-[#171411] shadow-none placeholder:text-[#171411]/35 focus-visible:ring-1 focus-visible:ring-[#156D3B]";

type Status = "idle" | "sending" | "success" | "already" | "error";

const scrollToId = (id: string, behavior: ScrollBehavior = "smooth") => {
  document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
};

const readSource = () => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("ref") || params.get("utm_source") || "";
  const clean = raw.toLowerCase().replace(/[^a-z0-9_.-]/g, "").slice(0, 40);
  return clean || null;
};

const Reveal = ({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

const SectionHeading = ({ eyebrow, title, color = GREEN, text }: { eyebrow: string; title: string; color?: string; text?: string }) => (
  <Reveal className="max-w-3xl">
    <p className="font-sans text-[0.8rem] font-semibold uppercase tracking-[0.18em]" style={{ color }}>
      {eyebrow}
    </p>
    <h2 className="mt-3 font-display text-[clamp(2rem,4.4vw,3.6rem)] font-bold leading-[0.98] tracking-[-0.04em] text-[#171411]">
      {title}
    </h2>
    {text ? <p className="mt-4 font-sans text-base leading-relaxed text-[#171411]/68 md:text-lg">{text}</p> : null}
  </Reveal>
);

const CiyesAppHome = ({ focusWaitlist = false }: { focusWaitlist?: boolean }) => {
  const [lang, setLang] = useState<CiyesLang>(() => detectCiyesLang());
  const t = CIYES_HOME_CONTENT[lang];
  const videoRef = useRef<HTMLVideoElement>(null);
  const waitlistRef = useRef<HTMLElement>(null);
  const [waitlistInView, setWaitlistInView] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState<CiyesWaitlistRole | null>(null);
  const [phoneOs, setPhoneOs] = useState<CiyesPhoneOs | null>(null);
  const [website, setWebsite] = useState(""); // honeypot: real people never see this field
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<"name" | "phone" | "email" | "role" | "form", string>>>({});

  // Title, description and <html lang> follow the chosen language.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.meta.description);
  }, [lang, t]);

  // /waitlist and #waitlist land on the form.
  useEffect(() => {
    if (!focusWaitlist && window.location.hash !== "#waitlist") return;
    // Instant jump (after the app's scroll-to-top on route change) so the visitor lands on the form.
    const timer = window.setTimeout(() => scrollToId("waitlist", "instant"), 180);
    return () => window.clearTimeout(timer);
  }, [focusWaitlist]);

  // Hide the phone's sticky button while the form itself is on screen.
  useEffect(() => {
    const node = waitlistRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setWaitlistInView(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const clearError = (key: "name" | "phone" | "email" | "role") =>
    setErrors((current) => (current[key] || current.form ? { ...current, [key]: undefined, form: undefined } : current));

  const switchLang = () => {
    const next: CiyesLang = lang === "en" ? "fr" : "en";
    setLang(next);
    saveCiyesLang(next);
    setErrors({});
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState(null, "", url.toString());
  };

  const watchVideo = () => {
    scrollToId("video");
    window.setTimeout(() => {
      videoRef.current?.play().catch(() => undefined);
    }, 450);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    const cleanName = name.trim();
    const normalizedPhone = normalizeWhatsAppNumber(phone);
    const cleanEmail = email.trim();
    if (cleanName.length < 2) nextErrors.name = t.waitlist.errors.name;
    if (!normalizedPhone) nextErrors.phone = t.waitlist.errors.phone;
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) nextErrors.email = t.waitlist.errors.email;
    if (!role) nextErrors.role = t.waitlist.errors.role;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setStatus("sending");
    try {
      const response = await fetch(WAITLIST_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: cleanName,
          whatsappPhone: normalizedPhone,
          email: cleanEmail || null,
          city: city.trim() || null,
          role,
          phoneOs,
          language: lang,
          source: readSource(),
          website,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) {
        if (payload?.field === "whatsappPhone") {
          setErrors({ phone: t.waitlist.errors.phone });
          setStatus("idle");
          return;
        }
        throw new Error(payload?.message || "Waitlist request failed");
      }
      setStatus(payload.already ? "already" : "success");
      trackEvent("ciyes_waitlist_join", { role, lang, already: Boolean(payload.already), source: readSource() });
    } catch {
      setErrors({ form: t.waitlist.errors.generic });
      setStatus("error");
    }
  };

  const shareHref = `https://wa.me/?text=${encodeURIComponent(`${t.waitlist.shareMessage} ${CIYES_WAITLIST_URL}`)}`;
  const done = status === "success" || status === "already";

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-[#171411]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_8%,rgba(21,109,59,0.10),transparent_28%),radial-gradient(circle_at_88%_14%,rgba(24,117,210,0.10),transparent_26%),radial-gradient(circle_at_60%_95%,rgba(255,178,0,0.10),transparent_30%)]" />

      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f7f8f3]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 md:h-[4.5rem] md:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="CIYES">
            <img src={ciyesMark} alt="" className="h-9 w-auto md:h-10" />
            <span className="leading-none">
              <span className="block font-sans text-xl font-bold tracking-[-0.03em] md:text-2xl">CIYES</span>
              <span className="hidden font-sans text-[0.72rem] font-medium text-[#171411]/55 sm:block">{t.nav.by}</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={switchLang}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 font-sans text-sm font-semibold text-[#171411] transition hover:bg-white"
              aria-label={t.nav.switchTo}
            >
              <Languages className="h-4 w-4" />
              {t.nav.switchTo}
            </button>
            <Button
              onClick={() => scrollToId("waitlist")}
              className="hidden h-10 rounded-full px-5 font-sans text-sm font-semibold text-white sm:inline-flex"
              style={{ backgroundColor: GREEN }}
            >
              {t.nav.waitlist}
            </Button>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-10 md:px-8 md:pt-16 lg:grid-cols-[1fr,1.08fr] lg:gap-14 lg:pb-24">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/80 px-3.5 py-1.5 font-sans text-[0.8rem] font-semibold text-[#171411]/75">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: GREEN }} />
              {t.hero.eyebrow}
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.7rem,6.4vw,4.9rem)] font-bold leading-[0.95] tracking-[-0.045em]">
              <span className="block" style={{ color: GREEN }}>{t.hero.lines[0]}</span>
              <span className="block" style={{ color: BLUE }}>{t.hero.lines[1]}</span>
              <span className="block" style={{ color: RED }}>{t.hero.lines[2]}</span>
            </h1>
            <p className="mt-5 inline-block rounded-full bg-[#171411] px-5 py-2 font-sans text-lg font-semibold text-white">
              {t.hero.tagline}
            </p>
            <p className="mt-6 max-w-xl font-sans text-[1.05rem] leading-relaxed text-[#171411]/72 md:text-lg">{t.hero.text}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => scrollToId("waitlist")}
                className="h-[3.25rem] rounded-full px-7 py-3.5 font-sans text-base font-semibold text-white shadow-[0_16px_36px_rgba(21,109,59,0.35)]"
                style={{ backgroundColor: GREEN }}
              >
                {t.hero.primary}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={watchVideo}
                className="h-[3.25rem] rounded-full border-black/10 bg-white/80 px-6 py-3.5 font-sans text-base font-semibold text-[#171411] hover:bg-white"
              >
                <Play className="mr-2 h-4 w-4" style={{ color: RED }} />
                {t.hero.secondary}
              </Button>
            </div>
            <ul className="mt-7 flex flex-wrap gap-2">
              {t.hero.chips.map((chip, i) => (
                <li key={chip} className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/70 px-3 py-1.5 font-sans text-sm font-medium text-[#171411]/75">
                  <Check className="h-3.5 w-3.5" style={{ color: ACCENTS[i % ACCENTS.length] }} />
                  {chip}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <div id="video" className="scroll-mt-24 overflow-hidden rounded-[1.75rem] border border-black/8 bg-white shadow-[0_30px_70px_rgba(17,16,14,0.14)]">
              <video
                key={lang}
                ref={videoRef}
                className="aspect-video w-full bg-[#fbf8fa]"
                controls
                playsInline
                preload="none"
                poster={`/videos/ciyes-${lang}-poster.jpg`}
                aria-label={t.hero.videoLabel}
              >
                <source src={`/videos/ciyes-${lang}.mp4`} type="video/mp4" />
              </video>
            </div>
          </Reveal>
        </section>

        {/* Problem */}
        <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
          <SectionHeading eyebrow={t.problem.eyebrow} title={t.problem.title} color={RED} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.problem.cards.map((card, i) => {
              const Icon = PROBLEM_ICONS[i];
              return (
                <Reveal key={card.title} delay={i * 0.05} className={`${surface} p-6`}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#CC2129]/10">
                    <Icon className="h-5 w-5" style={{ color: RED }} />
                  </span>
                  <h3 className="mt-5 font-sans text-lg font-bold leading-snug tracking-[-0.02em]">{card.title}</h3>
                  <p className="mt-2 font-sans text-[0.95rem] leading-relaxed text-[#171411]/65">{card.text}</p>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
          <SectionHeading eyebrow={t.features.eyebrow} title={t.features.title} />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {t.features.items.map((item, i) => {
              const Icon = FEATURE_ICONS[i];
              const isPro = i === t.features.items.length - 1;
              const color = ACCENTS[i % ACCENTS.length];
              if (isPro) {
                return (
                  <Reveal key={item.title} className="rounded-[1.75rem] bg-[#171411] p-6 text-white md:col-span-2 lg:col-span-3 lg:flex lg:items-center lg:justify-between lg:p-8">
                    <div className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: YELLOW }}>
                        <Icon className="h-5 w-5 text-[#171411]" />
                      </span>
                      <div>
                        <h3 className="font-sans text-xl font-bold tracking-[-0.02em]">{item.title}</h3>
                        <p className="mt-1 font-sans text-[0.95rem] leading-relaxed text-white/70">{item.text}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => scrollToId("pricing")}
                      className="mt-5 h-11 rounded-full bg-white px-5 font-sans text-sm font-semibold text-[#171411] hover:bg-white/90 lg:mt-0"
                    >
                      {t.pricing.eyebrow}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </Reveal>
                );
              }
              return (
                <Reveal key={item.title} delay={(i % 3) * 0.05} className={`${surface} p-6`}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}1A` }}>
                    <Icon className="h-5 w-5" style={{ color: color === YELLOW ? "#B07F00" : color }} />
                  </span>
                  <h3 className="mt-5 font-sans text-lg font-bold tracking-[-0.02em]">{item.title}</h3>
                  <p className="mt-2 font-sans text-[0.95rem] leading-relaxed text-[#171411]/65">{item.text}</p>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Coming soon */}
        <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
          <SectionHeading eyebrow={t.soon.eyebrow} title={t.soon.title} color={BLUE} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.soon.items.map((item, i) => {
              const Icon = SOON_ICONS[i];
              return (
                <Reveal key={item} delay={i * 0.05} className={`${surface} flex flex-col gap-5 p-6`}>
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1875D2]/10">
                      <Icon className="h-5 w-5" style={{ color: BLUE }} />
                    </span>
                    <span className="rounded-full border border-black/10 px-3 py-1 font-sans text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#171411]/55">
                      {t.soon.badge}
                    </span>
                  </div>
                  <h3 className="font-sans text-lg font-bold leading-snug tracking-[-0.02em]">{item}</h3>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Who it's for */}
        <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
          <SectionHeading eyebrow={t.who.eyebrow} title={t.who.title} color={BLUE} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {t.who.items.map((item, i) => {
              const Icon = WHO_ICONS[i];
              const color = [GREEN, BLUE, RED, "#FF7900", "#E7B008"][i];
              return (
                <Reveal key={item.title} delay={i * 0.05} className={`${surface} p-6`}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
                    <Icon className="h-5 w-5 text-white" />
                  </span>
                  <h3 className="mt-5 font-sans text-lg font-bold leading-tight tracking-[-0.02em]">{item.title}</h3>
                  <p className="mt-2 font-sans text-[0.92rem] leading-relaxed text-[#171411]/65">{item.text}</p>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-14 md:px-8 md:py-20">
          <SectionHeading eyebrow={t.pricing.eyebrow} title={t.pricing.title} text={t.pricing.text} />
          <div className="mt-10 grid gap-5 lg:grid-cols-[0.8fr,1.2fr]">
            <Reveal className={`${surface} flex flex-col p-7`}>
              <p className="font-sans text-sm font-bold uppercase tracking-[0.14em] text-[#171411]/55">{t.pricing.free.name}</p>
              <p className="mt-3 font-display text-5xl font-bold tracking-[-0.04em]">{t.pricing.free.price}</p>
              <ul className="mt-6 space-y-3">
                {t.pricing.free.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 font-sans text-[0.98rem] text-[#171411]/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GREEN }} />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.08} className="rounded-[1.75rem] bg-[#171411] p-7 text-white shadow-[0_30px_70px_rgba(17,16,14,0.22)]">
              <div className="flex items-center justify-between gap-3">
                <p className="font-sans text-sm font-bold uppercase tracking-[0.14em]" style={{ color: YELLOW }}>{t.pricing.pro.name}</p>
                <span className="rounded-full bg-white/10 px-3 py-1 font-sans text-xs font-semibold text-white/80">{t.pricing.pro.badge}</span>
              </div>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {t.pricing.pro.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 font-sans text-[0.95rem] text-white/85">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: YELLOW }} />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {CIYES_PRO_PLANS.map((plan) => {
                  const best = plan.months === 12;
                  return (
                    <div
                      key={plan.months}
                      className={`relative rounded-[1.25rem] border p-4 ${best ? "border-[#FFB200] bg-[#FFB200]/10" : "border-white/12 bg-white/[0.04]"}`}
                    >
                      {best ? (
                        <span className="absolute -top-3 right-3 rounded-full px-2.5 py-0.5 font-sans text-[0.7rem] font-bold text-[#171411]" style={{ backgroundColor: YELLOW }}>
                          {t.pricing.bestValue}
                        </span>
                      ) : null}
                      <p className="font-sans text-sm font-semibold text-white/70">{t.pricing.planLabel(plan.months)}</p>
                      <p className="mt-1 font-sans text-[1.6rem] font-bold leading-tight tracking-[-0.03em]">{formatCiyesPrice(lang, plan.priceXaf)}</p>
                      <p className="mt-1 font-sans text-xs text-white/60">
                        {t.pricing.perMonth(formatCiyesPrice(lang, plan.priceXaf / plan.months))}
                      </p>
                      {plan.freeMonths ? (
                        <p className="mt-3 inline-block rounded-full px-2.5 py-1 font-sans text-xs font-bold text-[#171411]" style={{ backgroundColor: YELLOW }}>
                          {t.pricing.freeMonths(plan.freeMonths)}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <p className="mt-6 font-sans text-sm leading-relaxed text-white/65">{t.pricing.note}</p>
              <Button
                onClick={() => scrollToId("waitlist")}
                className="mt-5 h-12 rounded-full px-6 font-sans text-sm font-semibold text-[#171411] hover:opacity-90"
                style={{ backgroundColor: YELLOW }}
              >
                {t.pricing.cta}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.8fr,1.2fr]">
            <SectionHeading eyebrow={t.faq.eyebrow} title={t.faq.title} />
            <Reveal className={`${surface} px-6 py-2`}>
              <Accordion type="single" collapsible>
                {t.faq.items.map((item, i) => (
                  <AccordionItem key={item.q} value={`q${i}`} className={i === t.faq.items.length - 1 ? "border-b-0" : "border-black/8"}>
                    <AccordionTrigger className="text-left font-sans text-base font-semibold hover:no-underline">{item.q}</AccordionTrigger>
                    <AccordionContent className="font-sans text-[0.98rem] leading-relaxed text-[#171411]/70">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </section>

        {/* Waitlist */}
        <section id="waitlist" ref={waitlistRef} className="mx-auto max-w-6xl scroll-mt-20 px-5 py-14 md:px-8 md:py-20">
          <div className="grid gap-8 overflow-hidden rounded-[2.2rem] bg-[#171411] p-6 text-white shadow-[0_30px_80px_rgba(17,16,14,0.25)] md:p-10 lg:grid-cols-[0.9fr,1.1fr] lg:gap-12 lg:p-12">
            <div>
              <p className="font-sans text-[0.8rem] font-semibold uppercase tracking-[0.18em]" style={{ color: YELLOW }}>{t.waitlist.eyebrow}</p>
              <h2 className="mt-3 font-display text-[clamp(2rem,4.2vw,3.4rem)] font-bold leading-[0.98] tracking-[-0.04em]">{t.waitlist.title}</h2>
              <p className="mt-4 font-sans text-base leading-relaxed text-white/72 md:text-lg">{t.waitlist.text}</p>
              <ul className="mt-6 space-y-2.5">
                {t.hero.chips.map((chip) => (
                  <li key={chip} className="flex items-center gap-3 font-sans text-[0.98rem] text-white/80">
                    <Smartphone className="h-4 w-4" style={{ color: YELLOW }} />
                    {chip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.6rem] bg-white p-5 text-[#171411] md:p-7">
              {done ? (
                <div className="flex min-h-[22rem] flex-col items-start justify-center" role="status">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: GREEN }}>
                    <Check className="h-7 w-7 text-white" />
                  </span>
                  <h3 className="mt-5 font-display text-3xl font-bold tracking-[-0.03em]">
                    {status === "already" ? t.waitlist.alreadyTitle : t.waitlist.successTitle}
                  </h3>
                  <p className="mt-3 font-sans text-base leading-relaxed text-[#171411]/70">
                    {status === "already" ? t.waitlist.alreadyText : t.waitlist.successText}
                  </p>
                  <a href={shareHref} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex">
                    <Button className="h-12 rounded-full bg-[#25D366] px-6 font-sans text-sm font-semibold text-white hover:bg-[#25D366]/90">
                      <WhatsAppLogo className="mr-2 h-4 w-4" />
                      {t.waitlist.share}
                    </Button>
                  </a>
                </div>
              ) : (
                <form onSubmit={submit} noValidate className="space-y-5">
                  <div>
                    <Label htmlFor="ciyes-name" className="font-sans text-sm font-semibold">{t.waitlist.name}</Label>
                    <Input id="ciyes-name" value={name} onChange={(e) => { setName(e.target.value); clearError("name"); }} autoComplete="name" className={inputClasses} aria-invalid={Boolean(errors.name)} />
                    {errors.name ? <p className="mt-1.5 font-sans text-sm text-[#CC2129]">{errors.name}</p> : null}
                  </div>
                  <div>
                    <Label htmlFor="ciyes-phone" className="font-sans text-sm font-semibold">{t.waitlist.phone}</Label>
                    <Input
                      id="ciyes-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder={t.waitlist.phonePlaceholder}
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); clearError("phone"); }}
                      className={inputClasses}
                      aria-invalid={Boolean(errors.phone)}
                    />
                    {errors.phone ? <p className="mt-1.5 font-sans text-sm text-[#CC2129]">{errors.phone}</p> : null}
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="ciyes-email" className="font-sans text-sm font-semibold">
                        {t.waitlist.email} <span className="font-normal text-[#171411]/45">({t.waitlist.optional})</span>
                      </Label>
                      <Input id="ciyes-email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); clearError("email"); }} className={inputClasses} aria-invalid={Boolean(errors.email)} />
                      {errors.email ? <p className="mt-1.5 font-sans text-sm text-[#CC2129]">{errors.email}</p> : null}
                    </div>
                    <div>
                      <Label htmlFor="ciyes-city" className="font-sans text-sm font-semibold">
                        {t.waitlist.city} <span className="font-normal text-[#171411]/45">({t.waitlist.optional})</span>
                      </Label>
                      <Input id="ciyes-city" autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)} className={inputClasses} />
                    </div>
                  </div>
                  <fieldset>
                    <legend className="font-sans text-sm font-semibold">{t.waitlist.role}</legend>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {ROLES.map((value) => {
                        const active = role === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => { setRole(value); clearError("role"); }}
                            aria-pressed={active}
                            className={`min-h-12 rounded-[1rem] border px-4 py-2.5 text-left font-sans text-sm font-semibold transition ${active ? "border-[#156D3B] bg-[#156D3B]/8 text-[#156D3B]" : "border-black/10 bg-white text-[#171411]/80 hover:border-black/25"}`}
                          >
                            {t.waitlist.roles[value]}
                          </button>
                        );
                      })}
                    </div>
                    {errors.role ? <p className="mt-1.5 font-sans text-sm text-[#CC2129]">{errors.role}</p> : null}
                  </fieldset>
                  <fieldset>
                    <legend className="font-sans text-sm font-semibold">
                      {t.waitlist.phoneOs} <span className="font-normal text-[#171411]/45">({t.waitlist.optional})</span>
                    </legend>
                    <div className="mt-2 flex gap-2">
                      {PHONE_OPTIONS.map((option) => {
                        const active = phoneOs === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setPhoneOs(active ? null : option.value)}
                            aria-pressed={active}
                            className={`h-11 flex-1 rounded-full border px-4 font-sans text-sm font-semibold transition ${active ? "border-[#1875D2] bg-[#1875D2]/8 text-[#1875D2]" : "border-black/10 bg-white text-[#171411]/80 hover:border-black/25"}`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                  {/* Honeypot for bots: hidden from people and screen readers. */}
                  <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
                    <label htmlFor="ciyes-website">Website</label>
                    <input id="ciyes-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                  </div>
                  {errors.form ? (
                    <p className="rounded-[1rem] bg-[#CC2129]/8 px-4 py-3 font-sans text-sm text-[#CC2129]">
                      {errors.form}{" "}
                      <a href={PANACHE_SUPPORT_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                        WhatsApp
                      </a>
                    </p>
                  ) : null}
                  <Button
                    type="submit"
                    disabled={status === "sending"}
                    className="h-[3.25rem] w-full rounded-full py-3.5 font-sans text-base font-semibold text-white"
                    style={{ backgroundColor: GREEN }}
                  >
                    {status === "sending" ? t.waitlist.sending : t.waitlist.submit}
                  </Button>
                  <p className="font-sans text-xs leading-relaxed text-[#171411]/50">{t.waitlist.privacy}</p>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* From Panache Foundation */}
        <section className="mx-auto max-w-6xl px-5 pb-20 pt-6 md:px-8">
          <SectionHeading eyebrow={t.foundation.eyebrow} title={t.foundation.title} color="#8241B6" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {t.foundation.cards.map((card, i) => (
              <Reveal key={card.to} delay={i * 0.05} className={`${surface} flex flex-col p-6`}>
                <h3 className="font-sans text-lg font-bold tracking-[-0.02em]">{card.title}</h3>
                <p className="mt-2 flex-1 font-sans text-[0.95rem] leading-relaxed text-[#171411]/65">{card.text}</p>
                <Link to={card.to} className="mt-5 inline-flex items-center font-sans text-sm font-semibold text-[#171411] hover:underline">
                  {card.cta}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      <Footer variant="cyes" />

      {/* Phone-only sticky button, hidden once the form is on screen or done. */}
      {!waitlistInView && !done ? (
        <div className="fixed bottom-5 left-4 right-[5.25rem] z-40 sm:hidden">
          <Button
            onClick={() => scrollToId("waitlist")}
            className="h-[3.25rem] w-full rounded-full py-3.5 font-sans text-base font-semibold text-white shadow-[0_18px_40px_rgba(21,109,59,0.45)]"
            style={{ backgroundColor: GREEN }}
          >
            {t.nav.waitlist}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default CiyesAppHome;
