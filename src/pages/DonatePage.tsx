import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Loader2, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Footer } from "@/components/Footer";
import { SiteNav } from "@/components/SiteNav";
import { ConfettiBurst } from "@/components/donate/ConfettiBurst";
import { KidsVideo } from "@/components/donate/KidsVideo";
import { WaterTankScene } from "@/components/donate/WaterTankScene";
import { BucketIcon, CupIcon, DrumIcon, DropPlusIcon, JerrycanIcon, TankIcon } from "@/components/donate/WaterIcons";
import { trackEvent } from "@/lib/analytics";
import { detectCiyesLang, saveCiyesLang, type CiyesLang } from "@/lib/ciyes-home-content";
import {
  CIYES_DONATE_AMOUNTS,
  CIYES_DONATE_CONTENT,
  CIYES_DONATE_MAX_XAF,
  CIYES_DONATE_MIN_XAF,
  CIYES_SPONSOR_EMAIL,
  CIYES_SPONSOR_PHONES,
  formatFcfa,
} from "@/lib/ciyes-donate-content";
import { DonationApiError, fetchDonationTotals, startDonation, type DonationTotals } from "@/lib/ciyes-donate-api";

// /donate: the CIYES 2027 community borehole. Same design language as the CIYES app homepage:
// cool off-white page, near-black ink, display headings, white panels and one dark panel for the action.

const DOTS = ["#156D3B", "#1875D2", "#CC2129", "#E7B008"];
const AMOUNT_ICONS = [CupIcon, BucketIcon, JerrycanIcon, DrumIcon, TankIcon];
// While there is no goal yet, the tank shows a little water rather than a percentage.
const NO_GOAL_LEVEL = 0.22;
const panel =
  "rounded-[2rem] border border-black/8 bg-white/80 shadow-[0_18px_42px_rgba(17,16,14,0.06)]";
const displayHeading = "font-display font-bold leading-[0.94] tracking-[-0.05em] text-[#11100e]";
const focusRingDark =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#171411]";
const darkInput =
  "mt-2 h-12 rounded-[1rem] border-white/12 bg-white/[0.07] px-4 font-sans text-base text-white shadow-none placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-white/70 focus-visible:ring-offset-0";

const readSource = () => {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("ref") || params.get("utm_source") || "";
  return raw.toLowerCase().replace(/[^a-z0-9_.-]/g, "").slice(0, 40) || null;
};

// Cameroon numbers (9 digits starting with 6 or 2, with or without 237) or +country code.
const isValidPhone = (raw: string) => {
  const value = raw.replace(/[\s().-]/g, "").replace(/^00/, "+");
  return /^(\+?237)?[26]\d{8}$/.test(value) || /^\+(?!237)[1-9]\d{7,14}$/.test(value);
};

const DonatePage = () => {
  const [lang, setLang] = useState<CiyesLang>(() => detectCiyesLang());
  const t = CIYES_DONATE_CONTENT[lang];

  const [totals, setTotals] = useState<DonationTotals | null>(null);
  const [totalsFailed, setTotalsFailed] = useState(false);
  // When a refresh finds the total went up, the kids jump and cheer and confetti flies.
  const lastRaised = useRef<number | null>(null);
  const cheerTimer = useRef<number>();
  const [cheerBurst, setCheerBurst] = useState(0);
  const [cheering, setCheering] = useState(false);

  const [preset, setPreset] = useState<number | null>(5000);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<"amount" | "phone" | "form", string>>>({});

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.meta.description);
  }, [lang, t]);

  // Progress: load now, then refresh every 30 seconds.
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetchDonationTotals()
        .then((next) => {
          if (cancelled) return;
          if (lastRaised.current !== null && next.raised_xaf > lastRaised.current) {
            setCheerBurst((n) => n + 1);
            setCheering(true);
            window.clearTimeout(cheerTimer.current);
            cheerTimer.current = window.setTimeout(() => setCheering(false), 2600);
          }
          lastRaised.current = next.raised_xaf;
          setTotals(next);
          setTotalsFailed(false);
        })
        .catch(() => !cancelled && setTotalsFailed(true));
    load();
    const timer = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.clearTimeout(cheerTimer.current);
    };
  }, []);

  const switchLang = () => {
    const next: CiyesLang = lang === "en" ? "fr" : "en";
    setLang(next);
    saveCiyesLang(next);
    setErrors({});
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState(null, "", url.toString());
  };

  const amount = preset ?? Number(custom.replace(/[^\d]/g, ""));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!Number.isInteger(amount) || amount < CIYES_DONATE_MIN_XAF || amount > CIYES_DONATE_MAX_XAF) {
      nextErrors.amount = t.form.errors.amount;
    }
    if (phone.trim() && !isValidPhone(phone)) nextErrors.phone = t.form.errors.phone;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      document.getElementById(nextErrors.amount ? "donate-amounts" : "donate-phone")?.focus();
      return;
    }

    setSending(true);
    try {
      const result = await startDonation({
        amount,
        donorName: name.trim() || undefined,
        whatsappPhone: phone.trim() || undefined,
        language: lang,
        source: readSource(),
        website,
      });
      trackEvent("ciyes_donate_start", { amount, lang });
      if (result.paymentLink) {
        window.location.assign(result.paymentLink);
        return;
      }
      setSending(false);
    } catch (error) {
      setSending(false);
      if (error instanceof DonationApiError && error.field === "amount") setErrors({ amount: t.form.errors.amount });
      else if (error instanceof DonationApiError && error.field === "whatsappPhone") setErrors({ phone: t.form.errors.phone });
      else if (error instanceof DonationApiError && error.status === 503) setErrors({ form: t.form.errors.notReady });
      else setErrors({ form: t.form.errors.generic });
    }
  };

  const goal = totals?.goal_xaf ?? null;
  const percent = goal && totals ? Math.min(100, Math.round((totals.raised_xaf / goal) * 100)) : 0;
  const level = goal && totals ? Math.max(0.04, Math.min(1, totals.raised_xaf / goal)) : NO_GOAL_LEVEL;
  const tankLabel = totals ? t.progress.tankLabel(formatFcfa(lang, totals.raised_xaf), totals.donors) : t.progress.loading;
  const sponsorHref = `mailto:${CIYES_SPONSOR_EMAIL}?subject=${encodeURIComponent(t.sponsor.subject)}`;

  const chip = (selected: boolean) =>
    `flex min-h-[5.5rem] flex-col items-center justify-center gap-1.5 rounded-[1.25rem] border px-3 py-3 font-sans text-[0.95rem] font-bold transition-[background-color,border-color,transform] motion-safe:active:scale-[0.97] ${focusRingDark} ${
      selected ? "border-[#FFB200] bg-[#FFB200] text-[#171411]" : "border-white/14 bg-white/[0.06] text-white hover:bg-white/[0.12]"
    }`;

  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#14110f] selection:bg-[#156D3B]/20 selection:text-[#11100e]">
      <SiteNav lang={lang} onSwitchLang={switchLang} />
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(24,117,210,0.08),transparent_24%),radial-gradient(circle_at_85%_16%,rgba(21,109,59,0.07),transparent_22%),linear-gradient(180deg,#f9fbfd_0%,#f4f6f9_48%,#edf1f5_100%)]" />

        <div className="relative max-w-full px-5 sm:px-14 lg:px-18">
          {/* Kids' donation video: portrait on phones, landscape on wide screens; hidden until the files exist */}
          <KidsVideo lang={lang} label={t.kidsVideo.label} panelClassName={panel} />

          {/* Hero: the project and the water tank on the left, the donation form on the right */}
          <section className="pb-14 pt-10 sm:pb-20 lg:pt-14">
            <div className="grid gap-8 lg:grid-cols-[1.04fr,0.96fr] lg:items-start">
              <div className="max-w-[42rem] lg:pt-2">
                <h1 className={`${displayHeading} text-[clamp(2.2rem,4.6vw,4.1rem)]`}>{t.hero.headline}</h1>
                <p className="mt-6 max-w-[36rem] font-sans text-[clamp(1.02rem,1.8vw,1.25rem)] leading-[1.5] text-[#11100e]/72">{t.hero.text}</p>
                <p className="mt-4 flex items-center gap-2 font-sans text-sm font-medium text-[#11100e]/60">
                  <span className="h-2 w-2 rounded-full bg-[#1875D2]" aria-hidden="true" />
                  {t.hero.date}
                </p>

                <div className={`${panel} relative mt-8 px-4 pb-6 pt-7 sm:px-7`}>
                  <ConfettiBurst burst={cheerBurst} top="32%" />
                  <div className="mx-auto max-w-[34rem]">
                    <WaterTankScene level={level} cheering={cheering} percentLabel={goal && totals ? `${percent}%` : null} label={tankLabel} />
                  </div>
                  <div className="mt-5 text-center" aria-live="polite">
                    {totals ? (
                      <>
                        <p className="font-sans text-[clamp(1.9rem,3.8vw,2.7rem)] font-semibold leading-none tracking-[-0.05em] text-[#11100e]">
                          {formatFcfa(lang, totals.raised_xaf)}
                        </p>
                        <p className="mt-2 font-sans text-base font-medium text-[#11100e]/68">
                          {goal ? t.progress.raisedOf(formatFcfa(lang, goal)) : t.progress.raisedSoFar} · {t.progress.donors(totals.donors)}
                        </p>
                        {goal ? null : <p className="mx-auto mt-2 max-w-[26rem] font-sans text-sm text-[#11100e]/54">{t.progress.noGoal}</p>}
                      </>
                    ) : (
                      <p className="font-sans text-sm font-medium text-[#11100e]/60">{totalsFailed ? t.progress.unavailable : t.progress.loading}</p>
                    )}
                  </div>
                </div>
              </div>

              <section
                id="give"
                aria-labelledby="give-title"
                className="scroll-mt-24 rounded-[2rem] border border-black/8 bg-[#171411] px-6 py-7 text-white shadow-[0_20px_48px_rgba(17,16,14,0.12)] md:px-8 md:py-8"
              >
                <h2 id="give-title" className="font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-bold leading-[0.96] tracking-[-0.05em]">
                  {t.form.title}
                </h2>
                <form className="mt-6 space-y-6" onSubmit={onSubmit} noValidate>
                  <fieldset>
                    <legend className="font-sans text-sm font-semibold text-white/80">{t.form.amountLabel}</legend>
                    <div id="donate-amounts" tabIndex={-1} className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 focus:outline-none">
                      {CIYES_DONATE_AMOUNTS.map((value, i) => {
                        const Icon = AMOUNT_ICONS[i % AMOUNT_ICONS.length];
                        return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={preset === value}
                          onClick={() => {
                            setPreset(value);
                            setErrors((e) => ({ ...e, amount: undefined, form: undefined }));
                          }}
                          className={chip(preset === value)}
                        >
                          <Icon className="h-8 w-8" />
                          {formatFcfa(lang, value)}
                        </button>
                        );
                      })}
                      <button
                        type="button"
                        aria-pressed={preset === null}
                        onClick={() => {
                          setPreset(null);
                          window.setTimeout(() => document.getElementById("donate-custom")?.focus(), 0);
                        }}
                        className={chip(preset === null)}
                      >
                        <DropPlusIcon className="h-8 w-8" />
                        {t.form.custom}
                      </button>
                    </div>
                    {preset === null ? (
                      <div className="mt-3">
                        <Label htmlFor="donate-custom" className="sr-only">{t.form.customPlaceholder}</Label>
                        <Input
                          id="donate-custom"
                          inputMode="numeric"
                          value={custom}
                          placeholder={t.form.customPlaceholder}
                          onChange={(e) => {
                            setCustom(e.target.value);
                            setErrors((x) => ({ ...x, amount: undefined, form: undefined }));
                          }}
                          aria-invalid={Boolean(errors.amount)}
                          aria-describedby={errors.amount ? "donate-amount-error" : undefined}
                          className={darkInput}
                        />
                      </div>
                    ) : null}
                    {errors.amount ? (
                      <p id="donate-amount-error" className="mt-2 font-sans text-sm font-medium text-[#ff8a80]">{errors.amount}</p>
                    ) : null}
                  </fieldset>

                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="donate-name" className="font-sans text-sm font-semibold text-white/80">
                        {t.form.nameLabel} <span className="font-normal text-white/50">({t.form.optional})</span>
                      </Label>
                      <Input id="donate-name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder={t.form.namePlaceholder} className={darkInput} />
                    </div>
                    <div>
                      <Label htmlFor="donate-phone" className="font-sans text-sm font-semibold text-white/80">
                        {t.form.phoneLabel} <span className="font-normal text-white/50">({t.form.optional})</span>
                      </Label>
                      <Input
                        id="donate-phone"
                        type="tel"
                        inputMode="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setErrors((x) => ({ ...x, phone: undefined, form: undefined }));
                        }}
                        autoComplete="tel"
                        placeholder="6XX XX XX XX"
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby="donate-phone-hint"
                        className={darkInput}
                      />
                      <p id="donate-phone-hint" className={`mt-2 font-sans text-xs ${errors.phone ? "font-medium text-[#ff8a80]" : "text-white/50"}`}>
                        {errors.phone || t.form.phoneHint}
                      </p>
                    </div>
                  </div>

                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="donate-website">Website</label>
                    <input id="donate-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                  </div>

                  {errors.form ? <p role="alert" className="font-sans text-sm font-medium text-[#ff8a80]">{errors.form}</p> : null}

                  <button
                    type="submit"
                    disabled={sending}
                    className={`flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#FFB200] px-6 py-3 text-center font-sans text-base font-bold text-[#171411] transition-colors hover:bg-[#f2a900] disabled:opacity-70 ${focusRingDark}`}
                  >
                    {sending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
                    {sending ? t.form.sending : t.form.submit}
                  </button>
                  <p className="font-sans text-xs leading-relaxed text-white/56">{t.form.secure}</p>
                </form>
              </section>
            </div>
          </section>

          {/* What the money pays for */}
          <section className="py-12 sm:py-16">
            <div className="grid gap-10 lg:grid-cols-[0.82fr,1.18fr] lg:items-start">
              <div>
                <h2 className={`${displayHeading} text-[clamp(2.1rem,4vw,3.6rem)]`}>{t.costs.title}</h2>
                <p className="mt-5 max-w-[30rem] font-sans text-base leading-relaxed text-[#11100e]/70">{t.costs.text}</p>
              </div>
              <ul className={`${panel} divide-y divide-black/8`}>
                {t.costs.items.map((item, i) => (
                  <li key={item.title} className="flex gap-4 px-6 py-5 sm:px-8">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: DOTS[i % DOTS.length] }} aria-hidden="true" />
                    <div>
                      <h3 className="font-sans text-lg font-semibold tracking-[-0.03em] text-[#11100e]">{item.title}</h3>
                      <p className="mt-1 font-sans text-[0.98rem] leading-relaxed text-[#11100e]/68">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Steps to the handover, set in the dark band */}
          <section className="py-12 sm:py-16">
            <div className="rounded-[2.4rem] border border-black/8 bg-[#171411] px-6 py-10 text-white shadow-[0_26px_70px_rgba(17,16,14,0.14)] md:px-12 md:py-14">
              <h2 className="font-display text-[clamp(2.1rem,4.4vw,4rem)] font-bold leading-[0.94] tracking-[-0.05em]">{t.steps.title}</h2>
              <ol className="mt-10 grid gap-x-10 md:grid-cols-2 xl:grid-cols-4">
                {t.steps.items.map((step, i) => (
                  <li key={step.title} className="border-t border-white/12 py-6">
                    <p className={`font-sans text-sm font-semibold ${i === t.steps.items.length - 1 ? "text-[#FFB200]" : "text-white/60"}`}>{step.when}</p>
                    <h3 className="mt-2 font-sans text-xl font-semibold tracking-[-0.02em]">{step.title}</h3>
                    <p className="mt-2 font-sans text-[0.98rem] leading-relaxed text-white/70">{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Impact measures */}
          <section className="py-12 sm:py-16">
            <div className="grid gap-10 lg:grid-cols-[0.82fr,1.18fr] lg:items-start">
              <div>
                <h2 className={`${displayHeading} text-[clamp(2.1rem,4vw,3.6rem)]`}>{t.impact.title}</h2>
                <p className="mt-5 max-w-[30rem] font-sans text-base leading-relaxed text-[#11100e]/70">{t.impact.text}</p>
              </div>
              <dl className={`${panel} divide-y divide-black/8`}>
                {t.impact.items.map((item) => (
                  <div key={item.title} className="flex flex-col gap-1 px-6 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8 sm:px-8">
                    <dt className="font-sans text-lg font-semibold tracking-[-0.03em] text-[#11100e]">{item.title}</dt>
                    <dd className="font-sans text-[0.98rem] leading-relaxed text-[#11100e]/68 sm:max-w-[24rem] sm:text-right">{item.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* Sponsors, with the borehole sponsor video */}
          <section className="pb-16 pt-6 sm:pb-24">
            <div className="grid gap-8 rounded-[2rem] border border-[#FFB200]/40 bg-[#FFB200]/[0.14] p-6 md:p-10 lg:grid-cols-[0.9fr,1.1fr] lg:items-center">
              <div>
                <h2 className="font-display text-[clamp(1.8rem,3.4vw,2.8rem)] font-bold leading-[0.98] tracking-[-0.04em] text-[#11100e]">{t.sponsor.title}</h2>
                <p className="mt-3 max-w-[34rem] font-sans text-[0.98rem] leading-relaxed text-[#11100e]/72">{t.sponsor.text}</p>
                <div className="mt-6 flex flex-col items-start gap-3">
                  <a
                    href={sponsorHref}
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-[#171411] px-6 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#171411]/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#156D3B]"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    {t.sponsor.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <p className="font-sans text-sm text-[#11100e]/64">{CIYES_SPONSOR_EMAIL}</p>
                  <ul className="flex flex-wrap gap-2" aria-label={t.sponsor.phones}>
                    {CIYES_SPONSOR_PHONES.map((phone) => (
                      <li key={phone.tel}>
                        <a
                          href={`tel:${phone.tel}`}
                          className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border border-black/10 bg-white/80 px-4 font-sans text-sm font-semibold text-[#11100e] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#156D3B]"
                        >
                          <Phone className="h-4 w-4" aria-hidden="true" />
                          {phone.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className={`${panel} p-2 sm:p-2.5`}>
                <video
                  key={lang}
                  className="aspect-video w-full rounded-[1.5rem] bg-[#0b4fd6]"
                  controls
                  playsInline
                  preload="none"
                  poster={`/videos/borehole-${lang}-poster.jpg`}
                  aria-label={t.sponsor.videoLabel}
                >
                  <source src={`/videos/borehole-${lang}.mp4`} type="video/mp4" />
                </video>
              </div>
            </div>
          </section>
        </div>

        <Footer variant="cyes" />
      </main>
    </div>
  );
};

export default DonatePage;
