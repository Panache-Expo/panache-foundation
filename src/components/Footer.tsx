import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import panacheScriptLogo from "@/assets/PanacheHeroLogo.svg";
import footerMuse from "@/assets/footer-muse-crown.png";

const quickLinks = [
  { label: "Foundation Home", to: "/" },
  { label: "Panache Expo 2026", to: "/panache-expo" },
  { label: "CYES", to: "/cyes" },
  { label: "Panache 360 Beauty", to: "/panache-expo/panache-360" },
  { label: "Panache D'or", to: "/panache-expo/panache-dor" },
];

const panacheSocials = [
  { label: "X", href: "https://x.com", icon: Twitter },
  { label: "Instagram", href: "https://instagram.com/panache_expo", icon: Instagram },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/thepanacheexpo/",
    icon: Linkedin,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1BvgGo9hXL/?mibextid=wwXIfr",
    icon: Facebook,
  },
];

const cyesSocials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/cyes_awards?igsh=bTN5eGdqcWR6ODk3&utm_source=qr",
    icon: Instagram,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/cyes-youth-summit-awards/",
    icon: Linkedin,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1BiZNSBN2q/?mibextid=wwXIfr",
    icon: Facebook,
  },
];

const socialLinkClasses =
  "inline-flex h-12 w-12 items-center justify-center rounded-full text-[#11100e] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-65";

export const Footer = () => {
  return (
    <footer className="relative bg-accent px-3 pb-4 pt-14 md:px-4 md:pt-16">
      <div className="relative overflow-hidden rounded-[2.75rem] bg-[linear-gradient(180deg,#f6f8f5_0%,#f5f5f2_52%,#f4f7fd_100%)] px-6 pb-10 pt-8 md:px-10 md:pb-12 md:pt-10 lg:px-14 lg:pb-14 lg:pt-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_78%,rgba(255,210,61,0.16),transparent_24%),radial-gradient(circle_at_50%_55%,rgba(130,65,182,0.12),transparent_26%),radial-gradient(circle_at_82%_22%,rgba(24,117,210,0.1),transparent_24%)]" />

        <div className="relative grid gap-8 text-center lg:grid-cols-[0.95fr_1.1fr_0.95fr] lg:items-start lg:text-left">
          <div className="flex items-center justify-center lg:justify-start">
            <h2 className="font-sans text-[clamp(2rem,4.3vw,3.5rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-[#11100e]">
              PANACHE FOUNDATION
            </h2>
          </div>

          <div className="flex items-center justify-center">
            <img
              src={panacheScriptLogo}
              alt="Panache signature logo"
              className="h-20 w-auto invert md:h-24"
            />
          </div>

          <p className="mx-auto max-w-[32rem] font-sans text-[clamp(1.2rem,2vw,1.8rem)] font-medium leading-[1.18] tracking-[-0.03em] text-[#11100e]/92 lg:mx-0 lg:text-right">
            Empowering communities through excellence in beauty, fashion, and
            youth entrepreneurship. Choose your path to discover our impactful
            initiatives.
          </p>
        </div>

        <div className="relative mt-10 grid gap-10 lg:grid-cols-[0.95fr_1.1fr_0.95fr] lg:items-start">
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <p className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-[#11100e]/60">
              Quick Links
            </p>

            <div className="mt-5 flex flex-col gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="font-sans text-[clamp(1.55rem,3.8vw,2.3rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[#11100e] transition-opacity hover:opacity-60"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <Link to="/panache-expo/register" className="mt-8 inline-flex">
              <Button className="h-14 rounded-full bg-black px-8 font-sans text-lg font-semibold text-white hover:bg-black/90">
                Register
              </Button>
            </Link>
          </div>

          <div className="order-1 flex justify-center lg:order-2">
            <div className="relative flex min-h-[21rem] w-full items-end justify-center md:min-h-[28rem] lg:min-h-[40rem]">
              <div className="pointer-events-none absolute inset-x-10 bottom-8 h-[14rem] rounded-full bg-[radial-gradient(circle,rgba(255,210,61,0.24),rgba(130,65,182,0.14)_42%,transparent_76%)] blur-3xl md:inset-x-12 md:h-[18rem]" />
              <img
                src={footerMuse}
                alt="Panache Foundation muse"
                className="relative h-[20rem] w-auto select-none object-contain drop-shadow-[0_24px_50px_rgba(17,16,14,0.18)] md:h-[28rem] lg:h-[40rem]"
              />
            </div>
          </div>

          <div className="order-3 text-center lg:text-right">
            <div>
              <p className="font-sans text-[clamp(1.35rem,2.2vw,1.9rem)] font-semibold leading-tight tracking-[-0.04em] text-[#11100e]">
                Follow Us - Panache Expo
              </p>

              <div className="mt-4 flex items-center justify-center gap-3 lg:justify-end">
                {panacheSocials.map((social) => {
                  const Icon = social.icon;

                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className={socialLinkClasses}
                    >
                      <Icon className="h-8 w-8" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="mt-10">
              <p className="font-sans text-[clamp(1.35rem,2.2vw,1.9rem)] font-semibold leading-tight tracking-[-0.04em] text-[#11100e]">
                Follow Us - CYES
              </p>

              <div className="mt-4 flex items-center justify-center gap-3 lg:justify-end">
                {cyesSocials.map((social) => {
                  const Icon = social.icon;

                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className={socialLinkClasses}
                    >
                      <Icon className="h-8 w-8" />
                    </a>
                  );
                })}
              </div>
            </div>

            <p className="mx-auto mt-12 max-w-[18rem] font-sans text-[clamp(1.2rem,2vw,1.7rem)] font-medium leading-[1.18] tracking-[-0.03em] text-[#11100e]/92 lg:mr-0">
              Stay updated with our latest events and workshops
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-2 pt-4 text-sm font-medium text-[#11100e]/80 md:flex-row md:items-center md:justify-between">
        <p>&copy; 2026 Panache Expo. All rights reserved.</p>

        <div className="flex flex-wrap items-center gap-6">
          <a href="#" className="transition-opacity hover:opacity-60">
            Privacy Policy
          </a>
          <a href="#" className="transition-opacity hover:opacity-60">
            Terms of Services
          </a>
        </div>
      </div>
    </footer>
  );
};
