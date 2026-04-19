import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import panacheScriptLogo from "@/assets/PanacheHeroLogo.svg";
import footerMuse from "@/assets/edith.png";

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
      <div className="relative overflow-hidden rounded-[2.75rem] bg-[#f7f5f1] px-6 py-10 md:px-10 md:py-12 lg:px-14 lg:py-14">
        <div className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(130,65,182,0.2),rgba(130,65,182,0.08)_38%,transparent_72%)] blur-3xl md:h-[34rem] md:w-[34rem]" />

        <div className="relative grid gap-12 lg:grid-cols-[0.95fr_1.3fr_0.95fr] lg:items-start">
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <p className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-[#11100e]/60">
              Quick Links
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="font-sans text-[clamp(1.55rem,4vw,2.4rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[#11100e] transition-opacity hover:opacity-60"
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

          <div className="order-1 flex flex-col items-center text-center lg:order-2">
            <img
              src={panacheScriptLogo}
              alt="Panache signature logo"
              className="h-20 w-auto invert md:h-24"
            />

            <h2 className="mt-5 font-sans text-[clamp(2.4rem,5vw,4.7rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-[#11100e]">
              PANACHE FOUNDATION
            </h2>

            <p className="mt-6 max-w-[40rem] font-sans text-[clamp(1.25rem,2.2vw,2rem)] font-medium leading-[1.18] tracking-[-0.03em] text-[#11100e]/92">
              Empowering communities through excellence in beauty, fashion, and youth
              entrepreneurship. Choose your path to discover our impactful initiatives.
            </p>
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

        <div className="relative mt-10 flex justify-center lg:-mt-8">
          <div className="relative">
            <img
              src={footerMuse}
              alt="Panache Foundation muse"
              className="h-[21rem] w-auto select-none object-contain grayscale contrast-125 brightness-90 mix-blend-multiply md:h-[28rem] lg:h-[36rem]"
            />

            <Link
              to="/panache-expo/contact"
              className="absolute bottom-4 left-1/2 -translate-x-1/2 md:bottom-6"
            >
              <Button className="h-14 rounded-full bg-black px-8 font-sans text-lg font-semibold text-white hover:bg-black/90">
                Contact Us
              </Button>
            </Link>
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
