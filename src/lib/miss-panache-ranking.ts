import type {
  MissPanacheAwardCategory,
  MissPanacheAwardNominee,
} from "@/integrations/supabase/services";
import { compareByName, sortByName } from "@/lib/blind-voting";

export type MissPanacheNomineeWithCategory = MissPanacheAwardNominee & {
  category: MissPanacheAwardCategory;
};

export type MissPanacheMotivation = {
  kind: "leader" | "close-gap" | "milestone";
  text: string;
  isCloseRace: boolean;
};

export const getMissPanacheVoteCount = (
  nominee: Pick<MissPanacheAwardNominee, "vote_count" | "ayati_vote_count">
) => nominee.vote_count ?? nominee.ayati_vote_count ?? 0;

export const compareMissPanacheNominees = (
  left: Pick<MissPanacheAwardNominee, "name" | "vote_count" | "ayati_vote_count">,
  right: Pick<MissPanacheAwardNominee, "name" | "vote_count" | "ayati_vote_count">
) => {
  const voteDifference =
    getMissPanacheVoteCount(right) - getMissPanacheVoteCount(left);

  if (voteDifference !== 0) {
    return voteDifference;
  }

  return left.name.localeCompare(right.name);
};

export const flattenMissPanacheNominees = (
  categories: MissPanacheAwardCategory[]
): MissPanacheNomineeWithCategory[] =>
  categories.flatMap((category) =>
    category.nominees.map((nominee) => ({
      ...nominee,
      category,
    }))
  );

export const rankMissPanacheNominees = (
  nominees: MissPanacheNomineeWithCategory[]
) => [...nominees].sort(compareMissPanacheNominees);

export const sortMissPanacheNomineesAlphabetically = (
  nominees: MissPanacheNomineeWithCategory[]
) => sortByName(nominees);

export const rankMissPanacheCategoryNominees = (
  category: MissPanacheAwardCategory
): MissPanacheNomineeWithCategory[] =>
  rankMissPanacheNominees(
    category.nominees.map((nominee) => ({
      ...nominee,
      category,
    }))
  );

export const sortMissPanacheCategoryNomineesAlphabetically = (
  category: MissPanacheAwardCategory
): MissPanacheNomineeWithCategory[] =>
  category.nominees
    .map((nominee) => ({
      ...nominee,
      category,
    }))
    .sort(compareByName);

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

export const getMissPanacheMotivation = (
  rankedNominees: MissPanacheNomineeWithCategory[],
  nomineeId: string
): MissPanacheMotivation | null => {
  const index = rankedNominees.findIndex((nominee) => nominee.id === nomineeId);

  if (index < 0) {
    return null;
  }

  const nominee = rankedNominees[index];
  const votes = getMissPanacheVoteCount(nominee);

  if (index === 0) {
    return {
      kind: "leader",
      text: "Leading this category.",
      isCloseRace: false,
    };
  }

  const previousNominee = rankedNominees[index - 1];
  const previousVotes = getMissPanacheVoteCount(previousNominee);
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

export const hasMissPanacheCloseRace = (
  category: MissPanacheAwardCategory
) => {
  const rankedNominees = rankMissPanacheCategoryNominees(category);

  return rankedNominees.some(
    (nominee) =>
      getMissPanacheMotivation(
        rankedNominees,
        nominee.id
      )?.isCloseRace
  );
};

export const getMissPanacheCategoryVoteUrl = (categorySlug: string) =>
  `/panache-expo/miss-panache/vote?category=${encodeURIComponent(
    categorySlug
  )}`;

