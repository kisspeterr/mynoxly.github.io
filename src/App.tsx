import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import SuperadminDashboard from "./pages/SuperadminDashboard"; 
import Profile from "./pages/Profile";
import RedemptionPage from "./pages/RedemptionPage";
import OrganizationProfile from "./pages/OrganizationProfile"; 
import OrganizationSelectionPage from "./pages/OrganizationSelectionPage"; // NEW IMPORT

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* AuthLoader eltávolítva, a useAuth hook kezeli a betöltési állapotot */}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/select-organization" element={<OrganizationSelectionPage />} /> {/* NEW ROUTE */}
          <Route path="/superadmin/dashboard" element={<SuperadminDashboard />} /> 
          <Route path="/code" element={<RedemptionPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/organization/:organizationName" element={<OrganizationProfile />} /> 
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;