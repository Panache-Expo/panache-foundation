import { readFileSync, writeFileSync } from "node:fs";

const pagePath = "src/pages/PanacheDorPage.tsx";
let source = readFileSync(pagePath, "utf8");

source = source.replace(
  '  "1.5 million FCFA cash package",',
  '  "Free business website",'
);

source = source.replace(
  '  "Free business website",\n  "Free business website",',
  '  "Free business website",'
);

source = source.replace(
  '  "Pro video advert",',
  '  "Professional video advert",'
);

source = source.replace(
  '  "Featured on the official website",',
  '  "Feature on the official website",'
);

source = source.replace(
  '  "Official Panache ambassador status",',
  '  "Official Panache D&apos;or ambassador status",'
);

source = source.replace(
  `              <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                Winner package
              </p>`,
  `              <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#8241B6]">
                Panache People&apos;s Choice Award
              </p>`
);

source = source.replace(
  "Panache D&apos;or comes with a full visibility and growth package.",
  "Panache People&apos;s Choice Award rewards the nominee with the most votes."
);

source = source.replace(
  "Panache D'or comes with a visibility and growth package.",
  "Panache People&apos;s Choice Award rewards the nominee with the most votes."
);

source = source.replace(
  `                The Panache D&apos;or winner goes with 1.5 million FCFA and a
                business-building prize package designed to extend visibility
                beyond the award night itself.`,
  `                The Panache People&apos;s Choice Award is for the Panache D&apos;or
                nominee with the highest number of online votes. The winner
                receives a visibility and business-growth package designed to
                extend their recognition beyond the award night itself.`
);

source = source.replace(
  `                The Panache D&apos;or winner receives a business-building prize
                package designed to extend visibility beyond the award night
                itself.`,
  `                The Panache People&apos;s Choice Award is for the Panache D&apos;or
                nominee with the highest number of online votes. The winner
                receives a visibility and business-growth package designed to
                extend their recognition beyond the award night itself.`
);

source = source.replace(
  `                It is structured to support brand growth, media exposure,
                content creation, and the winner&apos;s position as one of the
                public faces of Panache.`,
  `                This special recognition is 100% based on online votes and is
                structured to support brand growth, media exposure, content
                creation, and the winner&apos;s position as one of the public faces
                of Panache.`
);

source = source.replace(
  `                  <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-[#8241B6]">
                    Online public paid votes
                  </p>
                  <p className="mt-4 font-sans text-4xl font-semibold tracking-[-0.08em] text-[#171411]">
                    70%
                  </p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/68">
                    Each online vote costs 100 CFA (approximately $0.17 USD), allowing supporters, fans, friends, and communities to actively support their favorite nominees.
                  </p>`,
  `                  <p className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-[#8241B6]">
                    People&apos;s Choice online votes
                  </p>
                  <p className="mt-4 font-sans text-4xl font-semibold tracking-[-0.08em] text-[#171411]">
                    100%
                  </p>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-[#171411]/68">
                    The Panache People&apos;s Choice Award goes to the Panache D&apos;or nominee with the highest number of online votes.
                  </p>`
);

source = source.replace(
  `                  Winners of the Panache D&apos;or Awards 2026 will be determined through a transparent voting and judging process combining both public support and professional evaluation.`,
  `                  The Panache People&apos;s Choice Award is determined by online votes. It recognises the Panache D&apos;or nominee who mobilises the strongest public support during the voting period.`
);

if (source.includes("1.5 million FCFA")) {
  throw new Error("Panache D'or prize copy still contains 1.5 million FCFA");
}

writeFileSync(pagePath, source);
console.log("Panache D'or People's Choice copy updated.");
