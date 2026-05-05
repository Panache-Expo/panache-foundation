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
const footerPath = path.join(repoRoot, "src", "components", "Footer.tsx");
const homePagePath = path.join(repoRoot, "src", "pages", "FoundationHome.tsx");

const panacheBotVoteHref = "https://wa.me/237674230406?text=Hi%2C%20I%20want%20to%20vote%20for%20the%20CYES%20Awards%20through%20WhatsApp.";
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
    description: "CYES WhatsApp voting helper constants",
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
  const message = [
    nomineeName && categoryName
      ? \`Hi, I want to vote for \${nomineeName} in the \${categoryName} category for the CYES Awards.\`
      : "Hi, I want to vote for the CYES Awards through WhatsApp.",
    voterName ? \`My name is \${voterName}.\` : "Please guide me through the WhatsApp voting process.",
  ]
    .filter(Boolean)
    .join("\\n");

  return \`https://wa.me/\${cyesWhatsAppBotNumber}?text=\${encodeURIComponent(message)}\`;
};`,
  },
  {
    description: "CYES selected vote WhatsApp href",
    originalSnippet: `  const voteSummary =
    selectedNominee && selectedCategory
      ? \`${selectedNominee.name} - ${selectedCategory.name}\`
      : selectedCategory
        ? selectedCategory.name
        : "No selection yet";`,
    patchedSnippet: `  const voteSummary =
    selectedNominee && selectedCategory
      ? \`${selectedNominee.name} - ${selectedCategory.name}\`
      : selectedCategory
        ? selectedCategory.name
        : "No selection yet";
  const selectedVoteWhatsAppHref = useMemo(
    () =>
      buildCyesWhatsAppVoteHref({
        nomineeName: selectedNominee?.name,
        categoryName: selectedCategory?.name,
        voterName,
      }),
    [selectedCategory?.name, selectedNominee?.name, voterName]
  );`,
  },
  {
    description: "CYES vote error recovery",
    originalSnippet: `    } catch (voteError) {
      toast({
        title: "Could not record vote",
        description:
          voteError instanceof Error ? voteError.message : "Please try again.",
        variant: "destructive",
      });
    }`,
    patchedSnippet: `    } catch (voteError) {
      resetOtpAndCaptcha();
      setVotingStep("details");
      toast({
        title: "Could not record vote",
        description:
          voteError instanceof Error
            ? \`${voteError.message} You can try again here or continue through WhatsApp.\`
            : "Please try again here or continue through WhatsApp.",
        variant: "destructive",
      });
    }`,
  },
  {
    description: "CYES hero WhatsApp voting action",
    originalSnippet: `              <Link
                to="/cyes/leaderboard"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#156D3B]/20 bg-[#f3fbf6] px-7 font-sans text-sm font-semibold text-[#156D3B] transition-colors hover:bg-white"
              >
                View Leaderboard
              </Link>`,
    patchedSnippet: `              <a
                href={buildCyesWhatsAppVoteHref({})}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#25D366]/25 bg-white px-7 font-sans text-sm font-semibold text-[#156D3B] transition-colors hover:bg-[#f3fbf6]"
              >
                <MessageCircle className="mr-2 h-4 w-4 text-[#25D366]" />
                Vote via WhatsApp
              </a>
              <Link
                to="/cyes/leaderboard"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#156D3B]/20 bg-[#f3fbf6] px-7 font-sans text-sm font-semibold text-[#156D3B] transition-colors hover:bg-white"
              >
                View Leaderboard
              </Link>`,
  },
  {
    description: "CYES details WhatsApp vote option",
    originalSnippet: `                    {turnstileSiteKey ? (`,
    patchedSnippet: `                    <div className="rounded-[1.35rem] border border-[#25D366]/25 bg-[#f3fbf6] px-4 py-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-sans text-sm font-semibold text-[#156D3B]">
                            Prefer to vote without OTP?
                          </p>
                          <p className="mt-1 font-sans text-sm leading-relaxed text-[#171411]/66">
                            Continue through the WhatsApp assistant instead. Your selected nominee and category will be added to the message automatically.
                          </p>
                        </div>
                        <a
                          href={selectedVoteWhatsAppHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] px-5 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#22c55e]"
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Vote via WhatsApp
                        </a>
                      </div>
                    </div>

                    {turnstileSiteKey ? (`,
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
    description: "CYES aggregate category and nominee vote counts",
    originalSnippet: `  let votes = [];
  if (categoryIds.length) {
    const { data: voteData, error: voteError } = await supabase
      .from("cyes_award_votes")
      .select("category_id, nominee_id")
      .in("category_id", categoryIds);

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

patchFile(homePagePath, [
  {
    description: "homepage voting and developer CTAs",
    originalSnippet: `                    <a
                      href={PANACHE_SUPPORT_WHATSAPP_HREF}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button
                        variant="outline"
                        className="h-12 rounded-full border-black/10 bg-white/80 px-6 font-sans text-sm font-semibold text-[#11100e] hover:bg-white"
                      >
                        <MessageCircle className="mr-2 h-4 w-4 text-[#25D366]" />
                        Talk on WhatsApp
                      </Button>
                    </a>`,
    patchedSnippet: `                    <a
                      href="${panacheBotVoteHref}"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button
                        variant="outline"
                        className="h-12 rounded-full border-[#25D366]/25 bg-white/80 px-6 font-sans text-sm font-semibold text-[#156D3B] hover:bg-white"
                      >
                        <MessageCircle className="mr-2 h-4 w-4 text-[#25D366]" />
                        Vote via WhatsApp
                      </Button>
                    </a>

                    <a
                      href="${glenWebsiteHref}"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button
                        variant="outline"
                        className="h-12 rounded-full border-black/10 bg-white/80 px-6 font-sans text-sm font-semibold text-[#11100e] hover:bg-white"
                      >
                        Need a website like this?
                      </Button>
                    </a>`,
  },
  {
    description: "homepage fast route copy",
    originalSnippet: `                      If someone does not want to browse, they can still register,
                      ask questions, and get directed quickly through WhatsApp.`,
    patchedSnippet: `                      If someone does not want to deal with OTP, they can vote through the WhatsApp assistant and get guided quickly.`,
  },
  {
    description: "homepage fast route CTA label",
    originalSnippet: `                          Open WhatsApp bot`,
    patchedSnippet: `                          Vote via WhatsApp`,
  },
]);
