import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense } from "react";
import FoundationHome from "./pages/FoundationHome";
import PanacheExpoPage from "./pages/PanacheExpoPage";
import CYESPage from "./pages/CYESPage";
import CharityNightPage from "./pages/CharityNightPage";
import Panache360Page from "./pages/Panache360Page";
import FashionNightPage from "./pages/FashionNightPage";
import { WorkshopsPage } from "./pages/WorkshopsPage";
import { ContactPage } from "./pages/ContactPage";
import { RegisterPage } from "./pages/RegisterPage";
import PanacheDorPage from "./pages/PanacheDorPage";
import NotFound from "./pages/NotFound";
import DatabaseDiagnostic from "./components/DatabaseDiagnostic";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <p className="text-xl text-gray-600">Loading...</p>
    </div>
  </div>
);

// Error boundary
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
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="p-6 bg-white rounded-lg shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-700 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reload Page
            </button>
            <details className="mt-4 text-xs text-gray-600">
              <summary>Error Details</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                {this.state.error?.stack}
              </pre>
            </details>
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
            {/* Show diagnostic in dev mode - comment out for production */}
            {/* {import.meta.env.DEV && (
              <div className="fixed top-0 left-0 right-0 z-50 p-2">
                <DatabaseDiagnostic />
              </div>
            )} */}
            <Routes>
              <Route path="/" element={<FoundationHome />} />
              <Route path="/panache-expo" element={<PanacheExpoPage />} />
              <Route path="/cyes" element={<CYESPage />} />
              <Route path="/cyes/charity-night" element={<CharityNightPage />} />
              <Route path="/panache-360" element={<Panache360Page />} />
              <Route path="/panache-fashion-night" element={<FashionNightPage />} />
              <Route path="/workshops" element={<WorkshopsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/panache-dor" element={<PanacheDorPage />} />
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
