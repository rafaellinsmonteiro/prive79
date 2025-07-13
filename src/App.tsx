
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CityProvider } from "@/contexts/CityContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

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
import ChatFeedPage from "./pages/ChatFeedPage";
import MobileChatPage from "./pages/MobileChatPage";
import ModelDashboard from "./pages/ModelDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import DesignTestPage from "./pages/DesignTestPage";
import DesignTestModelsPage from "./pages/DesignTestModelsPage";
import DesignTestChatPage from "./pages/DesignTestChatPage";
import DesignTestAppointmentsPage from "./pages/DesignTestAppointmentsPage";
import DesignTestClientsPage from "./pages/DesignTestClientsPage";
import DesignTestServicesPage from "./pages/DesignTestServicesPage";
import DesignTestUserProfile from "./pages/DesignTestUserProfile";
import AgendaPage from "./pages/AgendaPage";
import ClientsPage from "./pages/ClientsPage";
import ServicesPage from "./pages/ServicesPage";
import ChatInteligentePage from "./pages/ChatInteligentePage";
import PriveBankPage from "./pages/PriveBankPage";
import ReviewsPage from "./pages/ReviewsPage";
import SearchPage from "./pages/SearchPage";
import LunnaPage from "./pages/LunnaPage";
import Header from "@/components/Header";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Rotas onde o header deve ser ocultado
  const hideHeaderRoutes = ['/reels', '/profile', '/chat-feed', '/mobile-chat', '/login'];
  const isDesignTestRoute = location.pathname.startsWith('/design-test');
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname) || isDesignTestRoute;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-100">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Main content without sidebar */}
      <div>
        {/* Conditionally show header */}
        {!shouldHideHeader && <Header />}
        
        <Routes>
          {/* Public routes */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding-modelo" element={<ModelOnboarding />} />
          
          {/* Home route - show login if not authenticated, otherwise show main app */}
          <Route path="/" element={<Index />} />
          
          {/* Protected routes - redirect to login if not authenticated */}
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
          <Route path="/admin" element={user ? <AdminDashboard /> : <Navigate to="/login" replace />} />
          <Route path="/model-dashboard" element={user ? <ModelDashboard /> : <Navigate to="/login" replace />} />
          <Route path="/client-dashboard" element={user ? <ClientDashboard /> : <Navigate to="/login" replace />} />
          <Route path="/modelo/:id" element={<ModelPage />} />
          <Route path="/cidade/:cityId" element={<CityPage />} />
          <Route path="/categoria/:categoryId" element={<CategoryPage />} />
          <Route path="/reels" element={<ReelsPage />} />
          <Route path="/galeria" element={<GalleryPage />} />
          <Route path="/midia/:type/:id" element={<MediaPage />} />
          <Route 
            path="/agenda" 
            element={
              user ? <AgendaPage /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/clientes" 
            element={
              user ? <ClientsPage /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/servicos" 
            element={
              user ? <ServicesPage /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/chat" 
            element={
              user ? <ChatPage /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/chat-feed" 
            element={
              user ? <ChatFeedPage /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/mobile-chat" 
            element={
              user ? <MobileChatPage /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/chat-inteligente" 
            element={
              user ? <ChatInteligentePage /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/lunna" 
            element={
              user ? <LunnaPage /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/privebank" 
            element={
              user ? <PriveBankPage /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/avaliacoes" 
            element={
              user ? <ReviewsPage /> : <Navigate to="/login" replace />
            } 
          />
          <Route path="/buscar" element={<SearchPage />} />
        <Route path="/design-test" element={<DesignTestPage />} />
        <Route path="/design-test/models" element={<DesignTestModelsPage />} />
          
          {/* Design Test Pages */}
          <Route path="/design-test/dashboard" element={<DesignTestPage />} />
          <Route path="/design-test/models" element={<DesignTestModelsPage />} />
              <Route path="/design-test/services" element={<DesignTestServicesPage />} />
              <Route path="/design-test/clients" element={<DesignTestClientsPage />} />
          <Route path="/design-test/appointments" element={<DesignTestAppointmentsPage />} />
          <Route path="/design-test/reviews" element={<DesignTestPage />} />
          <Route path="/design-test/gallery" element={<DesignTestPage />} />
          <Route path="/design-test/reels" element={<DesignTestPage />} />
          <Route path="/design-test/chat" element={<DesignTestChatPage />} />
          <Route path="/design-test/user-profile" element={<DesignTestUserProfile />} />
          <Route path="/design-test/settings" element={<DesignTestPage />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CityProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </CityProvider>
  </QueryClientProvider>
);

export default App;
