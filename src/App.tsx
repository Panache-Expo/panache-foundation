import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense } from "react";
import FoundationHome from "./pages/FoundationHome";
import PanacheExpoPage from "./pages/PanacheExpoPage";
import CYESPage from "./pages/CYESPage";
import CYESAwardsPage from "./pages/CYESAwardsPage";
import CYESNominationsPage from "./pages/CYESNominationsPage";
import CYESRegisterPage from "./pages/CYESRegisterPage";
import CYESPitchCompetitionPage from "./pages/CYESPitchCompetitionPage";
import CharityNightPage from "./pages/CharityNightPage";
import ExhibitionStandsPage from "./pages/ExhibitionStandsPage";
import Panache360Page from "./pages/Panache360Page";
import Panache360RegisterPage from "./pages/Panache360RegisterPage";
import FashionNightPage from "./pages/FashionNightPage";
import FashionNightRegisterPage from "./pages/FashionNightRegisterPage";
import { WorkshopsPage } from "./pages/WorkshopsPage";
import { ContactPage } from "./pages/ContactPage";
import { RegisterPage } from "./pages/RegisterPage";
import PanacheDorPage from "./pages/PanacheDorPage";
import PanacheNominationsPage from "./pages/PanacheNominationsPage";
import MissPanachePage from "./pages/MissPanachePage";
import MissPanacheRegisterPage from "./pages/MissPanacheRegisterPage";
import ParticipantsDashboardPage from "./pages/ParticipantsDashboardPage";
import NotFound from "./pages/NotFound";
import DatabaseDiagnostic from "./components/DatabaseDiagnostic";

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
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<FoundationHome />} />
              <Route path="/panache-expo" element={<PanacheExpoPage />} />
              <Route path="/panache-expo/exhibition-stands" element={<ExhibitionStandsPage />} />
              <Route path="/panache-expo/charity-night" element={<CharityNightPage />} />
              <Route path="/panache-expo/nominations" element={<PanacheNominationsPage />} />
              <Route path="/panache-expo/panache-360" element={<Panache360Page />} />
              <Route path="/panache-expo/panache-360/register" element={<Panache360RegisterPage />} />
              <Route path="/panache-expo/panache-fashion-night" element={<FashionNightPage />} />
              <Route path="/panache-expo/panache-fashion-night/register" element={<FashionNightRegisterPage />} />
              <Route path="/panache-expo/miss-panache" element={<MissPanachePage />} />
              <Route path="/panache-expo/miss-panache/register" element={<MissPanacheRegisterPage />} />
              <Route path="/panache-expo/panache-dor" element={<PanacheDorPage />} />
              <Route path="/panache-expo/workshops" element={<WorkshopsPage />} />
              <Route path="/panache-expo/contact" element={<ContactPage />} />
              <Route path="/panache-expo/register" element={<RegisterPage />} />
              <Route path="/cyes" element={<CYESPage />} />
              <Route path="/cyes/awards" element={<CYESAwardsPage />} />
              <Route path="/cyes/nominations" element={<CYESNominationsPage />} />
              <Route path="/cyes/register" element={<CYESRegisterPage />} />
              <Route path="/cyes/pitch-competition" element={<CYESPitchCompetitionPage />} />
              <Route path="/cyes/contact" element={<ContactPage />} />
              <Route path="/admin/participants" element={<ParticipantsDashboardPage />} />
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
