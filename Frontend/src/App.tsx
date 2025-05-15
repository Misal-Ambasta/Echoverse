
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthCheck } from "./components/auth/AuthCheck";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Timeline from "./pages/Timeline";
import Settings from "./pages/Settings";
import EntryDetails from "./pages/EntryDetails";
import NotFound from "./pages/NotFound";

// Private route component to protect routes that require authentication
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  return <AuthCheck>{children}</AuthCheck>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/timeline" element={<PrivateRoute><Timeline /></PrivateRoute>} />
          <Route path="/entry/:id" element={<PrivateRoute><EntryDetails /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
