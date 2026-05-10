import { readFileSync, writeFileSync } from "node:fs";

const pagePath = "src/pages/PanacheDorPage.tsx";
let source = readFileSync(pagePath, "utf8");

source = source.replace(
  /const winnerPackageItems = \[[\s\S]*?\];/,
  `const winnerPackageItems = [
  "Free business website",
  "Professional video advert",
  "Media tours",
  "Feature on our official website",
  "Official Panache D’or ambassador status",
  "DJI Pocket 3 vlogging camera",
];`
);

source = source.replace(/Winner package/g, "Panache People&apos;s Choice Award");
source = source.replace(
  /Panache D&apos;or comes with a(?: full)? visibility and growth package\./g,
  "Panache People&apos;s Choice Award rewards the nominee with the most votes."
);
source = source.replace(
  /The Panache D&apos;or winner(?: goes with 1\.5 million FCFA and a| receives a)\s+business-building prize package designed to extend visibility\s+beyond the award night itself\./g,
  `The Panache People&apos;s Choice Award is for the Panache D&apos;or
                nominee with the highest number of online votes. The winner
                receives a visibility and business-growth package designed to
                extend their recognition beyond the award night itself.`
);
source = source.replace(
  /It is structured to support brand growth, media exposure,\s+content creation, and the winner&apos;s position as one of the\s+public faces of Panache\./g,
  `This special recognition is 100% based on online votes and is
                structured to support brand growth, media exposure, content
                creation, and the winner&apos;s position as one of the public faces
                of Panache.`
);
source = source.replace(/Online public paid votes/g, "People&apos;s Choice online votes");
source = source.replace(/>\s*70%\s*<\/p>/g, ">\n                    100%\n                  </p>");
source = source.replace(
  /Each online vote costs 100 CFA \(approximately \$0\.17 USD\), allowing supporters, fans, friends, and communities to actively support their favorite nominees\./g,
  "The Panache People&apos;s Choice Award goes to the Panache D&apos;or nominee with the highest number of online votes."
);
source = source.replace(
  /Winners of the Panache D&apos;or Awards 2026 will be determined through a transparent voting and judging process combining both public support and professional evaluation\./g,
  "The Panache People&apos;s Choice Award is determined by online votes. It recognises the Panache D&apos;or nominee who mobilises the strongest public support during the voting period."
);
source = source.replace(/1\.5 million FCFA cash package/g, "Free business website");
source = source.replace(/1\.5 million FCFA/g, "a visibility and business-growth package");

writeFileSync(pagePath, source);
console.log("Panache D'or People's Choice copy patched safely.");
