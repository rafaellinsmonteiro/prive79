
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CityProvider } from "@/contexts/CityContext";
import { useAuth } from "@/hooks/useAuth";
import BottomNavigation from "@/components/ui/bottom-navigation";
import HomePage from "./pages/HomePage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ModelPage from "./pages/ModelPage";
import CityPage from "./pages/CityPage";
import CategoryPage from "./pages/CategoryPage";
import ReelsPage from "./pages/ReelsPage";
import GalleryPage from "./pages/GalleryPage";
import MediaPage from "./pages/MediaPage";
import ModelOnboarding from "./pages/ModelOnboarding";
import ChatPage from "./pages/ChatPage";
import MobileChatPage from "./pages/MobileChatPage";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-100">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Routes>
        {/* Public routes */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding-modelo" element={<ModelOnboarding />} />
        
        {/* Protected routes - show main app if user is logged in, otherwise redirect to home */}
        <Route path="/" element={user ? <Index /> : <HomePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/modelo/:id" element={<ModelPage />} />
        <Route path="/cidade/:cityId" element={<CityPage />} />
        <Route path="/categoria/:categoryId" element={<CategoryPage />} />
        <Route path="/reels" element={<ReelsPage />} />
        <Route path="/galeria" element={<GalleryPage />} />
        <Route path="/midia/:type/:id" element={<MediaPage />} />
        <Route 
          path="/chat" 
          element={
            user ? <ChatPage /> : <Navigate to="/" replace />
          } 
        />
        <Route 
          path="/mobile-chat" 
          element={
            user ? <MobileChatPage /> : <Navigate to="/" replace />
          } 
        />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Show bottom navigation only for logged in users */}
      {user && <BottomNavigation />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CityProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </CityProvider>
  </QueryClientProvider>
);

export default App;
