import { Badge } from "@/components/ui/badge";
import {
  getResultsPublishDate,
  getVotingEndsDate,
  isVotingClosed,
  type BlindVotingPayload,
} from "@/lib/blind-voting";
import { Clock3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const formatTimerNumber = (value: number) => String(value).padStart(2, "0");

const getRemainingParts = (target: Date | null, now = Date.now()) => {
  if (!target) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  }

  const totalMs = Math.max(0, target.getTime() - now);
  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, totalMs };
};

export const BlindVotingCountdown = ({
  voting,
  title,
  description,
}: {
  voting?: BlindVotingPayload | null;
  title?: string;
  description?: string;
}) => {
  const publishTarget = useMemo(() => getResultsPublishDate(voting), [voting]);
  const votingEndsTarget = useMemo(() => getVotingEndsDate(voting), [voting]);
  const [now, setNow] = useState(Date.now());
  const votingHasClosed = isVotingClosed(voting, now);
  const hasVotingClosePhase = Boolean(votingEndsTarget);
  const showVotingCloseCountdown = hasVotingClosePhase && !votingHasClosed;
  const showRevealNotice = hasVotingClosePhase && votingHasClosed;
  const target = showVotingCloseCountdown ? votingEndsTarget : publishTarget;
  const remaining = getRemainingParts(target, now);

  useEffect(() => {
    setNow(Date.now());

    if (!voting?.blind_voting && !hasVotingClosePhase) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [hasVotingClosePhase, voting?.blind_voting]);

  if (!voting?.blind_voting && !hasVotingClosePhase) {
    return null;
  }

  const publishLabel = voting.results_publish_label || "12 July 2026 at 2:00 AM WAT";
  const votingEndsLabel = voting.voting_ends_label || "11 July 2026 at 6:00 PM WAT";
  const countsAreVisible = Boolean(voting.counts_available);
  const displayTitle =
    title ||
    (showVotingCloseCountdown
      ? "Voting closes in"
      : showRevealNotice
      ? "Voting has ended"
      : "Blind voting is active");
  const displayDescription =
    description ||
    (showVotingCloseCountdown
      ? countsAreVisible
        ? `Voting remains open until ${votingEndsLabel}. The public ranking is currently visible, while the official reveal remains ${publishLabel}.`
        : `Voting remains open until ${votingEndsLabel}. Public vote totals and rankings stay hidden until results are revealed ${publishLabel}.`
      : showRevealNotice
      ? countsAreVisible
        ? `Voting is closed. The public ranking is currently visible, while the official reveal remains ${publishLabel}.`
        : `Voting is closed. Public vote totals and rankings stay hidden until results are revealed ${publishLabel}.`
      : "Vote totals and rankings are hidden while voting continues. Results will be published when the countdown ends.");
  const badgeText = showVotingCloseCountdown
    ? `Voting closes ${votingEndsLabel}`
    : `Results publish ${publishLabel}`;

  return (
    <section className="rounded-[1.8rem] border border-[#8241B6]/18 bg-white p-5 shadow-[0_18px_44px_rgba(17,16,14,0.06)] md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Badge className="rounded-full bg-[#8241B6] text-white hover:bg-[#8241B6]">
            <Clock3 className="mr-2 h-4 w-4" />
            {badgeText}
          </Badge>
          <h2 className="mt-4 font-sans text-[clamp(1.8rem,3vw,2.8rem)] font-semibold leading-[0.95] tracking-[-0.06em] text-[#171411]">
            {displayTitle}
          </h2>
          <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-[#171411]/66">
            {displayDescription}
          </p>
        </div>

        {showRevealNotice ? (
          <div className="rounded-[1.1rem] border border-black/8 bg-[#f8f2e8] px-5 py-4 sm:min-w-[23rem]">
            <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#171411]/48">
              Results reveal
            </p>
            <p className="mt-2 font-sans text-2xl font-semibold leading-tight text-[#171411]">
              {publishLabel}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:min-w-[23rem]">
            {[
              ["Days", remaining.days],
              ["Hours", remaining.hours],
              ["Minutes", remaining.minutes],
              ["Seconds", remaining.seconds],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[1.1rem] border border-black/8 bg-[#f8f2e8] px-3 py-4 text-center"
              >
                <p className="font-sans text-2xl font-semibold text-[#171411] md:text-3xl">
                  {label === "Days" ? value : formatTimerNumber(Number(value))}
                </p>
                <p className="mt-1 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#171411]/48">
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
