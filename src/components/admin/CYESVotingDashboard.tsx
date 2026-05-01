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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { CYESAwardCategory, CYESAwardNominee } from "@/integrations/supabase/services";
import { useToast } from "@/hooks/use-toast";
import {
  createCyesVotingCategory,
  createCyesVotingNominee,
  fetchCyesVotingDashboard,
  updateCyesVotingCategory,
  updateCyesVotingNominee,
  uploadCyesVotingNomineePhoto,
} from "@/lib/dashboard-admin";
import {
  Award,
  BarChart3,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type CYESVotingDashboardProps = {
  accessKey: string;
};

type CategoryDraft = {
  name: string;
  description: string;
  status: string;
  voting_enabled: boolean;
  sort_order: string;
};

type NomineeDraft = {
  category_id: string;
  name: string;
  organization: string;
  bio: string;
  photo_url: string;
  status: string;
  sort_order: string;
};

const emptyCategoryDraft = (): CategoryDraft => ({
  name: "",
  description: "",
  status: "active",
  voting_enabled: true,
  sort_order: "0",
});

const emptyNomineeDraft = (categoryId = ""): NomineeDraft => ({
  category_id: categoryId,
  name: "",
  organization: "",
  bio: "",
  photo_url: "",
  status: "active",
  sort_order: "0",
});

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

type NomineePhotoFieldProps = {
  id: string;
  photoUrl: string;
  isUploading: boolean;
  onPhotoUrlChange: (value: string) => void;
  onFileSelect: (file: File | undefined) => void;
};

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

const NomineePhotoField = ({
  id,
  photoUrl,
  isUploading,
  onPhotoUrlChange,
  onFileSelect,
}: NomineePhotoFieldProps) => (
  <div className="space-y-3">
    <Label htmlFor={`${id}PhotoUrl`}>Photo</Label>
    <div className="grid gap-3 sm:grid-cols-[96px_1fr]">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-muted/30">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <ImagePlus className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <div className="space-y-2">
        <Input
          id={`${id}PhotoUrl`}
          placeholder="Photo URL"
          value={photoUrl}
          onChange={(event) => onPhotoUrlChange(event.target.value)}
        />
        <div className="relative">
          <Input
            id={`${id}PhotoFile`}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={isUploading}
            onChange={(event) => {
              onFileSelect(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          {isUploading ? (
            <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG, WEBP, or GIF up to 3 MB.</p>
      </div>
    </div>
  </div>
);

const toSortOrder = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const categoryToDraft = (category: CYESAwardCategory): CategoryDraft => ({
  name: category.name,
  description: category.description || "",
  status: category.status,
  voting_enabled: category.voting_enabled,
  sort_order: String(category.sort_order ?? 0),
});

const nomineeToDraft = (nominee: CYESAwardNominee): NomineeDraft => ({
  category_id: nominee.category_id,
  name: nominee.name,
  organization: nominee.organization || "",
  bio: nominee.bio || "",
  photo_url: nominee.photo_url || "",
  status: nominee.status,
  sort_order: String(nominee.sort_order ?? 0),
});

const getStatusBadgeVariant = (status: string) => {
  if (status === "active") {
    return "default";
  }
  if (status === "archived") {
    return "secondary";
  }
  return "outline";
};

export const CYESVotingDashboard = ({ accessKey }: CYESVotingDashboardProps) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CYESAwardCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isSavingNominee, setIsSavingNominee] = useState(false);
  const [isUploadingNomineePhoto, setIsUploadingNomineePhoto] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedNomineeId, setSelectedNomineeId] = useState("");
  const [newCategoryDraft, setNewCategoryDraft] = useState(emptyCategoryDraft);
  const [categoryDraft, setCategoryDraft] = useState(emptyCategoryDraft);
  const [newNomineeDraft, setNewNomineeDraft] = useState(() => emptyNomineeDraft());
  const [nomineeDraft, setNomineeDraft] = useState(() => emptyNomineeDraft());

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
    const activeCategoryCount = categories.filter(
      (category) => category.status === "active" && category.voting_enabled
    ).length;
    const voteCount = categories.reduce(
      (sum, category) => sum + category.vote_count,
      0
    );

    return {
      activeCategoryCount,
      nomineeCount,
      voteCount,
    };
  }, [categories]);

  const loadVoting = useCallback(async () => {
    if (!accessKey) {
      return;
    }

    setIsLoading(true);
    try {
      const voting = await fetchCyesVotingDashboard(accessKey);
      setCategories(voting.categories);

      setSelectedCategoryId((currentCategoryId) => {
        const nextSelectedCategory =
          voting.categories.find((category) => category.id === currentCategoryId) ||
          voting.categories[0];
        return nextSelectedCategory?.id || "";
      });
    } catch (error) {
      toast({
        title: "CYES voting unavailable",
        description:
          error instanceof Error
            ? error.message
            : "Could not load voting categories.",
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
      const voting = await createCyesVotingCategory(accessKey, {
        name: newCategoryDraft.name.trim(),
        description: newCategoryDraft.description.trim() || null,
        status: newCategoryDraft.status,
        voting_enabled: newCategoryDraft.voting_enabled,
        sort_order: toSortOrder(newCategoryDraft.sort_order),
      });
      setCategories(voting.categories);
      const created = voting.categories.find(
        (category) => category.name === newCategoryDraft.name.trim()
      );
      setSelectedCategoryId(created?.id || selectedCategoryId);
      setNewCategoryDraft(emptyCategoryDraft());
      toast({
        title: "Category created",
        description: "The voting category is ready for nominees.",
      });
    } catch (error) {
      toast({
        title: "Could not create category",
        description:
          error instanceof Error ? error.message : "Please try again.",
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
      const voting = await updateCyesVotingCategory(accessKey, selectedCategory.id, {
        name: categoryDraft.name.trim(),
        description: categoryDraft.description.trim() || null,
        status: categoryDraft.status,
        voting_enabled: categoryDraft.voting_enabled,
        sort_order: toSortOrder(categoryDraft.sort_order),
      });
      setCategories(voting.categories);
      toast({
        title: "Category saved",
        description: "Voting category details were updated.",
      });
    } catch (error) {
      toast({
        title: "Could not save category",
        description:
          error instanceof Error ? error.message : "Please try again.",
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
      const voting = await createCyesVotingNominee(accessKey, {
        category_id: newNomineeDraft.category_id,
        name: newNomineeDraft.name.trim(),
        organization: newNomineeDraft.organization.trim() || null,
        bio: newNomineeDraft.bio.trim() || null,
        photo_url: newNomineeDraft.photo_url.trim() || null,
        status: newNomineeDraft.status,
        sort_order: toSortOrder(newNomineeDraft.sort_order),
      });
      setCategories(voting.categories);
      setNewNomineeDraft(emptyNomineeDraft(newNomineeDraft.category_id));
      toast({
        title: "Nominee created",
        description: "The nominee now appears in the selected category.",
      });
    } catch (error) {
      toast({
        title: "Could not create nominee",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingNominee(false);
    }
  };

  const handleSaveNominee = async () => {
    if (!selectedNominee) {
      return;
    }

    setIsSavingNominee(true);
    try {
      const voting = await updateCyesVotingNominee(accessKey, selectedNominee.id, {
        category_id: nomineeDraft.category_id,
        name: nomineeDraft.name.trim(),
        organization: nomineeDraft.organization.trim() || null,
        bio: nomineeDraft.bio.trim() || null,
        photo_url: nomineeDraft.photo_url.trim() || null,
        status: nomineeDraft.status,
        sort_order: toSortOrder(nomineeDraft.sort_order),
      });
      setCategories(voting.categories);
      toast({
        title: "Nominee saved",
        description: "Nominee details were updated.",
      });
    } catch (error) {
      toast({
        title: "Could not save nominee",
        description:
          error instanceof Error ? error.message : "Please try again.",
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

    setIsUploadingNomineePhoto(true);
    try {
      const base64 = await readFileAsBase64(file);
      const upload = await uploadCyesVotingNomineePhoto(accessKey, {
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
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingNomineePhoto(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-soft">
      <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle className="font-display text-2xl text-primary">
            CYES Awards Voting
          </CardTitle>
          <CardDescription>
            Create categories, manage nominees, and monitor voting totals.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void loadVoting()}
          disabled={isLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Voting
        </Button>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Open categories</p>
                <p className="text-2xl font-semibold text-primary">
                  {totals.activeCategoryCount}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-rose-gold" />
              <div>
                <p className="text-sm text-muted-foreground">Nominees</p>
                <p className="text-2xl font-semibold text-primary">
                  {totals.nomineeCount}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Votes recorded</p>
                <p className="text-2xl font-semibold text-primary">
                  {totals.voteCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-border/60 p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-xl text-primary">Categories</h3>
                <p className="text-sm text-muted-foreground">
                  Select an existing category or add a new one.
                </p>
              </div>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : null}
            </div>

            <div className="space-y-5">
              <div>
                <Label htmlFor="cyesVotingCategorySelect">Category</Label>
                <Select
                  value={selectedCategoryId}
                  onValueChange={setSelectedCategoryId}
                >
                  <SelectTrigger id="cyesVotingCategorySelect" className="mt-2">
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
              </div>

              {selectedCategory ? (
                <div className="space-y-4 rounded-2xl bg-muted/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge variant={getStatusBadgeVariant(selectedCategory.status)}>
                      {selectedCategory.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {selectedCategory.vote_count} votes
                    </span>
                  </div>
                  <div>
                    <Label htmlFor="cyesVotingCategoryName">Name</Label>
                    <Input
                      id="cyesVotingCategoryName"
                      className="mt-2"
                      value={categoryDraft.name}
                      onChange={(event) =>
                        setCategoryDraft((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="cyesVotingCategoryDescription">Description</Label>
                    <Textarea
                      id="cyesVotingCategoryDescription"
                      className="mt-2"
                      value={categoryDraft.description}
                      onChange={(event) =>
                        setCategoryDraft((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-[1fr_120px]">
                    <div>
                      <Label htmlFor="cyesVotingCategoryStatus">Status</Label>
                      <Select
                        value={categoryDraft.status}
                        onValueChange={(value) =>
                          setCategoryDraft((current) => ({
                            ...current,
                            status: value,
                          }))
                        }
                      >
                        <SelectTrigger id="cyesVotingCategoryStatus" className="mt-2">
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
                    </div>
                    <div>
                      <Label htmlFor="cyesVotingCategorySort">Order</Label>
                      <Input
                        id="cyesVotingCategorySort"
                        type="number"
                        className="mt-2"
                        value={categoryDraft.sort_order}
                        onChange={(event) =>
                          setCategoryDraft((current) => ({
                            ...current,
                            sort_order: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background p-4">
                    <div>
                      <p className="font-medium text-primary">Voting enabled</p>
                      <p className="text-sm text-muted-foreground">
                        Active categories appear on the public voting page.
                      </p>
                    </div>
                    <Switch
                      checked={categoryDraft.voting_enabled}
                      onCheckedChange={(checked) =>
                        setCategoryDraft((current) => ({
                          ...current,
                          voting_enabled: checked,
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
              ) : (
                <p className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                  No voting categories have been created yet.
                </p>
              )}

              <div className="space-y-4 rounded-2xl border border-dashed border-border p-4">
                <h4 className="font-semibold text-primary">New category</h4>
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
                  placeholder="Short category description"
                  value={newCategoryDraft.description}
                  onChange={(event) =>
                    setNewCategoryDraft((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
                <div className="grid gap-4 md:grid-cols-[1fr_120px]">
                  <Select
                    value={newCategoryDraft.status}
                    onValueChange={(value) =>
                      setNewCategoryDraft((current) => ({
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
                    value={newCategoryDraft.sort_order}
                    onChange={(event) =>
                      setNewCategoryDraft((current) => ({
                        ...current,
                        sort_order: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-muted/20 p-4">
                  <span className="text-sm font-medium text-primary">Voting enabled</span>
                  <Switch
                    checked={newCategoryDraft.voting_enabled}
                    onCheckedChange={(checked) =>
                      setNewCategoryDraft((current) => ({
                        ...current,
                        voting_enabled: checked,
                      }))
                    }
                  />
                </div>
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
          </div>

          <div className="rounded-3xl border border-border/60 p-5">
            <div className="mb-5">
              <h3 className="font-display text-xl text-primary">Nominees</h3>
              <p className="text-sm text-muted-foreground">
                Add nominees and keep their display details current.
              </p>
            </div>

            <div className="space-y-5">
              {selectedCategory ? (
                <div className="rounded-2xl bg-muted/20 p-4">
                  <div className="mb-4 flex items-center gap-2 text-sm text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    {selectedCategory.name}
                  </div>
                  <div className="grid gap-3">
                    {selectedCategory.nominees.length ? (
                      selectedCategory.nominees.map((nominee) => (
                        <button
                          key={nominee.id}
                          type="button"
                          className={`rounded-2xl border p-4 text-left transition-colors ${
                            nominee.id === selectedNomineeId
                              ? "border-primary bg-background"
                              : "border-border/60 bg-background/70 hover:border-primary/50"
                          }`}
                          onClick={() => setSelectedNomineeId(nominee.id)}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-primary">{nominee.name}</p>
                              {nominee.organization ? (
                                <p className="text-sm text-muted-foreground">
                                  {nominee.organization}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusBadgeVariant(nominee.status)}>
                                {nominee.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {nominee.vote_count} votes
                              </span>
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
                </div>
              ) : null}

              {selectedNominee ? (
                <div className="space-y-4 rounded-2xl border border-border/60 p-4">
                  <h4 className="font-semibold text-primary">Edit nominee</h4>
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
                    placeholder="Business, organization, or title"
                    value={nomineeDraft.organization}
                    onChange={(event) =>
                      setNomineeDraft((current) => ({
                        ...current,
                        organization: event.target.value,
                      }))
                    }
                  />
                  <Textarea
                    placeholder="Short nominee bio"
                    value={nomineeDraft.bio}
                    onChange={(event) =>
                      setNomineeDraft((current) => ({
                        ...current,
                        bio: event.target.value,
                      }))
                    }
                  />
                  <NomineePhotoField
                    id="cyesVotingEditNominee"
                    photoUrl={nomineeDraft.photo_url}
                    isUploading={isUploadingNomineePhoto}
                    onPhotoUrlChange={(value) =>
                      setNomineeDraft((current) => ({
                        ...current,
                        photo_url: value,
                      }))
                    }
                    onFileSelect={(file) =>
                      void handleUploadNomineePhoto(file, "existing")
                    }
                  />
                  <div className="grid gap-4 md:grid-cols-[1fr_120px]">
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
                </div>
              ) : null}

              <div className="space-y-4 rounded-2xl border border-dashed border-border p-4">
                <h4 className="font-semibold text-primary">New nominee</h4>
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
                  placeholder="Business, organization, or title"
                  value={newNomineeDraft.organization}
                  onChange={(event) =>
                    setNewNomineeDraft((current) => ({
                      ...current,
                      organization: event.target.value,
                    }))
                  }
                />
                <Textarea
                  placeholder="Short nominee bio"
                  value={newNomineeDraft.bio}
                  onChange={(event) =>
                    setNewNomineeDraft((current) => ({
                      ...current,
                      bio: event.target.value,
                    }))
                  }
                />
                <NomineePhotoField
                  id="cyesVotingNewNominee"
                  photoUrl={newNomineeDraft.photo_url}
                  isUploading={isUploadingNomineePhoto}
                  onPhotoUrlChange={(value) =>
                    setNewNomineeDraft((current) => ({
                      ...current,
                      photo_url: value,
                    }))
                  }
                  onFileSelect={(file) => void handleUploadNomineePhoto(file, "new")}
                />
                <div className="grid gap-4 md:grid-cols-[1fr_120px]">
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
