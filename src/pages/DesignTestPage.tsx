import React, { useState } from 'react';
import { LayoutDashboard, Users, MessageSquare, Calendar, TrendingUp, Settings, LogOut, Sun, Moon, ChevronLeft, Search, Bell, Star, Heart, BarChart3, PlusCircle, Filter, Download, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
const DesignTestPage = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
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
    label: 'Usuários Ativos',
    value: '2,543',
    change: '+12%',
    icon: Users
  }, {
    label: 'Receita Mensal',
    value: 'R$ 45.2k',
    change: '+8%',
    icon: TrendingUp
  }, {
    label: 'Conversas',
    value: '1,234',
    change: '+23%',
    icon: MessageSquare
  }, {
    label: 'Agendamentos',
    value: '89',
    change: '+5%',
    icon: Calendar
  }];
  return <div className={`min-h-screen flex w-full ${isDark ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className={`
          bg-[hsl(var(--sidebar-bg))] 
          border-r border-[hsl(var(--sidebar-border))] 
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-72' : 'w-20'} 
          flex flex-col
          shadow-xl
        `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-yellow-500 rounded-xl flex items-center justify-center shadow-[var(--shadow-gold)]">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              {isExpanded && <div>
                  <div className="font-bold text-lg text-[hsl(var(--sidebar-text))]">PrivePlatform</div>
                  <div className="text-sm text-[hsl(var(--sidebar-text-muted))]">
                    Premium Experience
                  </div>
                </div>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-[hsl(var(--sidebar-text-muted))] hover:text-[hsl(var(--sidebar-text))] hover:bg-[hsl(var(--sidebar-hover))] p-2 rounded-lg">
              <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? '' : 'rotate-180'}`} />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6 space-y-8">
          {/* Main Navigation */}
          <div>
            {isExpanded && <div className="text-xs font-semibold mb-4 px-3 text-[hsl(var(--sidebar-text-muted))] uppercase tracking-wider">
                Principal
              </div>}
            <nav className="space-y-2">
              {navigationItems.map(item => <div key={item.id} className="relative group" onMouseEnter={() => setHoveredItem(item.id)} onMouseLeave={() => setHoveredItem(null)}>
                  <Button variant="ghost" className={`
                      w-full justify-start px-3 py-3 h-12 rounded-xl transition-all duration-200
                      ${item.active ? 'bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-active-text))] shadow-lg border border-primary/20' : 'text-[hsl(var(--sidebar-text-muted))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-text))]'}
                    `}>
                    <item.icon className="w-5 h-5 shrink-0" />
                    {isExpanded && <>
                        <span className="ml-3 font-medium">{item.label}</span>
                        {item.badge && <Badge variant="secondary" className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-sm">
                            {item.badge}
                          </Badge>}
                      </>}
                  </Button>
                  
                  {/* Tooltip para estado colapsado */}
                  {!isExpanded && hoveredItem === item.id && <div className="absolute left-20 top-3 z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg whitespace-nowrap">
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>}
                </div>)}
            </nav>
          </div>

          {/* Account Section */}
          <div className="border-t border-[hsl(var(--sidebar-border))] pt-6">
            {isExpanded && <div className="text-xs font-semibold mb-4 px-3 text-[hsl(var(--sidebar-text-muted))] uppercase tracking-wider">
                Conta
              </div>}
            <nav className="space-y-2">
              {accountItems.map(item => <div key={item.id} className="relative" onMouseEnter={() => setHoveredItem(item.id)} onMouseLeave={() => setHoveredItem(null)}>
                  <Button variant="ghost" className="w-full justify-start px-3 py-3 h-12 rounded-xl text-[hsl(var(--sidebar-text-muted))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-text))] transition-all duration-200">
                    <item.icon className="w-5 h-5 shrink-0" />
                    {isExpanded && <span className="ml-3 font-medium">{item.label}</span>}
                  </Button>
                  
                  {!isExpanded && hoveredItem === item.id && <div className="absolute left-20 top-3 z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg whitespace-nowrap">
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>}
                </div>)}
            </nav>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center justify-center gap-3 bg-[hsl(var(--sidebar-hover))] rounded-xl p-3">
            <Sun className={`w-4 h-4 ${isDark ? 'text-[hsl(var(--sidebar-text-muted))]' : 'text-primary'}`} />
            <Switch checked={isDark} onCheckedChange={setIsDark} className="data-[state=checked]:bg-primary" />
            <Moon className={`w-4 h-4 ${isDark ? 'text-primary' : 'text-[hsl(var(--sidebar-text-muted))]'}`} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[hsl(var(--content-bg))] overflow-hidden">
        {/* Header */}
        <header className="bg-[hsl(var(--header-bg))] border-b border-[hsl(var(--sidebar-border))] px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[hsl(var(--sidebar-text))] mb-1">
                Dashboard
              </h1>
              <p className="text-[hsl(var(--sidebar-text-muted))]">
                Bem-vindo de volta! Aqui está o resumo da sua plataforma.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[hsl(var(--sidebar-text-muted))]" />
                <Input placeholder="Buscar..." className="pl-10 w-80 bg-[hsl(var(--sidebar-hover))] border-[hsl(var(--sidebar-border))] focus:border-primary" />
              </div>
              
              <Button variant="ghost" size="sm" className="relative p-2 hover:bg-[hsl(var(--sidebar-hover))]">
                <Bell className="w-5 h-5 text-[hsl(var(--sidebar-text-muted))]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
              </Button>
              
              <Button className="bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/90 hover:to-yellow-500/90 text-primary-foreground shadow-[var(--shadow-gold)]">
                <PlusCircle className="w-4 h-4 mr-2" />
                Novo
              </Button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-[hsl(var(--sidebar-border))]">
                <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                  <AvatarImage src="/lovable-uploads/182f2a41-9665-421f-ad03-aee8b5a34ad0.png" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-yellow-500 text-primary-foreground font-semibold">
                    JW
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-semibold text-[hsl(var(--sidebar-text))]">John Wilson</div>
                  <div className="text-[hsl(var(--sidebar-text-muted))]">Admin</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-8 overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => <Card key={index} className="bg-[hsl(var(--sidebar-bg))] border-[hsl(var(--sidebar-border))] hover:shadow-lg transition-all duration-200 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[hsl(var(--sidebar-text-muted))] mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-[hsl(var(--sidebar-text))]">{stat.value}</p>
                      <p className="text-sm text-primary font-medium">{stat.change}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-primary/10 to-yellow-500/10 rounded-xl group-hover:scale-110 transition-transform duration-200">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>

          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Card */}
            <Card className="lg:col-span-2 bg-[hsl(var(--sidebar-bg))] border-[hsl(var(--sidebar-border))]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[hsl(var(--sidebar-text))]">Análise de Performance</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-[hsl(var(--sidebar-border))]">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtro
                  </Button>
                  <Button variant="outline" size="sm" className="border-[hsl(var(--sidebar-border))]">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gradient-to-br from-primary/5 to-yellow-500/5 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
                    <p className="text-[hsl(var(--sidebar-text-muted))]">Gráfico de análise seria exibido aqui</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Card */}
            <Card className="bg-[hsl(var(--sidebar-bg))] border-[hsl(var(--sidebar-border))]">
              <CardHeader>
                <CardTitle className="text-[hsl(var(--sidebar-text))] flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
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
                }].map((activity, index) => <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--sidebar-hover))] transition-colors duration-200">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-yellow-500/20 text-xs">
                          {activity.user.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[hsl(var(--sidebar-text))] truncate">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-[hsl(var(--sidebar-text-muted))]">{activity.time}</p>
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>;
};
export default DesignTestPage;