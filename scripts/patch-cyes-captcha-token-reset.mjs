import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const votingPagePath = path.join(repoRoot, "src", "pages", "CYESVotingPage.tsx");

const originalSnippet = `  const resetOtpForFieldChange = () => {
    setOtp("");
    setCaptchaToken("");
  };`;

const patchedSnippet = `  const resetOtpForFieldChange = () => {
    setOtp("");
  };`;

const source = readFileSync(votingPagePath, "utf8");

if (source.includes(patchedSnippet)) {
  process.exit(0);
}

if (!source.includes(originalSnippet)) {
  throw new Error(
    "Could not patch CYESVotingPage.tsx: resetOtpForFieldChange snippet was not found."
  );
}

writeFileSync(votingPagePath, source.replace(originalSnippet, patchedSnippet));
