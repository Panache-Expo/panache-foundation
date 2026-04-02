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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { CompetitionApplication } from "@/integrations/supabase/services";
import { useToast } from "@/hooks/use-toast";
import {
  clearStoredDashboardAccessKey,
  fetchDashboardApplications,
  getStoredDashboardAccessKey,
  storeDashboardAccessKey,
  updateDashboardApplication,
} from "@/lib/dashboard-admin";
import { competitionRegistrationLinks } from "@/lib/registration-links";
import { format } from "date-fns";
import {
  CheckCircle2,
  CreditCard,
  Eye,
  LayoutGrid,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

const competitionTabs = [
  {
    slug: competitionRegistrationLinks.cyesPitch.competitionSlug,
    title: competitionRegistrationLinks.cyesPitch.title,
    shortTitle: "CYES Pitch",
  },
  {
    slug: competitionRegistrationLinks.exhibitionStands.competitionSlug,
    title: competitionRegistrationLinks.exhibitionStands.title,
    shortTitle: "Exhibition Stands",
  },
  {
    slug: competitionRegistrationLinks.panache360.competitionSlug,
    title: competitionRegistrationLinks.panache360.title,
    shortTitle: "Panache 360",
  },
  {
    slug: competitionRegistrationLinks.fashionNight.competitionSlug,
    title: competitionRegistrationLinks.fashionNight.title,
    shortTitle: "Fashion Night",
  },
  {
    slug: competitionRegistrationLinks.missPanache.competitionSlug,
    title: competitionRegistrationLinks.missPanache.title,
    shortTitle: "Miss Panache",
  },
] as const;

const paymentStatusOptions = [
  { value: "pending", label: "Pending payment" },
  { value: "paid", label: "Paid" },
  { value: "payment_failed", label: "Payment failed" },
] as const;

const reviewStatusOptions = [
  { value: "submitted", label: "Submitted" },
  { value: "contacted", label: "Contacted" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
] as const;

const getCompetitionTitle = (competitionSlug: string) =>
  competitionTabs.find((competition) => competition.slug === competitionSlug)?.title ||
  competitionSlug;

const getBadgeVariant = (status: string) => {
  if (status === "paid") {
    return "default";
  }

  if (status === "payment_failed" || status === "rejected") {
    return "destructive";
  }

  return "secondary";
};

const formatStatusLabel = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatJsonKeyLabel = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getBusinessName = (application: CompetitionApplication) => {
  if (!isRecord(application.form_payload)) {
    return "";
  }

  const businessName = application.form_payload.business_name;
  return typeof businessName === "string" ? businessName : "";
};

const getApplicantName = (application: CompetitionApplication) => {
  if (
    application.competition_slug ===
    competitionRegistrationLinks.exhibitionStands.competitionSlug
  ) {
    return application.first_name || "Unnamed exhibitor";
  }

  return [application.first_name, application.last_name].filter(Boolean).join(" ");
};

const ParticipantsDashboardPage = () => {
  const { toast } = useToast();
  const [accessKeyInput, setAccessKeyInput] = useState("");
  const [dashboardAccessKey, setDashboardAccessKey] = useState("");
  const [applications, setApplications] = useState<CompetitionApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(
    competitionRegistrationLinks.panache360.competitionSlug
  );
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<CompetitionApplication | null>(null);
  const [paymentStatusDraft, setPaymentStatusDraft] = useState("pending");
  const [paymentReferenceDraft, setPaymentReferenceDraft] = useState("");
  const [paymentAmountDraft, setPaymentAmountDraft] = useState("");
  const [reviewStatusDraft, setReviewStatusDraft] = useState("submitted");
  const [reviewNotesDraft, setReviewNotesDraft] = useState("");

  const loadApplications = async (accessKey: string) => {
    if (!accessKey) {
      return false;
    }

    setIsLoading(true);

    try {
      const nextApplications = await fetchDashboardApplications(accessKey);
      setApplications(nextApplications);
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not load dashboard applications.";

      if (message.toLowerCase().includes("access code")) {
        clearStoredDashboardAccessKey();
        setDashboardAccessKey("");
        setAccessKeyInput("");
      }

      toast({
        title: "Dashboard unavailable",
        description: message,
        variant: "destructive",
      });
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
    setDashboardAccessKey(storedAccessKey);
    void loadApplications(storedAccessKey);
  }, []);

  useEffect(() => {
    setCategoryFilter("all");
  }, [selectedCompetition]);

  const selectedCompetitionApplications = applications.filter(
    (application) => application.competition_slug === selectedCompetition
  );

  const categoryCounts = selectedCompetitionApplications.reduce<Record<string, number>>(
    (accumulator, application) => {
      const categoryKey = application.category || "Unspecified";
      accumulator[categoryKey] = (accumulator[categoryKey] || 0) + 1;
      return accumulator;
    },
    {}
  );

  const visibleApplications = selectedCompetitionApplications.filter((application) => {
    const matchesPayment =
      paymentFilter === "all" || application.payment_status === paymentFilter;
    const matchesCategory =
      categoryFilter === "all" ||
      (application.category || "Unspecified") === categoryFilter;
    const haystack = [
      application.application_code,
      application.first_name,
      application.last_name,
      getBusinessName(application),
      application.email,
      application.phone,
      application.category || "",
      application.city || "",
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = haystack.includes(searchQuery.trim().toLowerCase());

    return matchesPayment && matchesCategory && matchesSearch;
  });

  const totalForCompetition = selectedCompetitionApplications.length;
  const paidForCompetition = selectedCompetitionApplications.filter(
    (application) => application.payment_status === "paid"
  ).length;
  const pendingForCompetition = selectedCompetitionApplications.filter(
    (application) => application.payment_status === "pending"
  ).length;

  const payloadEntries = isRecord(selectedApplication?.form_payload)
    ? Object.entries(selectedApplication.form_payload)
    : [];

  const openApplication = (application: CompetitionApplication) => {
    setSelectedApplication(application);
    setPaymentStatusDraft(application.payment_status);
    setPaymentReferenceDraft(application.payment_reference || "");
    setPaymentAmountDraft(
      application.payment_amount === null ? "" : String(application.payment_amount)
    );
    setReviewStatusDraft(application.review_status);
    setReviewNotesDraft(application.review_notes || "");
  };

  const handleUnlockDashboard = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accessKeyInput.trim()) {
      toast({
        title: "Access code required",
        description: "Enter the dashboard access code before continuing.",
        variant: "destructive",
      });
      return;
    }

    setIsUnlocking(true);

    try {
      const didLoad = await loadApplications(accessKeyInput.trim());

      if (!didLoad) {
        return;
      }

      storeDashboardAccessKey(accessKeyInput.trim());
      setDashboardAccessKey(accessKeyInput.trim());

      toast({
        title: "Dashboard unlocked",
        description: "Participant data is ready to review.",
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleLogout = () => {
    clearStoredDashboardAccessKey();
    setDashboardAccessKey("");
    setAccessKeyInput("");
    setApplications([]);
    setSelectedApplication(null);
  };

  const handleSaveApplication = async () => {
    if (!selectedApplication || !dashboardAccessKey) {
      return;
    }

    setIsSaving(true);

    try {
      const updatedApplication = await updateDashboardApplication(
        dashboardAccessKey,
        selectedApplication.id,
        {
          payment_status: paymentStatusDraft,
          payment_reference: paymentReferenceDraft || null,
          payment_amount: paymentAmountDraft ? Number(paymentAmountDraft) : null,
          review_status: reviewStatusDraft,
          review_notes: reviewNotesDraft || null,
        }
      );

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === updatedApplication.id ? updatedApplication : application
        )
      );
      setSelectedApplication(updatedApplication);

      toast({
        title: "Participant updated",
        description: "Payment and review details were saved.",
      });
    } catch (error) {
      toast({
        title: "Could not save changes",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickMarkPaid = async (application: CompetitionApplication) => {
    if (!dashboardAccessKey) {
      return;
    }

    try {
      const updatedApplication = await updateDashboardApplication(
        dashboardAccessKey,
        application.id,
        {
          payment_status: application.payment_status === "paid" ? "pending" : "paid",
        }
      );

      setApplications((currentApplications) =>
        currentApplications.map((currentApplication) =>
          currentApplication.id === updatedApplication.id
            ? updatedApplication
            : currentApplication
        )
      );

      toast({
        title:
          updatedApplication.payment_status === "paid"
            ? "Marked as paid"
            : "Moved back to pending",
        description: `${getApplicantName(updatedApplication)} has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Could not update payment status",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-24 pb-16 relative overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_42%)]" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
              <ShieldCheck className="w-4 h-4" />
              Private participant dashboard
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
              Panache Registration <span className="text-rose-gold">Dashboard</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Monitor applications by competition and category, review participant
              details, and manually confirm the people who have completed payment.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        {!dashboardAccessKey ? (
          <Card className="max-w-xl mx-auto border-border/60 shadow-elegant">
            <CardHeader>
              <CardTitle className="font-display text-2xl text-primary">
                Unlock the dashboard
              </CardTitle>
              <CardDescription>
                Use the private access code configured for the Panache admin team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleUnlockDashboard}>
                <div>
                  <Label htmlFor="dashboardAccessCode">Dashboard access code</Label>
                  <Input
                    id="dashboardAccessCode"
                    type="password"
                    className="mt-2"
                    value={accessKeyInput}
                    onChange={(event) => setAccessKeyInput(event.target.value)}
                    placeholder="Enter access code"
                  />
                </div>
                <Button type="submit" variant="hero" disabled={isUnlocking}>
                  {isUnlocking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Unlocking...
                    </>
                  ) : (
                    "Open Dashboard"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-3">
                <Card className="min-w-[180px] border-border/60 shadow-soft">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-rose-gold" />
                      <div>
                        <p className="text-sm text-muted-foreground">Applicants</p>
                        <p className="text-2xl font-semibold text-primary">
                          {totalForCompetition}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="min-w-[180px] border-border/60 shadow-soft">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Paid</p>
                        <p className="text-2xl font-semibold text-primary">
                          {paidForCompetition}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="min-w-[180px] border-border/60 shadow-soft">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-2xl font-semibold text-primary">
                          {pendingForCompetition}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="min-w-[180px] border-border/60 shadow-soft">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <LayoutGrid className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Categories</p>
                        <p className="text-2xl font-semibold text-primary">
                          {Object.keys(categoryCounts).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => void loadApplications(dashboardAccessKey)}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  Lock Dashboard
                </Button>
              </div>
            </div>

            <Tabs
              value={selectedCompetition}
              onValueChange={setSelectedCompetition}
              className="space-y-6"
            >
              <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
                {competitionTabs.map((competition) => (
                  <TabsTrigger
                    key={competition.slug}
                    value={competition.slug}
                    className="rounded-full border border-border/60 bg-card px-4 py-2 data-[state=active]:border-primary data-[state=active]:text-primary"
                  >
                    {competition.shortTitle}
                  </TabsTrigger>
                ))}
              </TabsList>

              {competitionTabs.map((competition) => (
                <TabsContent
                  key={competition.slug}
                  value={competition.slug}
                  className="space-y-6"
                >
                  <Card className="border-border/60 shadow-soft">
                    <CardHeader>
                      <CardTitle className="font-display text-2xl text-primary">
                        {competition.title}
                      </CardTitle>
                      <CardDescription>
                        Category overview for {competition.shortTitle}.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {Object.entries(categoryCounts).length ? (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          {Object.entries(categoryCounts)
                            .sort(([, leftCount], [, rightCount]) => rightCount - leftCount)
                            .map(([category, count]) => {
                              const paidCount = selectedCompetitionApplications.filter(
                                (application) =>
                                  (application.category || "Unspecified") === category &&
                                  application.payment_status === "paid"
                              ).length;

                              return (
                                <div
                                  key={category}
                                  className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                                >
                                  <p className="text-xs uppercase tracking-[0.24em] text-rose-gold mb-2">
                                    Category
                                  </p>
                                  <h3 className="font-semibold text-primary mb-2">{category}</h3>
                                  <p className="text-3xl font-bold text-primary">{count}</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {paidCount} paid
                                  </p>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          No applications have been submitted for this competition yet.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 shadow-soft">
                    <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <CardTitle className="font-display text-2xl text-primary">
                          Participant list
                        </CardTitle>
                        <CardDescription>
                          Review applicants, track payment, and update notes.
                        </CardDescription>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="relative md:col-span-2 xl:col-span-2">
                          <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            className="pl-9"
                            placeholder="Search name, code, email, phone..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                          />
                        </div>
                        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Payment status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All payments</SelectItem>
                            {paymentStatusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
                            {Object.keys(categoryCounts)
                              .sort((left, right) => left.localeCompare(right))
                              .map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Applicant</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Review</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {visibleApplications.length ? (
                            visibleApplications.map((application) => (
                              <TableRow key={application.id}>
                                <TableCell>
                                  <div className="space-y-1">
                                    <p className="font-semibold text-primary">
                                      {getApplicantName(application)}
                                    </p>
                                    {getBusinessName(application) ? (
                                      <p className="text-xs text-muted-foreground">
                                        {getBusinessName(application)}
                                      </p>
                                    ) : null}
                                    <p className="text-xs text-muted-foreground">
                                      {application.application_code}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>{application.category || "Unspecified"}</TableCell>
                                <TableCell>
                                  <div className="space-y-1 text-sm">
                                    <p>{application.email}</p>
                                    <p className="text-muted-foreground">
                                      {application.phone}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-2">
                                    <Badge variant={getBadgeVariant(application.payment_status)}>
                                      {formatStatusLabel(application.payment_status)}
                                    </Badge>
                                    {application.payment_reference ? (
                                      <p className="text-xs text-muted-foreground">
                                        Ref: {application.payment_reference}
                                      </p>
                                    ) : null}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={getBadgeVariant(application.review_status)}>
                                    {formatStatusLabel(application.review_status)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {format(new Date(application.created_at), "MMM d, yyyy")}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex flex-wrap justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openApplication(application)}
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      Review
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant={
                                        application.payment_status === "paid"
                                          ? "outline"
                                          : "hero"
                                      }
                                      onClick={() => void handleQuickMarkPaid(application)}
                                    >
                                      {application.payment_status === "paid"
                                        ? "Set Pending"
                                        : "Mark Paid"}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                className="py-12 text-center text-muted-foreground"
                              >
                                No participants match the current filters.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </section>

      <Dialog
        open={!!selectedApplication}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedApplication(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedApplication ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-primary">
                  {getApplicantName(selectedApplication)}
                </DialogTitle>
                <DialogDescription>
                  {getCompetitionTitle(selectedApplication.competition_slug)} ·{" "}
                  {selectedApplication.application_code}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-rose-gold mb-2">
                        Contact
                      </p>
                      {getBusinessName(selectedApplication) ? (
                        <p className="text-sm text-muted-foreground">
                          {getBusinessName(selectedApplication)}
                        </p>
                      ) : null}
                      <p className="font-semibold text-primary">{selectedApplication.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedApplication.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {[selectedApplication.city, selectedApplication.country]
                          .filter(Boolean)
                          .join(", ") || "Location not provided"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-rose-gold mb-2">
                        Competition
                      </p>
                      <p className="font-semibold text-primary">
                        {selectedApplication.category || "Unspecified category"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Submitted {format(new Date(selectedApplication.created_at), "PPP p")}
                      </p>
                      {selectedApplication.paid_at ? (
                        <p className="text-sm text-muted-foreground">
                          Paid {format(new Date(selectedApplication.paid_at), "PPP p")}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {selectedApplication.motivation ? (
                    <div className="rounded-2xl border border-border/60 p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-rose-gold mb-2">
                        Motivation
                      </p>
                      <p className="text-sm leading-7 text-foreground">
                        {selectedApplication.motivation}
                      </p>
                    </div>
                  ) : null}

                  <div className="rounded-2xl border border-border/60 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-rose-gold mb-4">
                      Submitted details
                    </p>
                    {payloadEntries.length ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        {payloadEntries.map(([key, value]) => (
                          <div
                            key={key}
                            className="rounded-xl border border-border/50 bg-muted/20 p-3"
                          >
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1">
                              {formatJsonKeyLabel(key)}
                            </p>
                            <p className="text-sm text-foreground break-words">
                              {typeof value === "boolean"
                                ? value
                                  ? "Yes"
                                  : "No"
                                : value === null || value === ""
                                  ? "Not provided"
                                  : String(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No extra payload fields were stored for this application.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-5 rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
                  <div>
                    <Label htmlFor="dashboardPaymentStatus">Payment status</Label>
                    <Select value={paymentStatusDraft} onValueChange={setPaymentStatusDraft}>
                      <SelectTrigger id="dashboardPaymentStatus" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dashboardPaymentReference">Payment reference</Label>
                    <Input
                      id="dashboardPaymentReference"
                      className="mt-2"
                      value={paymentReferenceDraft}
                      onChange={(event) => setPaymentReferenceDraft(event.target.value)}
                      placeholder="Ayati order ref, phone ref, cash note..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="dashboardPaymentAmount">Payment amount</Label>
                    <Input
                      id="dashboardPaymentAmount"
                      type="number"
                      className="mt-2"
                      value={paymentAmountDraft}
                      onChange={(event) => setPaymentAmountDraft(event.target.value)}
                      placeholder="15000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dashboardReviewStatus">Review status</Label>
                    <Select value={reviewStatusDraft} onValueChange={setReviewStatusDraft}>
                      <SelectTrigger id="dashboardReviewStatus" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reviewStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dashboardReviewNotes">Internal notes</Label>
                    <Textarea
                      id="dashboardReviewNotes"
                      className="mt-2 min-h-[140px]"
                      value={reviewNotesDraft}
                      onChange={(event) => setReviewNotesDraft(event.target.value)}
                      placeholder="Add internal review notes, follow-up details, or payment comments..."
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedApplication(null)}
                  disabled={isSaving}
                >
                  Close
                </Button>
                <Button
                  variant="hero"
                  onClick={() => void handleSaveApplication()}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ParticipantsDashboardPage;
