import PrivateVoteCountPage from "./PrivateVoteCountPage";

const MissPanacheContestantVotesPage = () => (
  <PrivateVoteCountPage
    title="Miss Panache"
    label="contestant"
    backTo="/panache-expo/miss-panache"
    source="miss-panache"
    verifyApiPath="/api/miss-panache-contestant-votes"
  />
);

export default MissPanacheContestantVotesPage;
