import "./patch-cyes-vote-breakdowns.mjs";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const dashboardPath = path.join(repoRoot, "src", "pages", "ParticipantsDashboardPage.tsx");

if (existsSync(dashboardPath)) {
  let source = readFileSync(dashboardPath, "utf8");
  let didPatch = false;

  if (!source.includes('import { CYESVotingAnalytics } from "@/components/admin/CYESVotingAnalytics";')) {
    source = source.replace(
      'import { CYESVotingDashboard } from "@/components/admin/CYESVotingDashboard";\n',
      'import { CYESVotingDashboard } from "@/components/admin/CYESVotingDashboard";\nimport { CYESVotingAnalytics } from "@/components/admin/CYESVotingAnalytics";\n'
    );
    didPatch = true;
  }

  if (!source.includes("<CYESVotingAnalytics accessKey={dashboardAccessKey} />")) {
    source = source.replace(
      "            <CYESVotingDashboard accessKey={dashboardAccessKey} />\n",
      "            <CYESVotingAnalytics accessKey={dashboardAccessKey} />\n\n            <CYESVotingDashboard accessKey={dashboardAccessKey} />\n"
    );
    didPatch = true;
  }

  if (didPatch) {
    writeFileSync(dashboardPath, source);
  }
}
