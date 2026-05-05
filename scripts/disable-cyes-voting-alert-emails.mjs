import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const votingApiPath = path.join(repoRoot, "api", "cyes-voting.js");

let source = readFileSync(votingApiPath, "utf8");

const originalSnippet = `const sendVotingIssueAlert = async (req, { action, message, error, body }) => {
  const recipients = normalizeEmailList(CYES_VOTE_ALERT_EMAILS);`;

const patchedSnippet = `const sendVotingIssueAlert = async (req, { action, message, error, body }) => {
  return {
    attempted: false,
    skipped: true,
    reason: "CYES voting issue alert emails are temporarily disabled.",
  };

  const recipients = normalizeEmailList(CYES_VOTE_ALERT_EMAILS);`;

if (!source.includes(patchedSnippet)) {
  if (!source.includes(originalSnippet)) {
    throw new Error("Could not disable CYES voting issue alert emails: target snippet was not found.");
  }

  source = source.replace(originalSnippet, patchedSnippet);
  writeFileSync(votingApiPath, source);
}
