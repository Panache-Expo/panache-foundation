import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const votingApiPath = path.join(repoRoot, "api", "cyes-voting.js");

let source = readFileSync(votingApiPath, "utf8");
let didPatch = false;

const applyPatch = ({
  originalSnippet,
  patchedSnippet,
  description,
  alreadyPatchedSnippet,
}) => {
  if (
    source.includes(patchedSnippet) ||
    (alreadyPatchedSnippet && source.includes(alreadyPatchedSnippet))
  ) {
    return;
  }

  if (!source.includes(originalSnippet)) {
    throw new Error(`Could not apply ${description}: target snippet was not found.`);
  }

  source = source.replace(originalSnippet, patchedSnippet);
  didPatch = true;
};

applyPatch({
  description: "CYES voting issue alert email disable patch",
  originalSnippet: `const sendVotingIssueAlert = async (req, { action, message, error, body }) => {
  const recipients = normalizeEmailList(CYES_VOTE_ALERT_EMAILS);`,
  patchedSnippet: `const sendVotingIssueAlert = async (req, { action, message, error, body }) => {
  return {
    attempted: false,
    skipped: true,
    reason: "CYES voting issue alert emails are disabled in code.",
  };

  const recipients = normalizeEmailList(CYES_VOTE_ALERT_EMAILS);`,
  alreadyPatchedSnippet: `reason: "CYES voting issue alert emails are disabled in code.",`,
});

applyPatch({
  description: "CYES new vote admin notification email disable patch",
  originalSnippet: `const sendVoteNotification = async (req, { vote, category, nominee }) => {
  const recipients = normalizeEmailList(CYES_VOTE_NOTIFICATION_EMAILS);`,
  patchedSnippet: `const sendVoteNotification = async (req, { vote, category, nominee }) => {
  return {
    attempted: false,
    skipped: true,
    reason: "CYES new vote admin notification emails are disabled in code.",
  };

  const recipients = normalizeEmailList(CYES_VOTE_NOTIFICATION_EMAILS);`,
  alreadyPatchedSnippet: `reason: "CYES new vote admin notification emails are disabled in code.",`,
});

if (didPatch) {
  writeFileSync(votingApiPath, source);
}
