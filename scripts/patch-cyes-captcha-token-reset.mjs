import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const patchFile = (filePath, replacements) => {
  let source = readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  let didPatch = false;

  for (const { originalSnippet, patchedSnippet, description } of replacements) {
    const originalSnippetLf = originalSnippet.replace(/\r\n/g, "\n");
    const patchedSnippetLf = patchedSnippet.replace(/\r\n/g, "\n");

    if (source.includes(patchedSnippet) || source.includes(patchedSnippetLf)) {
      continue;
    }

    if (source.includes(originalSnippet)) {
      source = source.replace(originalSnippet, patchedSnippet);
      didPatch = true;
      continue;
    }

    if (source.includes(originalSnippetLf)) {
      source = source.replace(originalSnippetLf, patchedSnippetLf);
      didPatch = true;
      continue;
    }

    throw new Error(
      `Could not patch ${path.relative(repoRoot, filePath)}: ${description} snippet was not found.`
    );
  }

  if (didPatch) {
    writeFileSync(filePath, source);
  }
};

const votingPagePath = path.join(repoRoot, "src", "pages", "CYESVotingPage.tsx");
const votingApiPath = path.join(repoRoot, "api", "cyes-voting.js");
const footerPath = path.join(repoRoot, "src", "components", "Footer.tsx");
const glenWebsiteHref = "https://wa.me/237657560828?text=Hi%20Glen%2C%20I%20saw%20the%20Panache%20Foundation%20website%20and%20I%27d%20like%20to%20discuss%20building%20something%20similar.";

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
  {
    description: "CYES WhatsApp icon import",
    originalSnippet: `  Mail,
  RefreshCw,`,
    patchedSnippet: `  Mail,
  MessageCircle,
  RefreshCw,`,
  },
  {
    description: "CYES WhatsApp voting and optimized image helpers",
    originalSnippet: `const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";`,
    patchedSnippet: `const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";
const cyesWhatsAppBotNumber = "237674230406";

const buildCyesWhatsAppVoteHref = ({
  nomineeName,
  categoryName,
  voterName,
}: {
  nomineeName?: string;
  categoryName?: string;
  voterName?: string;
}) => {
  const lines = [
    nomineeName && categoryName
      ? \`Hi, I want to vote for \${nomineeName} in the \${categoryName} category for the CYES Awards.\`
      : "Hi, I want to vote for the CYES Awards through WhatsApp.",
    voterName ? \`My name is \${voterName}.\` : "Please guide me through the voting process.",
  ].filter(Boolean);

  return \`https://wa.me/\${cyesWhatsAppBotNumber}?text=\${encodeURIComponent(lines.join("\\n"))}\`;
};

const getOptimizedSupabaseImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl || !imageUrl.includes("/storage/v1/object/public/")) {
    return imageUrl || "";
  }

  const optimizedUrl = imageUrl.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  );
  const separator = optimizedUrl.includes("?") ? "&" : "?";

  return \`\${optimizedUrl}\${separator}width=300&height=300&resize=cover&quality=60\`;
};`,
  },
  {
    description: "CYES selected vote WhatsApp href",
    originalSnippet: `        : "No selection yet";

  const loadFallbackCaptcha = useCallback(async () => {`,
    patchedSnippet: `        : "No selection yet";
  const selectedVoteWhatsAppHref = useMemo(
    () =>
      buildCyesWhatsAppVoteHref({
        nomineeName: selectedNominee?.name,
        categoryName: selectedCategory?.name,
        voterName,
      }),
    [selectedCategory?.name, selectedNominee?.name, voterName]
  );

  const loadFallbackCaptcha = useCallback(async () => {`,
  },
  {
    description: "CYES details WhatsApp vote option",
    originalSnippet: `                    <Button
                      type="submit"`,
    patchedSnippet: `                    <div className="rounded-[1.35rem] border border-[#25D366]/25 bg-[#f3fbf6] px-4 py-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-sans text-sm font-semibold text-[#156D3B]">
                            Prefer WhatsApp voting?
                          </p>
                          <p className="mt-1 font-sans text-sm leading-relaxed text-[#171411]/66">
                            If you do not want to deal with OTP, open WhatsApp with your selected nominee, category, and name already filled in.
                          </p>
                        </div>
                        <a
                          href={selectedVoteWhatsAppHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] px-5 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#22c55e]"
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Vote using WhatsApp
                        </a>
                      </div>
                    </div>

                    <Button
                      type="submit"`,
  },
  {
    description: "CYES nominee image transformations and lazy loading",
    originalSnippet: `                                  <img
                                    src={nominee.photo_url}
                                    alt={nominee.name}
                                    className="h-full w-full object-cover"
                                  />`,
    patchedSnippet: `                                  <img
                                    src={getOptimizedSupabaseImageUrl(nominee.photo_url)}
                                    alt={nominee.name}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-cover"
                                  />`,
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
      .in("category_id", categoryIds)
      .in("status", COUNTED_VOTE_STATUSES);

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
      .in("category_id", categoryIds)
      .in("status", COUNTED_VOTE_STATUSES);

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
              href="${glenWebsiteHref}"
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
