export type BlindVotingPayload = {
  blind_voting?: boolean;
  counts_available?: boolean;
  results_publish_at?: string;
  results_publish_label?: string;
};

export const isBlindVotingActive = (voting?: BlindVotingPayload | null) =>
  Boolean(voting?.blind_voting);

export const getResultsPublishDate = (voting?: BlindVotingPayload | null) => {
  const timestamp = voting?.results_publish_at
    ? Date.parse(voting.results_publish_at)
    : Number.NaN;

  return Number.isFinite(timestamp) ? new Date(timestamp) : null;
};

export const compareByName = <T extends { name: string }>(left: T, right: T) =>
  left.name.localeCompare(right.name, undefined, { sensitivity: "base" });

export const sortByName = <T extends { name: string }>(items: T[]) =>
  [...items].sort(compareByName);
