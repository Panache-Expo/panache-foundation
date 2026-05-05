import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const patchFile = (filePath, replacements) => {
  let source = readFileSync(filePath, "utf8");
  let didPatch = false;

  for (const { originalSnippet, patchedSnippet, description } of replacements) {
    if (source.includes(patchedSnippet)) {
      continue;
    }

    if (!source.includes(originalSnippet)) {
      throw new Error(
        `Could not patch ${path.relative(repoRoot, filePath)}: ${description} snippet was not found.`
      );
    }

    source = source.replace(originalSnippet, patchedSnippet);
    didPatch = true;
  }

  if (didPatch) {
    writeFileSync(filePath, source);
  }
};

const votingPagePath = path.join(repoRoot, "src", "pages", "CYESVotingPage.tsx");
const votingApiPath = path.join(repoRoot, "api", "cyes-voting.js");
const footerPath = path.join(repoRoot, "src", "components", "Footer.tsx");

patchFile(votingPagePath, [
  {
    description: "CAPTCHA token field reset",
    originalSnippet: `  const resetOtpForFieldChange = () => {
    setOtp("");
    setCaptchaToken("");
  };`,
    patchedSnippet: `  const resetOtpForFieldChange = () => {
    setOtp("");
  };`,
  },
]);

patchFile(votingApiPath, [
  {
    description: "CYES exact total vote count declaration",
    originalSnippet: `  const categoryIds = (categories || []).map((category) => category.id);
  let nominees = [];`,
    patchedSnippet: `  const categoryIds = (categories || []).map((category) => category.id);
  let totalVotes = 0;

  if (categoryIds.length) {
    const { count, error: totalVotesError } = await supabase
      .from("cyes_award_votes")
      .select("id", { count: "exact", head: true })
      .in("category_id", categoryIds);

    if (totalVotesError) {
      throw totalVotesError;
    }

    totalVotes = count || 0;
  }

  let nominees = [];`,
  },
  {
    description: "CYES aggregate category and nominee vote counts",
    originalSnippet: `  let votes = [];
  if (categoryIds.length) {
    const { data: voteData, error: voteError } = await supabase
      .from("cyes_award_votes")
      .select("category_id, nominee_id")
      .in("category_id", categoryIds);

    if (voteError) {
      throw voteError;
    }
    votes = voteData || [];
  }

  const nomineeVoteCounts = votes.reduce((accumulator, vote) => {
    accumulator[vote.nominee_id] = (accumulator[vote.nominee_id] || 0) + 1;
    return accumulator;
  }, {});

  const categoryVoteCounts = votes.reduce((accumulator, vote) => {
    accumulator[vote.category_id] = (accumulator[vote.category_id] || 0) + 1;
    return accumulator;
  }, {});`,
    patchedSnippet: `  let nomineeVoteCounts = {};
  let categoryVoteCounts = {};

  if (categoryIds.length) {
    const { data: nomineeCountData, error: nomineeCountError } = await supabase
      .from("cyes_nominee_vote_counts")
      .select("nominee_id, category_id, vote_count")
      .in("category_id", categoryIds);

    if (nomineeCountError) {
      throw nomineeCountError;
    }

    nomineeVoteCounts = (nomineeCountData || []).reduce((accumulator, entry) => {
      accumulator[entry.nominee_id] = entry.vote_count || 0;
      return accumulator;
    }, {});

    const { data: categoryCountData, error: categoryCountError } = await supabase
      .from("cyes_category_vote_counts")
      .select("category_id, vote_count")
      .in("category_id", categoryIds);

    if (categoryCountError) {
      throw categoryCountError;
    }

    categoryVoteCounts = (categoryCountData || []).reduce((accumulator, entry) => {
      accumulator[entry.category_id] = entry.vote_count || 0;
      return accumulator;
    }, {});
  }`,
  },
  {
    description: "CYES exact total vote count return",
    originalSnippet: `  return {
    categories: categoriesWithNominees,
    total_votes: votes.length,
  };`,
    patchedSnippet: `  return {
    categories: categoriesWithNominees,
    total_votes: totalVotes,
  };`,
  },
]);

patchFile(footerPath, [
  {
    description: "developer footer credit",
    originalSnippet: `        <p>&copy; 2026 Panache Expo. All rights reserved.</p>`,
    patchedSnippet: `        <div className="space-y-1">
          <p>&copy; 2026 Panache Expo. All rights reserved.</p>
          <p className="text-xs text-[#11100e]/58">
            Website crafted by
            <a
              href="https://wa.me/237657560828?text=Hi%20Glen%2C%20I%20saw%20the%20Panache%20Foundation%20website%20and%20I%27d%20like%20to%20discuss%20building%20something%20similar."
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 font-semibold text-[#11100e] underline-offset-4 transition-opacity hover:opacity-70 hover:underline"
            >
              Glen Mue
            </a>
            . Need a website or voting platform like this? Contact me.
          </p>
        </div>`,
  },
]);
