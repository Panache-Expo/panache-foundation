import PrivateVoteCountPage from "./PrivateVoteCountPage";
import type { ContestantBasePassSource } from "@/integrations/supabase/services";

const CYESContestantVotesPage = () => (
  <PrivateVoteCountPage
    title="CYECD Awards"
    label="nominee"
    backTo="/cyes/vote"
    source={"cyes" as ContestantBasePassSource}
    rpcName={"public_verify_cyes_contestant_password" as any}
  />
);

export default CYESContestantVotesPage;
