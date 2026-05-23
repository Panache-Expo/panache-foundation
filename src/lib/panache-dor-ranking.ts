import type {
  PanacheDorAwardCategory,
  PanacheDorAwardNominee,
} from "@/integrations/supabase/services";

export type PanacheDorNomineeWithCategory = PanacheDorAwardNominee & {
  category: PanacheDorAwardCategory;
};

export type PanacheDorMotivation = {
  kind: "leader" | "close-gap" | "milestone";
  text: string;
  isCloseRace: boolean;
};

export const getPanacheDorVoteCount = (
  nominee: Pick<PanacheDorAwardNominee, "vote_count" | "ayati_vote_count">
) => nominee.vote_count ?? nominee.ayati_vote_count ?? 0;

export const comparePanacheDorNominees = (
  left: Pick<PanacheDorAwardNominee, "name" | "vote_count" | "ayati_vote_count">,
  right: Pick<PanacheDorAwardNominee, "name" | "vote_count" | "ayati_vote_count">
) => {
  const voteDifference =
    getPanacheDorVoteCount(right) - getPanacheDorVoteCount(left);

  if (voteDifference !== 0) {
    return voteDifference;
  }

  return left.name.localeCompare(right.name);
};

export const flattenPanacheDorNominees = (
  categories: PanacheDorAwardCategory[]
): PanacheDorNomineeWithCategory[] =>
  categories.flatMap((category) =>
    category.nominees.map((nominee) => ({
      ...nominee,
      category,
    }))
  );

export const rankPanacheDorNominees = (
  nominees: PanacheDorNomineeWithCategory[]
) => [...nominees].sort(comparePanacheDorNominees);

export const rankPanacheDorCategoryNominees = (
  category: PanacheDorAwardCategory
): PanacheDorNomineeWithCategory[] =>
  rankPanacheDorNominees(
    category.nominees.map((nominee) => ({
      ...nominee,
      category,
    }))
  );

const getCloseGapThreshold = (previousVotes: number) =>
  Math.max(10, Math.min(75, Math.ceil(previousVotes * 0.12)));

const getNextMilestone = (votes: number) => {
  if (votes < 50) {
    return Math.ceil((votes + 1) / 10) * 10;
  }

  if (votes < 200) {
    return Math.ceil((votes + 1) / 25) * 25;
  }

  return Math.ceil((votes + 1) / 100) * 100;
};

export const getPanacheDorMotivation = (
  rankedNominees: PanacheDorNomineeWithCategory[],
  nomineeId: string
): PanacheDorMotivation | null => {
  const index = rankedNominees.findIndex((nominee) => nominee.id === nomineeId);

  if (index < 0) {
    return null;
  }

  const nominee = rankedNominees[index];
  const votes = getPanacheDorVoteCount(nominee);

  if (index === 0) {
    return {
      kind: "leader",
      text: "Leading this category.",
      isCloseRace: false,
    };
  }

  const previousNominee = rankedNominees[index - 1];
  const previousVotes = getPanacheDorVoteCount(previousNominee);
  const votesNeeded = previousVotes - votes + 1;
  const previousRank = index;
  const isCloseRace =
    votesNeeded > 0 && votesNeeded <= getCloseGapThreshold(previousVotes);

  if (isCloseRace) {
    return {
      kind: "close-gap",
      text: `Only ${votesNeeded.toLocaleString()} vote${
        votesNeeded === 1 ? "" : "s"
      } to move up to #${previousRank}.`,
      isCloseRace: true,
    };
  }

  if (votes <= 0) {
    return {
      kind: "milestone",
      text: "Help them record their first verified votes.",
      isCloseRace: false,
    };
  }

  return {
    kind: "milestone",
    text: `Help them reach ${getNextMilestone(votes).toLocaleString()} verified votes.`,
    isCloseRace: false,
  };
};

export const hasPanacheDorCloseRace = (
  category: PanacheDorAwardCategory
) => {
  const rankedNominees = rankPanacheDorCategoryNominees(category);

  return rankedNominees.some(
    (nominee) =>
      getPanacheDorMotivation(
        rankedNominees,
        nominee.id
      )?.isCloseRace
  );
};

export const getPanacheDorCategoryVoteUrl = (categorySlug: string) =>
  `/panache-expo/panache-dor/vote?category=${encodeURIComponent(
    categorySlug
  )}`;
