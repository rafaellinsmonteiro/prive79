import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Camera, MessageSquare, User, Image, Calendar, Star, Users, TrendingUp, Settings, LogOut, Sun, Moon, ChevronLeft, Search, Bell, PlusCircle, Menu, Grid, List, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const ModelV2FeedPage = () => {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [isDark, setIsDark] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [isMobile]);

  const principalItems = [{
    icon: LayoutDashboard,
    label: 'Dashboard',
    id: 'dashboard',
    link: '/v2/dashboard'
  }, {
    icon: Camera,
    label: 'Feed',
    id: 'feed',
    link: '/v2/feed',
    active: true
  }, {
    icon: MessageSquare,
    label: 'Conversas',
    id: 'chat',
    link: '/v2/chat',
    badge: '5'
  }, {
    icon: User,
    label: 'Perfil',
    id: 'profile',
    link: '/v2/profile'
  }, {
    icon: Image,
    label: 'Mídias',
    id: 'media',
    link: '/v2/media'
  }];

  const vendasItems = [{
    icon: Calendar,
    label: 'Agenda',
    id: 'appointments',
    link: '/v2/appointments'
  }, {
    icon: Star,
    label: 'Serviços',
    id: 'services',
    link: '/v2/services'
  }, {
    icon: Users,
    label: 'Clientes',
    id: 'clients',
    link: '/v2/clients'
  }];

  const evolucaoItems = [{
    icon: TrendingUp,
    label: 'Avaliações',
    id: 'reviews',
    link: '/v2/reviews'
  }, {
    icon: TrendingUp,
    label: 'Metas',
    id: 'goals',
    link: '/v2/goals'
  }];

  const accountItems = [{
    icon: Settings,
    label: 'Configurações',
    id: 'settings'
  }, {
    icon: LogOut,
    label: 'Sair',
    id: 'logout'
  }];

  const renderNavItem = (item: any) => (
    <div key={item.id} className="relative group" onMouseEnter={() => setHoveredItem(item.id)} onMouseLeave={() => setHoveredItem(null)}>
      {item.link ? (
        <Link to={item.link}>
          <Button variant="ghost" className={`
              w-full justify-start px-3 py-3 h-12 rounded-xl transition-all duration-200
              ${item.active ? 'bg-gradient-to-r from-primary/20 to-primary/30 text-primary shadow-lg border border-primary/20' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}
            `}>
            <item.icon className="w-5 h-5 shrink-0" />
            {(isExpanded || isMobileMenuOpen) && (
              <>
                <span className="ml-3 font-medium">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-sm">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Button>
        </Link>
      ) : (
        <Button variant="ghost" className="w-full justify-start px-3 py-3 h-12 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200">
          <item.icon className="w-5 h-5 shrink-0" />
          {(isExpanded || isMobileMenuOpen) && <span className="ml-3 font-medium">{item.label}</span>}
        </Button>
      )}
      
      {/* Tooltip para estado colapsado - apenas desktop */}
      {!isMobile && !isExpanded && hoveredItem === item.id && (
        <div className="absolute left-20 top-3 z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg whitespace-nowrap">
          {item.label}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen flex w-full ${isDark ? 'dark' : ''} bg-background text-foreground`}>
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
          bg-card 
          border-r border-border 
          transition-all duration-300 ease-in-out
          flex flex-col
          shadow-xl
          ${isMobile ? 
            `fixed left-0 top-0 h-full z-50 ${isMobileMenuOpen ? 'w-72' : 'w-0 overflow-hidden'}` : 
            `relative ${isExpanded ? 'w-72' : 'w-20'}`
          }
        `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-[0_4px_20px_hsl(var(--primary))_/_0.3]">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              {isExpanded && (
                <div>
                  <div className="font-bold text-lg text-foreground">PrivePlatform</div>
                  <div className="text-sm text-muted-foreground">
                    Premium Experience
                  </div>
                </div>
              )}
            </div>
            {!isMobile && (
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-muted-foreground hover:text-foreground hover:bg-accent p-2 rounded-lg">
                <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? '' : 'rotate-180'}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          {/* Principal Navigation */}
          <div>
            {(isExpanded || isMobileMenuOpen) && (
              <div className="text-xs font-semibold mb-4 px-3 text-muted-foreground uppercase tracking-wider">
                Principal
              </div>
            )}
            <nav className="space-y-2">
              {principalItems.map(renderNavItem)}
            </nav>
          </div>

          {/* Vendas Navigation */}
          <div>
            {(isExpanded || isMobileMenuOpen) && (
              <div className="text-xs font-semibold mb-4 px-3 text-muted-foreground uppercase tracking-wider">
                Vendas
              </div>
            )}
            <nav className="space-y-2">
              {vendasItems.map(renderNavItem)}
            </nav>
          </div>

          {/* Evolução Navigation */}
          <div>
            {(isExpanded || isMobileMenuOpen) && (
              <div className="text-xs font-semibold mb-4 px-3 text-muted-foreground uppercase tracking-wider">
                Evolução
              </div>
            )}
            <nav className="space-y-2">
              {evolucaoItems.map(renderNavItem)}
            </nav>
          </div>

          {/* Account Section */}
          <div className="border-t border-border pt-6">
            {(isExpanded || isMobileMenuOpen) && (
              <div className="text-xs font-semibold mb-4 px-3 text-muted-foreground uppercase tracking-wider">
                Conta
              </div>
            )}
            <nav className="space-y-2">
              {accountItems.map(renderNavItem)}
            </nav>

            {/* Profile Card */}
            {(isExpanded || isMobileMenuOpen) && (
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 mt-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                      <AvatarImage src="/lovable-uploads/182f2a41-9665-421f-ad03-aee8b5a34ad0.png" />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-sm">
                        MG
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground text-sm truncate">Maria Garcia</div>
                      <div className="text-muted-foreground text-xs">Modelo</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
              {/* Mobile Menu Button */}
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
                  Feed
                </h1>
                <p className="text-sm lg:text-base text-muted-foreground hidden sm:block">
                  Compartilhe conteúdo e interaja com sua audiência.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-accent rounded-lg p-1">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="p-2"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="p-2"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="relative p-2 hover:bg-accent">
                <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
                <div className="absolute -top-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 bg-primary rounded-full"></div>
              </Button>
              
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-[0_4px_20px_hsl(var(--primary))_/_0.3] text-sm lg:text-base px-3 lg:px-4">
                <PlusCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Criar Post</span>
                <span className="sm:hidden">+</span>
              </Button>
              
              <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-border">
                <Avatar className="w-8 h-8 lg:w-10 lg:h-10 ring-2 ring-primary/20">
                  <AvatarImage src="/lovable-uploads/182f2a41-9665-421f-ad03-aee8b5a34ad0.png" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-xs lg:text-sm">
                    MG
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs lg:text-sm hidden sm:block">
                  <div className="font-semibold text-foreground">Maria Garcia</div>
                  <div className="text-muted-foreground">Modelo</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area - Feed */}
        <main className="p-4 lg:p-8 overflow-y-auto h-[calc(100vh-120px)]">
          <div className="space-y-6">
            {/* Placeholder Feed Content */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-center text-muted-foreground">
                  <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  Em breve - Feed de Conteúdo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Esta funcionalidade permitirá que você compartilhe fotos, vídeos e textos com sua audiência.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModelV2FeedPage;