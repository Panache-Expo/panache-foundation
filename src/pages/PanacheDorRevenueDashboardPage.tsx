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
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Banknote,
  CreditCard,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Ticket,
  TrendingUp,
  Vote,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SourceSummary = {
  key: string;
  label: string;
  gross_revenue_xaf: number;
  estimated_provider_fees_xaf: number;
  estimated_net_revenue_xaf: number;
  completed_payment_count: number;
  pending_payment_count: number;
  failed_payment_count: number;
  total_votes: number;
  total_tickets: number;
  total_admits: number;
  unavailable?: boolean;
  error?: string | null;
};

type DailyRevenueRow = {
  date: string;
  panache_dor_xaf: number;
  panache_360_xaf: number;
  tickets_xaf: number;
  total_xaf: number;
};

type MethodBreakdownRow = {
  method: string;
  gross_revenue_xaf: number;
  estimated_provider_fees_xaf: number;
  payment_count: number;
  votes?: number;
  tickets?: number;
  admits?: number;
};

type NamedBreakdownRow = {
  category?: string;
  package?: string;
  event?: string;
  gross_revenue_xaf: number;
  votes?: number;
  payment_count?: number;
  tickets?: number;
  admits?: number;
};

type WithdrawalSummary = {
  available: boolean;
  error?: string | null;
  successful_withdrawals_xaf: number;
  successful_withdrawal_fees_xaf: number;
  successful_withdrawals_with_fees_xaf: number;
  pending_withdrawals_xaf: number;
  failed_withdrawals_xaf: number;
  successful_withdrawal_count: number;
  pending_withdrawal_count: number;
  failed_withdrawal_count: number;
};

type RecentTransaction = {
  source_key: string;
  source_label: string;
  kind: "vote" | "ticket" | string;
  name: string;
  group: string;
  method: string;
  method_confidence: string;
  status: string;
  amount_xaf: number;
  units: number;
  unit_label: string;
  reference: string;
  transaction_date?: string | null;
};

type RevenueSummary = {
  generated_at: string;
  currency: string;
  gross_revenue_xaf: number;
  estimated_provider_fees_xaf: number;
  estimated_net_before_withdrawals_xaf: number;
  estimated_cash_after_withdrawals_xaf: number;
  completed_payment_count: number;
  pending_payment_count: number;
  failed_payment_count: number;
  total_votes: number;
  total_tickets: number;
  total_admits: number;
  source_breakdown: SourceSummary[];
  payment_method_breakdown: MethodBreakdownRow[];
  daily_revenue: DailyRevenueRow[];
  vote_category_breakdown: {
    panache_dor: NamedBreakdownRow[];
    panache_360: NamedBreakdownRow[];
  };
  ticket_package_breakdown: NamedBreakdownRow[];
  ticket_event_breakdown: NamedBreakdownRow[];
  withdrawals: WithdrawalSummary;
  recent_transactions: RecentTransaction[];
  assumptions: string[];
};

const REVENUE_API_URL =
  import.meta.env.VITE_PANACHE_REVENUE_API_URL || "/api/panache-revenue";

const chartColors = ["#8241B6", "#0F8A5F", "#1F76D2", "#E4B94A", "#E83E8C"];

const formatNumber = (value: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    Number(value || 0)
  );

const formatMoney = (value: number, currency = "XAF") =>
  `${formatNumber(value)} ${currency}`;

const formatDate = (value?: string | null) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

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

const MoneyTooltip = ({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
  currency: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/70 bg-background p-3 text-sm shadow-soft">
      {label ? <p className="mb-2 font-medium text-primary">{label}</p> : null}
      <div className="space-y-1">
        {payload.map((entry) => (
          <p key={entry.name} className="text-muted-foreground">
            <span style={{ color: entry.color }}>{entry.name}</span>:{" "}
            {formatMoney(Number(entry.value || 0), currency)}
          </p>
        ))}
      </div>
    </div>
  );
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

const EmptyChart = ({ label }: { label: string }) => (
  <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
    {label}
  </div>
);

const SourceBadge = ({ sourceKey }: { sourceKey: string }) => {
  const label =
    sourceKey === "panache_dor"
      ? "D'or"
      : sourceKey === "panache_360"
      ? "360"
      : "Tickets";

  return <Badge variant="outline">{label}</Badge>;
};

const PanacheDorRevenueDashboardPage = () => {
  const [accessKeyInput, setAccessKeyInput] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadRevenue = async (key: string) => {
    if (!key) return false;

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
    if (!storedAccessKey) return;

    setAccessKeyInput(storedAccessKey);
    setAccessKey(storedAccessKey);
    void loadRevenue(storedAccessKey);
  }, []);

  const sourceChartData = useMemo(
    () =>
      revenue?.source_breakdown.map((source) => ({
        name: source.label,
        value: source.gross_revenue_xaf,
      })) || [],
    [revenue]
  );

  const methodChartData = useMemo(
    () =>
      revenue?.payment_method_breakdown.map((method) => ({
        name: method.method.toUpperCase(),
        value: method.gross_revenue_xaf,
      })) || [],
    [revenue]
  );

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

  const currency = revenue?.currency || "XAF";
  const withdrawals = revenue?.withdrawals;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="rounded-full bg-[#8241B6] text-white hover:bg-[#8241B6]">
              Panache admin
            </Badge>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-primary md:text-6xl">
              Revenue dashboard
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Track Panache D&apos;or vote revenue, Panache 360 vote revenue, all
              ticket sales, provider-fee estimates, and synced withdrawal impact.
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
                voting dashboards.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="panacheRevenueAccessKey">
                  Dashboard access key
                </Label>
                <Input
                  id="panacheRevenueAccessKey"
                  value={accessKeyInput}
                  onChange={(event) => setAccessKeyInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void handleUnlock();
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
                label="Gross revenue"
                value={formatMoney(revenue.gross_revenue_xaf, currency)}
                helper={`${formatNumber(revenue.completed_payment_count)} completed payment rows`}
                icon={Banknote}
              />
              <MetricCard
                label="Provider fees"
                value={formatMoney(revenue.estimated_provider_fees_xaf, currency)}
                helper="Estimated from detected card/MOMO method split"
                icon={CreditCard}
              />
              <MetricCard
                label="Net before withdrawals"
                value={formatMoney(
                  revenue.estimated_net_before_withdrawals_xaf,
                  currency
                )}
                helper="Gross revenue minus estimated provider fees"
                icon={TrendingUp}
              />
              <MetricCard
                label="Cash after withdrawals"
                value={formatMoney(
                  revenue.estimated_cash_after_withdrawals_xaf,
                  currency
                )}
                helper={
                  withdrawals?.available
                    ? `${formatNumber(withdrawals.successful_withdrawal_count)} synced withdrawal(s)`
                    : withdrawals?.error || "Withdrawal sync unavailable"
                }
                icon={ShieldCheck}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Vote units"
                value={formatNumber(revenue.total_votes)}
                helper="D'or plus Panache 360 completed vote payments"
                icon={Vote}
              />
              <MetricCard
                label="Ticket orders"
                value={formatNumber(revenue.total_tickets)}
                helper={`${formatNumber(revenue.total_admits)} admitted guest(s)`}
                icon={Ticket}
              />
              <MetricCard
                label="Open payment issues"
                value={formatNumber(
                  revenue.pending_payment_count + revenue.failed_payment_count
                )}
                helper={`${formatNumber(revenue.pending_payment_count)} pending, ${formatNumber(
                  revenue.failed_payment_count
                )} failed/cancelled`}
                icon={RefreshCw}
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
              <Card className="border-border/60 shadow-soft">
                <CardHeader>
                  <CardTitle>Daily revenue trend</CardTitle>
                  <CardDescription>
                    Completed payment/order revenue by source.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {revenue.daily_revenue.length ? (
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenue.daily_revenue}>
                          <defs>
                            <linearGradient id="dorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8241B6" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#8241B6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis tickFormatter={(value) => formatNumber(Number(value))} width={74} />
                          <Tooltip content={<MoneyTooltip currency={currency} />} />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="panache_dor_xaf"
                            name="D'or"
                            stroke="#8241B6"
                            fill="url(#dorRevenue)"
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="panache_360_xaf"
                            name="360"
                            stroke="#0F8A5F"
                            fill="#0F8A5F"
                            fillOpacity={0.08}
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="tickets_xaf"
                            name="Tickets"
                            stroke="#1F76D2"
                            fill="#1F76D2"
                            fillOpacity={0.08}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChart label="No completed revenue yet." />
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-soft">
                <CardHeader>
                  <CardTitle>Revenue by source</CardTitle>
                  <CardDescription>D'or, 360, and ticket sales.</CardDescription>
                </CardHeader>
                <CardContent>
                  {sourceChartData.some((entry) => entry.value > 0) ? (
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sourceChartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            outerRadius={105}
                            paddingAngle={3}
                          >
                            {sourceChartData.map((entry, index) => (
                              <Cell
                                key={entry.name}
                                fill={chartColors[index % chartColors.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<MoneyTooltip currency={currency} />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChart label="No source revenue yet." />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-border/60 shadow-soft">
                <CardHeader>
                  <CardTitle>Payment method split</CardTitle>
                  <CardDescription>
                    Detected card vs MOMO revenue from provider payloads.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {methodChartData.some((entry) => entry.value > 0) ? (
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={methodChartData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={95}
                          >
                            {methodChartData.map((entry, index) => (
                              <Cell
                                key={entry.name}
                                fill={chartColors[(index + 2) % chartColors.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<MoneyTooltip currency={currency} />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChart label="No payment methods detected yet." />
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-soft">
                <CardHeader>
                  <CardTitle>Ticket packages</CardTitle>
                  <CardDescription>
                    Revenue by event and ticket package.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {revenue.ticket_package_breakdown.length ? (
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={revenue.ticket_package_breakdown.slice(0, 8)}
                          layout="vertical"
                          margin={{ left: 20, right: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" tickFormatter={(value) => formatNumber(Number(value))} />
                          <YAxis
                            type="category"
                            dataKey="package"
                            width={150}
                            tick={{ fontSize: 11 }}
                          />
                          <Tooltip content={<MoneyTooltip currency={currency} />} />
                          <Bar
                            dataKey="gross_revenue_xaf"
                            name="Revenue"
                            fill="#1F76D2"
                            radius={[0, 6, 6, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyChart label="No completed ticket revenue yet." />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {[
                ["Panache D'or categories", revenue.vote_category_breakdown.panache_dor],
                ["Panache 360 categories", revenue.vote_category_breakdown.panache_360],
              ].map(([title, rows]) => (
                <Card key={String(title)} className="border-border/60 shadow-soft">
                  <CardHeader>
                    <CardTitle>{String(title)}</CardTitle>
                    <CardDescription>
                      Completed vote revenue by category.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(rows as NamedBreakdownRow[]).length ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={(rows as NamedBreakdownRow[]).slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                              dataKey="category"
                              tick={{ fontSize: 11 }}
                              interval={0}
                              angle={-24}
                              textAnchor="end"
                              height={88}
                            />
                            <YAxis tickFormatter={(value) => formatNumber(Number(value))} />
                            <Tooltip content={<MoneyTooltip currency={currency} />} />
                            <Bar
                              dataKey="gross_revenue_xaf"
                              name="Revenue"
                              fill={String(title).includes("360") ? "#0F8A5F" : "#8241B6"}
                              radius={[6, 6, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <EmptyChart label="No completed vote revenue yet." />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-border/60 shadow-soft">
              <CardHeader>
                <CardTitle>Source health</CardTitle>
                <CardDescription>
                  Totals, pending rows, failed rows, and unavailable tables.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {revenue.source_breakdown.map((source) => (
                    <div
                      key={source.key}
                      className="rounded-2xl border border-border/60 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-primary">{source.label}</p>
                        {source.unavailable ? (
                          <Badge variant="destructive">Unavailable</Badge>
                        ) : (
                          <Badge variant="outline">Live</Badge>
                        )}
                      </div>
                      <p className="mt-3 text-2xl font-semibold text-primary">
                        {formatMoney(source.gross_revenue_xaf, currency)}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {formatNumber(source.completed_payment_count)} completed,{" "}
                        {formatNumber(source.pending_payment_count)} pending,{" "}
                        {formatNumber(source.failed_payment_count)} failed/cancelled
                      </p>
                      {source.total_votes ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatNumber(source.total_votes)} votes
                        </p>
                      ) : null}
                      {source.total_tickets ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatNumber(source.total_tickets)} ticket orders,{" "}
                          {formatNumber(source.total_admits)} admits
                        </p>
                      ) : null}
                      {source.error ? (
                        <p className="mt-2 text-xs text-destructive">{source.error}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-soft">
              <CardHeader>
                <CardTitle>Recent transactions</CardTitle>
                <CardDescription>
                  Latest completed vote and ticket revenue rows. References are masked.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] text-left text-sm">
                    <thead className="text-muted-foreground">
                      <tr className="border-b border-border/60">
                        <th className="py-3 pr-4 font-medium">Source</th>
                        <th className="py-3 pr-4 font-medium">Item</th>
                        <th className="py-3 pr-4 font-medium">Method</th>
                        <th className="py-3 pr-4 font-medium">Units</th>
                        <th className="py-3 pr-4 font-medium">Amount</th>
                        <th className="py-3 pr-4 font-medium">Reference</th>
                        <th className="py-3 pr-4 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenue.recent_transactions.length ? (
                        revenue.recent_transactions.map((transaction) => (
                          <tr
                            key={`${transaction.source_key}-${transaction.reference}-${transaction.transaction_date}`}
                            className="border-b border-border/40"
                          >
                            <td className="py-3 pr-4">
                              <SourceBadge sourceKey={transaction.source_key} />
                            </td>
                            <td className="py-3 pr-4">
                              <p className="font-medium text-primary">
                                {transaction.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {transaction.group}
                              </p>
                            </td>
                            <td className="py-3 pr-4">
                              <Badge variant="outline">
                                {transaction.method.toUpperCase()} -{" "}
                                {transaction.method_confidence}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4">
                              {formatNumber(transaction.units)}{" "}
                              {transaction.unit_label}
                            </td>
                            <td className="py-3 pr-4">
                              {formatMoney(transaction.amount_xaf, currency)}
                            </td>
                            <td className="py-3 pr-4 font-mono text-xs">
                              {transaction.reference || "N/A"}
                            </td>
                            <td className="py-3 pr-4">
                              {formatDate(transaction.transaction_date)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-5 text-muted-foreground" colSpan={7}>
                            No completed revenue transactions found yet.
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
