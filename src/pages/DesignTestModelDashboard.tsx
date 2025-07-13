import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  LayoutDashboard, 
  Rss, 
  MessageCircle, 
  User, 
  Camera,
  Calendar,
  Wrench,
  Users,
  Star,
  Target,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Eye,
  Clock,
  ChevronLeft,
  Search,
  Bell,
  PlusCircle,
  Menu,
  Settings,
  LogOut,
  Sun,
  Moon
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useModelProfile } from '@/hooks/useModelProfile';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useUserBalance } from '@/hooks/useUserBalance';
import ModelDashboardHome from '@/components/model/ModelDashboardHome';
import EnhancedModelProfileManager from '@/components/model/EnhancedModelProfileManager';
import EnhancedModelMediaManager from '@/components/model/EnhancedModelMediaManager';
import ModelGoals from '@/components/model/ModelGoals';

const DesignTestModelDashboard = () => {
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section');
  const [activeSection, setActiveSection] = useState(section || 'dashboard');
  const { user, signOut, loading, authComplete } = useAuth();
  const { profile, isLoading: profileLoading } = useModelProfile();
  const { data: currentUser } = useCurrentUser();
  const { data: balanceData } = useUserBalance();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [isDark, setIsDark] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [isMobile]);

  React.useEffect(() => {
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

  const navigationSections = [
    {
      title: "Principal",
      items: [
        { name: "Dashboard", path: "dashboard", icon: LayoutDashboard, active: activeSection === 'dashboard' },
        { name: "Feed", path: "feed", icon: Rss, active: activeSection === 'feed' },
        { name: "Conversas", path: "conversas", icon: MessageCircle, active: activeSection === 'conversas', badge: '5' },
        { name: "Perfil", path: "perfil", icon: User, active: activeSection === 'perfil' },
        { name: "Mídias", path: "midias", icon: Camera, active: activeSection === 'midias' },
      ]
    },
    {
      title: "Vendas",
      items: [
        { name: "Agenda", path: "agenda", icon: Calendar, active: activeSection === 'agenda' },
        { name: "Serviços", path: "servicos", icon: Wrench, active: activeSection === 'servicos' },
        { name: "Clientes", path: "clientes", icon: Users, active: activeSection === 'clientes' },
      ]
    },
    {
      title: "Evolução",
      items: [
        { name: "Avaliações", path: "avaliacoes", icon: Star, active: activeSection === 'avaliacoes' },
        { name: "Metas", path: "metas", icon: Target, active: activeSection === 'metas' },
      ]
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <ModelDashboardHome profile={profile} modelId={profile.model_id} onSectionChange={setActiveSection} />;
      case 'perfil':
        return <EnhancedModelProfileManager profile={profile} />;
      case 'midias':
        return <EnhancedModelMediaManager modelId={profile.model_id} />;
      case 'metas':
        return <ModelGoals modelId={profile.model_id} />;
      case 'feed':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Feed</h2><p className="text-muted-foreground">Em desenvolvimento...</p></div>;
      case 'conversas':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Conversas</h2><p className="text-muted-foreground">Em desenvolvimento...</p></div>;
      case 'agenda':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Agenda</h2><p className="text-muted-foreground">Em desenvolvimento...</p></div>;
      case 'servicos':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Serviços</h2><p className="text-muted-foreground">Em desenvolvimento...</p></div>;
      case 'clientes':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Clientes</h2><p className="text-muted-foreground">Em desenvolvimento...</p></div>;
      case 'avaliacoes':
        return <div className="p-6"><h2 className="text-2xl font-bold mb-4">Avaliações</h2><p className="text-muted-foreground">Em desenvolvimento...</p></div>;
      default:
        return <ModelDashboardHome profile={profile} modelId={profile.model_id} onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className={`min-h-screen flex w-full ${isDark ? 'dark' : ''} bg-background text-foreground`}>
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`
          bg-card 
          border-r border-border 
          transition-all duration-300 ease-in-out
          flex flex-col
          shadow-xl
          ${isMobile 
            ? `fixed left-0 top-0 h-full z-50 ${isMobileMenuOpen ? 'w-72' : 'w-0 overflow-hidden'}` 
            : `relative ${isExpanded ? 'w-72' : 'w-20'}`
          }
        `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-[0_4px_20px_hsl(var(--primary))_/_0.3]">
                <DollarSign className="w-5 h-5 text-primary-foreground" />
              </div>
              {isExpanded && (
                <div>
                  <div className="font-bold text-lg text-foreground">PrivePlatform</div>
                  <div className="text-sm text-muted-foreground">Premium Experience</div>
                </div>
              )}
            </div>
            {!isMobile && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="text-muted-foreground hover:text-foreground hover:bg-accent p-2 rounded-lg"
              >
                <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? '' : 'rotate-180'}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6 space-y-8">
          {navigationSections.map((section) => (
            <div key={section.title}>
              {(isExpanded || isMobileMenuOpen) && (
                <div className="text-xs font-semibold mb-4 px-3 text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              <nav className="space-y-2">
                {section.items.map((item) => (
                  <div 
                    key={item.path} 
                    className="relative group" 
                    onMouseEnter={() => setHoveredItem(item.path)} 
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Button 
                      variant="ghost" 
                      onClick={() => setActiveSection(item.path)}
                      className={`
                        w-full justify-start px-3 py-3 h-12 rounded-xl transition-all duration-200
                        ${item.active 
                          ? 'bg-gradient-to-r from-primary/20 to-primary/30 text-primary shadow-lg border border-primary/20' 
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {(isExpanded || isMobileMenuOpen) && (
                        <>
                          <span className="ml-3 font-medium">{item.name}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-sm">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Button>
                    
                    {!isMobile && !isExpanded && hoveredItem === item.path && (
                      <div className="absolute left-20 top-3 z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg whitespace-nowrap">
                        {item.name}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          ))}

          {/* User Profile Section */}
          <div className="border-t border-border pt-6">
            {(isExpanded || isMobileMenuOpen) && (
              <div className="text-xs font-semibold mb-4 px-3 text-muted-foreground uppercase tracking-wider">
                Conta
              </div>
            )}
            
            <div className="mb-4 px-3">
              {isExpanded || isMobileMenuOpen ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/50">
                  <Avatar className="w-8 h-8 ring-2 ring-primary/20 shrink-0">
                    <AvatarImage src={''} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-sm">
                      {profile?.models?.name ? profile.models.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'M'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground text-sm truncate">
                      {profile?.models?.name || user?.email}
                    </div>
                    <div className="text-xs text-muted-foreground">Modelo</div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-auto">
                    <Button variant="ghost" size="sm" className="p-1.5 h-7 w-7 hover:bg-accent text-muted-foreground hover:text-foreground">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="p-1.5 h-7 w-7 hover:bg-red-500/10 text-muted-foreground hover:text-red-500">
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                      <AvatarImage src={''} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-sm">
                        {profile?.models?.name ? profile.models.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'M'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button variant="ghost" size="sm" className="p-2 h-10 w-10 hover:bg-accent text-muted-foreground hover:text-foreground">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="p-2 h-10 w-10 hover:bg-red-500/10 text-muted-foreground hover:text-red-500">
                      <LogOut className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Balance Display */}
            {(isExpanded || isMobileMenuOpen) && balanceData && (
              <div className="mb-4 px-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg p-3 border border-green-500/20">
                    <div className="text-xs text-green-600 font-medium mb-1">R$</div>
                    <div className="font-bold text-sm text-foreground">
                      {new Intl.NumberFormat('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }).format(Number(balanceData.balance_brl) || 0)}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg p-3 border border-primary/20">
                    <div className="text-xs text-primary font-medium mb-1">P$</div>
                    <div className="font-bold text-sm text-primary">
                      {new Intl.NumberFormat('pt-BR').format(Number(balanceData.balance) || 0)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-center gap-3 bg-accent rounded-xl p-3">
            <Sun className={`w-4 h-4 ${isDark ? 'text-muted-foreground' : 'text-primary'}`} />
            <Switch checked={isDark} onCheckedChange={setIsDark} className="data-[state=checked]:bg-primary" />
            <Moon className={`w-4 h-4 ${isDark ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 bg-background overflow-hidden ${isMobile ? 'w-full' : ''}`}>
        {/* Header */}
        <header className="bg-card border-b border-border px-4 lg:px-8 py-4 lg:py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                  className="p-2 hover:bg-accent"
                >
                  <Menu className="w-5 h-5 text-muted-foreground" />
                </Button>
              )}
              
              <div>
                <h1 className="text-xl lg:text-3xl font-bold text-primary mb-1">
                  Dashboard Modelo
                </h1>
                <p className="text-sm lg:text-base text-muted-foreground hidden sm:block">
                  Gerencie seu perfil, mídias e conquiste seus objetivos.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-4">
              {!isMobile && (
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar..." 
                    className="pl-10 w-60 lg:w-80 bg-accent border-border focus:border-primary" 
                  />
                </div>
              )}
              
              <Button variant="ghost" size="sm" className="relative p-2 hover:bg-accent">
                <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
                <div className="absolute -top-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 bg-primary rounded-full"></div>
              </Button>
              
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-[0_4px_20px_hsl(var(--primary))_/_0.3] text-sm lg:text-base px-3 lg:px-4">
                <PlusCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                Novo Conteúdo
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DesignTestModelDashboard;