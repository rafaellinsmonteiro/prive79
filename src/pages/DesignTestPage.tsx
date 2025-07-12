import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, MessageSquare, Calendar, TrendingUp, Settings, LogOut, Sun, Moon, ChevronLeft, Search, Bell, Star, Heart, BarChart3, PlusCircle, Filter, Download, Zap, Menu, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';

const DesignTestPage = () => {
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

  const navigationItems = [{
    icon: LayoutDashboard,
    label: 'Dashboard',
    id: 'dashboard',
    active: true
  }, {
    icon: Users,
    label: 'Modelos',
    id: 'models',
    badge: '24'
  }, {
    icon: MessageSquare,
    label: 'Conversas',
    id: 'chat',
    badge: '5'
  }, {
    icon: Calendar,
    label: 'Agenda',
    id: 'calendar'
  }, {
    icon: TrendingUp,
    label: 'Analytics',
    id: 'analytics'
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

  const stats = [{
    label: 'Receita Total',
    value: 'R$ 45.280',
    change: '+12.5%',
    icon: DollarSign
  }, {
    label: 'Novos Clientes',
    value: '156',
    change: '+8.2%',
    icon: Users
  }, {
    label: 'Agendamentos',
    value: '89',
    change: '+15.3%',
    icon: Calendar
  }, {
    label: 'Avaliação Média',
    value: '4.8',
    change: '+0.3',
    icon: Star
  }];

  return <div className={`min-h-screen flex w-full ${isDark ? 'dark' : ''} bg-background text-foreground`}>
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
              {isExpanded && <div>
                  <div className="font-bold text-lg text-foreground">PrivePlatform</div>
                  <div className="text-sm text-muted-foreground">
                    Premium Experience
                  </div>
                </div>}
            </div>
            {!isMobile && (
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-muted-foreground hover:text-foreground hover:bg-accent p-2 rounded-lg">
                <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? '' : 'rotate-180'}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6 space-y-8">
          {/* Main Navigation */}
          <div>
            {(isExpanded || isMobileMenuOpen) && (
              <div className="text-xs font-semibold mb-4 px-3 text-muted-foreground uppercase tracking-wider">
                Principal
              </div>
            )}
            <nav className="space-y-2">
              {navigationItems.map(item => <div key={item.id} className="relative group" onMouseEnter={() => setHoveredItem(item.id)} onMouseLeave={() => setHoveredItem(null)}>
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
                  
                  {/* Tooltip para estado colapsado - apenas desktop */}
                  {!isMobile && !isExpanded && hoveredItem === item.id && (
                    <div className="absolute left-20 top-3 z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg whitespace-nowrap">
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </div>)}
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
              {accountItems.map(item => <div key={item.id} className="relative" onMouseEnter={() => setHoveredItem(item.id)} onMouseLeave={() => setHoveredItem(null)}>
                  <Button variant="ghost" className="w-full justify-start px-3 py-3 h-12 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200">
                    <item.icon className="w-5 h-5 shrink-0" />
                    {(isExpanded || isMobileMenuOpen) && <span className="ml-3 font-medium">{item.label}</span>}
                  </Button>
                  
                  {!isMobile && !isExpanded && hoveredItem === item.id && (
                    <div className="absolute left-20 top-3 z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg whitespace-nowrap">
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </div>)}
            </nav>
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
                  Dashboard
                </h1>
                <p className="text-sm lg:text-base text-muted-foreground hidden sm:block">
                  Bem-vindo de volta! Aqui está o resumo da sua plataforma.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Search - Hidden on small mobile */}
              {!isMobile && (
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar..." className="pl-10 w-60 lg:w-80 bg-accent border-border focus:border-primary" />
                </div>
              )}
              
              <Button variant="ghost" size="sm" className="relative p-2 hover:bg-accent">
                <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
                <div className="absolute -top-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 bg-primary rounded-full"></div>
              </Button>
              
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-[0_4px_20px_hsl(var(--primary))_/_0.3] text-sm lg:text-base px-3 lg:px-4">
                <PlusCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Novo</span>
                <span className="sm:hidden">+</span>
              </Button>
              
              <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-border">
                <Avatar className="w-8 h-8 lg:w-10 lg:h-10 ring-2 ring-primary/20">
                  <AvatarImage src="/lovable-uploads/182f2a41-9665-421f-ad03-aee8b5a34ad0.png" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-xs lg:text-sm">
                    JW
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs lg:text-sm hidden sm:block">
                  <div className="font-semibold text-foreground">John Wilson</div>
                  <div className="text-muted-foreground">Admin</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-4 lg:p-8 overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-lg transition-all duration-200 group">
                <CardContent className="p-3 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs lg:text-sm text-muted-foreground mb-1 truncate">{stat.label}</p>
                      <p className="text-lg lg:text-2xl font-bold text-foreground truncate">{stat.value}</p>
                      <p className="text-xs lg:text-sm text-primary font-medium">{stat.change}</p>
                    </div>
                    <div className="p-2 lg:p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl group-hover:scale-110 transition-transform duration-200 ml-2">
                      <stat.icon className="w-4 h-4 lg:w-6 lg:h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            {/* Chart Card */}
            <Card className="lg:col-span-2 bg-card border-border">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-foreground text-lg lg:text-xl">Análise de Performance</CardTitle>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="border-border flex-1 sm:flex-none">
                    <Filter className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                    <span className="text-xs lg:text-sm">Filtro</span>
                  </Button>
                  <Button variant="outline" size="sm" className="border-border flex-1 sm:flex-none">
                    <Download className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                    <span className="text-xs lg:text-sm">Export</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-60 lg:h-80 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 lg:w-16 lg:h-16 text-primary mx-auto mb-4" />
                    <p className="text-sm lg:text-base text-muted-foreground">Gráfico de análise seria exibido aqui</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2 text-lg lg:text-xl">
                  <Star className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[{
                  user: 'Maria Silva',
                  action: 'agendou um encontro',
                  time: '2 min atrás'
                }, {
                  user: 'João Santos',
                  action: 'enviou uma mensagem',
                  time: '5 min atrás'
                }, {
                  user: 'Ana Costa',
                  action: 'atualizou o perfil',
                  time: '10 min atrás'
                }, {
                  user: 'Pedro Lima',
                  action: 'fez um pagamento',
                  time: '15 min atrás'
                }].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 lg:p-3 rounded-lg hover:bg-accent transition-colors duration-200">
                      <Avatar className="w-6 h-6 lg:w-8 lg:h-8">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-xs">
                          {activity.user.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs lg:text-sm text-foreground truncate">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>;
};

export default DesignTestPage;