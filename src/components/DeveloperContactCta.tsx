import { MessageCircle } from "lucide-react";

const GLEN_WHATSAPP_HREF =
  "https://wa.me/237657560828?text=Hi%20Glen%2C%20I%20saw%20the%20Panache%20Foundation%20website%20and%20I%27d%20like%20to%20discuss%20building%20something%20similar.";

export const DeveloperContactCta = () => (
  <a
    href={GLEN_WHATSAPP_HREF}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Contact Glen Mue for a similar website"
    className="fixed bottom-5 right-4 z-50 inline-flex items-center gap-3 rounded-full border border-black/10 bg-[#11100e] px-4 py-3 font-sans text-sm font-semibold text-white shadow-[0_18px_44px_rgba(17,16,14,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#11100e]/92 md:right-6 md:px-5"
  >
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white">
      <MessageCircle className="h-5 w-5" />
    </span>
    <span className="flex flex-col leading-tight">
      <span className="text-[0.72rem] font-medium text-white/70">
        Need a website like this?
      </span>
      <span>Talk to Glen</span>
    </span>
  </a>
);
