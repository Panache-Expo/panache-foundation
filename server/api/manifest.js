import competitionApplications from "./competition-applications.js";
import contestantAccessPass from "./contestant-access-pass.js";
import cyesAccessPassAgent from "./cyes-access-pass-agent.js";
import cyesContestantVotes from "./cyes-contestant-votes.js";
import cyesVoting from "./cyes-voting.js";
import dashboardApplications from "./dashboard-applications.js";
import emailRankings from "./email-rankings.js";
import eventTickets from "./event-tickets.js";
import missPanacheContestantVotes from "./miss-panache-contestant-votes.js";
import missPanacheVoting from "./miss-panache-voting.js";
import panache360Voting from "./panache-360-voting.js";
import panacheDorRevenueLite from "./panache-dor-revenue-lite.js";
import panacheDorRevenue from "./panache-dor-revenue.js";
import panacheDorVoting from "./panache-dor-voting.js";
import panacheRankingsEmail from "./panache-rankings-email.js";
import panacheRevenue from "./panache-revenue-real-balance.js";
import sendRegistrationEmail from "./send-registration-email.js";

export const apiHandlers = Object.freeze({
  "competition-applications": competitionApplications,
  "contestant-access-pass": contestantAccessPass,
  "cyes-access-pass-agent": cyesAccessPassAgent,
  "cyes-contestant-votes": cyesContestantVotes,
  "cyes-voting": cyesVoting,
  "dashboard-applications": dashboardApplications,
  "email-rankings": emailRankings,
  "event-tickets": eventTickets,
  "miss-panache-contestant-votes": missPanacheContestantVotes,
  "miss-panache-voting": missPanacheVoting,
  "panache-360-voting": panache360Voting,
  "panache-dor-revenue-lite": panacheDorRevenueLite,
  "panache-dor-revenue": panacheDorRevenue,
  "panache-dor-voting": panacheDorVoting,
  "panache-rankings-email": panacheRankingsEmail,
  "panache-revenue": panacheRevenue,
  "send-registration-email": sendRegistrationEmail,
});
