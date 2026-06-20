import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const DASHBOARD_ACCESS_KEY_STORAGE = "panache-dashboard-access-key";
const RANKINGS_EMAIL_API_URL =
  import.meta.env.VITE_RANKINGS_EMAIL_API_URL || "/api/email-rankings";

const dashboardPaths = new Set([
  "/panache-expo/participants-dashboard",
  "/admin/participants",
]);

export const EmailRankingsButton = () => {
  const { pathname } = useLocation();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  if (!dashboardPaths.has(pathname)) {
    return null;
  }

  const handleEmailRankings = async () => {
    const accessKey =
      typeof window === "undefined"
        ? ""
        : window.sessionStorage.getItem(DASHBOARD_ACCESS_KEY_STORAGE) || "";

    if (!accessKey) {
      toast({
        title: "Unlock dashboard first",
        description: "Open the dashboard with the access code before emailing rankings.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(RANKINGS_EMAIL_API_URL, {
        method: "POST",
        headers: {
          "x-dashboard-key": accessKey,
        },
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            message?: string;
            recipient?: string;
            generated_at?: string;
            skipped?: Array<{ label: string; message: string }>;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || "Could not email rankings.");
      }

      toast({
        title: "Rankings email sent",
        description: `Sent vote-count and voteless rankings${
          payload?.recipient ? ` to ${payload.recipient}` : ""
        }.`,
      });
    } catch (error) {
      toast({
        title: "Could not email rankings",
        description:
          error instanceof Error ? error.message : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        type="button"
        variant="hero"
        className="shadow-elegant"
        disabled={isSending}
        onClick={() => void handleEmailRankings()}
      >
        {isSending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Emailing rankings...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Email rankings
          </>
        )}
      </Button>
    </div>
  );
};
