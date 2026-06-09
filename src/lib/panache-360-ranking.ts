import type {
  Panache360AwardCategory,
  Panache360AwardNominee,
} from "@/integrations/supabase/services";
import { compareByName, sortByName } from "@/lib/blind-voting";

export type Panache360NomineeWithCategory = Panache360AwardNominee & {
  category: Panache360AwardCategory;
};

export type Panache360Motivation = {
  kind: "leader" | "close-gap" | "milestone";
  text: string;
  isCloseRace: boolean;
};

export const getPanache360VoteCount = (
  nominee: Pick<Panache360AwardNominee, "vote_count" | "ayati_vote_count">
) => nominee.vote_count ?? nominee.ayati_vote_count ?? 0;

export const comparePanache360Nominees = (
  left: Pick<Panache360AwardNominee, "name" | "vote_count" | "ayati_vote_count">,
  right: Pick<Panache360AwardNominee, "name" | "vote_count" | "ayati_vote_count">
) => {
  const voteDifference =
    getPanache360VoteCount(right) - getPanache360VoteCount(left);

  if (voteDifference !== 0) {
    return voteDifference;
  }

  return left.name.localeCompare(right.name);
};

export const flattenPanache360Nominees = (
  categories: Panache360AwardCategory[]
): Panache360NomineeWithCategory[] =>
  categories.flatMap((category) =>
    category.nominees.map((nominee) => ({
      ...nominee,
      category,
    }))
  );

export const rankPanache360Nominees = (
  nominees: Panache360NomineeWithCategory[]
) => [...nominees].sort(comparePanache360Nominees);

export const sortPanache360NomineesAlphabetically = (
  nominees: Panache360NomineeWithCategory[]
) => sortByName(nominees);

export const rankPanache360CategoryNominees = (
  category: Panache360AwardCategory
): Panache360NomineeWithCategory[] =>
  rankPanache360Nominees(
    category.nominees.map((nominee) => ({
      ...nominee,
      category,
    }))
  );

export const sortPanache360CategoryNomineesAlphabetically = (
  category: Panache360AwardCategory
): Panache360NomineeWithCategory[] =>
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

export const getPanache360Motivation = (
  rankedNominees: Panache360NomineeWithCategory[],
  nomineeId: string
): Panache360Motivation | null => {
  const index = rankedNominees.findIndex((nominee) => nominee.id === nomineeId);

  if (index < 0) {
    return null;
  }

  const nominee = rankedNominees[index];
  const votes = getPanache360VoteCount(nominee);

  if (index === 0) {
    return {
      kind: "leader",
      text: "Leading this category.",
      isCloseRace: false,
    };
  }

  const previousNominee = rankedNominees[index - 1];
  const previousVotes = getPanache360VoteCount(previousNominee);
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

export const hasPanache360CloseRace = (
  category: Panache360AwardCategory
) => {
  const rankedNominees = rankPanache360CategoryNominees(category);

  return rankedNominees.some(
    (nominee) =>
      getPanache360Motivation(
        rankedNominees,
        nominee.id
      )?.isCloseRace
  );
};

export const getPanache360CategoryVoteUrl = (categorySlug: string) =>
  `/panache-expo/panache-360/vote?category=${encodeURIComponent(
    categorySlug
  )}`;
