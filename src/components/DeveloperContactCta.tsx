import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";
import { WhatsAppLogo } from "@/components/WhatsAppLogo";
import {
  PANACHE_SUPPORT_WHATSAPP_HREF,
  PANACHE_SUPPORT_WHATSAPP_NUMBER,
} from "@/lib/registration-links";

const PANACHE_AGENT_WHATSAPP_HREF = `${PANACHE_SUPPORT_WHATSAPP_HREF}?text=${encodeURIComponent(
  "Hi Panache, I need help from the WhatsApp agent."
)}`;
const DASHBOARD_ACCESS_KEY_STORAGE = "panache-dashboard-access-key";
const RANKINGS_EMAIL_API_URL =
  import.meta.env.VITE_PANACHE_RANKINGS_EMAIL_API_URL ||
  "/api/panache-rankings-email";

export const DeveloperContactCta = () => {
  const location = useLocation();
  const [isSendingRankings, setIsSendingRankings] = useState(false);
  const [rankingsMessage, setRankingsMessage] = useState("");
  const isRevenueDashboard = location.pathname === "/admin/panache-dor-revenue";

  const emailRankings = async () => {
    const accessKey = window.sessionStorage.getItem(DASHBOARD_ACCESS_KEY_STORAGE) || "";

    if (!accessKey) {
      setRankingsMessage("Unlock the dashboard first.");
      return;
    }

    setIsSendingRankings(true);
    setRankingsMessage("");

    try {
      const response = await fetch(RANKINGS_EMAIL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dashboard-key": accessKey,
        },
      });
      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || "Could not email rankings.");
      }

      setRankingsMessage(payload?.message || "Rankings email sent.");
      trackEvent("rankings_email_sent", {
        placement: "revenue_dashboard_floating_cta",
      });
    } catch (error) {
      setRankingsMessage(
        error instanceof Error ? error.message : "Could not email rankings."
      );
    } finally {
      setIsSendingRankings(false);
    }
  };

  if (isRevenueDashboard) {
    return (
      <div className="fixed bottom-5 right-4 z-50 flex max-w-[280px] flex-col items-end gap-2 md:right-6">
        {rankingsMessage ? (
          <span className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-[#11100e] shadow-[0_10px_30px_rgba(17,16,14,0.18)]">
            {rankingsMessage}
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => void emailRankings()}
          disabled={isSendingRankings}
          className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-[#43145a] px-4 py-3 font-sans text-sm font-semibold text-white shadow-[0_18px_44px_rgba(67,20,90,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#43145a]/92 disabled:cursor-not-allowed disabled:opacity-70 md:px-5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white">
            {isSendingRankings ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Mail className="h-5 w-5" />
            )}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[0.72rem] font-medium text-white/70">
              Admin action
            </span>
            <span>Email rankings</span>
          </span>
        </button>
      </div>
    );
  }

  return (
    <a
      href={PANACHE_AGENT_WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with the Panache WhatsApp agent at ${PANACHE_SUPPORT_WHATSAPP_NUMBER}`}
      title={`WhatsApp agent ${PANACHE_SUPPORT_WHATSAPP_NUMBER}`}
      onClick={() =>
        trackEvent("panache_agent_whatsapp_clicked", {
          placement: "floating_cta",
        })
      }
      className="fixed bottom-5 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,255,255,0.58))] text-[#25D366] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-8px_18px_rgba(90,54,35,0.08),0_18px_44px_rgba(16,10,7,0.18)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/88 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/45 md:right-6"
    >
      <WhatsAppLogo className="h-7 w-7 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]" />
    </a>
  );
};
