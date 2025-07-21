
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
// New Design System Pages
import AdminDesignTestDashboard from "./pages/AdminDesignTestDashboard";
import AdminDesignTestModels from "./pages/AdminDesignTestModels";
import AdminDesignTestUsers from "./pages/AdminDesignTestUsers";
import AdminDesignTestFields from "./pages/AdminDesignTestFields";
import AdminDesignTestChat from "./pages/AdminDesignTestChat";
import AdminDesignTestAppointments from "./pages/AdminDesignTestAppointments";
import AdminDesignTestSettings from "./pages/AdminDesignTestSettings";
import DesignTestPage from "./pages/DesignTestPage";
import DesignTestModelsPage from "./pages/DesignTestModelsPage";
import DesignTestChatPage from "./pages/DesignTestChatPage";
import DesignTestAppointmentsPage from "./pages/DesignTestAppointmentsPage";
import DesignTestClientsPage from "./pages/DesignTestClientsPage";
import DesignTestServicesPage from "./pages/DesignTestServicesPage";
import DesignTestUserProfile from "./pages/DesignTestUserProfile";
import DesignTestModelDashboard from "./pages/DesignTestModelDashboard";
import ModelV2DashboardPage from "./pages/ModelV2DashboardPage";
import ModelV2FeedPage from "./pages/ModelV2FeedPage";
import ModelV2ChatPage from "./pages/ModelV2ChatPage";
import ModelV2ProfilePage from "./pages/ModelV2ProfilePage";
import ModelV2MediaPage from "./pages/ModelV2MediaPage";
import ModelV2AppointmentsPage from "./pages/ModelV2AppointmentsPage";
import ModelV2ServicesPage from "./pages/ModelV2ServicesPage";
import ModelV2ClientsPage from "./pages/ModelV2ClientsPage";
import ModelV2ReviewsPage from "./pages/ModelV2ReviewsPage";
import ModelV2GoalsPage from "./pages/ModelV2GoalsPage";
import ComponentsDocumentationPage from "./pages/ComponentsDocumentationPage";
import PublicBookingPage from "./pages/PublicBookingPage";
import PublicModelBookingPage from "./pages/PublicModelBookingPage";

// Legacy Pages (will be gradually replaced)
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
import ClientDashboard from "./pages/ClientDashboard";
import AgendaPage from "./pages/AgendaPage";
import ClientsPage from "./pages/ClientsPage";
import ServicesPage from "./pages/ServicesPage";
import ChatInteligentePage from "./pages/ChatInteligentePage";
import PriveBankPage from "./pages/PriveBankPage";
import ReviewsPage from "./pages/ReviewsPage";
import SearchPage from "./pages/SearchPage";
import LunnaPage from "./pages/LunnaPage";
import Header from "@/components/Header";
import { AuthRedirectHandler } from "@/components/AuthRedirectHandler";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Rotas onde o header deve ser ocultado
  const hideHeaderRoutes = ['/reels', '/profile', '/chat-feed', '/mobile-chat', '/login', '/v2/dashboard', '/v2/feed', '/v2/chat', '/v2/profile', '/v2/media', '/v2/appointments', '/v2/services', '/v2/clients', '/v2/reviews', '/v2/goals', '/buscar'];
  const isDesignTestRoute = location.pathname.startsWith('/design-test');
  const isAdminDesignTestRoute = location.pathname.startsWith('/admin-design-test');
  const isNewDashboardRoute = ['/admin', '/model-dashboard', '/client-dashboard'].includes(location.pathname);
  const isModelRoute = location.pathname.startsWith('/modelo/');
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname) || isDesignTestRoute || isAdminDesignTestRoute || isNewDashboardRoute || isModelRoute;
  

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-100">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Auth redirect handler */}
      <AuthRedirectHandler />
      
      {/* Main content without sidebar */}
      <div>
        {/* Conditionally show header */}
        {!shouldHideHeader && <Header />}
        
        <Routes>
          {/* Public routes */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding-modelo" element={<ModelOnboarding />} />
          <Route path="/agendar" element={<PublicBookingPage />} />
          
          
          {/* Home route - show login if not authenticated, otherwise show main app */}
          <Route path="/" element={<Index />} />
          
          {/* Protected routes - redirect to login if not authenticated */}
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
          <Route path="/admin" element={user ? <AdminDesignTestDashboard /> : <Navigate to="/login" replace />} />
          <Route path="/model-dashboard" element={user ? <DesignTestModelDashboard /> : <Navigate to="/login" replace />} />
          
          {/* Model V2 Routes */}
          <Route path="/v2/dashboard" element={user ? <ModelV2DashboardPage /> : <Navigate to="/login" replace />} />
          <Route path="/v2/feed" element={user ? <ModelV2FeedPage /> : <Navigate to="/login" replace />} />
          <Route path="/v2/chat" element={user ? <ModelV2ChatPage /> : <Navigate to="/login" replace />} />
          <Route path="/v2/profile" element={user ? <ModelV2ProfilePage /> : <Navigate to="/login" replace />} />
          <Route path="/v2/media" element={user ? <ModelV2MediaPage /> : <Navigate to="/login" replace />} />
          <Route path="/v2/appointments" element={user ? <ModelV2AppointmentsPage /> : <Navigate to="/login" replace />} />
          <Route path="/v2/services" element={user ? <ModelV2ServicesPage /> : <Navigate to="/login" replace />} />
          <Route path="/v2/clients" element={user ? <ModelV2ClientsPage /> : <Navigate to="/login" replace />} />
          <Route path="/v2/reviews" element={user ? <ModelV2ReviewsPage /> : <Navigate to="/login" replace />} />
          <Route path="/v2/goals" element={user ? <ModelV2GoalsPage /> : <Navigate to="/login" replace />} />
          <Route path="/components-documentation" element={user ? <ComponentsDocumentationPage /> : <Navigate to="/login" replace />} />
          
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
          {/* Design Test Pages */}
          <Route path="/design-test" element={<DesignTestPage />} />
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
          
          {/* Admin Design Test Pages */}
          <Route path="/admin-design-test" element={<AdminDesignTestDashboard />} />
          <Route path="/admin-design-test/dashboard" element={<AdminDesignTestDashboard />} />
          <Route path="/admin-design-test/models" element={<AdminDesignTestModels />} />
          <Route path="/admin-design-test/users" element={<AdminDesignTestUsers />} />
          <Route path="/admin-design-test/fields" element={<AdminDesignTestFields />} />
          <Route path="/admin-design-test/chat" element={<AdminDesignTestChat />} />
          <Route path="/admin-design-test/appointments" element={<AdminDesignTestAppointments />} />
          <Route path="/admin-design-test/settings" element={<AdminDesignTestSettings />} />
          
          {/* Agendamento público por slug - deve vir antes do catch-all */}
          <Route path="/:slug" element={<PublicModelBookingPage />} />
          
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
