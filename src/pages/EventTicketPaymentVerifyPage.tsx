import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  type EventTicketIssued,
  eventTicketsService,
} from "@/integrations/supabase/services";
import { CheckCircle2, Download, Loader2, RefreshCw, Ticket, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

type EventTicketPaymentVerifyPageProps = {
  brand: "cyes" | "panache-dor";
};

const brandConfig = {
  cyes: {
    title: "CYES & Awards ticket confirmation",
    backHref: "/cyes/tickets",
    backLabel: "Back to CYES & Awards tickets",
    accent: "text-[#156D3B]",
    button: "bg-[#156D3B] hover:bg-[#156D3B]/92",
    bg: "bg-[#f7f8f3]",
  },
  "panache-dor": {
    title: "Panache D'or ticket confirmation",
    backHref: "/panache-expo/panache-dor/tickets",
    backLabel: "Back to Panache D'or tickets",
    accent: "text-[#8241B6]",
    button: "bg-[#171411] hover:bg-[#171411]/92",
    bg: "bg-[#f4f3ef]",
  },
};

const isPreviewAllowed = () => {
  if (import.meta.env.DEV) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
};

const createPreviewQr = (ticketCode: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">
      <rect width="220" height="220" fill="#fff"/>
      <rect x="18" y="18" width="54" height="54" fill="#171411"/>
      <rect x="30" y="30" width="30" height="30" fill="#fff"/>
      <rect x="148" y="18" width="54" height="54" fill="#171411"/>
      <rect x="160" y="30" width="30" height="30" fill="#fff"/>
      <rect x="18" y="148" width="54" height="54" fill="#171411"/>
      <rect x="30" y="160" width="30" height="30" fill="#fff"/>
      <rect x="92" y="28" width="14" height="14" fill="#171411"/>
      <rect x="112" y="44" width="24" height="14" fill="#171411"/>
      <rect x="92" y="84" width="42" height="14" fill="#171411"/>
      <rect x="148" y="92" width="14" height="42" fill="#171411"/>
      <rect x="176" y="98" width="20" height="20" fill="#171411"/>
      <rect x="88" y="132" width="20" height="20" fill="#171411"/>
      <rect x="118" y="124" width="14" height="54" fill="#171411"/>
      <rect x="144" y="154" width="54" height="14" fill="#171411"/>
      <rect x="166" y="180" width="16" height="16" fill="#171411"/>
      <text x="110" y="214" text-anchor="middle" font-family="Arial" font-size="9" fill="#171411">${ticketCode}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const buildPreviewTicket = (brand: EventTicketPaymentVerifyPageProps["brand"]) => {
  const isCyes = brand === "cyes";
  const ticketCode = isCyes ? "CYES-PREVIEW" : "PDOR-PREVIEW";
  const event = isCyes
    ? {
        id: "preview-cyes-event",
        slug: "cyes-awards-night",
        title: "CYES & Awards Night",
        short_title: "CYES & Awards",
        event_date: "2026-07-09",
        event_date_label: "9 July 2026",
        venue: "Chariot Hotel, Buea",
        brand: "cyes",
      }
    : {
        id: "preview-panache-event",
        slug: "panache-dor-awards-night",
        title: "Panache D'or Awards Night",
        short_title: "Panache D'or",
        event_date: "2026-07-11",
        event_date_label: "11 July 2026",
        venue: "Chariot Hotel, Buea",
        brand: "panache-dor",
      };

  return {
    status: "success",
    message: "Preview mode: this is how the ticket page looks after payment.",
    ticket: {
      id: "preview-ticket",
      ticket_code: ticketCode,
      qr_token: "preview-token",
      buyer_name: "Demo Guest",
      buyer_email: "demo@example.com",
      buyer_whatsapp: "237600000000",
      admit_count: 5,
      checked_in_count: 0,
      status: "active",
      issued_at: new Date().toISOString(),
      check_in_url: `/tickets/check-in?code=${ticketCode}&token=preview-token`,
      download_url: "#preview-download",
      qr_image_data_url: createPreviewQr(ticketCode),
      event,
      package: {
        id: "preview-package",
        event_id: event.id,
        slug: "premium-table-5",
        name: "Premium Table",
        description: "Group table for 5 guests with a balanced drinks package.",
        price_xaf: 50000,
        admit_count: 5,
        benefits: [
          "1 whisky (Chivas or Black)",
          "1 Baileys",
          "1 wine",
          "5 beer",
        ],
        status: "active",
        sort_order: 20,
        style_key: "premium",
      },
      order: {
        id: "preview-order",
        tx_ref: "preview-ticket-payment",
        reference: "preview-reference",
        amount_xaf: 50000,
        currency: "XAF",
        status: "completed",
      },
    },
  } as Awaited<ReturnType<typeof eventTicketsService.verifyPayment>>;
};

const TicketSummary = ({ ticket }: { ticket: EventTicketIssued }) => (
  <div className="mx-auto mt-7 grid max-w-4xl gap-5 lg:grid-cols-[1fr_16rem]">
    <div className="rounded-[1.6rem] border border-black/8 bg-white p-6 text-left shadow-[0_18px_50px_rgba(17,16,14,0.08)]">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#8241B6]">
        Official QR ticket
      </p>
      <h2 className="mt-3 font-sans text-3xl font-semibold tracking-[-0.05em] text-[#171411]">
        {ticket.event.title}
      </h2>
      <div className="mt-5 grid gap-3 font-sans text-sm text-[#171411]/70 sm:grid-cols-2">
        <p>
          <span className="font-semibold text-[#171411]">Ticket:</span>{" "}
          {ticket.ticket_code}
        </p>
        <p>
          <span className="font-semibold text-[#171411]">Package:</span>{" "}
          {ticket.package.name}
        </p>
        <p>
          <span className="font-semibold text-[#171411]">Buyer:</span>{" "}
          {ticket.buyer_name}
        </p>
        <p>
          <span className="font-semibold text-[#171411]">Admits:</span>{" "}
          {ticket.admit_count}
        </p>
        <p>
          <span className="font-semibold text-[#171411]">Date:</span>{" "}
          {ticket.event.event_date_label}
        </p>
        <p>
          <span className="font-semibold text-[#171411]">Venue:</span>{" "}
          {ticket.event.venue}
        </p>
      </div>
      <div className="mt-5 rounded-2xl bg-[#f8f2e8] p-4">
        <p className="font-sans text-sm font-semibold text-[#171411]">
          Package includes
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ticket.package.benefits.map((benefit) => (
            <span
              key={benefit}
              className="rounded-full bg-white px-3 py-1 font-sans text-xs font-semibold text-[#171411]/72"
            >
              {benefit}
            </span>
          ))}
        </div>
      </div>
    </div>

    <div className="rounded-[1.6rem] border border-black/8 bg-white p-5 text-center shadow-[0_18px_50px_rgba(17,16,14,0.08)]">
      <img
        src={ticket.qr_image_data_url}
        alt={`QR code for ${ticket.ticket_code}`}
        className="mx-auto h-44 w-44"
      />
      <p className="mt-3 font-sans text-sm font-semibold text-[#171411]">
        {ticket.ticket_code}
      </p>
      <p className="mt-1 font-sans text-xs text-[#171411]/58">
        Present this QR code at the entrance.
      </p>
    </div>
  </div>
);

export const EventTicketPaymentVerifyPage = ({
  brand,
}: EventTicketPaymentVerifyPageProps) => {
  const config = brandConfig[brand];
  const [searchParams] = useSearchParams();
  const txRef = searchParams.get("tx_ref") || searchParams.get("txRef") || "";
  const reference =
    searchParams.get("reference") ||
    searchParams.get("transId") ||
    searchParams.get("transaction_id") ||
    "";
  const previewMode = searchParams.get("preview") === "success";
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof eventTicketsService.verifyPayment>
  > | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      if (previewMode && isPreviewAllowed()) {
        setResult(buildPreviewTicket(brand));
        setIsLoading(false);
        return;
      }

      if (!txRef && !reference) {
        setError("Payment reference is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const verifyResult = await eventTicketsService.verifyPayment({
          txRef,
          reference,
        });
        if (mounted) {
          setResult(verifyResult);
        }
      } catch (verifyError) {
        if (mounted) {
          setError(
            verifyError instanceof Error
              ? verifyError.message
              : "Could not verify this ticket payment."
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    verify();

    return () => {
      mounted = false;
    };
  }, [brand, previewMode, reference, txRef]);

  const ticket = result?.ticket;
  const isSuccess =
    result?.status === "success" || result?.status === "already-counted";
  const isPending = result?.status === "pending";
  const emailFailed = Boolean(result?.email && result.email.ok !== true);
  const emailFailureMessage =
    result?.email?.message ||
    result?.email?.error ||
    "Ticket was created, but the email was not sent.";

  return (
    <div className={`min-h-screen ${config.bg} text-[#171411]`}>
      <Header />

      <main className="px-6 pb-20 pt-28 md:pb-24 md:pt-32">
        <section className="mx-auto max-w-5xl text-center">
          <p className={`font-sans text-xs font-semibold uppercase tracking-[0.22em] ${config.accent}`}>
            {config.title}
          </p>

          {isLoading ? (
            <div className="mt-10 rounded-[1.6rem] border border-black/8 bg-white p-8">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#171411]" />
              <h1 className="mt-5 font-sans text-3xl font-semibold tracking-[-0.05em]">
                Verifying your payment
              </h1>
              <p className="mt-3 font-sans text-sm text-[#171411]/62">
                Please keep this page open.
              </p>
            </div>
          ) : isSuccess && ticket ? (
            <>
              <CheckCircle2 className="mx-auto mt-8 h-12 w-12 text-[#18a058]" />
              <h1 className="mt-5 font-sans text-[clamp(2.2rem,5vw,4.6rem)] font-semibold leading-[0.9] tracking-[-0.07em]">
                Your ticket is ready.
              </h1>
              {emailFailed ? (
                <p className="mx-auto mt-4 max-w-2xl rounded-2xl bg-red-50 px-4 py-3 font-sans text-sm font-semibold text-red-700">
                  Email was not sent: {emailFailureMessage}
                </p>
              ) : (
                <p className="mx-auto mt-4 max-w-2xl font-sans text-lg text-[#171411]/66">
                  We have emailed the ticket to {ticket.buyer_email}. You can also
                  download it here.
                </p>
              )}

              <TicketSummary ticket={ticket} />

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  className={`h-12 rounded-full px-7 font-sans text-sm font-semibold text-white ${config.button}`}
                >
                  <a href={ticket.download_url}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF ticket
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border-black/12 bg-white px-7 font-sans text-sm font-semibold"
                >
                  <Link to={config.backHref}>
                    <Ticket className="mr-2 h-4 w-4" />
                    Buy another ticket
                  </Link>
                </Button>
              </div>
            </>
          ) : isPending ? (
            <>
              <RefreshCw className="mx-auto mt-8 h-12 w-12 text-[#FDBA11]" />
              <h1 className="mt-5 font-sans text-[clamp(2.2rem,5vw,4.6rem)] font-semibold leading-[0.9] tracking-[-0.07em]">
                Payment is still pending.
              </h1>
              <p className="mx-auto mt-4 max-w-2xl font-sans text-lg text-[#171411]/66">
                If you completed payment, refresh this page shortly.
              </p>
            </>
          ) : (
            <>
              <XCircle className="mx-auto mt-8 h-12 w-12 text-destructive" />
              <h1 className="mt-5 font-sans text-[clamp(2.2rem,5vw,4.6rem)] font-semibold leading-[0.9] tracking-[-0.07em]">
                Ticket not verified.
              </h1>
              <p className="mx-auto mt-4 max-w-2xl font-sans text-lg text-[#171411]/66">
                {error || result?.message || "We could not verify this payment."}
              </p>
            </>
          )}

          <div className="mt-8">
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full border-black/12 bg-white px-6 font-sans text-sm font-semibold"
            >
              <Link to={config.backHref}>{config.backLabel}</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default EventTicketPaymentVerifyPage;
