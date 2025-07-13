import React, { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Home, 
  Users, 
  Settings, 
  Calendar,
  Search,
  Bell,
  Menu,
  X,
  User,
  Camera,
  Shield,
  BarChart3,
  Target,
  Palette
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useModelProfile } from '@/hooks/useModelProfile';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import EnhancedModelProfileManager from '@/components/model/EnhancedModelProfileManager';
import EnhancedModelMediaManager from '@/components/model/EnhancedModelMediaManager';
import ModelPrivacySettings from '@/components/model/ModelPrivacySettings';
import ModelStats from '@/components/model/ModelStats';
import ModelDashboardHome from '@/components/model/ModelDashboardHome';
import ModelGoals from '@/components/model/ModelGoals';

const DesignTestModelDashboard = () => {
  const [isMobile, setIsMobile] = useState(useIsMobile());
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section');
  const [activeSection, setActiveSection] = useState(section || 'home');
  const { user, signOut, loading, authComplete } = useAuth();
  const { profile, isLoading: profileLoading } = useModelProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (isMobile) {
      setIsSidebarExpanded(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (authComplete && !user) {
      navigate('/login', { replace: true });
      return;
    }
  }, [authComplete, user, navigate]);

  const handleSignOut = async () => {
    try {
      toast.loading('Saindo...');
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-100">Carregando...</div>
      </div>
    );
  }

  if (authComplete && !user) {
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center text-zinc-100">
          <h2 className="text-xl font-semibold mb-4">Perfil não encontrado</h2>
          <p className="mb-4">Não foi possível encontrar o perfil do modelo.</p>
          <div className="space-x-4">
            <Button onClick={() => navigate('/')} variant="outline">
              Voltar ao Início
            </Button>
            <Button onClick={handleSignOut} variant="destructive">
              Sair
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { name: "Dashboard", path: "home", icon: Home, badge: null },
    { name: "Perfil", path: "profile", icon: User, badge: null },
    { name: "Mídia", path: "media", icon: Camera, badge: null },
    { name: "Metas", path: "goals", icon: Target, badge: null },
    { name: "Privacidade", path: "privacy", icon: Shield, badge: null },
    { name: "Estatísticas", path: "stats", icon: BarChart3, badge: null },
  ];

  const accountItems = [
    { name: "Configurações", path: "settings", icon: Settings, badge: null },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <ModelDashboardHome profile={profile} modelId={profile.model_id} onSectionChange={setActiveSection} />;
      case 'profile':
        return <EnhancedModelProfileManager profile={profile} />;
      case 'media':
        return <EnhancedModelMediaManager modelId={profile.model_id} />;
      case 'goals':
        return <ModelGoals modelId={profile.model_id} />;
      case 'privacy':
        return <ModelPrivacySettings modelId={profile.model_id} />;
      case 'stats':
        return <ModelStats modelId={profile.model_id} />;
      default:
        return <ModelDashboardHome profile={profile} modelId={profile.model_id} onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gradient-to-br from-background via-background/50 to-background">
        {/* Mobile Overlay */}
        {showMobileMenu && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
            fixed left-0 top-0 z-50 h-full bg-card/80 backdrop-blur-xl border-r border-border/50 transition-all duration-300 ease-in-out lg:relative lg:translate-x-0
            ${showMobileMenu ? "translate-x-0" : "-translate-x-full"}
            ${isSidebarExpanded ? "w-64" : "w-16"}
          `}
        >
          {/* Logo */}
          <div className={`h-16 flex items-center ${isSidebarExpanded ? "px-4" : "justify-center"} border-b border-border/50`}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <Palette className="w-4 h-4 text-primary-foreground" />
              </div>
              {isSidebarExpanded && (
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  ModelHub
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    setActiveSection(item.path);
                    setShowMobileMenu(false);
                  }}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${activeSection === item.path
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }
                    ${!isSidebarExpanded ? "justify-center" : ""}
                  `}
                >
                  <item.icon className={`${isSidebarExpanded ? "w-4 h-4" : "w-5 h-5"} transition-all duration-200`} />
                  {isSidebarExpanded && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                  {!isSidebarExpanded && hoveredItem === item.path && (
                    <div className="absolute left-16 ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md shadow-lg text-sm whitespace-nowrap z-50 border border-border">
                      {item.name}
                    </div>
                  )}
                </button>
              ))}
            </nav>

            {/* Account section */}
            <div className="mt-8 px-2">
              <div className={`${isSidebarExpanded ? "px-3 mb-2" : "mb-4"}`}>
                {isSidebarExpanded && (
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Conta
                  </h3>
                )}
              </div>
              <nav className="space-y-1">
                {accountItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      setActiveSection(item.path);
                      setShowMobileMenu(false);
                    }}
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${activeSection === item.path
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }
                      ${!isSidebarExpanded ? "justify-center" : ""}
                    `}
                  >
                    <item.icon className={`${isSidebarExpanded ? "w-4 h-4" : "w-5 h-5"} transition-all duration-200`} />
                    {isSidebarExpanded && (
                      <>
                        <span className="flex-1 text-left">{item.name}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                    {!isSidebarExpanded && hoveredItem === item.path && (
                      <div className="absolute left-16 ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md shadow-lg text-sm whitespace-nowrap z-50 border border-border">
                        {item.name}
                      </div>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Theme toggle */}
          <div className={`p-4 border-t border-border/50 ${!isSidebarExpanded ? "flex justify-center" : ""}`}>
            <div className="flex items-center space-x-3">
              <Switch
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                className="data-[state=checked]:bg-primary"
              />
              {isSidebarExpanded && (
                <span className="text-sm font-medium text-foreground">Modo Escuro</span>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-card/50 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(true)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="hidden lg:flex"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {navigationItems.find(item => item.path === activeSection)?.name || 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <Input
                  placeholder="Buscar..."
                  className="w-64 bg-background/50 border-border/50"
                />
              </div>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 text-xs">
                  3
                </Badge>
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-foreground">
                    {user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">Modelo</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DesignTestModelDashboard;