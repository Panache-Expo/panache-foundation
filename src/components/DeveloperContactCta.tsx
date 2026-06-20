import { Loader2, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";

const GLEN_WHATSAPP_HREF =
  "https://wa.me/237657560828?text=Hi%20Glen%2C%20I%20saw%20the%20Panache%20Foundation%20website%20and%20I%27d%20like%20to%20discuss%20building%20something%20similar.";
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
      href={GLEN_WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact Glen Mue for a similar website"
      onClick={() =>
        trackEvent("developer_whatsapp_clicked", {
          placement: "floating_cta",
        })
      }
      className="fixed bottom-5 right-4 z-50 inline-flex items-center gap-3 rounded-full border border-black/10 bg-[#11100e] px-4 py-3 font-sans text-sm font-semibold text-white shadow-[0_18px_44px_rgba(17,16,14,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#11100e]/92 md:right-6 md:px-5"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white">
        <MessageCircle className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[0.72rem] font-medium text-white/70">
          Need a website like this?
        </span>
        {/* <span>Talk to Glen</span> */}
      </span>
    </a>
  );
};
