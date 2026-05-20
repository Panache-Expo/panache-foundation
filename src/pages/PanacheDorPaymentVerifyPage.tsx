import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { panacheDorVotingService } from "@/integrations/supabase/services";
import type { PanacheDorVoteVerifyResponse } from "@/integrations/supabase/services";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const PanacheDorPaymentVerifyPage = () => {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<PanacheDorVoteVerifyResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const txRef = searchParams.get("tx_ref") || searchParams.get("txRef") || "";
  const reference =
    searchParams.get("reference") ||
    searchParams.get("transId") ||
    searchParams.get("transaction_id") ||
    "";

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      if (!txRef && !reference) {
        setError("Payment reference is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const payload = await panacheDorVotingService.verifyCampayVote({
          txRef,
          reference,
        });
        if (mounted) {
          setResult(payload);
        }
      } catch (verifyError) {
        if (mounted) {
          setError(
            verifyError instanceof Error
              ? verifyError.message
              : "Could not verify the payment."
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void verify();

    return () => {
      mounted = false;
    };
  }, [reference, txRef]);

  const isSuccess =
    result?.status === "success" || result?.status === "already-counted";

  return (
    <div className="min-h-screen bg-[#f4f3ef]">
      <Header />

      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-28 md:px-10">
        <section className="w-full rounded-[2rem] border border-black/8 bg-white p-6 text-center shadow-[0_24px_64px_rgba(17,16,14,0.10)] md:p-10">
          {isLoading ? (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#8241B6]" />
              <h1 className="mt-6 font-sans text-3xl font-semibold tracking-[-0.05em] text-[#171411]">
                Verifying your payment
              </h1>
              <p className="mt-3 font-sans text-sm text-[#171411]/64">
                Please wait while Panache confirms the payment.
              </p>
            </>
          ) : error ? (
            <>
              <XCircle className="mx-auto h-12 w-12 text-destructive" />
              <h1 className="mt-6 font-sans text-3xl font-semibold tracking-[-0.05em] text-[#171411]">
                Payment not verified
              </h1>
              <p className="mt-3 font-sans text-sm text-destructive">{error}</p>
            </>
          ) : (
            <>
              {isSuccess ? (
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
              ) : (
                <Loader2 className="mx-auto h-12 w-12 text-[#8241B6]" />
              )}
              <Badge className="mt-6 rounded-full bg-[#f8f2e8] text-[#171411] hover:bg-[#f8f2e8]">
                {result?.status || "pending"}
              </Badge>
              <h1 className="mt-5 font-sans text-3xl font-semibold tracking-[-0.05em] text-[#171411]">
                {isSuccess ? "Your votes have been counted" : "Payment pending"}
              </h1>
              <p className="mt-3 font-sans text-sm text-[#171411]/64">
                {result?.message ||
                  "If your payment is still pending, refresh this page after it completes."}
              </p>

              {result?.receipt ? (
                <div className="mx-auto mt-7 max-w-md rounded-[1.4rem] border border-black/8 bg-[#f8f2e8] p-5 text-left">
                  <p className="font-sans text-sm font-semibold text-[#171411]">
                    {result.receipt.nominee_name}
                  </p>
                  <p className="mt-1 font-sans text-sm text-[#171411]/62">
                    {result.receipt.category_name}
                  </p>
                  <div className="mt-4 grid gap-2 font-sans text-sm text-[#171411]/72">
                    <p>Votes: {result.receipt.vote_count.toLocaleString()}</p>
                    <p>
                      Amount: {result.receipt.amount_xaf.toLocaleString()}{" "}
                      {result.receipt.currency}
                    </p>
                    <p>Reference: {result.receipt.reference || result.receipt.tx_ref}</p>
                  </div>
                </div>
              ) : null}
            </>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              className="h-12 rounded-full bg-[#171411] px-7 text-white hover:bg-[#171411]/92"
            >
              <Link to="/panache-expo/panache-dor/leaderboard">
                View leaderboard
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-full border-black/12 bg-white px-7"
            >
              <Link to="/panache-expo/panache-dor/vote">Back to nominees</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PanacheDorPaymentVerifyPage;
