import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  Panache360AwardCategory,
  Panache360AwardNominee,
  Panache360PaymentSettings,
} from "@/integrations/supabase/services";
import { panache360VotingService } from "@/integrations/supabase/services";
import { CreditCard, Loader2, Star } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type Panache360VoteFormProps = {
  contestant: Panache360AwardNominee;
  category: Panache360AwardCategory;
  payment?: Panache360PaymentSettings;
};

const quickVoteOptions = [5, 10, 20, 50, 100];
const popularVoteOption = 5;

export const Panache360VoteForm = ({
  contestant,
  category,
  payment,
}: Panache360VoteFormProps) => {
  const [email, setEmail] = useState("");
  const [voteCount, setVoteCount] = useState(String(popularVoteOption));
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
    ? "Secure payment is being connected. Contestants and results pages remain visible."
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
      const result = await panache360VotingService.initializeCampayVote({
        nomineeId: contestant.id,
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
            Vote for {contestant.name}
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
          <Label htmlFor={`panache360Votes-${contestant.id}`}>Number of votes</Label>
          <p className="mt-1 rounded-full bg-white px-3 py-2 font-sans text-xs font-semibold text-[#8241B6]">
            You can vote more than once.
          </p>
          <Input
            id={`panache360Votes-${contestant.id}`}
            type="number"
            min={1}
            step={1}
            value={voteCount}
            onChange={(event) => setVoteCount(event.target.value)}
            className="mt-2 h-12 rounded-full border-black/10 bg-white"
          />
          <div className="mt-3">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[#171411]/54">
              Quick boost
            </p>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {quickVoteOptions.map((option) => {
                const isSelected = normalizedVoteCount === option;
                const isPopular = option === popularVoteOption;

                return (
                  <Button
                    key={option}
                    type="button"
                    variant="outline"
                    onClick={() => setVoteCount(String(option))}
                    className={`relative h-auto min-h-10 overflow-visible rounded-full border px-2 py-2 font-sans text-sm font-semibold ${
                      isPopular
                        ? "border-[#8241B6] bg-[#8241B6] text-white shadow-[0_10px_24px_rgba(130,65,182,0.22)] hover:bg-[#8241B6]/92 hover:text-white"
                        : isSelected
                          ? "border-[#171411] bg-[#171411] text-white hover:bg-[#171411]/92 hover:text-white"
                          : "border-black/10 bg-white text-[#171411] hover:bg-white"
                    }`}
                  >
                    {isPopular ? (
                      <Star
                        className="absolute right-1.5 top-1 h-4 w-4 rotate-12 fill-[#FDBA11] text-[#FDBA11] drop-shadow-[0_2px_4px_rgba(253,186,17,0.75)]"
                        aria-hidden="true"
                      />
                    ) : null}
                    <span className="flex flex-col items-center justify-center leading-none">
                      <span>{option}</span>
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor={`panache360Email-${contestant.id}`}>
            Email for receipt, optional
          </Label>
          <Input
            id={`panache360Email-${contestant.id}`}
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
