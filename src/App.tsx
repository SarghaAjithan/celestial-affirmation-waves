
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Goals from "./pages/Goals";
import Builder from "./pages/Builder";
import Player from "./pages/Player";
import Library from "./pages/Library";
import Dashboard from "./pages/Dashboard";
import NowPlaying from "./pages/NowPlaying";
import NotFound from "./pages/NotFound";
import MiniPlayerBand from "@/components/MiniPlayerBand";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import React from "react";

const queryClient = new QueryClient();

// Custom wrapper to get location and conditionally show MiniPlayerBand
const AppRoutes = () => {
  const location = useLocation();
  // Initialize analytics
  useAnalytics();
  
  // Hide MiniPlayerBand on "/now-playing" route
  const hideBand =
    location.pathname === "/now-playing";

  return (
    <>
      {!hideBand && <MiniPlayerBand />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/builder"
          element={
            <ProtectedRoute>
              <Builder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/player"
          element={
            <ProtectedRoute>
              <Player />
            </ProtectedRoute>
          }
        />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <Library />
            </ProtectedRoute>
          }
        />
        <Route
          path="/now-playing"
          element={
            <ProtectedRoute>
              <NowPlaying />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OnboardingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PlayerProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </PlayerProvider>
        </TooltipProvider>
      </OnboardingProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
