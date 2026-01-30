import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FoundationHome from "./pages/FoundationHome";
import PanacheExpoPage from "./pages/PanacheExpoPage";
import CYESPage from "./pages/CYESPage";
import Panache360Page from "./pages/Panache360Page";
import { WorkshopsPage } from "./pages/WorkshopsPage";
import { ContactPage } from "./pages/ContactPage";
import { RegisterPage } from "./pages/RegisterPage";
import PanacheDorPage from "./pages/PanacheDorPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FoundationHome />} />
          <Route path="/panache-expo" element={<PanacheExpoPage />} />
          <Route path="/cyes" element={<CYESPage />} />
          <Route path="/panache-360" element={<Panache360Page />} />
          <Route path="/workshops" element={<WorkshopsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/panache-dor" element={<PanacheDorPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
