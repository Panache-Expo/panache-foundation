import PrivateVoteCountPage from "./PrivateVoteCountPage";

const PanacheDorContestantVotesPage = () => (
  <PrivateVoteCountPage
    title="Panache D’or"
    label="nominee"
    backTo="/panache-expo/panache-dor"
    rpcName="public_verify_panache_dor_contestant_password"
  />
);

export default PanacheDorContestantVotesPage;
