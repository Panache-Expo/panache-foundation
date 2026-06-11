import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import React, { Suspense, useEffect } from "react";
import FoundationHome from "./pages/FoundationHome";
import PanacheExpoPage from "./pages/PanacheExpoPage";
import CYESPage from "./pages/CYESPage";
import CYESAwardsPage from "./pages/CYESAwardsPage";
import CYESNominationsPage from "./pages/CYESNominationsPage";
import CYESVotingPage from "./pages/CYESVotingPage";
import CYESLeaderboardPage from "./pages/CYESLeaderboardPage";
import CYESRegisterPage from "./pages/CYESRegisterPage";
import CYESPitchCompetitionPage from "./pages/CYESPitchCompetitionPage";
import CharityNightPage from "./pages/CharityNightPage";
import ExhibitionStandsPage from "./pages/ExhibitionStandsPage";
import Panache360Page from "./pages/Panache360Page";
import Panache360RegisterPage from "./pages/Panache360RegisterPage";
import Panache360VotingPage from "./pages/Panache360VotingPage";
import Panache360NomineePage from "./pages/Panache360NomineePage";
import Panache360ContestantVotesPage from "./pages/Panache360ContestantVotesPage";
import Panache360PaymentVerifyPage from "./pages/Panache360PaymentVerifyPage";
import Panache360LeaderboardPage from "./pages/Panache360LeaderboardPage";
import FashionNightPage from "./pages/FashionNightPage";
import FashionNightRegisterPage from "./pages/FashionNightRegisterPage";
import { WorkshopsPage } from "./pages/WorkshopsPage";
import { ContactPage } from "./pages/ContactPage";
import { RegisterPage } from "./pages/RegisterPage";
import PanacheDorPage from "./pages/PanacheDorPage";
import PanacheDorVotingPage from "./pages/PanacheDorVotingPage";
import PanacheDorNomineePage from "./pages/PanacheDorNomineePage";
import PanacheDorContestantVotesPage from "./pages/PanacheDorContestantVotesPage";
import PanacheDorLeaderboardPage from "./pages/PanacheDorLeaderboardPage";
import PanacheDorRevenueDashboardPage from "./pages/PanacheDorRevenueDashboardPage";
import PanacheDorPaymentVerifyPage from "./pages/PanacheDorPaymentVerifyPage";
import EventTicketsPage from "./pages/EventTicketsPage";
import EventTicketPaymentVerifyPage from "./pages/EventTicketPaymentVerifyPage";
import EventTicketCheckInPage from "./pages/EventTicketCheckInPage";
import PanacheNominationsPage from "./pages/PanacheNominationsPage";
import MissPanachePage from "./pages/MissPanachePage";
import MissPanacheRegisterPage from "./pages/MissPanacheRegisterPage";
import MissPanacheVotingPage from "./pages/MissPanacheVotingPage";
import MissPanacheNomineePage from "./pages/MissPanacheNomineePage";
import MissPanacheContestantVotesPage from "./pages/MissPanacheContestantVotesPage";
import MissPanachePaymentVerifyPage from "./pages/MissPanachePaymentVerifyPage";
import MissPanacheLeaderboardPage from "./pages/MissPanacheLeaderboardPage";
import ParticipantsDashboardPage from "./pages/ParticipantsDashboardPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import NotFound from "./pages/NotFound";
import DatabaseDiagnostic from "./components/DatabaseDiagnostic";
import { DeveloperContactCta } from "./components/DeveloperContactCta";
import { initGoogleAnalytics, trackPageView } from "./lib/analytics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <p className="text-xl text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    initGoogleAnalytics();
    trackPageView(pathname);
  }, [pathname]);

  return null;
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-destructive/5">
          <div className="p-6 bg-card rounded-lg shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-destructive mb-4">Oops! Something went wrong</h1>
            <p className="text-foreground mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <DeveloperContactCta />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<FoundationHome />} />
              <Route path="/panache-expo" element={<PanacheExpoPage />} />
              <Route path="/panache-expo/exhibition-stands" element={<ExhibitionStandsPage />} />
              <Route path="/panache-expo/charity-night" element={<CharityNightPage />} />
              <Route path="/panache-expo/nominations" element={<PanacheNominationsPage />} />
              <Route path="/panache-expo/panache-360" element={<Panache360Page />} />
              <Route path="/panache-expo/panache-360/register" element={<Panache360RegisterPage />} />
              <Route path="/panache-expo/panache-360/vote" element={<Panache360VotingPage />} />
              <Route path="/panache-expo/panache-360/nominees/:slug" element={<Panache360NomineePage />} />
              <Route path="/panache-expo/panache-360/nominees/:slug/vote-count" element={<Panache360ContestantVotesPage />} />
              <Route path="/panache-expo/panache-360/payment/verify" element={<Panache360PaymentVerifyPage />} />
              <Route path="/panache-expo/panache-360/leaderboard" element={<Panache360LeaderboardPage />} />
              <Route path="/panache-expo/panache-fashion-night" element={<FashionNightPage />} />
              <Route path="/panache-expo/panache-fashion-night/register" element={<FashionNightRegisterPage />} />
              <Route path="/panache-expo/miss-panache" element={<MissPanachePage />} />
              <Route path="/panache-expo/miss-panache/register" element={<MissPanacheRegisterPage />} />
              <Route path="/panache-expo/miss-panache/vote" element={<MissPanacheVotingPage />} />
              <Route path="/panache-expo/miss-panache/contestants/:slug" element={<MissPanacheNomineePage />} />
              <Route path="/panache-expo/miss-panache/contestants/:slug/vote-count" element={<MissPanacheContestantVotesPage />} />
              <Route path="/panache-expo/miss-panache/payment/verify" element={<MissPanachePaymentVerifyPage />} />
              <Route path="/panache-expo/miss-panache/leaderboard" element={<MissPanacheLeaderboardPage />} />
              <Route path="/panache-expo/panache-dor" element={<PanacheDorPage />} />
              <Route path="/panache-expo/panache-dor/vote" element={<PanacheDorVotingPage />} />
              <Route path="/panache-expo/panache-dor/nominees/:slug" element={<PanacheDorNomineePage />} />
              <Route path="/panache-expo/panache-dor/nominees/:slug/vote-count" element={<PanacheDorContestantVotesPage />} />
              <Route path="/panache-expo/panache-dor/payment/verify" element={<PanacheDorPaymentVerifyPage />} />
              <Route path="/panache-expo/panache-dor/leaderboard" element={<PanacheDorLeaderboardPage />} />
              <Route path="/panache-expo/panache-dor/tickets" element={<EventTicketsPage eventSlug="panache-dor-awards-night" />} />
              <Route path="/panache-expo/panache-dor/tickets/payment/verify" element={<EventTicketPaymentVerifyPage brand="panache-dor" />} />
              <Route path="/panache-expo/workshops" element={<WorkshopsPage />} />
              <Route path="/panache-expo/contact" element={<ContactPage />} />
              <Route path="/panache-expo/register" element={<RegisterPage />} />
              <Route path="/cyes" element={<CYESPage />} />
              <Route path="/cyes/awards" element={<CYESAwardsPage />} />
              <Route path="/cyes/nominations" element={<CYESNominationsPage />} />
              <Route path="/cyes/vote" element={<CYESVotingPage />} />
              <Route path="/cyes/leaderboard" element={<CYESLeaderboardPage />} />
              <Route path="/cyes/register" element={<CYESRegisterPage />} />
              <Route path="/cyes/pitch-competition" element={<CYESPitchCompetitionPage />} />
              <Route path="/cyes/tickets" element={<EventTicketsPage eventSlug="cyes-awards-night" />} />
              <Route path="/cyes/tickets/payment/verify" element={<EventTicketPaymentVerifyPage brand="cyes" />} />
              <Route path="/cyes/contact" element={<ContactPage />} />
              <Route path="/tickets/check-in" element={<EventTicketCheckInPage />} />
              <Route path="/panache-expo/participants-dashboard" element={<ParticipantsDashboardPage />} />
              <Route path="/admin/participants" element={<ParticipantsDashboardPage />} />
              <Route path="/admin/panache-dor-revenue" element={<PanacheDorRevenueDashboardPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
