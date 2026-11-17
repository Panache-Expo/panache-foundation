import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Languages, Play } from "lucide-react";
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

// The CIYES app homepage, set in the Panache Foundation homepage's design language:
// cool off-white page, near-black ink, Reckless Neue display lines mixed with Matter,
// black pill buttons, white rounded panels and one dark panel that holds the main action.

const WAITLIST_API_URL =
  import.meta.env.VITE_CIYES_WAITLIST_API_URL || "/api/ciyes-waitlist";

const DOTS = ["#156D3B", "#1875D2", "#CC2129", "#E7B008"];
const ROLES: CiyesWaitlistRole[] = ["entrepreneur", "organiser", "ngo", "customer"];
const PHONE_OPTIONS: { value: CiyesPhoneOs; label: string }[] = [
  { value: "android", label: "Android" },
  { value: "iphone", label: "iPhone" },
];

const panel =
  "rounded-[2rem] border border-black/8 bg-white/80 shadow-[0_18px_42px_rgba(17,16,14,0.06)]";
const displayHeading =
  "font-display font-bold leading-[0.94] tracking-[-0.05em] text-[#11100e]";
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#156D3B]";
const darkInput =
  "mt-2 h-12 rounded-[1rem] border-white/12 bg-white/[0.07] px-4 font-sans text-base text-white shadow-none placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-white/70 focus-visible:ring-offset-0";

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

const CiyesAppHome = ({ focusWaitlist = false }: { focusWaitlist?: boolean }) => {
  const reduceMotion = useReducedMotion();
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

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.meta.description);
  }, [lang, t]);

  // /waitlist and #waitlist land on the form (after the app's scroll-to-top on route change).
  useEffect(() => {
    if (!focusWaitlist && window.location.hash !== "#waitlist") return;
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

  const goToWaitlist = () => {
    scrollToId("waitlist");
    window.setTimeout(() => document.getElementById("ciyes-name")?.focus({ preventScroll: true }), 500);
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

  // The page's one authored motion: the headline lines rise in, one after another.
  const line = (i: number) =>
    reduceMotion
      ? {}
      : {
          // Starts visible: if the animation never runs, the headline is still there.
          initial: { y: 22 },
          animate: { y: 0 },
          transition: { duration: 0.7, delay: 0.08 + i * 0.09, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#14110f] selection:bg-[#156D3B]/20 selection:text-[#11100e]">
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(21,109,59,0.07),transparent_24%),radial-gradient(circle_at_85%_16%,rgba(24,117,210,0.08),transparent_22%),linear-gradient(180deg,#f9fbfd_0%,#f4f6f9_48%,#edf1f5_100%)]" />

        <div className="relative mx-auto w-full">
          <div className="max-w-full px-5 sm:px-14 lg:px-18">
            {/* Logo lockup and language switch */}
            <div className="flex items-start justify-between gap-4 pt-6 sm:pt-8">
              <Link
                to="/"
                className={`inline-flex items-center gap-3 rounded-[1.65rem] border border-black/8 bg-white/78 px-4 py-3 shadow-[0_18px_42px_rgba(17,16,14,0.06)] backdrop-blur-sm sm:gap-4 sm:px-5 sm:py-4 ${focusRing}`}
              >
                <img src={ciyesMark} alt="" className="h-10 w-auto sm:h-12" />
                <span className="text-left">
                  <span className="block font-sans text-lg font-semibold leading-none tracking-[-0.04em] text-[#11100e] sm:text-xl">
                    CIYES
                  </span>
                  <span className="mt-1 hidden font-sans text-sm font-medium leading-snug text-[#11100e]/64 sm:block">
                    {t.nav.tagline} <span className="text-[#11100e]/48">{t.nav.by}</span>
                  </span>
                </span>
              </Link>
              <button
                type="button"
                onClick={switchLang}
                className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-black/10 bg-white/80 px-5 font-sans text-sm font-semibold text-[#11100e] transition-colors hover:bg-white ${focusRing}`}
              >
                <Languages className="h-4 w-4" aria-hidden="true" />
                {t.nav.switchTo}
              </button>
            </div>

            {/* Hero: the offer on the left, the waitlist itself on the right */}
            <section className="relative pb-16 pt-8 sm:pb-20 lg:pt-12">
              <div className="relative grid gap-8 lg:grid-cols-[1.04fr,0.96fr] lg:items-start">
                <div className="max-w-[42rem] lg:pt-4">
                  <h1 className="text-[#11100e]">
                    <motion.span {...line(0)} className="block font-sans text-[clamp(2.8rem,6vw,5.3rem)] font-semibold leading-[0.9] tracking-[-0.07em]">
                      {t.hero.headline[0]}
                    </motion.span>
                    <motion.span {...line(1)} className="block font-display text-[clamp(3rem,6.4vw,5.8rem)] font-bold leading-[0.88] tracking-[-0.06em]">
                      {t.hero.headline[1]}
                    </motion.span>
                    <motion.span {...line(2)} className="block font-sans text-[clamp(2.8rem,6vw,5.3rem)] font-semibold leading-[0.9] tracking-[-0.07em]">
                      {t.hero.headline[2]}
                    </motion.span>
                  </h1>

                  <p className="mt-6 max-w-[36rem] font-sans text-[clamp(1.04rem,1.9vw,1.32rem)] leading-[1.5] text-[#11100e]/72">
                    {t.hero.text}
                  </p>
                  <p className="mt-4 flex items-center gap-2 font-sans text-sm font-medium text-[#11100e]/60">
                    <span className="h-2 w-2 rounded-full bg-[#156D3B]" aria-hidden="true" />
                    {t.hero.meta}
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button
                      onClick={goToWaitlist}
                      className={`h-12 rounded-full bg-[#171411] px-6 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92 lg:hidden ${focusRing}`}
                    >
                      {t.hero.primary}
                      <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={watchVideo}
                      className={`h-12 rounded-full border-black/10 bg-white/80 px-6 font-sans text-sm font-semibold text-[#11100e] hover:bg-white ${focusRing}`}
                    >
                      <Play className="mr-2 h-4 w-4 text-[#CC2129]" aria-hidden="true" />
                      {t.hero.secondary}
                    </Button>
                  </div>

                  <div className="mt-9 grid gap-3 sm:grid-cols-3">
                    {t.hero.pillars.map((pillar, i) => (
                      <div
                        key={pillar.title}
                        className="rounded-[1.45rem] border border-black/8 bg-white/72 px-4 py-4 shadow-[0_14px_30px_rgba(17,16,14,0.05)]"
                      >
                        <p className="flex items-center gap-2 font-sans text-sm font-semibold tracking-[-0.03em] text-[#11100e]">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: DOTS[i] }} aria-hidden="true" />
                          {pillar.title}
                        </p>
                        <p className="mt-2 font-sans text-sm leading-relaxed text-[#11100e]/64">{pillar.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <section
                  id="waitlist"
                  ref={waitlistRef}
                  aria-labelledby="waitlist-title"
                  className="scroll-mt-6 rounded-[2rem] border border-black/8 bg-[#171411] px-6 py-7 text-white shadow-[0_20px_48px_rgba(17,16,14,0.12)] md:px-8 md:py-8"
                >
                  {done ? (
                    <div className="flex min-h-[26rem] flex-col items-start justify-center" role="status">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366]">
                        <Check className="h-7 w-7 text-[#171411]" aria-hidden="true" />
                      </span>
                      <h2 id="waitlist-title" className="mt-6 font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[0.94] tracking-[-0.05em]">
                        {status === "already" ? t.waitlist.alreadyTitle : t.waitlist.successTitle}
                      </h2>
                      <p className="mt-4 max-w-[28rem] font-sans text-base leading-relaxed text-white/72">
                        {status === "already" ? t.waitlist.alreadyText : t.waitlist.successText}
                      </p>
                      <a href={shareHref} target="_blank" rel="noopener noreferrer" className={`mt-7 inline-flex rounded-full ${focusRing}`}>
                        <span className="inline-flex h-11 items-center rounded-full bg-white px-5 font-sans text-sm font-semibold text-[#171411] transition-colors hover:bg-white/92">
                          <WhatsAppLogo className="mr-2 h-4 w-4 text-[#25D366]" />
                          {t.waitlist.share}
                        </span>
                      </a>
                    </div>
                  ) : (
                    <>
                      <h2 id="waitlist-title" className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[0.94] tracking-[-0.05em]">
                        {t.waitlist.title}
                      </h2>
                      <p className="mt-3 max-w-[28rem] font-sans text-sm leading-relaxed text-white/72 md:text-base">{t.waitlist.text}</p>

                      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
                        <div>
                          <Label htmlFor="ciyes-name" className="font-sans text-sm font-semibold text-white/88">{t.waitlist.name}</Label>
                          <Input id="ciyes-name" value={name} onChange={(e) => { setName(e.target.value); clearError("name"); }} autoComplete="name" className={darkInput} aria-invalid={Boolean(errors.name)} />
                          {errors.name ? <p className="mt-1.5 font-sans text-sm text-[#ff9ea2]">{errors.name}</p> : null}
                        </div>
                        <div>
                          <Label htmlFor="ciyes-phone" className="font-sans text-sm font-semibold text-white/88">{t.waitlist.phone}</Label>
                          <Input
                            id="ciyes-phone"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder={t.waitlist.phonePlaceholder}
                            value={phone}
                            onChange={(e) => { setPhone(e.target.value); clearError("phone"); }}
                            className={darkInput}
                            aria-invalid={Boolean(errors.phone)}
                          />
                          {errors.phone ? <p className="mt-1.5 font-sans text-sm text-[#ff9ea2]">{errors.phone}</p> : null}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="ciyes-email" className="font-sans text-sm font-semibold text-white/88">
                              {t.waitlist.email} <span className="font-normal text-white/50">({t.waitlist.optional})</span>
                            </Label>
                            <Input id="ciyes-email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); clearError("email"); }} className={darkInput} aria-invalid={Boolean(errors.email)} />
                            {errors.email ? <p className="mt-1.5 font-sans text-sm text-[#ff9ea2]">{errors.email}</p> : null}
                          </div>
                          <div>
                            <Label htmlFor="ciyes-city" className="font-sans text-sm font-semibold text-white/88">
                              {t.waitlist.city} <span className="font-normal text-white/50">({t.waitlist.optional})</span>
                            </Label>
                            <Input id="ciyes-city" autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)} className={darkInput} />
                          </div>
                        </div>
                        <fieldset>
                          <legend className="font-sans text-sm font-semibold text-white/88">{t.waitlist.role}</legend>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {ROLES.map((value) => {
                              const active = role === value;
                              return (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => { setRole(value); clearError("role"); }}
                                  aria-pressed={active}
                                  className={`min-h-12 rounded-[1rem] border px-4 py-2.5 text-left font-sans text-sm font-semibold transition-colors ${focusRing} ${active ? "border-white bg-white text-[#171411]" : "border-white/12 bg-white/[0.04] text-white/82 hover:border-white/30"}`}
                                >
                                  {t.waitlist.roles[value]}
                                </button>
                              );
                            })}
                          </div>
                          {errors.role ? <p className="mt-1.5 font-sans text-sm text-[#ff9ea2]">{errors.role}</p> : null}
                        </fieldset>
                        <fieldset>
                          <legend className="font-sans text-sm font-semibold text-white/88">
                            {t.waitlist.phoneOs} <span className="font-normal text-white/50">({t.waitlist.optional})</span>
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
                                  className={`h-11 flex-1 rounded-full border px-4 font-sans text-sm font-semibold transition-colors ${focusRing} ${active ? "border-white bg-white text-[#171411]" : "border-white/12 bg-white/[0.04] text-white/82 hover:border-white/30"}`}
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
                          <p className="rounded-[1rem] bg-white/[0.06] px-4 py-3 font-sans text-sm text-[#ff9ea2]">
                            {errors.form}{" "}
                            <a href={PANACHE_SUPPORT_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline underline-offset-2">
                              WhatsApp
                            </a>
                          </p>
                        ) : null}
                        <Button
                          type="submit"
                          disabled={status === "sending"}
                          className="h-12 w-full rounded-full bg-white font-sans text-sm font-semibold text-[#171411] hover:bg-white/92 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#171411]"
                        >
                          {status === "sending" ? t.waitlist.sending : t.waitlist.submit}
                          {status === "sending" ? null : <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />}
                        </Button>
                        <p className="font-sans text-xs leading-relaxed text-white/56">{t.waitlist.privacy}</p>
                      </form>
                    </>
                  )}
                </section>
              </div>
            </section>

            {/* Video */}
            <section className="py-10 sm:py-14">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className={`${displayHeading} text-[clamp(2.1rem,4.4vw,4.2rem)]`}>{t.video.title}</h2>
                <p className="mx-auto mt-3 max-w-2xl font-sans text-sm font-medium leading-relaxed text-[#11100e]/70 sm:text-base">{t.video.text}</p>
              </div>
              <div id="video" className={`${panel} mx-auto mt-10 max-w-5xl scroll-mt-8 p-2 sm:p-3`}>
                <video
                  key={lang}
                  ref={videoRef}
                  className="aspect-video w-full rounded-[1.5rem] bg-[#fbf8fa]"
                  controls
                  playsInline
                  preload="none"
                  poster={`/videos/ciyes-${lang}-poster.jpg`}
                  aria-label={t.hero.videoLabel}
                >
                  <source src={`/videos/ciyes-${lang}.mp4`} type="video/mp4" />
                </video>
              </div>
            </section>

            {/* The problem, set like the Foundation's mission band */}
            <section className="py-12 sm:py-16">
              <div className="rounded-[2.4rem] border border-black/8 bg-[#171411] px-6 py-10 text-white shadow-[0_26px_70px_rgba(17,16,14,0.14)] md:px-12 md:py-14">
                <h2 className="text-center font-display text-[clamp(2.3rem,4.8vw,4.6rem)] font-bold leading-[0.94] tracking-[-0.05em]">
                  {t.problem.title}
                </h2>
                <div className="mx-auto mt-10 grid max-w-5xl gap-x-12 md:grid-cols-2">
                  {t.problem.cards.map((card) => (
                    <div key={card.title} className="border-t border-white/12 py-6">
                      <h3 className="font-sans text-lg font-semibold leading-snug tracking-[-0.02em] md:text-xl">{card.title}</h3>
                      <p className="mt-2 font-sans text-[0.98rem] leading-relaxed text-white/70">{card.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* What you can do */}
            <section className="py-12 sm:py-16">
              <div className="grid gap-10 lg:grid-cols-[0.82fr,1.18fr] lg:items-start">
                <div className="lg:sticky lg:top-10">
                  <h2 className={`${displayHeading} text-[clamp(2.1rem,4vw,3.8rem)]`}>{t.features.title}</h2>
                  <p className="mt-5 max-w-[30rem] font-sans text-base leading-relaxed text-[#11100e]/70">{t.features.text}</p>
                </div>
                <ul className={`${panel} divide-y divide-black/8`}>
                  {t.features.items.map((item, i) => (
                    <li key={item.title} className="flex gap-4 px-6 py-5 sm:px-8 sm:py-6">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: DOTS[i % DOTS.length] }} aria-hidden="true" />
                      <div>
                        <h3 className="font-sans text-lg font-semibold tracking-[-0.03em] text-[#11100e] sm:text-xl">{item.title}</h3>
                        <p className="mt-1.5 max-w-[38rem] font-sans text-[0.98rem] leading-relaxed text-[#11100e]/68">{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Who it's for and what comes next, set like the Foundation's flagship cards */}
            <section className="py-12 sm:py-16">
              <div className="grid gap-6 lg:grid-cols-2">
                <article className={`${panel} relative overflow-hidden p-7 md:p-9`}>
                  <div className="absolute inset-x-6 top-0 h-24 rounded-b-[1.75rem] bg-gradient-to-b from-[#156D3B]/14 to-[#1875D2]/10 opacity-90" aria-hidden="true" />
                  <div className="relative">
                    <h2 className="font-sans text-[clamp(2.2rem,4.4vw,3.6rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-[#11100e]">{t.who.title}</h2>
                    <p className="mt-3 max-w-[28rem] font-sans text-sm font-medium leading-snug text-[#11100e]/70 sm:text-base">{t.who.text}</p>
                    <ul className="mt-6 divide-y divide-black/8 border-t border-black/8">
                      {t.who.items.map((item) => (
                        <li key={item.title} className="flex flex-col gap-0.5 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                          <span className="font-sans text-base font-semibold tracking-[-0.02em] text-[#11100e]">{item.title}</span>
                          <span className="font-sans text-sm text-[#11100e]/66 sm:text-right">{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
                <article className={`${panel} relative overflow-hidden p-7 md:p-9`}>
                  <div className="absolute inset-x-6 top-0 h-24 rounded-b-[1.75rem] bg-gradient-to-b from-[#E7B008]/22 to-[#CC2129]/8 opacity-90" aria-hidden="true" />
                  <div className="relative">
                    <h2 className="font-sans text-[clamp(2.2rem,4.4vw,3.6rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-[#11100e]">{t.soon.title}</h2>
                    <p className="mt-3 max-w-[28rem] font-sans text-sm font-medium leading-snug text-[#11100e]/70 sm:text-base">{t.soon.text}</p>
                    <ul className="mt-6 divide-y divide-black/8 border-t border-black/8">
                      {t.soon.items.map((item) => (
                        <li key={item} className="flex items-center justify-between gap-4 py-3.5">
                          <span className="font-sans text-base font-semibold tracking-[-0.02em] text-[#11100e]">{item}</span>
                          <span className="shrink-0 rounded-full border border-black/10 px-2.5 py-0.5 font-sans text-xs font-semibold text-[#11100e]/60">{t.soon.badge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </div>
            </section>

            {/* Pricing */}
            <section className="py-12 sm:py-16">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className={`${displayHeading} text-[clamp(2.1rem,4.4vw,4.2rem)]`}>{t.pricing.title}</h2>
                <p className="mx-auto mt-3 max-w-2xl font-sans text-sm font-medium leading-relaxed text-[#11100e]/70 sm:text-base">{t.pricing.text}</p>
              </div>
              <div className="mx-auto mt-10 grid max-w-6xl gap-5 lg:grid-cols-[0.85fr,1.15fr]">
                <div className={`${panel} flex flex-col p-7 md:p-8`}>
                  <h3 className="font-display text-3xl font-bold tracking-[-0.04em] text-[#11100e]">{t.pricing.free.name}</h3>
                  <p className="mt-4 font-sans text-[2.6rem] font-semibold leading-none tracking-[-0.05em] text-[#11100e]">{t.pricing.free.price}</p>
                  <ul className="mt-7 space-y-3 border-t border-black/8 pt-6">
                    {t.pricing.free.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 font-sans text-[0.98rem] text-[#11100e]/80">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#156D3B]" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[2rem] border border-black/8 bg-[#171411] p-7 text-white shadow-[0_20px_48px_rgba(17,16,14,0.12)] md:p-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-3xl font-bold tracking-[-0.04em]">{t.pricing.pro.name}</h3>
                    <span className="rounded-full border border-white/16 px-3 py-1 font-sans text-xs font-semibold text-white/80">{t.pricing.pro.badge}</span>
                  </div>
                  <ul className="mt-5 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                    {t.pricing.pro.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 font-sans text-[0.95rem] text-white/84">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#FFB200]" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <table className="mt-7 w-full border-t border-white/12 font-sans">
                    <tbody>
                      {CIYES_PRO_PLANS.map((plan) => (
                        <tr key={plan.months} className="border-b border-white/12">
                          <th scope="row" className="whitespace-nowrap py-4 pr-3 text-left text-sm font-semibold text-white/70">
                            {t.pricing.planLabel(plan.months)}
                          </th>
                          <td className="py-4 pr-3 text-right">
                            <span className="block text-xl font-semibold tracking-[-0.03em] sm:text-2xl">{formatCiyesPrice(lang, plan.priceXaf)}</span>
                            <span className="block text-xs text-white/60">{t.pricing.perMonth(formatCiyesPrice(lang, plan.priceXaf / plan.months))}</span>
                          </td>
                          <td className="w-px whitespace-nowrap py-4 text-right">
                            {plan.freeMonths ? (
                              <span className="rounded-full bg-[#FFB200] px-2.5 py-1 text-xs font-bold text-[#171411]">{t.pricing.freeMonths(plan.freeMonths)}</span>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-5 font-sans text-sm leading-relaxed text-white/66">{t.pricing.note}</p>
                  <button
                    type="button"
                    onClick={goToWaitlist}
                    className="mt-5 inline-flex h-11 items-center rounded-full bg-white px-5 font-sans text-sm font-semibold text-[#171411] transition-colors hover:bg-white/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#171411]"
                  >
                    {t.pricing.cta}
                    <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section className="py-12 sm:py-16">
              <div className="grid gap-8 lg:grid-cols-[0.82fr,1.18fr] lg:items-start">
                <h2 className={`${displayHeading} text-[clamp(2.1rem,4.4vw,4.2rem)]`}>{t.faq.title}</h2>
                <div className={`${panel} px-6 py-2 sm:px-8`}>
                  <Accordion type="single" collapsible>
                    {t.faq.items.map((item, i) => (
                      <AccordionItem key={item.q} value={`q${i}`} className={i === t.faq.items.length - 1 ? "border-b-0" : "border-black/8"}>
                        <AccordionTrigger className="text-left font-sans text-base font-semibold text-[#11100e] hover:no-underline">{item.q}</AccordionTrigger>
                        <AccordionContent className="font-sans text-[0.98rem] leading-relaxed text-[#11100e]/70">{item.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </section>

            {/* From Panache Foundation: the Foundation's flagship cards */}
            <section className="py-12 sm:py-16">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className={`${displayHeading} text-[clamp(2.1rem,4.4vw,4.2rem)]`}>{t.foundation.title}</h2>
                <p className="mx-auto mt-3 max-w-2xl font-sans text-sm font-medium leading-relaxed text-[#11100e]/70 sm:text-base">{t.foundation.text}</p>
              </div>
              <div className="mt-12 grid gap-6 lg:grid-cols-2">
                {t.foundation.cards.map((card) => (
                  <article key={card.to} className={`${panel} relative overflow-hidden p-7`}>
                    <div className={`absolute inset-x-6 top-0 h-24 rounded-b-[1.75rem] bg-gradient-to-b ${card.accent} opacity-90`} aria-hidden="true" />
                    <div className="relative">
                      <h3 className="mt-2 font-sans text-[clamp(2.2rem,4.8vw,4.1rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-[#11100e]">{card.title}</h3>
                      <p className="mt-2 max-w-[24rem] font-sans text-[0.84rem] font-medium leading-snug text-[#11100e]/70 sm:text-sm">{card.meta}</p>
                      <p className="mt-5 max-w-[30rem] font-sans text-sm leading-relaxed text-[#11100e]/74 sm:text-[0.98rem]">{card.text}</p>
                      <Link to={card.to} className={`mt-6 inline-flex rounded-full ${focusRing}`}>
                        <span className="inline-flex h-11 items-center rounded-full bg-[#171411] px-5 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#171411]/92">
                          {card.cta}
                          <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                        </span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
              <p className="mt-8 text-center">
                <Link to="/foundation" className={`inline-flex items-center rounded-full font-sans text-sm font-semibold text-[#11100e] underline decoration-black/20 underline-offset-4 hover:decoration-black/60 ${focusRing}`}>
                  {t.foundation.about}
                  <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                </Link>
              </p>
            </section>
          </div>

          <Footer variant="cyes" />
        </div>
      </main>

      {/* Phone-only sticky button, hidden while the form is on screen or once it's done. */}
      {!waitlistInView && !done ? (
        <div className="fixed bottom-5 left-4 right-[5.25rem] z-40 lg:hidden">
          <Button
            onClick={goToWaitlist}
            className="h-12 w-full rounded-full bg-[#171411] font-sans text-sm font-semibold text-white shadow-[0_18px_40px_rgba(17,16,14,0.35)] hover:bg-[#171411]/92"
          >
            {t.nav.waitlist}
            <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default CiyesAppHome;
