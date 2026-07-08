import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type EventTicketStaffTicket,
  eventTicketsService,
} from "@/integrations/supabase/services";
import {
  AlertTriangle,
  CheckCircle2,
  ImageOff,
  Loader2,
  Search,
  ShieldCheck,
  TicketCheck,
  UserCheck,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const CONTESTANT_PASS_PROFILE_API_URL =
  import.meta.env.VITE_CONTESTANT_PASS_PROFILE_API_URL ||
  "/api/contestant-pass-profile";

type ContestantVerificationProfile = {
  source?: string | null;
  source_label?: string | null;
  id?: string | null;
  slug?: string | null;
  name?: string | null;
  organization?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  status?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
};

type PassProfileResponse = {
  is_contestant_access_pass: boolean;
  contestant: ContestantVerificationProfile | null;
  message?: string;
};

const TicketStaffCard = ({
  ticket,
  accessKey,
  token,
  onUpdated,
}: {
  ticket: EventTicketStaffTicket;
  accessKey: string;
  token?: string;
  onUpdated: (ticket: EventTicketStaffTicket) => void;
}) => {
  const [count, setCount] = useState(
    String(Math.max(1, ticket.remaining_count || 1))
  );
  const [checkedInBy, setCheckedInBy] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profileStatus, setProfileStatus] = useState<
    "loading" | "paid" | "contestant" | "error"
  >("loading");
  const [contestantProfile, setContestantProfile] =
    useState<ContestantVerificationProfile | null>(null);
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const remaining = Math.max(0, ticket.remaining_count);
  const isContestantAccessPass = profileStatus === "contestant";

  useEffect(() => {
    let cancelled = false;

    const loadContestantProfile = async () => {
      setProfileStatus("loading");
      setContestantProfile(null);
      setIdentityConfirmed(false);

      try {
        const response = await fetch(CONTESTANT_PASS_PROFILE_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-dashboard-key": accessKey,
          },
          body: JSON.stringify({
            ticketCode: ticket.ticket_code,
            token,
          }),
        });
        const payload = (await response.json().catch(() => null)) as
          | PassProfileResponse
          | null;

        if (!response.ok || !payload) {
          throw new Error(payload?.message || "Could not verify pass type.");
        }
        if (cancelled) {
          return;
        }

        if (payload.is_contestant_access_pass) {
          setContestantProfile(payload.contestant);
          setProfileStatus("contestant");
          setCount("1");
        } else {
          setProfileStatus("paid");
        }
      } catch {
        if (!cancelled) {
          setProfileStatus("error");
        }
      }
    };

    void loadContestantProfile();
    return () => {
      cancelled = true;
    };
  }, [accessKey, ticket.ticket_code, token]);

  const handleCheckIn = async () => {
    setMessage("");
    setError("");

    if (isContestantAccessPass && !identityConfirmed) {
      setError("Confirm the contestant's identity before checking in this free access pass.");
      return;
    }

    setIsCheckingIn(true);
    try {
      const result = await eventTicketsService.checkInTicket({
        accessKey,
        ticketCode: ticket.ticket_code,
        token,
        count: isContestantAccessPass
          ? 1
          : Math.max(1, Number.parseInt(count, 10) || 1),
        checkedInBy: checkedInBy.trim() || undefined,
        method: token ? "qr" : "manual",
      });
      onUpdated(result.ticket);
      setMessage(`${result.checked_in_count} guest(s) checked in.`);
    } catch (checkInError) {
      setError(
        checkInError instanceof Error
          ? checkInError.message
          : "Could not check in ticket."
      );
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="rounded-[1.6rem] border border-black/8 bg-white p-5 shadow-[0_18px_50px_rgba(17,16,14,0.08)]">
      {isContestantAccessPass ? (
        <div className="mb-6 overflow-hidden rounded-[1.4rem] border-2 border-amber-500/70 bg-amber-50/70">
          <div className="flex items-start gap-3 border-b border-amber-500/30 bg-amber-100/70 px-4 py-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
                Complimentary contestant access pass
              </p>
              <p className="mt-1 font-sans text-sm font-semibold text-amber-950">
                Identity verification is required before entry.
              </p>
              <p className="mt-1 font-sans text-xs leading-relaxed text-amber-900/75">
                Compare the person standing in front of you with the official contestant photo and details below.
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-4 md:grid-cols-[190px_1fr] md:p-5">
            <div>
              <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-black/10 bg-white">
                {contestantProfile?.photo_url ? (
                  <img
                    src={contestantProfile.photo_url}
                    alt={contestantProfile.name || "Contestant"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center text-[#171411]/45">
                    <ImageOff className="h-8 w-8" />
                    <p className="font-sans text-xs font-semibold">No official contestant photo available</p>
                  </div>
                )}
              </div>
              <p className="mt-2 text-center font-sans text-xs font-semibold text-amber-900/70">
                Official contestant image
              </p>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#8241B6] px-3 py-1 font-sans text-xs font-semibold text-white">
                  {contestantProfile?.source_label || "Contestant"}
                </span>
                {contestantProfile?.status ? (
                  <span className="rounded-full border border-black/10 bg-white px-3 py-1 font-sans text-xs font-semibold text-[#171411]/65">
                    {contestantProfile.status}
                  </span>
                ) : null}
              </div>

              <h3 className="mt-3 font-sans text-3xl font-semibold tracking-[-0.05em] text-[#171411]">
                {contestantProfile?.name || ticket.buyer_name}
              </h3>

              {contestantProfile?.organization ? (
                <p className="mt-1 font-sans text-base font-semibold text-[#8241B6]">
                  {contestantProfile.organization}
                </p>
              ) : null}

              <div className="mt-4 grid gap-3 rounded-2xl border border-black/8 bg-white p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#171411]/45">
                    Competition
                  </p>
                  <p className="mt-1 font-sans font-semibold text-[#171411]">
                    {contestantProfile?.source_label || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#171411]/45">
                    Category
                  </p>
                  <p className="mt-1 font-sans font-semibold text-[#171411]">
                    {contestantProfile?.category_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#171411]/45">
                    Pass holder name
                  </p>
                  <p className="mt-1 font-sans font-semibold text-[#171411]">
                    {ticket.buyer_name}
                  </p>
                </div>
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#171411]/45">
                    WhatsApp
                  </p>
                  <p className="mt-1 break-all font-sans font-semibold text-[#171411]">
                    {ticket.buyer_whatsapp || "N/A"}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#171411]/45">
                    Email
                  </p>
                  <p className="mt-1 break-all font-sans font-semibold text-[#171411]">
                    {ticket.buyer_email}
                  </p>
                </div>
              </div>

              {contestantProfile?.bio ? (
                <div className="mt-4 rounded-2xl border border-black/8 bg-white p-4">
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#171411]/45">
                    Contestant information
                  </p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/72">
                    {contestantProfile.bio}
                  </p>
                </div>
              ) : null}

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-[#8241B6]/25 bg-white p-4">
                <input
                  type="checkbox"
                  checked={identityConfirmed}
                  onChange={(event) => setIdentityConfirmed(event.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 accent-[#8241B6]"
                />
                <span>
                  <span className="block font-sans text-sm font-bold text-[#171411]">
                    I confirmed this person's identity
                  </span>
                  <span className="mt-1 block font-sans text-xs leading-relaxed text-[#171411]/62">
                    I compared the person with the official contestant photo and profile before allowing entry.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>
      ) : profileStatus === "error" ? (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="font-sans text-sm text-destructive">
            Pass type could not be verified. Refresh before checking in a complimentary contestant pass.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#8241B6]">
            {ticket.event.short_title}
          </p>
          <h2 className="mt-2 font-sans text-2xl font-semibold tracking-[-0.05em] text-[#171411]">
            {ticket.ticket_code}
          </h2>
          <p className="mt-1 font-sans text-sm text-[#171411]/62">
            {ticket.package.name} - {ticket.buyer_name}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 font-sans text-xs font-semibold ${
            remaining > 0
              ? "bg-[#e9f8ef] text-[#166534]"
              : "bg-[#f8f2e8] text-[#171411]/60"
          }`}
        >
          {remaining > 0 ? `${remaining} remaining` : "Fully checked in"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 font-sans text-sm text-[#171411]/70 sm:grid-cols-2">
        <p>Admits: {ticket.admit_count}</p>
        <p>Checked in: {ticket.checked_in_count}</p>
        <p>Email: {ticket.buyer_email}</p>
        <p>WhatsApp: {ticket.buyer_whatsapp || "N/A"}</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <Label htmlFor={`${ticket.id}-count`}>Guests to check in</Label>
          <Input
            id={`${ticket.id}-count`}
            type="number"
            min={1}
            max={Math.max(1, remaining)}
            value={isContestantAccessPass ? "1" : count}
            onChange={(event) => setCount(event.target.value)}
            disabled={remaining <= 0 || isContestantAccessPass}
            className="mt-2 h-11 rounded-full"
          />
        </div>
        <div>
          <Label htmlFor={`${ticket.id}-staff`}>Staff name, optional</Label>
          <Input
            id={`${ticket.id}-staff`}
            value={checkedInBy}
            onChange={(event) => setCheckedInBy(event.target.value)}
            className="mt-2 h-11 rounded-full"
          />
        </div>
        <Button
          type="button"
          disabled={
            isCheckingIn ||
            remaining <= 0 ||
            profileStatus === "loading" ||
            profileStatus === "error" ||
            (isContestantAccessPass && !identityConfirmed)
          }
          onClick={handleCheckIn}
          className="h-11 rounded-full bg-[#171411] px-5 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
        >
          {isCheckingIn ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isContestantAccessPass ? (
            <UserCheck className="mr-2 h-4 w-4" />
          ) : (
            <TicketCheck className="mr-2 h-4 w-4" />
          )}
          {isContestantAccessPass ? "Verify & check in" : "Check in"}
        </Button>
      </div>

      {message ? (
        <p className="mt-4 rounded-2xl bg-[#e9f8ef] px-4 py-3 font-sans text-sm text-[#166534]">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-2xl bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export const EventTicketCheckInPage = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get("code") || "";
  const token = searchParams.get("token") || "";
  const [accessKey, setAccessKey] = useState("");
  const [search, setSearch] = useState(initialCode);
  const [tickets, setTickets] = useState<EventTicketStaffTicket[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const lookup = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setError("");
    setIsSearching(true);
    try {
      const result = await eventTicketsService.lookupTicket({
        accessKey,
        ticketCode: initialCode || undefined,
        token: token || undefined,
        search: initialCode ? undefined : search,
      });
      setTickets(result);
      if (!result.length) {
        setError("No ticket matched that search.");
      }
    } catch (lookupError) {
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : "Could not look up ticket."
      );
      setTickets([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (initialCode && accessKey) {
      lookup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessKey, initialCode]);

  const updateTicket = (updatedTicket: EventTicketStaffTicket) => {
    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f3ef] text-[#171411]">
      <Header />

      <main className="px-6 pb-20 pt-28 md:pb-24 md:pt-32">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-[1.8rem] border border-black/8 bg-white p-6 shadow-[0_18px_50px_rgba(17,16,14,0.08)]">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-[#8241B6]">
              Staff entrance
            </p>
            <h1 className="mt-3 font-sans text-[clamp(2.2rem,5vw,4.4rem)] font-semibold leading-[0.92] tracking-[-0.07em]">
              Ticket check-in
            </h1>
            <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-[#171411]/64">
              Scan a QR code or search manually. Complimentary contestant passes require photo and profile verification before entry.
            </p>

            <form onSubmit={lookup} className="mt-6 grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
              <div>
                <Label htmlFor="ticket-access-key">Access key</Label>
                <Input
                  id="ticket-access-key"
                  value={accessKey}
                  onChange={(event) => setAccessKey(event.target.value)}
                  type="password"
                  className="mt-2 h-12 rounded-full"
                  placeholder="Staff access key"
                />
              </div>
              <div>
                <Label htmlFor="ticket-search">
                  {initialCode ? "Scanned ticket code" : "Search ticket"}
                </Label>
                <Input
                  id="ticket-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  disabled={Boolean(initialCode)}
                  className="mt-2 h-12 rounded-full"
                  placeholder="Code, name, email, WhatsApp"
                />
              </div>
              <Button
                type="submit"
                disabled={isSearching || !accessKey}
                className="h-12 rounded-full bg-[#171411] px-6 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
              >
                {isSearching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : initialCode ? (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                {initialCode ? "Verify QR" : "Search"}
              </Button>
            </form>

            {initialCode ? (
              <p className="mt-4 flex items-center rounded-2xl bg-[#f8f2e8] px-4 py-3 font-sans text-sm text-[#171411]/68">
                <CheckCircle2 className="mr-2 h-4 w-4 text-[#18a058]" />
                QR code detected. Enter staff key to verify.
              </p>
            ) : null}
            {error ? (
              <p className="mt-4 rounded-2xl bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4">
            {tickets.map((ticket) => (
              <TicketStaffCard
                key={ticket.id}
                ticket={ticket}
                accessKey={accessKey}
                token={initialCode ? token : undefined}
                onUpdated={updateTicket}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default EventTicketCheckInPage;
