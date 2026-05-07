import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const apiPath = path.join(repoRoot, "api", "cyes-voting.js");

const patchIfNeeded = (filePath, patch) => {
  if (!existsSync(filePath)) return;
  let source = readFileSync(filePath, "utf8");
  if (source.includes(patch.already)) return;
  if (!source.includes(patch.find)) {
    throw new Error(`Could not apply ${patch.description}: target not found.`);
  }
  source = source.replace(patch.find, patch.replace);
  writeFileSync(filePath, source);
};

patchIfNeeded(apiPath, {
  description: "CYES vote source analytics helper",
  already: "const fetchVoteSourceAnalytics = async (supabase, categoryIds) => {",
  find: `const fetchVotingPayload = async (supabase, { includeDrafts = false } = {}) => {`,
  replace: `const fetchVoteSourceAnalytics = async (supabase, categoryIds) => {
  const empty = {
    totals: { total_votes: 0, otp_votes: 0, whatsapp_votes: 0 },
    byCategory: {},
    byNominee: {},
  };

  if (!categoryIds.length) {
    return empty;
  }

  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("cyes_award_votes")
      .select("category_id, nominee_id, voter_email")
      .in("category_id", categoryIds)
      .in("status", COUNTED_VOTE_STATUSES)
      .range(from, from + pageSize - 1);

    if (error) {
      throw error;
    }

    const votes = data || [];
    for (const vote of votes) {
      const isOtpVote = Boolean(normalizeText(vote.voter_email));
      const sourceKey = isOtpVote ? "otp_votes" : "whatsapp_votes";

      empty.totals.total_votes += 1;
      empty.totals[sourceKey] += 1;

      if (vote.category_id) {
        empty.byCategory[vote.category_id] = empty.byCategory[vote.category_id] || {
          total_votes: 0,
          otp_votes: 0,
          whatsapp_votes: 0,
        };
        empty.byCategory[vote.category_id].total_votes += 1;
        empty.byCategory[vote.category_id][sourceKey] += 1;
      }

      if (vote.nominee_id) {
        empty.byNominee[vote.nominee_id] = empty.byNominee[vote.nominee_id] || {
          total_votes: 0,
          otp_votes: 0,
          whatsapp_votes: 0,
        };
        empty.byNominee[vote.nominee_id].total_votes += 1;
        empty.byNominee[vote.nominee_id][sourceKey] += 1;
      }
    }

    if (votes.length < pageSize) {
      break;
    }
    from += pageSize;
  }

  return empty;
};

const fetchVotingPayload = async (supabase, { includeDrafts = false } = {}) => {`,
});

patchIfNeeded(apiPath, {
  description: "CYES vote source analytics fetch",
  already: "const voteSourceAnalytics = includeDrafts",
  find: `  let nomineeVoteCounts = {};
  let categoryVoteCounts = {};

  if (categoryIds.length) {`,
  replace: `  let nomineeVoteCounts = {};
  let categoryVoteCounts = {};
  const voteSourceAnalytics = includeDrafts
    ? await fetchVoteSourceAnalytics(supabase, categoryIds)
    : null;

  if (categoryIds.length) {`,
});

patchIfNeeded(apiPath, {
  description: "CYES vote source analytics payload fields",
  already: "source_breakdown: voteSourceAnalytics?.byCategory?.[category.id] || null,",
  find: `  const categoriesWithNominees = (categories || []).map((category) => ({
    ...category,
    vote_count: categoryVoteCounts[category.id] || 0,
    nominees: nominees
      .filter((nominee) => nominee.category_id === category.id)
      .map((nominee) => ({
        ...nominee,
        vote_count: nomineeVoteCounts[nominee.id] || 0,
      })),
  }));

  return {
    categories: categoriesWithNominees,
    total_votes: totalVotes,
  };`,
  replace: `  const categoriesWithNominees = (categories || []).map((category) => ({
    ...category,
    vote_count: categoryVoteCounts[category.id] || 0,
    source_breakdown: voteSourceAnalytics?.byCategory?.[category.id] || null,
    nominees: nominees
      .filter((nominee) => nominee.category_id === category.id)
      .map((nominee) => ({
        ...nominee,
        vote_count: nomineeVoteCounts[nominee.id] || 0,
        source_breakdown: voteSourceAnalytics?.byNominee?.[nominee.id] || null,
      })),
  }));

  return {
    categories: categoriesWithNominees,
    total_votes: totalVotes,
    source_breakdown: voteSourceAnalytics?.totals || null,
  };`,
});
