import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, Loader2, RefreshCw, XCircle } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SiteNav } from "@/components/SiteNav";
import { WhatsAppLogo } from "@/components/WhatsAppLogo";
import { detectCiyesLang, saveCiyesLang, type CiyesLang } from "@/lib/ciyes-home-content";
import { CIYES_DONATE_CONTENT, CIYES_DONATE_URL, formatFcfa } from "@/lib/ciyes-donate-content";
import { DonationApiError, verifyDonation, type DonationVerifyResult } from "@/lib/ciyes-donate-api";

// /donate/thank-you?tx_ref=...: Campay sends donors back here. Verify once on load; while the
// payment is pending, offer "Check again". Modelled on EventTicketPaymentVerifyPage.

type State =
  | { kind: "checking" }
  | { kind: "result"; result: DonationVerifyResult }
  | { kind: "missing" }
  | { kind: "error" };

const DonateThankYouPage = () => {
  const [params] = useSearchParams();
  const txRef = params.get("tx_ref") || "";
  const [lang, setLang] = useState<CiyesLang>(() => detectCiyesLang());
  const t = CIYES_DONATE_CONTENT[lang].thanks;
  const [state, setState] = useState<State>({ kind: "checking" });
  const [rechecking, setRechecking] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.metaTitle;
  }, [lang, t]);

  const check = useCallback(async () => {
    if (!txRef) {
      setState({ kind: "missing" });
      return;
    }
    try {
      setState({ kind: "result", result: await verifyDonation(txRef) });
    } catch (error) {
      setState(error instanceof DonationApiError && (error.status === 404 || error.status === 400) ? { kind: "missing" } : { kind: "error" });
    }
  }, [txRef]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void check();
  }, [check]);

  const checkAgain = async () => {
    setRechecking(true);
    await check();
    setRechecking(false);
  };

  const switchLang = () => {
    const next: CiyesLang = lang === "en" ? "fr" : "en";
    setLang(next);
    saveCiyesLang(next);
  };

  const shareHref = `https://wa.me/?text=${encodeURIComponent(`${t.shareMessage} ${CIYES_DONATE_URL}`)}`;
  const status = state.kind === "result" ? state.result.status : null;
  const pending = status === "pending" || state.kind === "error";

  const button =
    "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-sans text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#156D3B]";

  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#14110f]">
      <SiteNav lang={lang} onSwitchLang={switchLang} />
      <main className="px-5 py-14 sm:px-14 sm:py-20">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-black/8 bg-white/85 p-8 text-center shadow-[0_18px_42px_rgba(17,16,14,0.06)] sm:p-10" aria-live="polite">
          {state.kind === "checking" ? (
            <>
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#156D3B]" aria-hidden="true" />
              <p className="mt-4 font-sans text-base font-medium text-[#11100e]/70">{t.checking}</p>
            </>
          ) : status === "completed" && state.kind === "result" ? (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-[#156D3B]" aria-hidden="true" />
              <h1 className="mt-5 font-display text-[clamp(2rem,5vw,3rem)] font-bold leading-[0.96] tracking-[-0.05em] text-[#11100e]">
                {t.successTitle(state.result.donor_name)}
              </h1>
              <p className="mt-4 font-sans text-base leading-relaxed text-[#11100e]/72">{t.successText(formatFcfa(lang, state.result.amount_xaf))}</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <a href={shareHref} target="_blank" rel="noreferrer" className={`${button} bg-[#25D366] text-[#0b2e17] hover:bg-[#22c55e]`}>
                  <WhatsAppLogo className="h-5 w-5" />
                  {t.share}
                </a>
                <Link to="/donate" className={`${button} border border-black/10 bg-white text-[#11100e] hover:bg-white/80`}>{t.back}</Link>
              </div>
            </>
          ) : pending ? (
            <>
              <Clock className="mx-auto h-12 w-12 text-[#E7B008]" aria-hidden="true" />
              <h1 className="mt-5 font-display text-[clamp(1.8rem,4.5vw,2.6rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[#11100e]">{t.pendingTitle}</h1>
              <p className="mt-4 font-sans text-base leading-relaxed text-[#11100e]/72">{t.pendingText}</p>
              <button type="button" onClick={checkAgain} disabled={rechecking} className={`${button} mt-8 bg-[#171411] text-white hover:bg-[#171411]/92 disabled:opacity-70`}>
                <RefreshCw className={`h-4 w-4 ${rechecking ? "animate-spin" : ""}`} aria-hidden="true" />
                {t.checkAgain}
              </button>
            </>
          ) : state.kind === "missing" ? (
            <>
              <XCircle className="mx-auto h-12 w-12 text-[#CC2129]" aria-hidden="true" />
              <h1 className="mt-5 font-display text-[clamp(1.8rem,4.5vw,2.6rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[#11100e]">{t.missingTitle}</h1>
              <p className="mt-4 font-sans text-base leading-relaxed text-[#11100e]/72">{t.missingText}</p>
              <Link to="/donate" className={`${button} mt-8 bg-[#171411] text-white hover:bg-[#171411]/92`}>{t.back}</Link>
            </>
          ) : (
            <>
              <XCircle className="mx-auto h-12 w-12 text-[#CC2129]" aria-hidden="true" />
              <h1 className="mt-5 font-display text-[clamp(1.8rem,4.5vw,2.6rem)] font-bold leading-[0.98] tracking-[-0.05em] text-[#11100e]">{t.failedTitle}</h1>
              <p className="mt-4 font-sans text-base leading-relaxed text-[#11100e]/72">{t.failedText}</p>
              <Link to="/donate" className={`${button} mt-8 bg-[#FFB200] font-bold text-[#171411] hover:bg-[#f2a900]`}>{t.tryAgain}</Link>
            </>
          )}
        </div>
      </main>
      <Footer variant="cyes" />
    </div>
  );
};

export default DonateThankYouPage;
