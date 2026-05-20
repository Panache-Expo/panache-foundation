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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  PanacheDorAwardCategory,
  PanacheDorAwardNominee,
} from "@/integrations/supabase/services";
import { useToast } from "@/hooks/use-toast";
import {
  createPanacheDorVotingCategory,
  createPanacheDorVotingNominee,
  fetchPanacheDorVotingDashboard,
  importPanacheDorNomineesCsv,
  syncPanacheDorCliqVotesCounts,
  updatePanacheDorVotingCategory,
  updatePanacheDorVotingNominee,
  uploadPanacheDorVotingNomineePhoto,
} from "@/lib/dashboard-admin";
import {
  BarChart3,
  ExternalLink,
  FileSpreadsheet,
  ImagePlus,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Upload,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type PanacheDorVotingDashboardProps = {
  accessKey: string;
};

type CategoryDraft = {
  slug: string;
  name: string;
  description: string;
  status: string;
  sort_order: string;
};

type NomineeDraft = {
  category_id: string;
  slug: string;
  name: string;
  organization: string;
  bio: string;
  photo_url: string;
  status: string;
  sort_order: string;
  ayati_vote_url: string;
  ayati_sync_id: string;
};

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
] as const;

const NOMINEE_PHOTO_MAX_BYTES = 3 * 1024 * 1024;
const nomineePhotoTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const csvTemplate =
  "category,name,organization,bio,photo_url,vote_url,vote_provider_sync_id,status,sort_order\n" +
  "Makeup Artist of the Year,Example Nominee,Example Studio,Short bio,https://example.com/photo.jpg,https://cliqvotes.com/panache-dor-awards/category/category-id?artist=artist-id,artist-id,active,10";

const emptyCategoryDraft = (): CategoryDraft => ({
  slug: "",
  name: "",
  description: "",
  status: "active",
  sort_order: "0",
});

const emptyNomineeDraft = (categoryId = ""): NomineeDraft => ({
  category_id: categoryId,
  slug: "",
  name: "",
  organization: "",
  bio: "",
  photo_url: "",
  status: "draft",
  sort_order: "0",
  ayati_vote_url: "",
  ayati_sync_id: "",
});

const toSortOrder = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const categoryToDraft = (category: PanacheDorAwardCategory): CategoryDraft => ({
  slug: category.slug,
  name: category.name,
  description: category.description || "",
  status: category.status,
  sort_order: String(category.sort_order ?? 0),
});

const nomineeToDraft = (nominee: PanacheDorAwardNominee): NomineeDraft => ({
  category_id: nominee.category_id,
  slug: nominee.slug,
  name: nominee.name,
  organization: nominee.organization || "",
  bio: nominee.bio || "",
  photo_url: nominee.photo_url || "",
  status: nominee.status,
  sort_order: String(nominee.sort_order ?? 0),
  ayati_vote_url: nominee.ayati_vote_url || "",
  ayati_sync_id: nominee.ayati_sync_id || "",
});

const readFileAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.readAsDataURL(file);
  });

const readFileAsText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read CSV file."));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsText(file);
  });

const statusBadgeVariant = (status: string) => {
  if (status === "active") {
    return "default";
  }
  if (status === "archived") {
    return "secondary";
  }
  return "outline";
};

export const PanacheDorVotingDashboard = ({
  accessKey,
}: PanacheDorVotingDashboardProps) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<PanacheDorAwardCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedNomineeId, setSelectedNomineeId] = useState("");
  const [categoryDraft, setCategoryDraft] = useState(emptyCategoryDraft);
  const [newCategoryDraft, setNewCategoryDraft] = useState(emptyCategoryDraft);
  const [nomineeDraft, setNomineeDraft] = useState(() => emptyNomineeDraft());
  const [newNomineeDraft, setNewNomineeDraft] = useState(() =>
    emptyNomineeDraft()
  );
  const [csvText, setCsvText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isSavingNominee, setIsSavingNominee] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const [isSyncingCliqVotes, setIsSyncingCliqVotes] = useState(false);
  const [countsAvailable, setCountsAvailable] = useState(false);
  const [voteProviderSyncConfigured, setVoteProviderSyncConfigured] =
    useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId
  );
  const selectedNominee = selectedCategory?.nominees.find(
    (nominee) => nominee.id === selectedNomineeId
  );

  const totals = useMemo(() => {
    const nomineeCount = categories.reduce(
      (sum, category) => sum + category.nominees.length,
      0
    );
    const activeNominees = categories.reduce(
      (sum, category) =>
        sum + category.nominees.filter((nominee) => nominee.status === "active").length,
      0
    );
    const linkedNominees = categories.reduce(
      (sum, category) =>
        sum +
        category.nominees.filter((nominee) =>
          Boolean(nominee.vote_url || nominee.ayati_vote_url)
        )
          .length,
      0
    );

    return {
      categories: categories.length,
      nomineeCount,
      activeNominees,
      linkedNominees,
    };
  }, [categories]);

  const loadVoting = useCallback(async () => {
    if (!accessKey) {
      return;
    }

    setIsLoading(true);
    try {
      const voting = await fetchPanacheDorVotingDashboard(accessKey);
      setCategories(voting.categories);
      setCountsAvailable(voting.counts_available);
      setVoteProviderSyncConfigured(
        Boolean(voting.vote_provider_sync_configured ?? voting.ayati_sync_configured)
      );
      setLastSyncedAt(voting.last_synced_at || null);
      setSelectedCategoryId((currentCategoryId) => {
        const nextCategory =
          voting.categories.find((category) => category.id === currentCategoryId) ||
          voting.categories[0];
        return nextCategory?.id || "";
      });
    } catch (error) {
      toast({
        title: "Panache D'or voting unavailable",
        description:
          error instanceof Error
            ? error.message
            : "Could not load nominees.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessKey, toast]);

  useEffect(() => {
    void loadVoting();
  }, [loadVoting]);

  useEffect(() => {
    if (!selectedCategory) {
      setCategoryDraft(emptyCategoryDraft());
      setNewNomineeDraft(emptyNomineeDraft(""));
      return;
    }

    setCategoryDraft(categoryToDraft(selectedCategory));
    setNewNomineeDraft((current) => ({
      ...current,
      category_id: selectedCategory.id,
    }));
    const nextNominee =
      selectedCategory.nominees.find((nominee) => nominee.id === selectedNomineeId) ||
      selectedCategory.nominees[0];
    setSelectedNomineeId(nextNominee?.id || "");
  }, [selectedCategory, selectedNomineeId]);

  useEffect(() => {
    if (!selectedNominee) {
      setNomineeDraft(emptyNomineeDraft(selectedCategoryId));
      return;
    }

    setNomineeDraft(nomineeToDraft(selectedNominee));
  }, [selectedNominee, selectedCategoryId]);

  const refreshFromVoting = (voting: {
    categories: PanacheDorAwardCategory[];
    counts_available?: boolean;
    vote_provider_sync_configured?: boolean;
    ayati_sync_configured?: boolean;
    last_synced_at?: string | null;
  }) => {
    setCategories(voting.categories);
    if (typeof voting.counts_available === "boolean") {
      setCountsAvailable(voting.counts_available);
    }
    setVoteProviderSyncConfigured(
      Boolean(voting.vote_provider_sync_configured ?? voting.ayati_sync_configured)
    );
    setLastSyncedAt(voting.last_synced_at || null);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryDraft.name.trim()) {
      toast({
        title: "Category name required",
        description: "Add a category name before creating it.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingCategory(true);
    try {
      const result = await createPanacheDorVotingCategory(accessKey, {
        slug: newCategoryDraft.slug.trim() || undefined,
        name: newCategoryDraft.name.trim(),
        description: newCategoryDraft.description.trim() || null,
        status: newCategoryDraft.status,
        sort_order: toSortOrder(newCategoryDraft.sort_order),
      });
      refreshFromVoting(result.voting);
      setNewCategoryDraft(emptyCategoryDraft());
      toast({
        title: "Category created",
        description: "Panache D'or nominees can now be added here.",
      });
    } catch (error) {
      toast({
        title: "Could not create category",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!selectedCategory) {
      return;
    }

    setIsSavingCategory(true);
    try {
      const result = await updatePanacheDorVotingCategory(
        accessKey,
        selectedCategory.id,
        {
          slug: categoryDraft.slug.trim(),
          name: categoryDraft.name.trim(),
          description: categoryDraft.description.trim() || null,
          status: categoryDraft.status,
          sort_order: toSortOrder(categoryDraft.sort_order),
        }
      );
      refreshFromVoting(result.voting);
      toast({
        title: "Category saved",
        description: "Panache D'or category details were updated.",
      });
    } catch (error) {
      toast({
        title: "Could not save category",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleCreateNominee = async () => {
    if (!newNomineeDraft.category_id || !newNomineeDraft.name.trim()) {
      toast({
        title: "Nominee details required",
        description: "Choose a category and add the nominee name.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingNominee(true);
    try {
      const result = await createPanacheDorVotingNominee(accessKey, {
        category_id: newNomineeDraft.category_id,
        slug: newNomineeDraft.slug.trim() || undefined,
        name: newNomineeDraft.name.trim(),
        organization: newNomineeDraft.organization.trim() || null,
        bio: newNomineeDraft.bio.trim() || null,
        photo_url: newNomineeDraft.photo_url.trim() || null,
        status: newNomineeDraft.status,
        sort_order: toSortOrder(newNomineeDraft.sort_order),
        ayati_vote_url: newNomineeDraft.ayati_vote_url.trim() || null,
        ayati_sync_id: newNomineeDraft.ayati_sync_id.trim() || null,
      });
      refreshFromVoting(result.voting);
      setNewNomineeDraft(emptyNomineeDraft(newNomineeDraft.category_id));
      toast({
        title: "Nominee created",
        description: "The nominee is ready for review or publishing.",
      });
    } catch (error) {
      toast({
        title: "Could not create nominee",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingNominee(false);
    }
  };

  const handleSaveNominee = async (forcedStatus?: string) => {
    if (!selectedNominee) {
      return;
    }

    setIsSavingNominee(true);
    try {
      const result = await updatePanacheDorVotingNominee(
        accessKey,
        selectedNominee.id,
        {
          category_id: nomineeDraft.category_id,
          slug: nomineeDraft.slug.trim(),
          name: nomineeDraft.name.trim(),
          organization: nomineeDraft.organization.trim() || null,
          bio: nomineeDraft.bio.trim() || null,
          photo_url: nomineeDraft.photo_url.trim() || null,
          status: forcedStatus || nomineeDraft.status,
          sort_order: toSortOrder(nomineeDraft.sort_order),
          ayati_vote_url: nomineeDraft.ayati_vote_url.trim() || null,
          ayati_sync_id: nomineeDraft.ayati_sync_id.trim() || null,
        }
      );
      refreshFromVoting(result.voting);
      toast({
        title: forcedStatus === "archived" ? "Nominee archived" : "Nominee saved",
        description: "Panache D'or nominee details were updated.",
      });
    } catch (error) {
      toast({
        title: "Could not save nominee",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingNominee(false);
    }
  };

  const handleUploadNomineePhoto = async (
    file: File | undefined,
    target: "existing" | "new"
  ) => {
    if (!file) {
      return;
    }
    if (!nomineePhotoTypes.has(file.type)) {
      toast({
        title: "Unsupported image",
        description: "Upload a JPG, PNG, WEBP, or GIF image.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > NOMINEE_PHOTO_MAX_BYTES) {
      toast({
        title: "Image too large",
        description: "Upload an image under 3 MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const base64 = await readFileAsBase64(file);
      const upload = await uploadPanacheDorVotingNomineePhoto(accessKey, {
        fileName: file.name,
        contentType: file.type,
        base64,
      });

      if (target === "existing") {
        setNomineeDraft((current) => ({
          ...current,
          photo_url: upload.photoUrl,
        }));
      } else {
        setNewNomineeDraft((current) => ({
          ...current,
          photo_url: upload.photoUrl,
        }));
      }

      toast({
        title: "Photo uploaded",
        description: "The nominee photo is ready to save.",
      });
    } catch (error) {
      toast({
        title: "Could not upload photo",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleImportCsv = async () => {
    if (!csvText.trim()) {
      toast({
        title: "CSV required",
        description: "Paste or upload a nominee CSV first.",
        variant: "destructive",
      });
      return;
    }

    setIsImportingCsv(true);
    try {
      const result = await importPanacheDorNomineesCsv(accessKey, csvText);
      refreshFromVoting(result.voting);
      toast({
        title: "CSV import complete",
        description: `${result.importSummary?.imported || 0} nominees imported. ${
          result.importSummary?.failed || 0
        } rows failed.`,
        variant: result.importSummary?.failed ? "destructive" : "default",
      });
    } catch (error) {
      toast({
        title: "Could not import CSV",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImportingCsv(false);
    }
  };

  const handleSyncCliqVotes = async () => {
    setIsSyncingCliqVotes(true);
    try {
      const result = await syncPanacheDorCliqVotesCounts(accessKey);
      refreshFromVoting(result.voting);
      if (result.syncSummary?.synced_at) {
        setLastSyncedAt(result.syncSummary.synced_at);
        setCountsAvailable(true);
      }
      toast({
        title: result.syncSummary?.configured
          ? "CliqVotes sync complete"
          : "CliqVotes sync not configured",
        description:
          result.syncSummary?.message ||
          "No CliqVotes count source is configured yet.",
        variant: result.syncSummary?.configured ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Could not sync CliqVotes counts",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncingCliqVotes(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-soft">
      <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle className="font-display text-2xl text-primary">
            Panache D&apos;or Voting
          </CardTitle>
          <CardDescription>
            Manage nominee pages and CliqVotes voting links. Counts are official only
            after CliqVotes sync completes.
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleSyncCliqVotes()}
            disabled={isSyncingCliqVotes}
          >
            {isSyncingCliqVotes ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="mr-2 h-4 w-4" />
            )}
            Sync CliqVotes counts
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadVoting()}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">Categories</p>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {totals.categories}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">Nominees</p>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {totals.nomineeCount}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">Active nominees</p>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {totals.activeNominees}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">CliqVotes links</p>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {totals.linkedNominees}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-primary">Official count status</p>
              <p className="text-sm text-muted-foreground">
                {countsAvailable
                  ? `Counts are available. Last sync: ${lastSyncedAt || "unknown"}`
                  : voteProviderSyncConfigured
                  ? "CliqVotes source is configured, but no counts have synced yet."
                  : "CliqVotes sync is not configured, so public vote counts stay hidden."}
              </p>
            </div>
            <Badge variant={countsAvailable ? "default" : "outline"}>
              {countsAvailable ? "Counts visible" : "Counts hidden"}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.44fr_0.56fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-border/60 p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl text-primary">Categories</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep award categories organized for public filters.
                  </p>
                </div>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              </div>

              <div className="space-y-4">
                <Label htmlFor="panacheDorCategorySelect">Category</Label>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger id="panacheDorCategorySelect">
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedCategory ? (
                  <div className="space-y-3 rounded-2xl bg-muted/20 p-4">
                    <Input
                      placeholder="Slug"
                      value={categoryDraft.slug}
                      onChange={(event) =>
                        setCategoryDraft((current) => ({
                          ...current,
                          slug: event.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Category name"
                      value={categoryDraft.name}
                      onChange={(event) =>
                        setCategoryDraft((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                    />
                    <Textarea
                      placeholder="Description"
                      value={categoryDraft.description}
                      onChange={(event) =>
                        setCategoryDraft((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                    />
                    <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                      <Select
                        value={categoryDraft.status}
                        onValueChange={(value) =>
                          setCategoryDraft((current) => ({
                            ...current,
                            status: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={categoryDraft.sort_order}
                        onChange={(event) =>
                          setCategoryDraft((current) => ({
                            ...current,
                            sort_order: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="hero"
                      onClick={() => void handleSaveCategory()}
                      disabled={isSavingCategory}
                    >
                      {isSavingCategory ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Category
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-border p-5">
              <h3 className="font-display text-xl text-primary">New category</h3>
              <div className="mt-4 space-y-3">
                <Input
                  placeholder="Slug, optional"
                  value={newCategoryDraft.slug}
                  onChange={(event) =>
                    setNewCategoryDraft((current) => ({
                      ...current,
                      slug: event.target.value,
                    }))
                  }
                />
                <Input
                  placeholder="Category name"
                  value={newCategoryDraft.name}
                  onChange={(event) =>
                    setNewCategoryDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
                <Textarea
                  placeholder="Description"
                  value={newCategoryDraft.description}
                  onChange={(event) =>
                    setNewCategoryDraft((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleCreateCategory()}
                  disabled={isSavingCategory}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Category
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 p-5">
              <div className="mb-4 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <h3 className="font-display text-xl text-primary">CSV import</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Use columns like category, name, organization, bio, photo_url,
                vote_url is optional, so you can publish nominees first
                and attach vote links later.
              </p>
              <div className="mt-4 space-y-3">
                <Input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) {
                      setCsvText(await readFileAsText(file));
                    }
                  }}
                />
                <Textarea
                  className="min-h-[12rem] font-mono text-xs"
                  value={csvText}
                  onChange={(event) => setCsvText(event.target.value)}
                  placeholder={csvTemplate}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCsvText(csvTemplate)}
                  >
                    Use template
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleImportCsv()}
                    disabled={isImportingCsv}
                  >
                    {isImportingCsv ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Import CSV
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-border/60 p-5">
              <div className="mb-5">
                <h3 className="font-display text-xl text-primary">Nominees</h3>
                <p className="text-sm text-muted-foreground">
                  CliqVotes links are optional while you prepare the directory. Public
                  pages show “vote link coming soon” until a link is added.
                </p>
              </div>

              {selectedCategory ? (
                <div className="grid gap-3">
                  {selectedCategory.nominees.length ? (
                    selectedCategory.nominees.map((nominee) => (
                      <button
                        key={nominee.id}
                        type="button"
                        className={`rounded-2xl border p-4 text-left transition-colors ${
                          nominee.id === selectedNomineeId
                            ? "border-primary bg-muted/20"
                            : "border-border/60 bg-background hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedNomineeId(nominee.id)}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                              {nominee.photo_url ? (
                                <img
                                  src={nominee.photo_url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Users className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-primary">{nominee.name}</p>
                              <p className="truncate text-sm text-muted-foreground">
                                {nominee.organization || nominee.slug}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={statusBadgeVariant(nominee.status)}>
                              {nominee.status}
                            </Badge>
                            {nominee.vote_url || nominee.ayati_vote_url ? (
                              <Badge variant="outline">CliqVotes linked</Badge>
                            ) : (
                              <Badge variant="secondary">Link pending</Badge>
                            )}
                            {countsAvailable ? (
                              <span className="text-sm text-muted-foreground">
                                {nominee.vote_count ?? nominee.ayati_vote_count} votes
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                      This category does not have nominees yet.
                    </p>
                  )}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                  Create or select a category to manage nominees.
                </p>
              )}
            </div>

            {selectedNominee ? (
              <div className="rounded-3xl border border-border/60 p-5">
                <h3 className="font-display text-xl text-primary">Edit nominee</h3>
                <div className="mt-4 grid gap-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="Slug"
                      value={nomineeDraft.slug}
                      onChange={(event) =>
                        setNomineeDraft((current) => ({
                          ...current,
                          slug: event.target.value,
                        }))
                      }
                    />
                    <Select
                      value={nomineeDraft.category_id}
                      onValueChange={(value) =>
                        setNomineeDraft((current) => ({
                          ...current,
                          category_id: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Nominee name"
                    value={nomineeDraft.name}
                    onChange={(event) =>
                      setNomineeDraft((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Business, brand, or title"
                    value={nomineeDraft.organization}
                    onChange={(event) =>
                      setNomineeDraft((current) => ({
                        ...current,
                        organization: event.target.value,
                      }))
                    }
                  />
                  <Textarea
                    placeholder="Short bio"
                    value={nomineeDraft.bio}
                    onChange={(event) =>
                      setNomineeDraft((current) => ({
                        ...current,
                        bio: event.target.value,
                      }))
                    }
                  />
                  <div className="grid gap-3 sm:grid-cols-[96px_1fr]">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-muted/30">
                      {nomineeDraft.photo_url ? (
                        <img
                          src={nomineeDraft.photo_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImagePlus className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Photo URL"
                        value={nomineeDraft.photo_url}
                        onChange={(event) =>
                          setNomineeDraft((current) => ({
                            ...current,
                            photo_url: event.target.value,
                          }))
                        }
                      />
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        disabled={isUploadingPhoto}
                        onChange={(event) => {
                          void handleUploadNomineePhoto(
                            event.target.files?.[0],
                            "existing"
                          );
                          event.target.value = "";
                        }}
                      />
                    </div>
                  </div>
                  <Input
                    placeholder="CliqVotes vote/payment link"
                    value={nomineeDraft.ayati_vote_url}
                    onChange={(event) =>
                      setNomineeDraft((current) => ({
                        ...current,
                        ayati_vote_url: event.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="CliqVotes artist id, optional"
                    value={nomineeDraft.ayati_sync_id}
                    onChange={(event) =>
                      setNomineeDraft((current) => ({
                        ...current,
                        ayati_sync_id: event.target.value,
                      }))
                    }
                  />
                  <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                    <Select
                      value={nomineeDraft.status}
                      onValueChange={(value) =>
                        setNomineeDraft((current) => ({
                          ...current,
                          status: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={nomineeDraft.sort_order}
                      onChange={(event) =>
                        setNomineeDraft((current) => ({
                          ...current,
                          sort_order: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="hero"
                      onClick={() => void handleSaveNominee()}
                      disabled={isSavingNominee}
                    >
                      {isSavingNominee ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Nominee
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleSaveNominee("archived")}
                      disabled={isSavingNominee}
                    >
                      Archive
                    </Button>
                    {selectedNominee.vote_url || selectedNominee.ayati_vote_url ? (
                      <Button asChild type="button" variant="outline">
                        <a
                          href={
                            selectedNominee.vote_url ||
                            selectedNominee.ayati_vote_url ||
                            undefined
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open CliqVotes
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="rounded-3xl border border-dashed border-border p-5">
              <h3 className="font-display text-xl text-primary">New nominee</h3>
              <div className="mt-4 grid gap-4">
                <Select
                  value={newNomineeDraft.category_id}
                  onValueChange={(value) =>
                    setNewNomineeDraft((current) => ({
                      ...current,
                      category_id: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Slug, optional"
                  value={newNomineeDraft.slug}
                  onChange={(event) =>
                    setNewNomineeDraft((current) => ({
                      ...current,
                      slug: event.target.value,
                    }))
                  }
                />
                <Input
                  placeholder="Nominee name"
                  value={newNomineeDraft.name}
                  onChange={(event) =>
                    setNewNomineeDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
                <Input
                  placeholder="Business, brand, or title"
                  value={newNomineeDraft.organization}
                  onChange={(event) =>
                    setNewNomineeDraft((current) => ({
                      ...current,
                      organization: event.target.value,
                    }))
                  }
                />
                <Textarea
                  placeholder="Short bio"
                  value={newNomineeDraft.bio}
                  onChange={(event) =>
                    setNewNomineeDraft((current) => ({
                      ...current,
                      bio: event.target.value,
                    }))
                  }
                />
                <Input
                  placeholder="Photo URL"
                  value={newNomineeDraft.photo_url}
                  onChange={(event) =>
                    setNewNomineeDraft((current) => ({
                      ...current,
                      photo_url: event.target.value,
                    }))
                  }
                />
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={isUploadingPhoto}
                  onChange={(event) => {
                    void handleUploadNomineePhoto(event.target.files?.[0], "new");
                    event.target.value = "";
                  }}
                />
                <Input
                  placeholder="CliqVotes vote/payment link"
                  value={newNomineeDraft.ayati_vote_url}
                  onChange={(event) =>
                    setNewNomineeDraft((current) => ({
                      ...current,
                      ayati_vote_url: event.target.value,
                    }))
                  }
                />
                <Input
                  placeholder="CliqVotes artist id, optional"
                  value={newNomineeDraft.ayati_sync_id}
                  onChange={(event) =>
                    setNewNomineeDraft((current) => ({
                      ...current,
                      ayati_sync_id: event.target.value,
                    }))
                  }
                />
                <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                  <Select
                    value={newNomineeDraft.status}
                    onValueChange={(value) =>
                      setNewNomineeDraft((current) => ({
                        ...current,
                        status: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={newNomineeDraft.sort_order}
                    onChange={(event) =>
                      setNewNomineeDraft((current) => ({
                        ...current,
                        sort_order: event.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleCreateNominee()}
                  disabled={isSavingNominee}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Nominee
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
