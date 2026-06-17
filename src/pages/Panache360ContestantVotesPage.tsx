import PrivateVoteCountPage from "./PrivateVoteCountPage";

const Panache360ContestantVotesPage = () => (
  <PrivateVoteCountPage
    title="Panache 360"
    label="contestant"
    backTo="/panache-expo/panache-360"
    source="panache-360"
    rpcName="public_verify_panache_360_contestant_password"
  />
);

export default Panache360ContestantVotesPage;
