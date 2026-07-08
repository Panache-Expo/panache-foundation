import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getStoredDashboardAccessKey } from "@/lib/dashboard-admin";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const DASHBOARD_API_URL =
  import.meta.env.VITE_DASHBOARD_API_URL || "/api/dashboard-applications";

const isParticipantsDashboardPath = (pathname: string) =>
  pathname === "/panache-expo/participants-dashboard" ||
  pathname === "/admin/participants";

export const Panache360VoteCountVisibilityControl = () => {
  const { pathname } = useLocation();
  const { toast } = useToast();
  const [accessKey, setAccessKey] = useState("");
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const dashboardOpen = isParticipantsDashboardPath(pathname);

  useEffect(() => {
    if (!dashboardOpen) {
      setAccessKey("");
      return;
    }

    const syncAccessKey = () => {
      setAccessKey(getStoredDashboardAccessKey());
    };

    syncAccessKey();
    const interval = window.setInterval(syncAccessKey, 1000);
    return () => window.clearInterval(interval);
  }, [dashboardOpen]);

  const loadVisibility = useCallback(async () => {
    if (!dashboardOpen || !accessKey) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${DASHBOARD_API_URL}?resource=panache-360-visibility`,
        {
          headers: {
            "x-dashboard-key": accessKey,
          },
        }
      );
      const payload = (await response.json().catch(() => null)) as
        | {
            message?: string;
            panache360Visibility?: { visible?: boolean };
          }
        | null;

      if (!response.ok || !payload?.panache360Visibility) {
        throw new Error(
          payload?.message || "Could not load Panache 360 vote count visibility."
        );
      }

      setVisible(Boolean(payload.panache360Visibility.visible));
    } catch (error) {
      toast({
        title: "Visibility control unavailable",
        description:
          error instanceof Error ? error.message : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessKey, dashboardOpen, toast]);

  useEffect(() => {
    void loadVisibility();
  }, [loadVisibility]);

  const toggleVisibility = async () => {
    if (!accessKey) {
      return;
    }

    const nextVisible = !visible;
    setIsUpdating(true);

    try {
      const response = await fetch(DASHBOARD_API_URL, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-dashboard-key": accessKey,
        },
        body: JSON.stringify({
          action: "setPanache360VoteCountVisibility",
          visible: nextVisible,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            message?: string;
            panache360Visibility?: { visible?: boolean };
          }
        | null;

      if (!response.ok || !payload?.panache360Visibility) {
        throw new Error(
          payload?.message || "Could not update Panache 360 vote count visibility."
        );
      }

      const updatedVisible = Boolean(payload.panache360Visibility.visible);
      setVisible(updatedVisible);
      toast({
        title: updatedVisible ? "Vote counts are now public" : "Vote counts are now hidden",
        description: updatedVisible
          ? "Panache 360 public pages will show the live ranking and verified vote totals."
          : "Panache 360 public pages will return to blind alphabetical results.",
      });
    } catch (error) {
      toast({
        title: "Could not change visibility",
        description:
          error instanceof Error ? error.message : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!dashboardOpen || !accessKey) {
    return null;
  }

  return (
    <div className="fixed right-4 top-24 z-50 rounded-2xl border border-border/70 bg-background/95 p-2 shadow-lg backdrop-blur md:right-6">
      <Button
        type="button"
        variant={visible ? "default" : "outline"}
        onClick={() => void toggleVisibility()}
        disabled={isLoading || isUpdating}
        className="rounded-xl"
      >
        {isLoading || isUpdating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : visible ? (
          <Eye className="mr-2 h-4 w-4" />
        ) : (
          <EyeOff className="mr-2 h-4 w-4" />
        )}
        Panache 360 counts: {visible ? "Visible" : "Hidden"}
      </Button>
    </div>
  );
};
