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
