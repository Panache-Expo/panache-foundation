import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const patchPath = path.resolve(__dirname, "patch-cyes-captcha-token-reset.mjs");

let source = readFileSync(patchPath, "utf8");

const replacements = [
  ["${selectedNominee.name}", "\\${selectedNominee.name}"],
  ["${selectedCategory.name}", "\\${selectedCategory.name}"],
];

for (const [bad, safe] of replacements) {
  source = source.split(bad).join(safe);
}

writeFileSync(patchPath, source);
