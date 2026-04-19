import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { type CSSProperties, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, Home, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavLinkItem = {
  label: string;
  to: string;
};

type HeaderVariant = "foundation" | "panache" | "cyes";

type HeaderConfig = {
  variant: HeaderVariant;
  brandTo: string;
  brandLabel: string;
  accentLabel?: string;
  primaryLinks: NavLinkItem[];
  dropdownLabel?: string;
  dropdownLinks?: NavLinkItem[];
  contactTo: string;
  showContactInNav?: boolean;
  showGatewayLink?: boolean;
  registerTo: string;
  registerLabel: string;
};

const panacheBaseRoutes = [
  "/panache-expo",
  "/panache-expo/panache-360",
  "/panache-expo/panache-fashion-night",
  "/panache-expo/panache-dor",
  "/panache-expo/miss-panache",
  "/panache-expo/workshops",
  "/panache-expo/exhibition-stands",
  "/panache-expo/charity-night",
  "/panache-expo/nominations",
];

const isPanacheRoute = (pathname: string) =>
  panacheBaseRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

const isCYESRoute = (pathname: string) =>
  pathname === "/cyes" || pathname.startsWith("/cyes/");

const getHeaderConfig = (pathname: string): HeaderConfig => {
  if (isPanacheRoute(pathname)) {
    return {
      variant: "panache",
      brandTo: "/panache-expo",
      brandLabel: "Panache Expo",
      accentLabel: "2026",
      primaryLinks: [
        { label: "Overview", to: "/panache-expo" },
        { label: "Panache 360", to: "/panache-expo/panache-360" },
        { label: "Runway Show", to: "/panache-expo/panache-fashion-night" },
      ],
      dropdownLabel: "More",
      dropdownLinks: [
        { label: "Miss Panache", to: "/panache-expo/miss-panache" },
        { label: "Exhibition Stands", to: "/panache-expo/exhibition-stands" },
        { label: "Charity Night", to: "/panache-expo/charity-night" },
        { label: "Panache D'or", to: "/panache-expo/panache-dor" },
        { label: "Nominations", to: "/panache-expo/nominations" },
        { label: "Workshops", to: "/panache-expo/workshops" },
        { label: "Contact", to: "/panache-expo/contact" },
      ],
      showContactInNav: false,
      showGatewayLink: false,
      contactTo: "/panache-expo/contact",
      registerTo: "/panache-expo/register",
      registerLabel: "Register",
    };
  }

  if (isCYESRoute(pathname)) {
    return {
      variant: "cyes",
      brandTo: "/cyes",
      brandLabel: "CYES",
      accentLabel: "Summit",
      primaryLinks: [
        { label: "Overview", to: "/cyes" },
        { label: "Awards", to: "/cyes/awards" },
        { label: "Nominations", to: "/cyes/nominations" },
        { label: "Pitch Competition", to: "/cyes/pitch-competition" },
      ],
      contactTo: "/cyes/contact",
      showGatewayLink: false,

      registerTo: "/cyes/register",
      registerLabel: "Register",
    };
  }

  return {
    variant: "foundation",
    brandTo: "/",
    brandLabel: "Panache Expo",
    accentLabel: "Foundation",
    primaryLinks: [
      { label: "Panache Expo", to: "/panache-expo" },
      { label: "CYES", to: "/cyes" },
      { label: "Contact", to: "/panache-expo/contact" },
    ],
    contactTo: "/panache-expo/contact",
    registerTo: "/panache-expo/register",
    registerLabel: "Register",
  };
};

const linkClasses = (isActive: boolean) =>
  [
    "transition-colors",
    isActive ? "text-primary font-medium" : "text-foreground hover:text-primary",
  ].join(" ");

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showcaseNavCenterShift, setShowcaseNavCenterShift] = useState(0);
  const [showcaseNavScrollProgress, setShowcaseNavScrollProgress] = useState(0);
  const [hoveredLiquidNavKey, setHoveredLiquidNavKey] = useState<string | null>(null);
  const [isHomeButtonCollapsed, setIsHomeButtonCollapsed] = useState(false);
  const [homeButtonSlotWidth, setHomeButtonSlotWidth] = useState(0);
  const showcaseNavTrackRef = useRef<HTMLDivElement | null>(null);
  const liquidNavRef = useRef<HTMLElement | null>(null);
  const homeButtonContentRef = useRef<HTMLSpanElement | null>(null);
  const location = useLocation();
  const config = getHeaderConfig(location.pathname);
  const isPanacheExpoLanding = location.pathname === "/panache-expo";
  const isCYESLanding = location.pathname === "/cyes";
  const isShowcaseLanding = isPanacheExpoLanding || isCYESLanding;

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setHoveredLiquidNavKey(null);
  }, [location.pathname]);

  const isExactActive = (to: string) => location.pathname === to;
  const isGatewayLink = location.pathname !== "/";
  const shouldShowGatewayLink = isGatewayLink && (config.showGatewayLink ?? true);
  const shouldShowContactInNav = config.showContactInNav ?? true;
  const isDropdownActive = config.dropdownLinks?.some((item) => isExactActive(item.to)) ?? false;
  const activeLiquidNavKey =
    config.primaryLinks.find((item) => isExactActive(item.to))?.to ??
    (isDropdownActive ? "dropdown" : null) ??
    (shouldShowContactInNav && config.variant !== "foundation" && isExactActive(config.contactTo)
      ? config.contactTo
      : null);
  const currentLiquidNavKey = hoveredLiquidNavKey ?? activeLiquidNavKey;
  const showcaseDesktopLinkClasses = (itemKey: string) =>
    cn(
      "liquid-nav__item",
      currentLiquidNavKey === itemKey ? "text-[#120d0b]" : "text-[#211d1b]"
    );
  const showcaseRegisterButtonClasses =
    config.variant === "cyes"
      ? "bg-cyes-yellow text-[#211d1b] hover:bg-cyes-yellow/90"
      : "bg-primary text-white hover:bg-primary/90";
  const homeButtonHoverClasses =
    config.variant === "cyes"
      ? "hover:bg-cyes-yellow hover:text-[#211d1b] hover:border-cyes-yellow hover:shadow-lg hover:scale-[1.02]"
      : "hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:scale-[1.02]";
  const registerButtonGlassClasses =
    "bg-white/25 text-[#211d1b] border border-white/40 backdrop-blur-xl shadow-[0_14px_34px_rgba(16,10,7,0.18)] hover:bg-white/35 hover:border-white/60 hover:shadow-[0_18px_40px_rgba(16,10,7,0.26)]";
  const liquidNavStyle = {
    "--expo-nav-center-shift": `${showcaseNavCenterShift}px`,
    "--expo-nav-scroll-progress": showcaseNavScrollProgress,
  } as CSSProperties;

  useEffect(() => {
    if (!isShowcaseLanding) {
      setShowcaseNavScrollProgress(0);
      return;
    }

    let frame = 0;
    const maxScrollDistance = 260;

    const syncShowcaseNavScrollProgress = () => {
      setShowcaseNavScrollProgress(Math.min(window.scrollY / maxScrollDistance, 1));
    };

    const queueShowcaseNavScrollProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncShowcaseNavScrollProgress);
    };

    queueShowcaseNavScrollProgress();
    window.addEventListener("scroll", queueShowcaseNavScrollProgress, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queueShowcaseNavScrollProgress);
    };
  }, [isShowcaseLanding]);

  useEffect(() => {
    let frame = 0;
    const collapseTriggerDistance = 220;
    const revealTriggerDistance = 24;

    setIsHomeButtonCollapsed(false);

    const syncHomeButtonCollapse = () => {
      if (window.scrollY <= revealTriggerDistance) {
        setIsHomeButtonCollapsed(false);
      } else if (window.scrollY >= collapseTriggerDistance) {
        setIsHomeButtonCollapsed(true);
      }
    };

    const queueHomeButtonCollapse = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncHomeButtonCollapse);
    };

    queueHomeButtonCollapse();
    window.addEventListener("scroll", queueHomeButtonCollapse, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queueHomeButtonCollapse);
    };
  }, [location.pathname]);

  const homeButtonVisibility = isHomeButtonCollapsed ? 0 : 1;
  const resolvedHomeButtonSlotWidth = homeButtonSlotWidth || 104;
  const homeNavButtonSlotStyle = {
    width: `${resolvedHomeButtonSlotWidth * homeButtonVisibility}px`,
    opacity: homeButtonVisibility,
    marginInline: `${8 * homeButtonVisibility}px`,
    transition:
      "width 240ms cubic-bezier(0.22, 1, 0.36, 1), margin 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 240ms cubic-bezier(0.22, 1, 0.36, 1)",
    pointerEvents: homeButtonVisibility > 0.05 ? "auto" : "none",
    overflow: "hidden",
    whiteSpace: "nowrap",
    flexShrink: 0,
  } as CSSProperties;
  const homeNavButtonInnerStyle = {
    opacity: homeButtonVisibility,
    transform: `translateY(${isHomeButtonCollapsed ? 4 : 0}px) scale(${isHomeButtonCollapsed ? 0.96 : 1})`,
    transformOrigin: "center right",
    transition:
      "opacity 240ms cubic-bezier(0.22, 1, 0.36, 1), transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
  } as CSSProperties;

  const navFontClassForItem = (label: string) =>
    /celebrating/i.test(label) ? "font-sans" : "";

  useLayoutEffect(() => {
    if (!homeButtonContentRef.current) {
      return;
    }

    const content = homeButtonContentRef.current;
    let frame = 0;

    const syncHomeButtonSlotWidth = () => {
      setHomeButtonSlotWidth(content.getBoundingClientRect().width);
    };

    const queueHomeButtonSlotWidth = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncHomeButtonSlotWidth);
    };

    const resizeObserver = new ResizeObserver(queueHomeButtonSlotWidth);

    queueHomeButtonSlotWidth();
    resizeObserver.observe(content);
    window.addEventListener("resize", queueHomeButtonSlotWidth);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", queueHomeButtonSlotWidth);
    };
  }, [isShowcaseLanding, location.pathname]);

  useLayoutEffect(() => {
    if (!isShowcaseLanding || !showcaseNavTrackRef.current || !liquidNavRef.current) {
      setShowcaseNavCenterShift(0);
      return;
    }

    const navTrack = showcaseNavTrackRef.current;
    const nav = liquidNavRef.current;
    let frame = 0;

    const syncShowcaseNavCenterShift = () => {
      const centeredLeft = Math.max((navTrack.clientWidth - nav.offsetWidth) / 2, 0);
      setShowcaseNavCenterShift(centeredLeft - nav.offsetLeft);
    };

    const queueShowcaseNavCenterShift = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncShowcaseNavCenterShift);
    };

    const resizeObserver = new ResizeObserver(queueShowcaseNavCenterShift);

    queueShowcaseNavCenterShift();
    resizeObserver.observe(navTrack);
    resizeObserver.observe(nav);
    window.addEventListener("resize", queueShowcaseNavCenterShift);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", queueShowcaseNavCenterShift);
    };
  }, [isShowcaseLanding, location.pathname]);

  useLayoutEffect(() => {
    if (!isShowcaseLanding || !liquidNavRef.current) {
      return;
    }

    const nav = liquidNavRef.current;
    let frame = 0;

    const syncLiquidNavIndicator = () => {
      const currentItem = nav.querySelector<HTMLElement>('[data-liquid-current="true"]');

      if (!currentItem) {
        nav.dataset.ready = "false";
        return;
      }

      const navRect = nav.getBoundingClientRect();
      const itemRect = currentItem.getBoundingClientRect();

      nav.style.setProperty("--liquid-nav-x", `${itemRect.left - navRect.left}px`);
      nav.style.setProperty("--liquid-nav-y", `${itemRect.top - navRect.top}px`);
      nav.style.setProperty("--liquid-nav-width", `${itemRect.width}px`);
      nav.style.setProperty("--liquid-nav-height", `${itemRect.height}px`);
      nav.dataset.ready = "true";
    };

    const queueLiquidNavSync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncLiquidNavIndicator);
    };

    const resizeObserver = new ResizeObserver(queueLiquidNavSync);

    queueLiquidNavSync();
    resizeObserver.observe(nav);

    const currentItem = nav.querySelector<HTMLElement>('[data-liquid-current="true"]');
    if (currentItem) {
      resizeObserver.observe(currentItem);
    }

    window.addEventListener("resize", queueLiquidNavSync);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", queueLiquidNavSync);
    };
  }, [currentLiquidNavKey, isShowcaseLanding, location.pathname]);

  return (
    <header
      className={
        isShowcaseLanding
          ? "fixed top-0 left-0 right-0 z-50 bg-transparent"
          : "fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-border"
      }
    >
      <div
        className={
          isShowcaseLanding
            ? " flex  items-center justify-end gap-6 px-2 py-4 md:px-4 md:py-6"
            : "  px-6 py-4 flex items-center justify-end gap-6"
        }
      >
        {/* <div className="flex items-center gap-4 min-w-0">
          <Link
            to={config.brandTo}
            className={
              isShowcaseLanding
                ? "flex items-baseline gap-2 min-w-0 font-display text-2xl font-bold text-white"
                : "flex items-baseline gap-2 min-w-0 font-display text-2xl font-bold text-primary"
            }
          >
            <span className="truncate">{config.brandLabel}</span>
            {config.accentLabel ? (
              <span className="text-rose-gold truncate">{config.accentLabel}</span>
            ) : null}
          </Link>
        </div> */}

        {isShowcaseLanding ? (
          <div ref={showcaseNavTrackRef} className="relative hidden md:flex flex-1 justify-end">
            <nav
              ref={liquidNavRef}
              className="liquid-nav text-sm"
              data-ready="false"
              style={liquidNavStyle}
              onPointerLeave={() => setHoveredLiquidNavKey(null)}
              onBlurCapture={(event) => {
                if (
                  !(event.relatedTarget instanceof Node) ||
                  !event.currentTarget.contains(event.relatedTarget)
                ) {
                  setHoveredLiquidNavKey(null);
                }
              }}
            >
              <span className="liquid-nav__indicator" aria-hidden="true" />
              <span className="liquid-nav__filter" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" focusable="false">
                  <defs>
                    <filter id="liquid-nav-filter" x="-30%" y="-70%" width="160%" height="240%">
                      <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.012 0.05"
                        numOctaves="2"
                        seed="8"
                        result="noise"
                      />
                      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                      <feDisplacementMap
                        in="blur"
                        in2="noise"
                        scale="10"
                        xChannelSelector="R"
                        yChannelSelector="B"
                        result="distorted"
                      />
                      <feColorMatrix
                        in="distorted"
                        type="matrix"
                        values="
                          1 0 0 0 0
                          0 1 0 0 0
                          0 0 1 0 0
                          0 0 0 20 -9"
                        result="goo"
                      />
                      <feBlend in="SourceGraphic" in2="goo" />
                    </filter>
                  </defs>
                </svg>
              </span>

              {shouldShowGatewayLink ? (
                <Link
                  to="/"
                  className={cn(showcaseDesktopLinkClasses("gateway"), navFontClassForItem("Gateway"))}
                  data-liquid-current={currentLiquidNavKey === "gateway" ? "true" : undefined}
                  onPointerEnter={() => setHoveredLiquidNavKey("gateway")}
                  onFocus={() => setHoveredLiquidNavKey("gateway")}
                >
                  <Home className="w-4 h-4" />
                  Choose Event
                </Link>
              ) : null}

              {config.primaryLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(showcaseDesktopLinkClasses(item.to), navFontClassForItem(item.label))}
                  data-liquid-current={currentLiquidNavKey === item.to ? "true" : undefined}
                  onPointerEnter={() => setHoveredLiquidNavKey(item.to)}
                  onFocus={() => setHoveredLiquidNavKey(item.to)}
                >
                  {item.label}
                </Link>
              ))}

              {config.dropdownLinks?.length ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(showcaseDesktopLinkClasses("dropdown"), navFontClassForItem(config.dropdownLabel ?? ""))}
                    data-liquid-current={currentLiquidNavKey === "dropdown" ? "true" : undefined}
                    onPointerEnter={() => setHoveredLiquidNavKey("dropdown")}
                    onFocus={() => setHoveredLiquidNavKey("dropdown")}
                  >
                    {config.dropdownLabel}
                    <ChevronDown className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="rounded-[1.35rem] border border-white/35 bg-white/80 p-2 shadow-[0_18px_45px_rgba(16,10,7,0.18)] backdrop-blur-xl">
                    {config.dropdownLinks.map((item) => (
                      <DropdownMenuItem key={item.to} asChild>
                        <Link
                          to={item.to}
                          className={cn(
                            "cursor-pointer rounded-full px-4 py-2 text-[#211d1b] transition-colors hover:bg-black/5 focus:bg-black/5",
                            navFontClassForItem(item.label)
                          )}
                        >
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}

              {shouldShowContactInNav && config.variant !== "foundation" ? (
                <Link
                  to={config.contactTo}
                  className={cn(showcaseDesktopLinkClasses(config.contactTo), navFontClassForItem("Contact"))}
                  data-liquid-current={
                    currentLiquidNavKey === config.contactTo ? "true" : undefined
                  }
                  onPointerEnter={() => setHoveredLiquidNavKey(config.contactTo)}
                  onFocus={() => setHoveredLiquidNavKey(config.contactTo)}
                >
                  Contact
                </Link>
              ) : null}

              <span className="inline-flex" style={homeNavButtonSlotStyle}>
                <span ref={homeButtonContentRef} className="inline-flex" style={homeNavButtonInnerStyle}>
                  <Link to="/">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-8 rounded-full px-4 text-sm font-semibold transition-all duration-300",
                        homeButtonHoverClasses
                      )}
                    >
                      Home
                    </Button>
                  </Link>
                </span>
              </span>

              <Link to={config.registerTo} className="liquid-nav__cta">
                <Button
                  className={cn(
                    "h-8 rounded-full px-6 text-sm font-semibold shadow-none",
                    showcaseRegisterButtonClasses
                  )}
                >
                  {config.registerLabel}
                </Button>
              </Link>
            </nav>
          </div>
        ) : (
          <nav className="hidden md:flex items-center gap-6">
            {shouldShowGatewayLink ? (
              <Link
                to="/"
                className={cn(
                  "flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors",
                  navFontClassForItem("Choose Event")
                )}
              >
                <Home className="w-4 h-4" />
                Choose Event
              </Link>
            ) : null}

            {config.primaryLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(linkClasses(isExactActive(item.to)), navFontClassForItem(item.label))}
              >
                {item.label}
              </Link>
            ))}

            {config.dropdownLinks?.length ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    "flex items-center gap-1 text-foreground hover:text-primary transition-colors",
                    navFontClassForItem(config.dropdownLabel ?? "")
                  )}
                >
                  {config.dropdownLabel}
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background border border-border shadow-elegant z-50">
                  {config.dropdownLinks.map((item) => (
                    <DropdownMenuItem key={item.to} asChild>
                      <Link
                        to={item.to}
                        className={cn("cursor-pointer", navFontClassForItem(item.label))}
                      >
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            {shouldShowContactInNav && config.variant !== "foundation" ? (
              <Link
                to={config.contactTo}
                className={cn(
                  linkClasses(isExactActive(config.contactTo)),
                  navFontClassForItem("Contact")
                )}
              >
                Contact
              </Link>
              ) : null}

              <span className="hidden sm:inline-flex" style={homeNavButtonSlotStyle}>
                <span ref={homeButtonContentRef} className="inline-flex" style={homeNavButtonInnerStyle}>
                  <Link to="/">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-8 rounded-full px-4 text-sm font-semibold transition-all duration-300",
                        homeButtonHoverClasses
                      )}
                    >
                      Home
                    </Button>
                  </Link>
                </span>
              </span>

              <Link to={config.registerTo}>
                <Button variant="default" size="sm" className="p-2">
                  {config.registerLabel}
                </Button>
              </Link>
          </nav>
        )}

        <button
          className={isShowcaseLanding ? "md:hidden p-2 text-white" : "md:hidden p-2"}
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {isMobileMenuOpen ? (
          <div
            className={
              isShowcaseLanding
                ? "absolute left-4 right-4 top-full rounded-[1.5rem] border border-white/15 bg-black/80 backdrop-blur-xl md:hidden"
                : "absolute top-full left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border md:hidden"
            }
          >
            <nav className="flex flex-col p-6 gap-4">
              {isShowcaseLanding ? (
                <>
                  {shouldShowGatewayLink ? (
                    <Link
                      to="/"
                      className="text-white hover:text-white/80 transition-colors flex items-center gap-2"
                    >
                      <Home className="w-4 h-4" />
                      Choose Event
                    </Link>
                  ) : null}

                  <div className="border-t border-white/10 pt-4">
                    <p className="text-sm text-white/60 mb-2">{config.brandLabel}</p>
                    {config.primaryLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "block text-white/85 hover:text-white transition-colors py-1 pl-2",
                      navFontClassForItem(item.label)
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                {config.dropdownLinks?.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "block text-white/85 hover:text-white transition-colors py-1 pl-2",
                      navFontClassForItem(item.label)
                    )}
                    >
                    {item.label}
                  </Link>
                ))}
                  </div>

                  {shouldShowContactInNav && config.variant !== "foundation" ? (
                    <Link
                      to={config.contactTo}
                      className={cn(
                        "text-white hover:text-white/80 transition-colors",
                        navFontClassForItem("Contact")
                      )}
                    >
                      Contact
                    </Link>
                  ) : null}

                  <Link to={config.registerTo}>
                    <Button size="sm" className="w-fit rounded-full px-5">
                      {config.registerLabel}
                    </Button>
                  </Link>
                </>
              ) : shouldShowGatewayLink ? (
                <Link
                  to="/"
                  className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Choose Event
                </Link>
              ) : null}

              {isShowcaseLanding ? null : (
                <>
                  <div className="border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground mb-2">{config.brandLabel}</p>
                    {config.primaryLinks.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                          "block text-foreground hover:text-primary transition-colors py-1 pl-2",
                          navFontClassForItem(item.label)
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                    {config.dropdownLinks?.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                          "block text-foreground hover:text-primary transition-colors py-1 pl-2",
                          navFontClassForItem(item.label)
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  {shouldShowContactInNav && config.variant !== "foundation" ? (
                    <Link
                      to={config.contactTo}
                      className={cn(
                        "text-foreground hover:text-primary transition-colors",
                        navFontClassForItem("Contact")
                      )}
                    >
                      Contact
                    </Link>
                  ) : null}

                  <Link to={config.registerTo}>
                    <Button variant="default" size="sm" className="w-fit">
                      {config.registerLabel}
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
};
