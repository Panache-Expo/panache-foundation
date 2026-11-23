import { useEffect, useState, type MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Languages, Menu, X } from "lucide-react";
import ciyesMark from "@/assets/ciyes-mark.svg";
import { CIYES_NAV_CONTENT } from "@/lib/ciyes-donate-content";
import type { CiyesLang } from "@/lib/ciyes-home-content";

// Site navbar for the CIYES app homepage and the donation pages: a sticky, light glass bar.
// On phones the links fold into a menu; the Donate button always stays in the bar.

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#156D3B]";

type Props = { lang: CiyesLang; onSwitchLang: () => void };

export const SiteNav = ({ lang, onSwitchLang }: Props) => {
  const t = CIYES_NAV_CONTENT[lang];
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // "/#features" style links: scroll in place on the homepage, otherwise go home and let the
  // homepage scroll to the hash once it has mounted.
  const onHashLink = (event: MouseEvent<HTMLAnchorElement>, to: string) => {
    const [path, hash] = to.split("#");
    if (!hash) return;
    event.preventDefault();
    setOpen(false);
    const onHome = location.pathname === (path || "/") || (path === "/" && location.pathname === "/waitlist");
    if (onHome) {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `${location.pathname}${location.search}#${hash}`);
    } else {
      navigate(`${path || "/"}${location.search}#${hash}`);
    }
  };

  const linkClass = (to: string) => {
    const active = !to.includes("#") && location.pathname.startsWith(to);
    return `rounded-full px-3 py-2 font-sans text-sm font-semibold transition-colors ${
      active ? "text-[#11100e]" : "text-[#11100e]/64 hover:text-[#11100e]"
    } ${focusRing}`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex h-16 max-w-full items-center gap-3 px-4 sm:px-8 lg:px-12" aria-label="Main">
        <Link to="/" className={`flex shrink-0 items-center gap-2.5 rounded-xl ${focusRing}`} aria-label={t.home}>
          <img src={ciyesMark} alt="" className="h-9 w-auto" />
          <span className="font-sans text-lg font-semibold leading-none tracking-[-0.04em] text-[#11100e]">CIYES</span>
        </Link>

        <ul className="ml-4 hidden items-center gap-0.5 xl:flex">
          {t.links.map((link) => (
            <li key={link.to}>
              <Link to={link.to} onClick={(e) => onHashLink(e, link.to)} className={linkClass(link.to)}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onSwitchLang}
            className={`inline-flex h-10 items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-3 font-sans text-sm font-semibold text-[#11100e] transition-colors hover:bg-white ${focusRing}`}
            aria-label={lang === "en" ? "Passer en français" : "Switch to English"}
          >
            <Languages className="h-4 w-4" aria-hidden="true" />
            {t.switchTo}
          </button>
          <Link
            to="/#waitlist"
            onClick={(e) => onHashLink(e, "/#waitlist")}
            className={`hidden h-10 items-center rounded-full bg-[#171411] px-4 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#171411]/90 md:inline-flex ${focusRing}`}
          >
            {t.waitlist}
          </Link>
          <Link
            to="/donate"
            className={`inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#FFB200] px-4 font-sans text-sm font-bold text-[#171411] transition-colors hover:bg-[#f2a900] ${focusRing}`}
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
            {t.donate}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 text-[#11100e] xl:hidden ${focusRing}`}
            aria-expanded={open}
            aria-controls="site-nav-menu"
            aria-label={open ? t.close : t.menu}
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div id="site-nav-menu" className="border-t border-black/[0.06] bg-white/95 px-4 pb-5 pt-2 backdrop-blur-xl sm:px-8 xl:hidden">
          <ul className="divide-y divide-black/[0.06]">
            {t.links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={(e) => onHashLink(e, link.to)}
                  className={`block rounded-lg py-3.5 font-sans text-base font-semibold text-[#11100e] ${focusRing}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/#waitlist"
            onClick={(e) => onHashLink(e, "/#waitlist")}
            className={`mt-3 flex h-12 items-center justify-center rounded-full bg-[#171411] font-sans text-sm font-semibold text-white md:hidden ${focusRing}`}
          >
            {t.waitlist}
          </Link>
        </div>
      ) : null}
    </header>
  );
};

export default SiteNav;
