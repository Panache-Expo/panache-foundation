import PrivateVoteCountPage from "./PrivateVoteCountPage";

const CYESContestantVotesPage = () => (
  <PrivateVoteCountPage
    title="CYES Awards"
    label="nominee"
    backTo="/cyes/leaderboard"
    source="cyes"
    verifyApiPath="/api/cyes-voting"
    footerVariant="cyes"
    accessPassDescription="Create one complimentary CYES QR access pass from this private link. It admits one person and does not include a free drink."
  />
);

export default CYESContestantVotesPage;
