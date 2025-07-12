import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, MessageSquare, Calendar, Activity, BarChart3, MessageCircle, Settings, LogOut, Sun, Moon, ChevronLeft, Grid3X3, User, Image, Shield, Target, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useModelProfile } from '@/hooks/useModelProfile';
import { useCurrentUser } from '@/hooks/useCurrentUser';
const DesignTestPage = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('home');
  
  const { user } = useAuth();
  const { profile } = useModelProfile();
  const { data: currentUser } = useCurrentUser();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);
  const overviewItems = [{
    icon: Home,
    label: 'Início',
    id: 'home'
  }, {
    icon: User,
    label: 'Perfil',
    id: 'profile'
  }, {
    icon: Image,
    label: 'Mídias',
    id: 'media',
    badge: '5' // Placeholder for now
  }, {
    icon: Target,
    label: 'Metas',
    id: 'goals'
  }, {
    icon: Calendar,
    label: 'Agenda',
    id: 'calendar'
  }, {
    icon: BarChart3,
    label: 'Estatísticas',
    id: 'stats'
  }, {
    icon: Shield,
    label: 'Privacidade',
    id: 'privacy'
  }];
  const accountItems = [{
    icon: MessageCircle,
    label: 'Chat',
    id: 'chat'
  }, {
    icon: Settings,
    label: 'Configurações',
    id: 'settings'
  }, {
    icon: LogOut,
    label: 'Sair',
    id: 'logout'
  }];
  const userName = profile?.models?.name || currentUser?.name || user?.email?.split('@')[0] || 'Usuário';
  const userEmail = user?.email || 'email@exemplo.com';
  const userPlan = currentUser?.plan?.name || 'Plano Básico';
  
  return <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <div className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'} flex flex-col`}>
        
        {/* Header with Logo */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sidebar-primary rounded flex items-center justify-center">
              <Grid3X3 className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            {isExpanded && <div>
                <div className="font-semibold text-sidebar-foreground">
                  Prive
                </div>
                <div className="text-sm text-sidebar-foreground/60">
                  Dashboard
                </div>
              </div>}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-sidebar-foreground/60 hover:text-sidebar-foreground p-1">
            <ChevronLeft className={`w-4 h-4 transition-transform ${isExpanded ? '' : 'rotate-180'}`} />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4">
          {/* Overview Section */}
          <div className="mb-6">
            {isExpanded && <div className="text-xs font-medium mb-3 px-3 text-sidebar-foreground/60 uppercase tracking-wider">MENU</div>}
            <nav className="space-y-1">
              {overviewItems.map(item => <div key={item.id} className="relative" onMouseEnter={() => setHoveredItem(item.id)} onMouseLeave={() => setHoveredItem(null)}>
                  <Button 
                    variant="ghost" 
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full justify-start px-3 py-2 h-10 ${activeSection === item.id ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {isExpanded && <>
                        <span className="ml-3">{item.label}</span>
                        {item.badge && <Badge variant="secondary" className="ml-auto bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                            {item.badge}
                          </Badge>}
                      </>}
                  </Button>
                  
                  {/* Tooltip for collapsed state */}
                  {!isExpanded && hoveredItem === item.id && <div className="absolute left-16 top-2 z-50 px-2 py-1 text-sm bg-popover text-popover-foreground rounded shadow-lg border">
                      {item.label}
                    </div>}
                </div>)}
            </nav>
          </div>

          {/* Account Section */}
          <div>
            {isExpanded && <div className="text-xs font-medium mb-3 px-3 text-sidebar-foreground/60 uppercase tracking-wider">CONTA</div>}
            <nav className="space-y-1">
              {accountItems.map(item => <div key={item.id} className="relative" onMouseEnter={() => setHoveredItem(item.id)} onMouseLeave={() => setHoveredItem(null)}>
                  <Button variant="ghost" className="w-full justify-start px-3 py-2 h-10 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <item.icon className="w-4 h-4 shrink-0" />
                    {isExpanded && <span className="ml-3">{item.label}</span>}
                  </Button>
                  
                  {/* Tooltip for collapsed state */}
                  {!isExpanded && hoveredItem === item.id && <div className="absolute left-16 top-2 z-50 px-2 py-1 text-sm bg-popover text-popover-foreground rounded shadow-lg border">
                      {item.label}
                    </div>}
                </div>)}
            </nav>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center justify-center gap-2">
            <Sun className={`w-4 h-4 ${!isDark ? 'text-yellow-500' : 'text-sidebar-foreground/40'}`} />
            <Switch checked={isDark} onCheckedChange={setIsDark} />
            <Moon className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-sidebar-foreground/40'}`} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-background">
        {/* Top Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard - {overviewItems.find(item => item.id === activeSection)?.label}</h1>
              <p className="text-sm text-muted-foreground">Gerencie sua conta e configurações</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {userPlan}
              </Button>
              
              {/* User Profile */}
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/lovable-uploads/182f2a41-9665-421f-ad03-aee8b5a34ad0.png" />
                  <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium text-foreground">{userName}</div>
                  <div className="text-muted-foreground">{userEmail}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            {activeSection === 'home' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Estatísticas Gerais</h3>
                  <p className="text-3xl font-bold text-primary">150</p>
                  <p className="text-sm text-muted-foreground">Visualizações este mês</p>
                </div>
                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Fotos</h3>
                  <p className="text-3xl font-bold text-primary">12</p>
                  <p className="text-sm text-muted-foreground">Fotos no perfil</p>
                </div>
                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Plano Atual</h3>
                  <p className="text-lg font-bold text-primary">{userPlan}</p>
                  <p className="text-sm text-muted-foreground">Seu plano ativo</p>
                </div>
              </div>
            )}
            
            {activeSection !== 'home' && (
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  {overviewItems.find(item => item.id === activeSection)?.label}
                </h2>
                <p className="text-muted-foreground">
                  Área de desenvolvimento para a seção {overviewItems.find(item => item.id === activeSection)?.label}.
                  Esta página demonstra a nova interface com dados reais da plataforma.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>;
};
export default DesignTestPage;