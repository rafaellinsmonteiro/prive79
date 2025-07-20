import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, MessageSquare, Calendar, TrendingUp, Settings, LogOut, Sun, Moon, ChevronLeft, Search, Bell, PlusCircle, Menu, Star, DollarSign, Clock, Edit, Copy, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { Zap } from 'lucide-react';
import { useServices, Service } from '@/hooks/useServices';
import { toast } from 'sonner';

const DesignTestServicesPage = () => {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [isDark, setIsDark] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Service form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 60,
    is_active: true
  });

  const { services, isLoading, createService, updateService, deleteService } = useServices();

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
    icon: Star,
    label: 'Serviços',
    id: 'services',
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

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && service.is_active) ||
      (filterStatus === 'inactive' && !service.is_active);
    return matchesSearch && matchesFilter;
  });

  const totalServices = services.length;
  const averagePrice = services.length > 0 
    ? services.reduce((sum, service) => sum + service.price, 0) / services.length 
    : 0;

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        price: service.price,
        duration: service.duration,
        is_active: service.is_active
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        duration: 60,
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveService = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome do serviço é obrigatório');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Preço deve ser maior que zero');
      return;
    }

    try {
      if (editingService) {
        await updateService.mutateAsync({
          id: editingService.id,
          name: formData.name,
          description: formData.description,
          price: formData.price,
          duration: formData.duration,
          is_active: formData.is_active
        });
      } else {
        await createService.mutateAsync({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          duration: formData.duration,
          is_active: formData.is_active,
          allow_online_booking: false,
        });
      }

      setIsModalOpen(false);
      setEditingService(null);
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleDuplicateService = async (service: Service) => {
    try {
      await createService.mutateAsync({
        name: `${service.name} (Cópia)`,
        description: service.description,
        price: service.price,
        duration: service.duration,
        is_active: service.is_active,
        allow_online_booking: service.allow_online_booking ?? false,
      });
    } catch (error) {
      console.error('Error duplicating service:', error);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (confirm('Tem certeza que deseja remover este serviço?')) {
      try {
        await deleteService.mutateAsync(serviceId);
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
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
                  Serviços
                </h1>
                <p className="text-sm lg:text-base text-muted-foreground hidden sm:block">
                  Gerencie seus serviços e preços.
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
              
              <Button 
                onClick={() => handleOpenModal()}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-[0_4px_20px_hsl(var(--primary))_/_0.3] text-sm lg:text-base px-3 lg:px-4"
              >
                <PlusCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Novo Serviço</span>
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

        {/* Content Area - Services Manager */}
        <main className="p-4 lg:p-8 overflow-y-auto h-[calc(100vh-120px)]">
          <div className="space-y-6">
            {/* Filtros e busca */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar serviços por nome..."
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
                      <p className="text-2xl font-bold text-foreground">{totalServices}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-lg flex items-center justify-center">
                      <Star className="h-5 w-5 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ativos</p>
                      <p className="text-2xl font-bold text-foreground">{services.filter(s => s.is_active).length}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-lg flex items-center justify-center">
                      <Star className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Médio</p>
                      <p className="text-2xl font-bold text-foreground">R$ {averagePrice.toFixed(2)}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Inativos</p>
                      <p className="text-2xl font-bold text-foreground">{services.filter(s => !s.is_active).length}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-lg flex items-center justify-center">
                      <Star className="h-5 w-5 text-red-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Services List */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-muted-foreground">Carregando serviços...</div>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Nenhum serviço encontrado</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {searchTerm ? 'Tente ajustar sua pesquisa' : 'Você ainda não tem serviços cadastrados'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => handleOpenModal()}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Cadastrar Primeiro Serviço
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground">{service.name}</h3>
                            <Badge className={getStatusColor(service.is_active)}>
                              {service.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          
                          {service.description && (
                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                              {service.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span className="text-green-500 font-medium">
                                R$ {service.price.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground text-sm">
                                {formatDuration(service.duration)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-popover border-border">
                            <DropdownMenuItem 
                              onClick={() => handleOpenModal(service)}
                              className="text-foreground focus:bg-accent"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar serviço
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDuplicateService(service)}
                              className="text-foreground focus:bg-accent"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar serviço
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteService(service.id)}
                              className="text-destructive focus:bg-accent focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover serviço
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Service Form Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span>{editingService ? 'Editar Serviço' : 'Novo Serviço'}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Serviço *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Corte + Escova"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva os detalhes do serviço..."
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0,00"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (minutos) *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                      placeholder="60"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Serviço Ativo</Label>
                    <p className="text-sm text-muted-foreground">
                      Serviço disponível para agendamento
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveService}
                    className="flex-1"
                    disabled={createService.isPending || updateService.isPending}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {editingService ? 'Atualizar' : 'Criar'} Serviço
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>;
};

export default DesignTestServicesPage;