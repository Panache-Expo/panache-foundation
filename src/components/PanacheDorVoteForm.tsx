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
import { CreditCard, Loader2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type PanacheDorVoteFormProps = {
  nominee: PanacheDorAwardNominee;
  category: PanacheDorAwardCategory;
  payment?: PanacheDorPaymentSettings;
};

export const PanacheDorVoteForm = ({
  nominee,
  category,
  payment,
}: PanacheDorVoteFormProps) => {
  const [email, setEmail] = useState("");
  const [voteCount, setVoteCount] = useState("1");
  const [isPreparingPayment, setIsPreparingPayment] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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
  const isBusy = isPreparingPayment;

  const configurationMessage = !backendPaymentsConfigured
    ? "Secure payment is being connected. Nominees and leaderboards remain visible."
    : "";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!backendPaymentsConfigured) {
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

      if (!result.payment.payment_link) {
        throw new Error("Secure payment could not be opened. Please try again.");
      }

      setNotice("Opening secure payment...");
      window.location.assign(result.payment.payment_link);
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
      className="rounded-[1.6rem] border border-black/8 bg-[#f8f2e8] p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-sans text-sm font-semibold text-[#171411]">
            Vote for {nominee.name}
          </p>
          <p className="mt-1 font-sans text-sm text-[#171411]/62">
            {category.name}
          </p>
        </div>
        <Badge className="rounded-full bg-white text-[#171411] hover:bg-white">
          {amountPerVote.toLocaleString()} {currency} / vote
        </Badge>
      </div>

      <div className="mt-5 grid gap-4">
        <div>
          <Label htmlFor={`panacheDorVotes-${nominee.id}`}>Number of votes</Label>
          <Input
            id={`panacheDorVotes-${nominee.id}`}
            type="number"
            min={1}
            step={1}
            value={voteCount}
            onChange={(event) => setVoteCount(event.target.value)}
            className="mt-2 h-12 rounded-full border-black/10 bg-white"
          />
        </div>
        <div>
          <Label htmlFor={`panacheDorEmail-${nominee.id}`}>
            Email for receipt, optional
          </Label>
          <Input
            id={`panacheDorEmail-${nominee.id}`}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 h-12 rounded-full border-black/10 bg-white"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sans text-sm font-semibold text-[#171411]">
          Total: {totalAmount.toLocaleString()} {currency}
        </p>
        <Button
          type="submit"
          disabled={isBusy || !backendPaymentsConfigured}
          className="h-12 rounded-full bg-[#171411] px-7 font-sans text-sm font-semibold text-white hover:bg-[#171411]/92"
        >
          {isBusy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="mr-2 h-4 w-4" />
          )}
          {isPreparingPayment ? "Opening..." : "Pay securely"}
        </Button>
      </div>

      {configurationMessage ? (
        <p className="mt-4 rounded-2xl bg-white px-4 py-3 font-sans text-sm text-[#171411]/68">
          {configurationMessage}
        </p>
      ) : null}
      {notice ? (
        <p className="mt-4 rounded-2xl bg-white px-4 py-3 font-sans text-sm text-[#171411]/68">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-2xl bg-destructive/10 px-4 py-3 font-sans text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  );
};
