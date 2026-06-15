export type BlindVotingPayload = {
  blind_voting?: boolean;
  counts_available?: boolean;
  results_publish_at?: string;
  results_publish_label?: string;
  voting_ends_at?: string;
  voting_ends_label?: string;
  voting_closed?: boolean;
};

export const isBlindVotingActive = (voting?: BlindVotingPayload | null) =>
  Boolean(voting?.blind_voting);

export const getResultsPublishDate = (voting?: BlindVotingPayload | null) => {
  const timestamp = voting?.results_publish_at
    ? Date.parse(voting.results_publish_at)
    : Number.NaN;

  return Number.isFinite(timestamp) ? new Date(timestamp) : null;
};

export const getVotingEndsDate = (voting?: BlindVotingPayload | null) => {
  const timestamp = voting?.voting_ends_at
    ? Date.parse(voting.voting_ends_at)
    : Number.NaN;

  return Number.isFinite(timestamp) ? new Date(timestamp) : null;
};

export const isVotingClosed = (voting?: BlindVotingPayload | null, now = Date.now()) => {
  const votingEndsAt = getVotingEndsDate(voting);

  return Boolean(voting?.voting_closed) || Boolean(votingEndsAt && now >= votingEndsAt.getTime());
};

export const compareByName = <T extends { name: string }>(left: T, right: T) =>
  left.name.localeCompare(right.name, undefined, { sensitivity: "base" });

export const sortByName = <T extends { name: string }>(items: T[]) =>
  [...items].sort(compareByName);
