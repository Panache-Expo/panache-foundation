import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearStoredDashboardAccessKey,
  getStoredDashboardAccessKey,
  storeDashboardAccessKey,
} from "@/lib/dashboard-admin";
import {
  Banknote,
  CreditCard,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Vote,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type PaymentClassification = {
  tx_ref: string;
  reference: string;
  nominee: string;
  category: string;
  votes: number;
  amount_xaf: number;
  method: "card" | "momo" | string;
  confidence: "detected" | "assumed" | string;
  provider_status?: string | null;
  campay_checked: boolean;
  campay_error?: string | null;
};

type Disbursement = {
  reference?: string | null;
  external_reference?: string | null;
  amount_xaf: number;
  currency?: string | null;
  status?: string | null;
  phone?: string | null;
  operator?: string | null;
  description?: string | null;
  transaction_date?: string | null;
};

type RevenueSummary = {
  generated_at: string;
  currency: string;
  vote_price_xaf: number;
  processing_fee_per_vote_xaf: number;
  card_fee_rate: number;
  momo_fee_rate: number;
  total_votes: number;
  total_votes_source: string;
  vote_count_view_available: boolean;
  completed_payment_votes: number;
  vote_gap: number;
  completed_payment_count: number;
  successful_payment_count: number;
  gross_vote_revenue_xaf: number;
  estimated_processing_fee_collected_xaf: number;
  estimated_total_collected_xaf: number;
  estimated_net_before_disbursements_xaf?: number;
  successful_disbursements_xaf?: number;
  successful_disbursement_withdrawals_xaf?: number;
  successful_disbursement_fees_xaf?: number;
  campay_disbursement_fee_rate?: number;
  pending_disbursements_xaf?: number;
  failed_disbursements_xaf?: number;
  estimated_cash_after_disbursements_xaf?: number;
  campay_disbursement_sync_available?: boolean;
  campay_disbursement_sync_error?: string | null;
  campay_disbursement_count?: number;
  campay_successful_disbursement_count?: number;
  campay_pending_disbursement_count?: number;
  campay_failed_disbursement_count?: number;
  recent_disbursements?: Disbursement[];
  total_disbursed_xaf?: number;
  disbursement_count?: number;
  disbursement_lookup_error?: string | null;
  card_payment_count: number;
  card_votes: number;
  card_gross_revenue_xaf: number;
  estimated_card_provider_fee_xaf: number;
  momo_payment_count: number;
  momo_detected_payment_count: number;
  momo_assumed_payment_count: number;
  momo_votes: number;
  momo_gross_revenue_xaf: number;
  estimated_momo_provider_fee_xaf: number;
  estimated_provider_fees_xaf: number;
  estimated_net_revenue_xaf: number;
  campay_checked_payment_count: number;
  campay_failed_check_count: number;
  recent_classifications: PaymentClassification[];
  assumptions: string[];
};

const REVENUE_API_URL =
  import.meta.env.VITE_PANACHE_DOR_REVENUE_API_URL ||
  "/api/panache-dor-revenue";

const formatNumber = (value: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    Number(value || 0)
  );

const formatMoney = (value: number, currency = "XAF") =>
  `${formatNumber(value)} ${currency}`;

const formatPercent = (value: number) =>
  new Intl.NumberFormat(undefined, {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));

const fetchRevenueSummary = async (accessKey: string) => {
  const response = await fetch(REVENUE_API_URL, {
    headers: {
      "x-dashboard-key": accessKey,
    },
  });
  const payload = (await response.json().catch(() => null)) as
    | { message?: string; revenue?: RevenueSummary }
    | null;

  if (!response.ok || !payload?.revenue) {
    throw new Error(payload?.message || "Could not load revenue analytics.");
  }

  return payload.revenue;
};

const MetricCard = ({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper?: string;
  icon: typeof Banknote;
}) => (
  <Card className="border-border/60 shadow-soft">
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-primary">
            {value}
          </p>
          {helper ? (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {helper}
            </p>
          ) : null}
        </div>
        <div className="rounded-2xl bg-muted p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const PanacheDorRevenueDashboardPage = () => {
  const [accessKeyInput, setAccessKeyInput] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadRevenue = async (key: string) => {
    if (!key) {
      return false;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const nextRevenue = await fetchRevenueSummary(key);
      setRevenue(nextRevenue);
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not load revenue analytics.";
      setErrorMessage(message);
      if (message.toLowerCase().includes("access code")) {
        clearStoredDashboardAccessKey();
        setAccessKey("");
        setAccessKeyInput("");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedAccessKey = getStoredDashboardAccessKey();
    if (!storedAccessKey) {
      return;
    }

    setAccessKeyInput(storedAccessKey);
    setAccessKey(storedAccessKey);
    void loadRevenue(storedAccessKey);
  }, []);

  const cardShare = useMemo(() => {
    if (!revenue?.total_votes) {
      return 0;
    }
    return revenue.card_votes / revenue.total_votes;
  }, [revenue]);

  const momoShare = useMemo(() => {
    if (!revenue?.total_votes) {
      return 0;
    }
    return revenue.momo_votes / revenue.total_votes;
  }, [revenue]);

  const successfulDisbursements = revenue
    ? revenue.successful_disbursements_xaf ?? revenue.total_disbursed_xaf ?? 0
    : 0;
  const successfulWithdrawalFees = revenue
    ? revenue.successful_disbursement_fees_xaf ?? 0
    : 0;
  const disbursementCount = revenue
    ? revenue.campay_successful_disbursement_count ??
      revenue.disbursement_count ??
      0
    : 0;
  const disbursementError = revenue
    ? revenue.campay_disbursement_sync_error ??
      revenue.disbursement_lookup_error ??
      null
    : null;

  const handleUnlock = async () => {
    const key = accessKeyInput.trim();
    if (!key) {
      setErrorMessage("Enter the dashboard access key.");
      return;
    }

    const ok = await loadRevenue(key);
    if (ok) {
      setAccessKey(key);
      storeDashboardAccessKey(key);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="rounded-full bg-[#8241B6] text-white hover:bg-[#8241B6]">
              Panache D&apos;or admin
            </Badge>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-primary md:text-6xl">
              Vote revenue analytics
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Estimate total generated revenue from Supabase vote counts, then
              reconcile successful CamPay transactions to separate card votes
              from MOMO votes for fee estimates.
            </p>
          </div>

          {accessKey ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadRevenue(accessKey)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh analytics
            </Button>
          ) : null}
        </div>

        {!accessKey ? (
          <Card className="mt-10 max-w-xl border-border/60 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Unlock admin analytics
              </CardTitle>
              <CardDescription>
                Use the same dashboard access key used for the participants and
                Panache D&apos;or voting dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="panacheDorRevenueAccessKey">
                  Dashboard access key
                </Label>
                <Input
                  id="panacheDorRevenueAccessKey"
                  value={accessKeyInput}
                  onChange={(event) => setAccessKeyInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      void handleUnlock();
                    }
                  }}
                  className="mt-2"
                  type="password"
                />
              </div>
              {errorMessage ? (
                <p className="text-sm text-destructive">{errorMessage}</p>
              ) : null}
              <Button
                type="button"
                onClick={() => void handleUnlock()}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                View revenue
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {accessKey && errorMessage ? (
          <Card className="mt-8 border-destructive/30 bg-destructive/5">
            <CardContent className="p-5">
              <p className="text-sm text-destructive">{errorMessage}</p>
            </CardContent>
          </Card>
        ) : null}

        {accessKey && isLoading && !revenue ? (
          <Card className="mt-8 border-border/60">
            <CardContent className="flex items-center gap-3 p-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading revenue analytics...
            </CardContent>
          </Card>
        ) : null}

        {revenue ? (
          <div className="mt-10 space-y-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Total votes"
                value={formatNumber(revenue.total_votes)}
                helper={`Source: ${revenue.total_votes_source.replaceAll("_", " ")}`}
                icon={Vote}
              />
              <MetricCard
                label="Gross vote revenue"
                value={formatMoney(
                  revenue.gross_vote_revenue_xaf,
                  revenue.currency
                )}
                helper={`${formatNumber(revenue.total_votes)} votes × ${formatMoney(
                  revenue.vote_price_xaf,
                  revenue.currency
                )}`}
                icon={Banknote}
              />
              <MetricCard
                label="Estimated total collected"
                value={formatMoney(
                  revenue.estimated_total_collected_xaf,
                  revenue.currency
                )}
                helper={
                  revenue.processing_fee_per_vote_xaf
                    ? `Includes ${formatMoney(
                        revenue.processing_fee_per_vote_xaf,
                        revenue.currency
                      )} processing fee per vote`
                    : "No extra processing fee configured"
                }
                icon={Banknote}
              />
              <MetricCard
                label="Estimated net revenue"
                value={formatMoney(
                  revenue.estimated_net_revenue_xaf,
                  revenue.currency
                )}
                helper={`Estimated collected amount minus synced disbursements of ${formatMoney(
                  successfulDisbursements,
                  revenue.currency
                )}`}
                icon={ShieldCheck}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-border/60 shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Card payments
                  </CardTitle>
                  <CardDescription>
                    Votes detected as card from successful Campay transaction
                    metadata. Card fees use {formatPercent(revenue.card_fee_rate)}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Votes</p>
                    <p className="mt-1 text-2xl font-semibold text-primary">
                      {formatNumber(revenue.card_votes)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPercent(cardShare)} of total
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gross</p>
                    <p className="mt-1 text-2xl font-semibold text-primary">
                      {formatMoney(revenue.card_gross_revenue_xaf, revenue.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fee estimate</p>
                    <p className="mt-1 text-2xl font-semibold text-primary">
                      {formatMoney(
                        revenue.estimated_card_provider_fee_xaf,
                        revenue.currency
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    MOMO payments
                  </CardTitle>
                  <CardDescription>
                    Remaining successful votes are treated as MOMO. MOMO fees use 1%.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Votes</p>
                    <p className="mt-1 text-2xl font-semibold text-primary">
                      {formatNumber(revenue.momo_votes)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPercent(momoShare)} of total
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gross</p>
                    <p className="mt-1 text-2xl font-semibold text-primary">
                      {formatMoney(revenue.momo_gross_revenue_xaf, revenue.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fee estimate</p>
                    <p className="mt-1 text-2xl font-semibold text-primary">
                      {formatMoney(
                        revenue.estimated_momo_provider_fee_xaf,
                        revenue.currency
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/60 shadow-soft">
              <CardHeader>
                <CardTitle>Reconciliation health</CardTitle>
                <CardDescription>
                  Use this to spot gaps between Supabase vote counts and
                  completed payment rows.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-5">
                <div className="rounded-2xl border border-border/60 p-4">
                  <p className="text-sm text-muted-foreground">Completed payments</p>
                  <p className="mt-1 text-xl font-semibold text-primary">
                    {formatNumber(revenue.completed_payment_count)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 p-4">
                  <p className="text-sm text-muted-foreground">Payment row votes</p>
                  <p className="mt-1 text-xl font-semibold text-primary">
                    {formatNumber(revenue.completed_payment_votes)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 p-4">
                  <p className="text-sm text-muted-foreground">Vote gap</p>
                  <p className="mt-1 text-xl font-semibold text-primary">
                    {formatNumber(revenue.vote_gap)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 p-4">
                  <p className="text-sm text-muted-foreground">Total disbursed</p>
                  <p className="mt-1 text-xl font-semibold text-primary">
                    {formatMoney(successfulDisbursements, revenue.currency)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {disbursementError
                      ? disbursementError
                      : `${formatNumber(
                          disbursementCount
                        )} withdrawal row(s), incl. ${formatMoney(
                          successfulWithdrawalFees,
                          revenue.currency
                        )} fee`}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 p-4">
                  <p className="text-sm text-muted-foreground">Campay check errors</p>
                  <p className="mt-1 text-xl font-semibold text-primary">
                    {formatNumber(revenue.campay_failed_check_count)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-soft">
              <CardHeader>
                <CardTitle>Recent payment classifications</CardTitle>
                <CardDescription>
                  Latest completed payments, with detected or assumed payment
                  method. References are masked.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead className="text-muted-foreground">
                      <tr className="border-b border-border/60">
                        <th className="py-3 pr-4 font-medium">Method</th>
                        <th className="py-3 pr-4 font-medium">Nominee</th>
                        <th className="py-3 pr-4 font-medium">Votes</th>
                        <th className="py-3 pr-4 font-medium">Amount</th>
                        <th className="py-3 pr-4 font-medium">Reference</th>
                        <th className="py-3 pr-4 font-medium">Campay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenue.recent_classifications.length ? (
                        revenue.recent_classifications.map((payment) => (
                          <tr
                            key={`${payment.tx_ref}-${payment.reference}`}
                            className="border-b border-border/40"
                          >
                            <td className="py-3 pr-4">
                              <Badge
                                variant={
                                  payment.method === "card" ? "default" : "outline"
                                }
                              >
                                {payment.method.toUpperCase()} · {payment.confidence}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4">
                              <p className="font-medium text-primary">
                                {payment.nominee}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {payment.category}
                              </p>
                            </td>
                            <td className="py-3 pr-4">{payment.votes}</td>
                            <td className="py-3 pr-4">
                              {formatMoney(payment.amount_xaf, revenue.currency)}
                            </td>
                            <td className="py-3 pr-4 font-mono text-xs">
                              {payment.reference || payment.tx_ref}
                            </td>
                            <td className="py-3 pr-4">
                              {payment.campay_error ? (
                                <span className="text-destructive">
                                  {payment.campay_error}
                                </span>
                              ) : payment.campay_checked ? (
                                payment.provider_status || "checked"
                              ) : (
                                "not checked"
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-5 text-muted-foreground" colSpan={6}>
                            No completed payments found yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default PanacheDorRevenueDashboardPage;
