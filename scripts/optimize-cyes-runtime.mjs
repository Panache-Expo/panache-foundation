import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const patchIfExists = (filePath, patches) => {
  if (!existsSync(filePath)) {
    return;
  }

  let source = readFileSync(filePath, "utf8");
  let didPatch = false;

  for (const patch of patches) {
    if (patch.patched && source.includes(patch.patched)) {
      continue;
    }

    if (patch.find && source.includes(patch.find)) {
      source = source.replace(patch.find, patch.replace);
      didPatch = true;
      continue;
    }

    if (patch.regex && patch.regex.test(source)) {
      source = source.replace(patch.regex, patch.replace);
      didPatch = true;
    }
  }

  if (didPatch) {
    writeFileSync(filePath, source);
  }
};

const apiPath = path.join(repoRoot, "api", "cyes-voting.js");
const hookPath = path.join(repoRoot, "src", "hooks", "useSupabase.ts");
const votingPagePath = path.join(repoRoot, "src", "pages", "CYESVotingPage.tsx");

patchIfExists(apiPath, [
  {
    find: `const sendJson = (res, statusCode, payload) => {\n  res.statusCode = statusCode;`,
    replace: `const setPublicVotingCacheHeaders = (res) => {\n  res.setHeader(\n    "Cache-Control",\n    "public, s-maxage=30, stale-while-revalidate=120"\n  );\n};\n\nconst sendJson = (res, statusCode, payload) => {\n  res.statusCode = statusCode;`,
    patched: `const setPublicVotingCacheHeaders = (res) => {`,
  },
  {
    regex: /if \(req\.method === "GET"\) \{\s*const payload = await fetchVotingPayload\(supabase, \{\s*includeDrafts: isAuthorizedDashboardRequest\(req\),\s*\}\);\s*return sendJson\(res, 200, payload\);\s*\}/s,
    replace: `if (req.method === "GET") {\n      const includeDrafts = isAuthorizedDashboardRequest(req);\n      if (!includeDrafts) {\n        setPublicVotingCacheHeaders(res);\n      }\n      const payload = await fetchVotingPayload(supabase, {\n        includeDrafts,\n      });\n      return sendJson(res, 200, payload);\n    }`,
    patched: `const includeDrafts = isAuthorizedDashboardRequest(req);\n      if (!includeDrafts) {\n        setPublicVotingCacheHeaders(res);\n      }`,
  },
  {
    find: `const sendVotingIssueAlert = async (req, { action, message, error, body }) => {`,
    replace: `const logCyesVotingEvent = async (supabase, event) => {\n  if (!supabase || !event?.event_type) {\n    return { attempted: false, skipped: true };\n  }\n\n  try {\n    const { error } = await supabase.from("cyes_voting_events").insert([\n      {\n        event_type: event.event_type,\n        action: event.action || null,\n        category_id: event.category_id || null,\n        nominee_id: event.nominee_id || null,\n        voter_name: event.voter_name || null,\n        voter_email: event.voter_email || null,\n        voter_phone: event.voter_phone || null,\n        message: event.message || null,\n        metadata: event.metadata || {},\n      },\n    ]);\n\n    if (error) {\n      return { attempted: true, ok: false, error: error.message };\n    }\n\n    return { attempted: true, ok: true };\n  } catch (logError) {\n    return {\n      attempted: true,\n      ok: false,\n      error: logError instanceof Error ? logError.message : String(logError),\n    };\n  }\n};\n\nconst sendVotingIssueAlert = async (req, { action, message, error, body }) => {`,
    patched: `const logCyesVotingEvent = async (supabase, event) => {`,
  },
  {
    find: `const sendVotingIssueAlert = async (req, { action, message, error, body }) => {\n  return {\n    attempted: false,\n    skipped: true,\n    reason: "CYES voting issue alert emails are disabled in code.",\n  };`,
    replace: `const sendVotingIssueAlert = async (req, { action, message, error, body }) => {\n  const bodySummary = body && typeof body === "object" ? body : {};\n  const supabase = createAdminClient();\n  await logCyesVotingEvent(supabase, {\n    event_type: "api_error",\n    action,\n    category_id: normalizeText(bodySummary.categoryId || bodySummary.category_id),\n    nominee_id: normalizeText(bodySummary.nomineeId || bodySummary.nominee_id),\n    voter_name: normalizeText(bodySummary.voterName || bodySummary.voter_name),\n    voter_email: normalizeEmail(bodySummary.voterEmail || bodySummary.voter_email),\n    voter_phone: normalizePhone(bodySummary.voterPhone || bodySummary.voter_phone || bodySummary.phone),\n    message,\n    metadata: { details: formatIssueDetails(error) },\n  });\n\n  return {\n    attempted: false,\n    skipped: true,\n    reason: "CYES voting issue alert emails are disabled in code.",\n  };`,
    patched: `event_type: "api_error",`,
  },
  {
    find: `const sendVoteNotification = async (req, { vote, category, nominee }) => {\n  return {\n    attempted: false,\n    skipped: true,\n    reason: "CYES new vote admin notification emails are disabled in code.",\n  };`,
    replace: `const sendVoteNotification = async (req, { vote, category, nominee }) => {\n  const supabase = createAdminClient();\n  await logCyesVotingEvent(supabase, {\n    event_type: "vote_recorded",\n    action: "castVote",\n    category_id: vote?.category_id || category?.id || null,\n    nominee_id: vote?.nominee_id || nominee?.id || null,\n    voter_name: vote?.voter_name || null,\n    voter_email: vote?.voter_email || null,\n    voter_phone: vote?.voter_phone || null,\n    message: "Vote recorded",\n    metadata: {\n      category_name: category?.name || null,\n      nominee_name: nominee?.name || null,\n    },\n  });\n\n  return {\n    attempted: false,\n    skipped: true,\n    reason: "CYES new vote admin notification emails are disabled in code.",\n  };`,
    patched: `event_type: "vote_recorded",`,
  },
]);

patchIfExists(hookPath, [
  {
    regex: /queryKey:\s*\["cyes-voting"\],\s*queryFn:\s*\(\)\s*=>\s*cyesVotingService\.getVotingPayload\(\),/s,
    replace: `queryKey: ["cyes-voting"],\n    queryFn: () => cyesVotingService.getVotingPayload(),\n    staleTime: 30_000,\n    refetchOnWindowFocus: false,\n    refetchOnReconnect: false,\n    refetchInterval: false,`,
    patched: `staleTime: 30_000,\n    refetchOnWindowFocus: false,`,
  },
]);

patchIfExists(votingPagePath, [
  {
    find: `                                  <img\n                                    src={nominee.photo_url}\n                                    alt={nominee.name}\n                                    className="h-full w-full object-cover"\n                                  />`,
    replace: `                                  <img\n                                    src={getOptimizedSupabaseImageUrl(nominee.photo_url)}\n                                    alt={nominee.name}\n                                    loading="lazy"\n                                    decoding="async"\n                                    className="h-full w-full object-cover"\n                                  />`,
    patched: `src={getOptimizedSupabaseImageUrl(nominee.photo_url)}`,
  },
]);
