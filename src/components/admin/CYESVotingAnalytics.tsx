import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CYESAwardCategory, CYESAwardNominee } from "@/integrations/supabase/services";
import { useToast } from "@/hooks/use-toast";
import { fetchCyesVotingDashboard } from "@/lib/dashboard-admin";
import { Award, BarChart3, Loader2, RefreshCw, Search, Trophy, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type CYESVotingAnalyticsProps = {
  accessKey: string;
};

type NomineeAnalyticsRow = CYESAwardNominee & {
  categoryName: string;
};

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

const getTopCategoryName = (categories: CYESAwardCategory[]) =>
  [...categories].sort((left, right) => right.vote_count - left.vote_count)[0]?.name || "No votes yet";

const getCategoryShare = (votes: number, totalVotes: number) =>
  totalVotes ? `${((votes / totalVotes) * 100).toFixed(1)}%` : "0%";

const flattenNominees = (categories: CYESAwardCategory[]) =>
  categories.flatMap((category) =>
    category.nominees.map((nominee) => ({
      ...nominee,
      categoryName: category.name,
    }))
  );

export const CYESVotingAnalytics = ({ accessKey }: CYESVotingAnalyticsProps) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CYESAwardCategory[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadAnalytics = useCallback(async () => {
    if (!accessKey) return;

    setIsLoading(true);
    try {
      const voting = await fetchCyesVotingDashboard(accessKey);
      setCategories(voting.categories);
      setTotalVotes(voting.total_votes);
    } catch (error) {
      toast({
        title: "Vote analytics unavailable",
        description:
          error instanceof Error
            ? error.message
            : "Could not load CYES voting analytics.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessKey, toast]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const analytics = useMemo(() => {
    const openCategories = categories.filter(
      (category) => category.status === "active" && category.voting_enabled
    ).length;
    const nominees = flattenNominees(categories);
    const activeNominees = nominees.filter((nominee) => nominee.status === "active").length;
    const query = searchQuery.trim().toLowerCase();
    const filteredNominees = nominees.filter((nominee) => {
      const haystack = [nominee.name, nominee.organization || "", nominee.categoryName]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });

    return {
      openCategories,
      activeNominees,
      topCategoryName: getTopCategoryName(categories),
      topCategories: [...categories]
        .sort((left, right) => right.vote_count - left.vote_count)
        .slice(0, 10),
      topNominees: filteredNominees
        .sort((left, right) => right.vote_count - left.vote_count)
        .slice(0, 20) as NomineeAnalyticsRow[],
    };
  }, [categories, searchQuery]);

  return (
    <Card className="border-border/60 shadow-soft">
      <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle className="font-display text-2xl text-primary">
            CYES Vote Analytics
          </CardTitle>
          <CardDescription>
            Track total votes, top categories, and the leading nominees from the admin panel.
          </CardDescription>
        </div>
        <Button type="button" variant="outline" onClick={() => void loadAnalytics()} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh analytics
        </Button>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total votes</p>
                <p className="text-3xl font-semibold text-primary">{formatNumber(totalVotes)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-rose-gold" />
              <div>
                <p className="text-sm text-muted-foreground">Open categories</p>
                <p className="text-3xl font-semibold text-primary">{analytics.openCategories}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active nominees</p>
                <p className="text-3xl font-semibold text-primary">{analytics.activeNominees}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-muted-foreground">Top category</p>
                <p className="text-lg font-semibold leading-tight text-primary">{analytics.topCategoryName}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-3xl border border-border/60 p-5">
            <div className="mb-5">
              <h3 className="font-display text-xl text-primary">Top categories</h3>
              <p className="text-sm text-muted-foreground">
                Share is calculated against all recorded CYES votes.
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Votes</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topCategories.length ? (
                  analytics.topCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-primary">{category.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {category.nominees.length} nominees
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatNumber(category.vote_count)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {getCategoryShare(category.vote_count, totalVotes)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      No category votes yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-3xl border border-border/60 p-5">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="font-display text-xl text-primary">Top nominees</h3>
                <p className="text-sm text-muted-foreground">
                  Search by nominee, organization, or category.
                </p>
              </div>
              <div className="relative lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search nominees..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nominee</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Votes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topNominees.length ? (
                  analytics.topNominees.map((nominee) => (
                    <TableRow key={nominee.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-primary">{nominee.name}</p>
                          {nominee.organization ? (
                            <p className="text-xs text-muted-foreground">{nominee.organization}</p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {nominee.categoryName}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatNumber(nominee.vote_count)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      No nominees match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
