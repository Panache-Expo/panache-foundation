import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type EventTicketPackage,
  eventTicketsService,
} from "@/integrations/supabase/services";
import cyesHero from "@/assets/CYESCDAwards.jpeg";
import panacheHero from "@/assets/PanacheAwards.jpeg";
import cyesTicketBg from "@/assets/tickets/cyes-ticket-bg.png";
import panacheTicketBg from "@/assets/tickets/panache-dor-ticket-bg.png";
import {
  CalendarDays,
  Check,
  CreditCard,
  Loader2,
  Mail,
  Ticket,
  Users,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type EventTicketsPageProps = {
  eventSlug: "cyes-awards-night" | "panache-dor-awards-night";
};

const pageThemes = {
  "cyes-awards-night": {
    eyebrow: "CYES Awards Night tickets",
    headline: "Reserve your CYES Awards Night pass.",
    description:
      "Choose your table or access pass for the 9 July awards night. Your ticket is emailed after verified payment.",
    heroImage: cyesHero,
    ticketImage: cyesTicketBg,
    bg: "bg-[#f7f8f3]",
    accent: "text-[#156D3B]",
    button: "bg-[#156D3B] hover:bg-[#156D3B]/92",
    glow: "from-[#156D3B]/18 via-[#1875D2]/10 to-[#FDBA11]/18",
    card: "border-[#156D3B]/15",
  },
  "panache-dor-awards-night": {
    eyebrow: "Panache D'or tickets",
    headline: "Secure your Panache D'or awards pass.",
    description:
      "Choose your awards-night package for 11 July. Your official QR ticket is emailed after verified payment.",
    heroImage: panacheHero,
    ticketImage: panacheTicketBg,
    bg: "bg-[#f4f3ef]",
    accent: "text-[#8241B6]",
    button: "bg-[#171411] hover:bg-[#171411]/92",
    glow: "from-[#8241B6]/16 via-[#f4e93f]/12 to-[#171411]/10",
    card: "border-[#8241B6]/15",
  },
};

const formatMoney = (amount: number, currency = "XAF") =>
  `${amount.toLocaleString()} ${currency}`;

const TicketPackageCard = ({
  ticketPackage,
  selected,
  onSelect,
  accent,
}: {
  ticketPackage: EventTicketPackage;
  selected: boolean;
  onSelect: () => void;
  accent: string;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={`flex h-full flex-col rounded-[1.6rem] border bg-white p-5 text-left transition ${
      selected
        ? "border-[#171411] shadow-[0_18px_40px_rgba(17,16,14,0.12)]"
        : "border-black/8 hover:-translate-y-0.5 hover:border-black/18"
    }`}
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className={`font-sans text-xs font-semibold uppercase tracking-[0.18em] ${accent}`}>
          {ticketPackage.admit_count === 1
            ? "Single access"
            : `${ticketPackage.admit_count} people`}
        </p>
        <h2 className="mt-3 font-sans text-2xl font-semibold tracking-[-0.05em] text-[#171411]">
          {ticketPackage.name}
        </h2>
      </div>
      <span className="rounded-full bg-[#f8f2e8] px-3 py-1 font-sans text-sm font-semibold text-[#171411]">
        {formatMoney(ticketPackage.price_xaf)}
      </span>
    </div>

    <p className="mt-4 font-sans text-sm leading-relaxed text-[#171411]/66">
      {ticketPackage.description}
    </p>

    <div className="mt-5 grid gap-2">
      {ticketPackage.benefits.map((benefit) => (
        <span
          key={benefit}
          className="flex items-center gap-2 font-sans text-sm text-[#171411]/76"
        >
          <Check className="h-4 w-4 text-[#18a058]" />
          {benefit}
        </span>
      ))}
    </div>

    <span
      className={`mt-auto pt-6 font-sans text-sm font-semibold ${
        selected ? "text-[#171411]" : "text-[#171411]/52"
      }`}
    >
      {selected ? "Selected package" : "Select package"}
    </span>
  </button>
);

export const EventTicketsPage = ({ eventSlug }: EventTicketsPageProps) => {
  const theme = pageThemes[eventSlug];
  const [payload, setPayload] = useState<Awaited<
    ReturnType<typeof eventTicketsService.getEvent>
  > | null>(null);
  const [selectedPackageSlug, setSelectedPackageSlug] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerWhatsapp, setBuyerWhatsapp] = useState("");
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    eventTicketsService
      .getEvent(eventSlug)
      .then((eventPayload) => {
        if (!mounted) {
          return;
        }
        setPayload(eventPayload);
        setSelectedPackageSlug(eventPayload.event.packages[0]?.slug || "");
      })
      .catch((loadError) => {
        if (mounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load tickets."
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [eventSlug]);

  const selectedPackage = useMemo(
    () =>
      payload?.event.packages.find(
        (ticketPackage) => ticketPackage.slug === selectedPackageSlug
      ),
    [payload, selectedPackageSlug]
  );
  const paymentsConfigured = Boolean(payload?.payment.payments_configured);
  const demoPaymentAmount = payload?.payment.demo_payment_amount_xaf;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!selectedPackage) {
      setError("Choose a ticket package.");
      return;
    }
    if (!paymentsConfigured) {
      setError("Ticket payment is being connected. Please check again shortly.");
      return;
    }
    if (buyerWhatsapp.trim() && !whatsappConsent) {
      setError("Confirm WhatsApp consent or leave the number blank.");
      return;
    }

    setIsPaying(true);
    try {
      const result = await eventTicketsService.initializePayment({
        eventSlug,
        packageSlug: selectedPackage.slug,
        buyerName,
        buyerEmail,
        buyerWhatsapp: buyerWhatsapp.trim() || undefined,
        whatsappConsent,
      });

      setNotice("Opening secure payment...");
      window.location.assign(result.order.payment_link);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not start ticket payment."
      );
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} text-[#171411]`}>
      <Header />

      <main className="px-6 pb-20 pt-28 md:px-10 md:pb-24 md:pt-32">
        <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className={`font-sans text-xs font-semibold uppercase tracking-[0.24em] ${theme.accent}`}>
              {theme.eyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl font-sans text-[clamp(2.7rem,7vw,5.6rem)] font-semibold leading-[0.88] tracking-[-0.07em]">
              {theme.headline}
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-[#171411]/68">
              {theme.description}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="inline-flex items-center rounded-full bg-white px-4 py-2 font-sans text-sm font-semibold text-[#171411]">
                <CalendarDays className="mr-2 h-4 w-4" />
                {payload?.event.event_date_label || "July 2026"}
              </span>
              <span className="inline-flex items-center rounded-full bg-white px-4 py-2 font-sans text-sm font-semibold text-[#171411]">
                <Ticket className="mr-2 h-4 w-4" />
                QR ticket by email
              </span>
            </div>
          </div>

          <div className="relative">
            <div className={`absolute inset-4 rounded-[2.4rem] bg-gradient-to-br ${theme.glow} blur-3xl`} />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_24px_70px_rgba(17,16,14,0.14)]">
              <img
                src={theme.heroImage}
                alt={payload?.event.title || "Event tickets"}
                className="h-[28rem] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 to-transparent p-6 text-white">
                <p className="font-sans text-sm font-semibold">
                  {payload?.event.title || "Awards Night"}
                </p>
                <p className="mt-1 font-sans text-sm text-white/72">
                  {payload?.event.venue || "Buea, Cameroon"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-12 grid max-w-7xl gap-8 lg:grid-cols-[1fr_25rem]">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className={`font-sans text-xs font-semibold uppercase tracking-[0.22em] ${theme.accent}`}>
                  Choose your pass
                </p>
                <h2 className="mt-2 font-sans text-3xl font-semibold tracking-[-0.05em]">
                  Ticket packages
                </h2>
              </div>
              {payload ? (
                <p className="font-sans text-sm text-[#171411]/58">
                  One payment creates one group QR pass.
                </p>
              ) : null}
            </div>

            {isLoading ? (
              <div className="mt-8 rounded-[1.6rem] border border-black/8 bg-white p-8 font-sans text-sm text-[#171411]/64">
                Loading ticket packages...
              </div>
            ) : error && !payload ? (
              <div className="mt-8 rounded-[1.6rem] border border-destructive/20 bg-destructive/10 p-8 font-sans text-sm text-destructive">
                {error}
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {payload?.event.packages.map((ticketPackage) => (
                  <TicketPackageCard
                    key={ticketPackage.id}
                    ticketPackage={ticketPackage}
                    selected={ticketPackage.slug === selectedPackageSlug}
                    onSelect={() => setSelectedPackageSlug(ticketPackage.slug)}
                    accent={theme.accent}
                  />
                ))}
              </div>
            )}
          </div>

          <aside className={`rounded-[1.8rem] border ${theme.card} bg-white p-5 shadow-[0_18px_50px_rgba(17,16,14,0.08)] lg:sticky lg:top-24 lg:self-start`}>
            <div className="overflow-hidden rounded-[1.2rem] border border-black/8">
              <img
                src={theme.ticketImage}
                alt="Ticket design preview"
                className="h-36 w-full object-cover"
              />
            </div>
            <h2 className="mt-5 font-sans text-2xl font-semibold tracking-[-0.05em]">
              Buyer details
            </h2>
            <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/62">
              The ticket PDF and download link will be sent to this email.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
              <div>
                <Label htmlFor={`${eventSlug}-buyer-name`}>Full name</Label>
                <Input
                  id={`${eventSlug}-buyer-name`}
                  value={buyerName}
                  onChange={(event) => setBuyerName(event.target.value)}
                  required
                  className="mt-2 h-12 rounded-full border-black/10"
                  placeholder="Buyer name"
                />
              </div>
              <div>
                <Label htmlFor={`${eventSlug}-buyer-email`}>Email</Label>
                <Input
                  id={`${eventSlug}-buyer-email`}
                  type="email"
                  value={buyerEmail}
                  onChange={(event) => setBuyerEmail(event.target.value)}
                  required
                  className="mt-2 h-12 rounded-full border-black/10"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <Label htmlFor={`${eventSlug}-buyer-whatsapp`}>
                  WhatsApp number, optional
                </Label>
                <Input
                  id={`${eventSlug}-buyer-whatsapp`}
                  value={buyerWhatsapp}
                  onChange={(event) => setBuyerWhatsapp(event.target.value)}
                  className="mt-2 h-12 rounded-full border-black/10"
                  placeholder="+237..."
                />
              </div>
              <label className="flex items-start gap-3 rounded-2xl bg-[#f8f2e8] p-3 font-sans text-xs leading-relaxed text-[#171411]/66">
                <Checkbox
                  checked={whatsappConsent}
                  onCheckedChange={(checked) => setWhatsappConsent(Boolean(checked))}
                  className="mt-0.5"
                />
                <span>
                  I agree to receive event updates and personalized WhatsApp
                  messages about this ticket.
                </span>
              </label>

              <div className="rounded-2xl bg-[#171411] p-4 text-white">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-sans text-sm text-white/70">Selected</span>
                  <span className="font-sans text-sm font-semibold">
                    {selectedPackage?.name || "Choose package"}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="inline-flex items-center font-sans text-sm text-white/70">
                    <Users className="mr-2 h-4 w-4" />
                    Admits
                  </span>
                  <span className="font-sans text-sm font-semibold">
                    {selectedPackage?.admit_count || 0}
                  </span>
                </div>
                <p className="mt-4 font-sans text-2xl font-semibold">
                  {selectedPackage
                    ? formatMoney(selectedPackage.price_xaf)
                    : "0 XAF"}
                </p>
              </div>

              <Button
                type="submit"
                disabled={isPaying || !paymentsConfigured || !selectedPackage}
                className={`h-12 rounded-full font-sans text-sm font-semibold text-white ${theme.button}`}
              >
                {isPaying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                {isPaying ? "Opening..." : "Pay securely"}
              </Button>

              {!paymentsConfigured && payload ? (
                <p className="rounded-2xl bg-[#f8f2e8] px-4 py-3 font-sans text-sm text-[#171411]/68">
                  Ticket payment is being connected. Packages are visible, but
                  checkout is disabled for now.
                </p>
              ) : null}
              {payload?.payment.demo_mode && demoPaymentAmount ? (
                <p className="rounded-2xl bg-[#f8f2e8] px-4 py-3 font-sans text-sm text-[#171411]/68">
                  Demo checkout charges {formatMoney(demoPaymentAmount)} so you
                  can test the ticket flow safely.
                </p>
              ) : null}
              {notice ? (
                <p className="rounded-2xl bg-[#f8f2e8] px-4 py-3 font-sans text-sm text-[#171411]/68">
                  {notice}
                </p>
              ) : null}
              {error && payload ? (
                <p className="rounded-2xl bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive">
                  {error}
                </p>
              ) : null}
            </form>

            <p className="mt-4 flex items-center font-sans text-xs text-[#171411]/54">
              <Mail className="mr-2 h-4 w-4" />
              Your QR ticket is emailed after payment verification.
            </p>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default EventTicketsPage;
