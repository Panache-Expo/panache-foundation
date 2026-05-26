import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type EventTicketStaffTicket,
  eventTicketsService,
} from "@/integrations/supabase/services";
import { CheckCircle2, Loader2, Search, ShieldCheck, TicketCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

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
  const remaining = Math.max(0, ticket.remaining_count);

  const handleCheckIn = async () => {
    setMessage("");
    setError("");
    setIsCheckingIn(true);
    try {
      const result = await eventTicketsService.checkInTicket({
        accessKey,
        ticketCode: ticket.ticket_code,
        token,
        count: Math.max(1, Number.parseInt(count, 10) || 1),
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
            value={count}
            onChange={(event) => setCount(event.target.value)}
            disabled={remaining <= 0}
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
          disabled={isCheckingIn || remaining <= 0}
          onClick={handleCheckIn}
          className="h-11 rounded-full bg-[#171411] px-5 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
        >
          {isCheckingIn ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <TicketCheck className="mr-2 h-4 w-4" />
          )}
          Check in
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
              Scan a QR code or search manually. Each group pass can only be
              checked in up to its guest capacity.
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
