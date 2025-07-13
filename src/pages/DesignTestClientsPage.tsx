import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, MessageSquare, Calendar, TrendingUp, Settings, LogOut, Sun, Moon, ChevronLeft, Search, Bell, PlusCircle, Menu, UserCheck, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Zap } from 'lucide-react';

// Simulando dados de clientes para exibição
const mockClients = [
  {
    id: '1',
    name: 'Ana Silva',
    phone: '+55 11 99999-9999',
    email: 'ana.silva@email.com',
    address: 'São Paulo, SP',
    notes: 'Cliente VIP, prefere atendimento personalizado',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    last_contact: '2024-01-20T14:30:00Z',
    total_appointments: 12,
    total_spent: 2400,
    rating: 5
  },
  {
    id: '2',
    name: 'Carlos Santos',
    phone: '+55 11 88888-8888',
    email: 'carlos.santos@email.com',
    address: 'Rio de Janeiro, RJ',
    notes: 'Cliente regular, sempre pontual',
    is_active: true,
    created_at: '2024-01-10T15:00:00Z',
    last_contact: '2024-01-18T16:45:00Z',
    total_appointments: 8,
    total_spent: 1600,
    rating: 4
  },
  {
    id: '3',
    name: 'Maria Oliveira',
    phone: '+55 11 77777-7777',
    email: 'maria.oliveira@email.com',
    address: 'Belo Horizonte, MG',
    notes: 'Nova cliente, muito comunicativa',
    is_active: true,
    created_at: '2024-01-25T09:00:00Z',
    last_contact: '2024-01-25T09:30:00Z',
    total_appointments: 2,
    total_spent: 400,
    rating: 5
  },
  {
    id: '4',
    name: 'João Pereira',
    phone: '+55 11 66666-6666',
    email: 'joao.pereira@email.com',
    address: 'Porto Alegre, RS',
    notes: 'Cliente inativo por período',
    is_active: false,
    created_at: '2023-12-01T12:00:00Z',
    last_contact: '2023-12-20T11:00:00Z',
    total_appointments: 5,
    total_spent: 1000,
    rating: 3
  }
];

const DesignTestClientsPage = () => {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [isDark, setIsDark] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [isMobile]);

  const navigationItems = [{
    icon: LayoutDashboard,
    label: 'Dashboard',
    id: 'dashboard'
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
    id: 'appointments'
  }, {
    icon: UserCheck,
    label: 'Clientes',
    id: 'clients',
    active: true
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

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && client.is_active) ||
      (filterStatus === 'inactive' && !client.is_active);
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const formatLastContact = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} semanas atrás`;
    return `${Math.ceil(diffDays / 30)} meses atrás`;
  };

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
                  Clientes
                </h1>
                <p className="text-sm lg:text-base text-muted-foreground hidden sm:block">
                  Gerencie seus clientes e relacionamentos.
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
                <span className="hidden sm:inline">Novo Cliente</span>
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

        {/* Content Area - Clients Manager */}
        <main className="p-4 lg:p-8 overflow-y-auto h-[calc(100vh-120px)]">
          <div className="space-y-6">
            {/* Filtros e busca */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar clientes por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-accent/50 border-border focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  className="text-sm"
                >
                  Todos
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('active')}
                  className="text-sm"
                >
                  Ativos
                </Button>
                <Button
                  variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('inactive')}
                  className="text-sm"
                >
                  Inativos
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold text-foreground">{mockClients.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ativos</p>
                      <p className="text-2xl font-bold text-foreground">{mockClients.filter(c => c.is_active).length}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-lg flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Este Mês</p>
                      <p className="text-2xl font-bold text-foreground">8</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Receita Total</p>
                      <p className="text-2xl font-bold text-foreground">R$ {mockClients.reduce((sum, client) => sum + client.total_spent, 0).toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Clients List */}
            <div className="grid gap-4">
              {filteredClients.map((client) => (
                <Card key={client.id} className="bg-card border-border hover:bg-accent/50 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      {/* Cliente Info */}
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {client.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                          <Badge variant="outline" className={getStatusColor(client.is_active)}>
                            {client.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2" />
                          {client.phone}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatLastContact(client.last_contact)}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg flex items-center justify-center mr-2">
                            <Calendar className="h-3 w-3 text-blue-500" />
                          </div>
                          <span className="text-foreground">{client.total_appointments} agendamentos</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <div className="w-6 h-6 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-lg flex items-center justify-center mr-2">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          </div>
                          <span className="text-foreground">R$ {client.total_spent.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < client.rating ? 'text-yellow-500' : 'text-muted-foreground'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {client.notes && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground bg-accent/30 rounded-lg p-3">
                          <strong className="text-foreground">Observações:</strong> {client.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredClients.length === 0 && (
                <Card className="bg-card border-border">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <UserCheck className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Nenhum cliente encontrado</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? 'Tente alterar os filtros de busca.' : 'Adicione seu primeiro cliente para começar.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>;
};

export default DesignTestClientsPage;