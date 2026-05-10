import { readFileSync, writeFileSync } from "node:fs";

const pagePath = "src/pages/PanacheDorPage.tsx";
let source = readFileSync(pagePath, "utf8");

source = source.replace(
  '  "1.5 million FCFA cash package",',
  '  "Business visibility and growth support package",'
);

source = source.replace(
  `                The Panache D&apos;or winner goes with 1.5 million FCFA and a
                business-building prize package designed to extend visibility
                beyond the award night itself.`,
  `                The Panache D&apos;or winner receives a business-building prize
                package designed to extend visibility beyond the award night
                itself.`
);

source = source.replace(
  "Panache D'or comes with a full visibility and growth package.",
  "Panache D'or comes with a visibility and growth package."
);

if (source.includes("1.5 million FCFA")) {
  throw new Error("Panache D'or prize copy still contains 1.5 million FCFA");
}

writeFileSync(pagePath, source);
console.log("Panache D'or prize copy updated to remove 1.5 million FCFA claim.");
