import { createClient } from "@supabase/supabase-js";
import basePanacheDorVotingHandler from "./panache-dor-voting.js";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const getSupabase = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service credentials are not configured.");
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: { "x-client-info": "panache-dor-visible-votes-api" },
    },
  });
};

const readVoteCounts = async (supabase) => {
  const { data, error } = await supabase
    .from("panache_dor_nominee_vote_counts")
    .select("nominee_id,total_votes");

  if (error) {
    throw error;
  }

  return new Map(
    (data || []).map((row) => [row.nominee_id, Number(row.total_votes || 0)])
  );
};

const applyVisibleVoteCounts = (voting, voteCounts) => {
  if (!voting?.categories) {
    return voting;
  }

  let totalVotes = 0;
  const categories = voting.categories.map((category) => {
    let categoryVotes = 0;
    const nominees = (category.nominees || []).map((nominee) => {
      const votes = Number(voteCounts.get(nominee.id) || 0);
      categoryVotes += votes;
      totalVotes += votes;

      return {
        ...nominee,
        ayati_vote_count: votes,
        vote_count: votes,
      };
    });

    return {
      ...category,
      vote_count: categoryVotes,
      nominees,
    };
  });

  return {
    ...voting,
    categories,
    total_votes: totalVotes,
    counts_available: true,
    blind_voting: false,
    public_vote_counts_forced_visible: true,
  };
};

const installVotingVisibilityInterceptor = (res) => {
  const originalEnd = res.end.bind(res);

  res.end = async (chunk, encoding, callback) => {
    try {
      const rawBody = Buffer.isBuffer(chunk)
        ? chunk.toString("utf8")
        : String(chunk || "");
      const payload = rawBody ? JSON.parse(rawBody) : null;

      if (payload?.voting) {
        const supabase = getSupabase();
        const voteCounts = await readVoteCounts(supabase);
        payload.voting = applyVisibleVoteCounts(payload.voting, voteCounts);
      }

      return originalEnd(payload ? JSON.stringify(payload) : chunk, encoding, callback);
    } catch (error) {
      console.error("Panache D'or visible vote count interceptor failed", error);
      return originalEnd(chunk, encoding, callback);
    }
  };
};

export default async function handler(req, res) {
  installVotingVisibilityInterceptor(res);
  return basePanacheDorVotingHandler(req, res);
}
