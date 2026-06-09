import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { BlindVotingCountdown } from "@/components/BlindVotingCountdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { panache360VotingService } from "@/integrations/supabase/services";
import type { Panache360VoteVerifyResponse } from "@/integrations/supabase/services";
import { isBlindVotingActive } from "@/lib/blind-voting";
import {
  getPanache360Motivation,
  rankPanache360CategoryNominees,
} from "@/lib/panache-360-ranking";
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  Share2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const PANACHE_360_WHATSAPP_CHANNEL_URL =
  "https://whatsapp.com/channel/0029Vb8Cg42ATRSgvXAcXE3L";

const isPreviewAllowed = () => {
  if (import.meta.env.DEV) {
    return true;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
};

const Panache360PaymentVerifyPage = () => {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<Panache360VoteVerifyResponse | null>(
    null,
  );
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [shareNotice, setShareNotice] = useState("");

  const txRef = searchParams.get("tx_ref") || searchParams.get("txRef") || "";
  const reference =
    searchParams.get("reference") ||
    searchParams.get("transId") ||
    searchParams.get("transaction_id") ||
    "";
  const previewMode = searchParams.get("preview") === "success";

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      if (previewMode && isPreviewAllowed()) {
        setResult({
          status: "success",
          message:
            "Preview mode: this is how the confirmation page looks after a successful vote.",
          receipt: {
            id: "preview-payment",
            tx_ref: "preview-panache-360-vote",
            reference: "preview-reference",
            nominee_id: "preview-nominee",
            nominee_name: "Lin's Glamour Burea",
            nominee_slug: "lin-s-glamour-burea",
            category_id: "preview-category",
            category_name: "Lash and Brow Artist of the Year",
            category_slug: "lash-artist-of-the-year",
            voter_email: null,
            voter_whatsapp: null,
            vote_count: 5,
            amount_xaf: 500,
            currency: "XAF",
            status: "completed",
            verified_at: new Date().toISOString(),
          },
          voting: {
            categories: [
              {
                id: "preview-category",
                slug: "lash-artist-of-the-year",
                name: "Lash and Brow Artist of the Year",
                description: null,
                status: "active",
                sort_order: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                vote_count: 122,
                nominees: [
                  {
                    id: "preview-leader",
                    category_id: "preview-category",
                    slug: "category-leader",
                    name: "Category Leader",
                    organization: null,
                    bio: null,
                    photo_url: null,
                    status: "active",
                    sort_order: 1,
                    ayati_vote_url: null,
                    ayati_sync_id: null,
                    ayati_vote_count: 66,
                    ayati_last_synced_at: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    vote_count: 66,
                  },
                  {
                    id: "preview-nominee",
                    category_id: "preview-category",
                    slug: "lin-s-glamour-burea",
                    name: "Lin's Glamour Burea",
                    organization: null,
                    bio: null,
                    photo_url: null,
                    status: "active",
                    sort_order: 2,
                    ayati_vote_url: null,
                    ayati_sync_id: null,
                    ayati_vote_count: 60,
                    ayati_last_synced_at: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    vote_count: 60,
                  },
                ],
              },
            ],
            total_votes: 122,
          },
        });
        setIsLoading(false);
        return;
      }

      if (!txRef && !reference) {
        setError("Payment reference is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const payload = await panache360VotingService.verifyCampayVote({
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
              : "Could not verify the payment.",
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
  }, [previewMode, reference, txRef]);

  const isSuccess =
    result?.status === "success" || result?.status === "already-counted";
  const receipt = result?.receipt;
  const receiptCategory = receipt
    ? result?.voting?.categories.find((category) =>
        category.nominees.some((nominee) => nominee.id === receipt.nominee_id),
      )
    : undefined;
  const receiptNominee = receiptCategory?.nominees.find(
    (nominee) => nominee.id === receipt?.nominee_id,
  );
  const blindVoting = isBlindVotingActive(result?.voting);
  const receiptMotivation =
    !blindVoting && receipt && receiptCategory
      ? getPanache360Motivation(
          rankPanache360CategoryNominees(receiptCategory),
          receipt.nominee_id,
        )
      : null;
  const closeRaceShareLine =
    receiptMotivation?.kind === "close-gap" ? receiptMotivation.text : "";
  const shareOrigin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://panache-foundation.org";
  const sharePath = (() => {
    if (receipt?.nominee_slug) {
      return `/panache-expo/panache-360/nominees/${receipt.nominee_slug}`;
    }
    if (receiptNominee?.slug) {
      return `/panache-expo/panache-360/nominees/${receiptNominee.slug}`;
    }
    if (receipt?.category_slug) {
      return `/panache-expo/panache-360/vote?category=${receipt.category_slug}`;
    }
    if (receiptCategory?.slug) {
      return `/panache-expo/panache-360/vote?category=${receiptCategory.slug}`;
    }
    return "/panache-expo/panache-360/vote";
  })();
  const shareUrl = `${shareOrigin}${sharePath}`;
  const shareText = receipt
    ? `I just voted for ${receipt.nominee_name} in Panache 360. ${
        closeRaceShareLine ? `${closeRaceShareLine} ` : ""
      }Help them win by voting too.`
    : "Support your favorite contestant in Panache 360.";
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `${shareText} ${shareUrl}`,
  )}`;

  const handleShare = async () => {
    setShareNotice("");

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Panache 360",
          text: shareText,
          url: shareUrl,
        });
        setShareNotice("Thanks for helping spread the word.");
      } catch (shareError) {
        if (
          shareError instanceof DOMException &&
          shareError.name === "AbortError"
        ) {
          return;
        }
        setShareNotice(
          "If sharing did not open, use the WhatsApp button below.",
        );
      }
      return;
    }

    window.open(whatsappShareUrl, "_blank", "noopener,noreferrer");
  };

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
                {isSuccess ? "Thanks for voting" : "Payment pending"}
              </h1>
              <p className="mt-3 font-sans text-sm text-[#171411]/64">
                {result?.message ||
                  "If your payment is still pending, refresh this page after it completes."}
              </p>

              <div className="mt-6 text-left">
                <BlindVotingCountdown
                  voting={result?.voting}
                  title="Your vote is counted, results stay blind"
                  description="Your payment can be verified while public totals and ranking hints remain hidden until the official announcement time."
                />
              </div>

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
                    <p>
                      Reference:{" "}
                      {result.receipt.reference || result.receipt.tx_ref}
                    </p>
                  </div>
                </div>
              ) : null}

              {isSuccess ? (
                <div className="mx-auto mt-5 max-w-md rounded-[1.4rem] border border-[#8241B6]/16 bg-white p-5">
                  <p className="font-sans text-sm font-semibold text-[#171411]">
                    Help {receipt?.nominee_name || "your contestant"} win
                  </p>
                  <p className="mt-2 font-sans text-sm text-[#171411]/64">
                    Share with 5 friends to help them win.
                  </p>

                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-full border-black/12 bg-white px-5 mt-4 "
                  >
                    <a href={whatsappShareUrl} target="_blank" rel="noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </a>
                  </Button>
                  {shareNotice ? (
                    <p className="mt-3 font-sans text-xs text-[#171411]/58">
                      {shareNotice}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {isSuccess ? (
                <div className="mx-auto mt-5 max-w-md rounded-[1.4rem] border border-[#8241B6]/16 bg-white p-5">
                  <p className="font-sans text-sm font-semibold text-[#171411]">
                    Stay close to Panache 360 updates
                  </p>
                  <p className="mt-2 font-sans text-sm text-[#171411]/64">
                    Join the official WhatsApp channel for contest updates,
                    announcements, and next steps.
                  </p>
                  <Button
                    asChild
                    className="mt-4 h-11 rounded-full bg-[#171411] px-6 text-white hover:bg-[#171411]/92"
                  >
                    <a
                      href={PANACHE_360_WHATSAPP_CHANNEL_URL}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Join WhatsApp Channel
                    </a>
                  </Button>
                </div>
              ) : null}
            </>
          )}

          {/* <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              className="h-12 rounded-full bg-[#171411] px-7 text-white hover:bg-[#171411]/92"
            >
              <Link to="/panache-expo/panache-360/leaderboard">
                View leaderboard
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-full border-black/12 bg-white px-7"
            >
              <Link to="/panache-expo/panache-360/vote">Back to contestants</Link>
            </Button>
          </div> */}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Panache360PaymentVerifyPage;
