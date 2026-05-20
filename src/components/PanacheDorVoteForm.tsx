import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  PanacheDorAwardCategory,
  PanacheDorAwardNominee,
  PanacheDorPaymentSettings,
} from "@/integrations/supabase/services";
import { panacheDorVotingService } from "@/integrations/supabase/services";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { FormEvent, useMemo, useRef, useState } from "react";

type PanacheDorVoteFormProps = {
  nominee: PanacheDorAwardNominee;
  category: PanacheDorAwardCategory;
  payment?: PanacheDorPaymentSettings;
};

type PaymentWidgetCallback = {
  reference?: string;
  transId?: string;
  transaction_id?: string;
  transactionId?: string;
  status?: string;
};

type PaymentWidgetOptions = {
  payButtonId: string;
  description: string;
  amount: string;
  currency: string;
  externalReference: string;
  redirectUrl: string;
};

declare global {
  interface Window {
    campay?: {
      options: (options: PaymentWidgetOptions) => void;
      onSuccess?: (data: PaymentWidgetCallback) => void;
      onFail?: (data: PaymentWidgetCallback) => void;
      onModalClose?: (data: PaymentWidgetCallback) => void;
    };
  }
}

const PAYMENT_WIDGET_APP_ID =
  import.meta.env.VITE_PANACHE_DOR_CAMPAY_APP_ID || "";
const PAYMENT_WIDGET_SCRIPT_ID = "panache-dor-secure-payment-widget";
const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029Vb8Cg42ATRSgvXAcXE3L";
const WHATSAPP_CHANNEL_TEXT =
  "Follow the Panache D'Or Fan official Channel channel on WhatsApp";

const extractPaymentReference = (data?: PaymentWidgetCallback) =>
  String(
    data?.reference ||
      data?.transId ||
      data?.transaction_id ||
      data?.transactionId ||
      ""
  ).trim();

const loadPaymentWidget = () =>
  new Promise<void>((resolve, reject) => {
    if (!PAYMENT_WIDGET_APP_ID) {
      reject(new Error("Secure payment is missing its public setup key."));
      return;
    }

    if (window.campay) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(
      PAYMENT_WIDGET_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => {
          if (window.campay) {
            resolve();
          } else {
            reject(new Error("Secure payment could not finish loading."));
          }
        },
        { once: true }
      );
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Secure payment could not be loaded.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = PAYMENT_WIDGET_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.campay.net/sdk/js?app-id=${encodeURIComponent(
      PAYMENT_WIDGET_APP_ID
    )}`;
    script.onload = () => {
      if (window.campay) {
        resolve();
      } else {
        reject(new Error("Secure payment could not finish loading."));
      }
    };
    script.onerror = () =>
      reject(new Error("Secure payment could not be loaded."));
    document.body.appendChild(script);
  });

export const PanacheDorVoteForm = ({
  nominee,
  category,
  payment,
}: PanacheDorVoteFormProps) => {
  const [email, setEmail] = useState("");
  const [voteCount, setVoteCount] = useState("1");
  const [isPreparingPayment, setIsPreparingPayment] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [verifiedMessage, setVerifiedMessage] = useState("");
  const paymentCallbackHandledRef = useRef(false);

  const amountPerVote = payment?.amount_per_vote_xaf || 100;
  const currency = payment?.currency || "XAF";
  const normalizedVoteCount = Math.max(
    1,
    Number.parseInt(voteCount || "1", 10) || 1
  );
  const totalAmount = useMemo(
    () => normalizedVoteCount * amountPerVote,
    [amountPerVote, normalizedVoteCount]
  );
  const backendPaymentsConfigured = Boolean(payment?.payments_configured);
  const widgetConfigured = Boolean(PAYMENT_WIDGET_APP_ID);
  const paymentsConfigured = backendPaymentsConfigured && widgetConfigured;
  const isBusy = isPreparingPayment || isVerifyingPayment;
  const payButtonId = `panacheDorSecurePay-${nominee.id}`;

  const configurationMessage = !backendPaymentsConfigured
    ? "Secure payment is being connected. Nominees and leaderboards remain visible."
    : !widgetConfigured
      ? "Secure payment is missing its public setup key."
      : "";

  const verifyPayment = async (
    txRef: string,
    data?: PaymentWidgetCallback,
    fallbackPendingMessage = "Payment is still pending. If money was deducted, refresh verification shortly."
  ) => {
    const reference = extractPaymentReference(data);

    if (!reference) {
      if (paymentCallbackHandledRef.current) {
        return;
      }
      setNotice(fallbackPendingMessage);
      return;
    }

    paymentCallbackHandledRef.current = true;
    setIsVerifyingPayment(true);
    setNotice("Confirming your payment...");
    setError("");
    setVerifiedMessage("");

    try {
      const result = await panacheDorVotingService.verifyCampayVote({
        txRef,
        reference,
      });

      if (result.status === "success" || result.status === "already-counted") {
        setVerifiedMessage(
          result.message || "Payment verified. Your votes have been counted."
        );
        setNotice("");
        return;
      }

      if (result.status === "pending") {
        setNotice(
          result.message ||
            "Payment is still pending. Refresh verification shortly."
        );
        return;
      }

      setError(result.message || "Payment could not be verified.");
      setNotice("");
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "Could not verify the payment."
      );
      setNotice("");
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setVerifiedMessage("");
    paymentCallbackHandledRef.current = false;

    if (!paymentsConfigured) {
      setError(
        configurationMessage ||
          "Secure payment is not available yet. Please check again shortly."
      );
      return;
    }

    setIsPreparingPayment(true);
    try {
      const result = await panacheDorVotingService.initializeCampayVote({
        nomineeId: nominee.id,
        voterEmail: email.trim() || undefined,
        voteCount: normalizedVoteCount,
      });

      await loadPaymentWidget();

      if (!window.campay) {
        throw new Error("Secure payment could not be opened.");
      }

      window.campay.onSuccess = (data) => {
        paymentCallbackHandledRef.current = true;
        void verifyPayment(result.payment.tx_ref, data);
      };
      window.campay.onFail = (data) => {
        void verifyPayment(
          result.payment.tx_ref,
          data,
          "Payment was not completed. You can try again when ready."
        );
      };
      window.campay.onModalClose = (data) => {
        if (paymentCallbackHandledRef.current && !extractPaymentReference(data)) {
          return;
        }
        void verifyPayment(
          result.payment.tx_ref,
          data,
          "Payment window closed before completion."
        );
      };

      window.campay.options({
        payButtonId,
        description: result.payment.widget.description,
        amount: String(result.payment.widget.amount),
        currency: result.payment.widget.currency,
        externalReference: result.payment.widget.externalReference,
        redirectUrl: result.payment.widget.redirectUrl,
      });

      requestAnimationFrame(() => {
        document.getElementById(payButtonId)?.click();
      });
      setNotice("Opening secure payment...");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not start the secure payment."
      );
    } finally {
      setIsPreparingPayment(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_24px_64px_rgba(17,16,14,0.10)]"
    >
      <div className="relative bg-[#171411] px-5 py-6 text-white md:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(244,233,63,0.24),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(130,65,182,0.42),transparent_34%)]" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge className="rounded-full bg-[#f4e93f] px-3 py-1 text-[#171411] hover:bg-[#f4e93f]">
              Secure verified payment
            </Badge>
            <Badge className="rounded-full border border-white/18 bg-white/10 px-3 py-1 text-white hover:bg-white/10">
              {amountPerVote.toLocaleString()} {currency} / vote
            </Badge>
          </div>

          <div className="mt-5">
            <p className="font-sans text-sm text-white/62">Vote for</p>
            <h3 className="mt-1 font-sans text-[1.75rem] font-semibold leading-[0.95] tracking-[-0.06em] text-white">
              {nominee.name}
            </h3>
            <p className="mt-2 font-sans text-sm font-medium text-[#f4e93f]">
              {category.name}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 bg-[#f8f2e8] p-5 md:p-6">
        <div className="rounded-[1.35rem] border border-black/8 bg-white/82 px-4 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8241B6]/10 text-[#8241B6]">
              <CreditCard className="h-4 w-4" />
            </span>
            <div>
              <p className="font-sans text-sm font-semibold text-[#171411]">
                Your votes are counted only after successful payment verification.
              </p>
              <p className="mt-1 font-sans text-xs leading-relaxed text-[#171411]/56">
                Choose your vote quantity, open the secure payment widget, then wait for confirmation before leaving the page.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <Label
              htmlFor={`panacheDorVotes-${nominee.id}`}
              className="font-sans text-sm font-semibold text-[#171411]"
            >
              Number of votes
            </Label>
            <Input
              id={`panacheDorVotes-${nominee.id}`}
              type="number"
              min={1}
              step={1}
              value={voteCount}
              onChange={(event) => setVoteCount(event.target.value)}
              className="mt-2 h-13 rounded-[1.1rem] border-black/10 bg-white px-4 font-sans text-base font-semibold text-[#171411] shadow-sm"
            />
          </div>
          <div>
            <Label
              htmlFor={`panacheDorEmail-${nominee.id}`}
              className="font-sans text-sm font-semibold text-[#171411]"
            >
              Email for receipt, optional
            </Label>
            <Input
              id={`panacheDorEmail-${nominee.id}`}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-13 rounded-[1.1rem] border-black/10 bg-white px-4 font-sans text-base text-[#171411] shadow-sm"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="grid gap-3 rounded-[1.45rem] border border-black/8 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#8241B6]">
              Total due
            </p>
            <p className="mt-1 font-sans text-3xl font-semibold tracking-[-0.08em] text-[#171411]">
              {totalAmount.toLocaleString()} {currency}
            </p>
          </div>
          <Button
            type="submit"
            disabled={isBusy || !paymentsConfigured}
            className="h-13 rounded-full bg-[linear-gradient(135deg,#171411,#8241B6)] px-7 font-sans text-sm font-semibold text-white shadow-[0_14px_28px_rgba(23,20,17,0.20)] hover:opacity-95 disabled:opacity-50"
          >
            {isBusy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            {isVerifyingPayment
              ? "Verifying..."
              : isPreparingPayment
                ? "Opening..."
                : "Pay securely"}
          </Button>
        </div>

        <button
          id={payButtonId}
          type="button"
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />

        {configurationMessage ? (
          <p className="rounded-[1.2rem] border border-black/8 bg-white px-4 py-3 font-sans text-sm text-[#171411]/68">
            {configurationMessage}
          </p>
        ) : null}
        {notice ? (
          <p className="rounded-[1.2rem] border border-[#8241B6]/14 bg-white px-4 py-3 font-sans text-sm text-[#171411]/68">
            {notice}
          </p>
        ) : null}
        {verifiedMessage ? (
          <div className="space-y-3 rounded-[1.55rem] border border-emerald-200 bg-emerald-50 p-4 font-sans text-sm text-emerald-800">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-emerald-900">Votes confirmed</p>
                <p className="mt-1 leading-relaxed">{verifiedMessage}</p>
              </div>
            </div>

            <div className="rounded-[1.2rem] border border-emerald-200/80 bg-white px-4 py-4 text-[#171411]">
              <p className="font-sans text-sm font-semibold leading-relaxed">
                {WHATSAPP_CHANNEL_TEXT}
              </p>
              <a
                href={WHATSAPP_CHANNEL_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex h-11 items-center justify-center rounded-full bg-[#171411] px-5 font-sans text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Join WhatsApp Channel
              </a>
            </div>
          </div>
        ) : null}
        {error ? (
          <p className="rounded-[1.2rem] border border-destructive/15 bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
};
