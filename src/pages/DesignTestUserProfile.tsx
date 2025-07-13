import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, MessageSquare, Calendar, TrendingUp, Settings, LogOut, Sun, Moon, ChevronLeft, Search, Bell, Star, BarChart3, PlusCircle, Menu, DollarSign, User, Edit2, Save, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserBalance } from '@/hooks/useUserBalance';
import { supabase } from '@/integrations/supabase/client';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';
const DesignTestUserProfile = () => {
  const isMobile = useIsMobile();
  const {
    user,
    signOut,
    isAdmin
  } = useAuth();
  const {
    data: currentUser,
    isLoading: currentUserLoading,
    error: currentUserError
  } = useCurrentUser();
  const {
    data: balanceData
  } = useUserBalance();
  const {
    toast
  } = useToast();
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [isDark, setIsDark] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>('');
  const [userInfo, setUserInfo] = useState({
    email: '',
    name: '',
    whatsapp: '',
    password: '',
    confirmPassword: ''
  });

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [isMobile]);

  // Carregar informações do usuário
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const basicInfo = {
          email: user.email || '',
          name: user.user_metadata?.name || '',
          whatsapp: user.user_metadata?.whatsapp || '',
          password: '',
          confirmPassword: ''
        };
        setUserInfo(basicInfo);

        // Carregar foto de perfil
        if (currentUser?.profile_photo_url) {
          setProfilePhotoUrl(currentUser.profile_photo_url);
        } else if (user.user_metadata?.profile_photo_url) {
          setProfilePhotoUrl(user.user_metadata.profile_photo_url);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar informações do usuário",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [user, currentUser, toast]);
  const navigationItems = [{
    icon: LayoutDashboard,
    label: 'Dashboard',
    id: 'dashboard',
    active: false
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
  const handleSignOut = async () => {
    const {
      error
    } = await signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso"
      });
    }
  };
  const handleSave = async () => {
    try {
      // Validações básicas
      if (userInfo.password && userInfo.password !== userInfo.confirmPassword) {
        toast({
          title: "Erro",
          description: "As senhas não coincidem",
          variant: "destructive"
        });
        return;
      }
      if (userInfo.password && userInfo.password.length < 6) {
        toast({
          title: "Erro",
          description: "A senha deve ter pelo menos 6 caracteres",
          variant: "destructive"
        });
        return;
      }

      // Atualizar informações do usuário
      const updateData: any = {
        data: {
          name: userInfo.name,
          whatsapp: userInfo.whatsapp
        }
      };

      // Se email mudou, incluir na atualização
      if (userInfo.email !== user?.email) {
        updateData.email = userInfo.email;
      }

      // Se senha foi fornecida, incluir na atualização
      if (userInfo.password) {
        updateData.password = userInfo.password;
      }
      const {
        error
      } = await supabase.auth.updateUser(updateData);
      if (error) {
        toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso"
      });

      // Limpar senha dos campos
      setUserInfo(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as informações",
        variant: "destructive"
      });
    }
  };
  const handleCancel = () => {
    // Restaurar dados originais
    setUserInfo({
      email: user?.email || '',
      name: user?.user_metadata?.name || '',
      whatsapp: user?.user_metadata?.whatsapp || '',
      password: '',
      confirmPassword: ''
    });
    setIsEditing(false);
  };
  const handlePhotoUpdate = (photoUrl: string) => {
    setProfilePhotoUrl(photoUrl);
    toast({
      title: "Sucesso",
      description: "Foto de perfil atualizada!"
    });
  };
  return <div className={`min-h-screen flex w-full ${isDark ? 'dark' : ''} bg-background text-foreground`}>
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* Sidebar */}
      <div className={`
          bg-card 
          border-r border-border 
          transition-all duration-300 ease-in-out
          flex flex-col
          shadow-xl
          ${isMobile ? `fixed left-0 top-0 h-full z-50 ${isMobileMenuOpen ? 'w-72' : 'w-0 overflow-hidden'}` : `relative ${isExpanded ? 'w-72' : 'w-20'}`}
        `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-[0_4px_20px_hsl(var(--primary))_/_0.3]">
                <DollarSign className="w-5 h-5 text-primary-foreground" />
              </div>
              {isExpanded && <div>
                  <div className="font-bold text-lg text-foreground">PrivePlatform</div>
                  <div className="text-sm text-muted-foreground">
                    Premium Experience
                  </div>
                </div>}
            </div>
            {!isMobile && <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-muted-foreground hover:text-foreground hover:bg-accent p-2 rounded-lg">
                <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? '' : 'rotate-180'}`} />
              </Button>}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6 space-y-8">
          {/* Main Navigation */}
          <div>
            {(isExpanded || isMobileMenuOpen) && <div className="text-xs font-semibold mb-4 px-3 text-muted-foreground uppercase tracking-wider">
                Principal
              </div>}
            <nav className="space-y-2">
              {navigationItems.map(item => <div key={item.id} className="relative group" onMouseEnter={() => setHoveredItem(item.id)} onMouseLeave={() => setHoveredItem(null)}>
                  <Button variant="ghost" className={`
                      w-full justify-start px-3 py-3 h-12 rounded-xl transition-all duration-200
                      ${item.active ? 'bg-gradient-to-r from-primary/20 to-primary/30 text-primary shadow-lg border border-primary/20' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}
                    `}>
                    <item.icon className="w-5 h-5 shrink-0" />
                    {(isExpanded || isMobileMenuOpen) && <>
                        <span className="ml-3 font-medium">{item.label}</span>
                        {item.badge && <Badge variant="secondary" className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-sm">
                            {item.badge}
                          </Badge>}
                      </>}
                  </Button>
                  
                  {!isMobile && !isExpanded && hoveredItem === item.id && <div className="absolute left-20 top-3 z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg whitespace-nowrap">
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>}
                </div>)}
            </nav>
          </div>

          {/* User Profile Section */}
          <div className="border-t border-border pt-6">
            {(isExpanded || isMobileMenuOpen) && <div className="text-xs font-semibold mb-4 px-3 text-muted-foreground uppercase tracking-wider">
                Conta
              </div>}
            
            {/* User Profile */}
              <div className="mb-4 px-3">
                <div className={`flex items-center gap-3 p-3 rounded-xl bg-accent/50 ${isExpanded || isMobileMenuOpen ? '' : 'justify-center'}`}>
                  <Avatar className="w-8 h-8 ring-2 ring-primary/20 shrink-0">
                    <AvatarImage src={profilePhotoUrl || currentUser?.profile_photo_url || '/lovable-uploads/182f2a41-9665-421f-ad03-aee8b5a34ad0.png'} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-sm">
                      {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                {(isExpanded || isMobileMenuOpen) && <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground text-sm truncate">
                      {currentUser?.name || 'Usuário'}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {currentUser?.user_role || 'Cliente'}
                    </div>
                  </div>}
                  
                  {/* Action Icons */}
                  <div className="flex items-center gap-2 ml-auto">
                    <Button variant="ghost" size="sm" className="p-1.5 h-7 w-7 hover:bg-accent text-muted-foreground hover:text-foreground">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="p-1.5 h-7 w-7 hover:bg-red-500/10 text-muted-foreground hover:text-red-500">
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
              </div>
            </div>

            {/* Balance Display */}
            {(isExpanded || isMobileMenuOpen) && balanceData && <div className="mb-4 px-3">
                
                <div className="grid grid-cols-2 gap-2">
                  {/* R$ Card */}
                  <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg p-3 border border-green-500/20">
                    <div className="text-xs text-green-600 font-medium mb-1">R$</div>
                    <div className="font-bold text-sm text-foreground">
                      {new Intl.NumberFormat('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(Number(balanceData.balance_brl) || 0)}
                    </div>
                  </div>
                  
                  {/* P$ Card */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg p-3 border border-primary/20">
                    <div className="text-xs text-primary font-medium mb-1">P$</div>
                    <div className="font-bold text-sm text-primary">
                      {new Intl.NumberFormat('pt-BR').format(Number(balanceData.balance) || 0)}
                    </div>
                  </div>
                </div>
              </div>}

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
              {isMobile && <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-accent">
                  <Menu className="w-5 h-5 text-muted-foreground" />
                </Button>}
              
              <div>
                <h1 className="text-xl lg:text-3xl font-bold text-primary mb-1">
                  Perfil do Usuário
                </h1>
                <p className="text-sm lg:text-base text-muted-foreground hidden sm:block">
                  Gerencie suas informações pessoais e configurações da conta.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Search - Hidden on small mobile */}
              {!isMobile && <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar..." className="pl-10 w-60 lg:w-80 bg-accent border-border focus:border-primary" />
                </div>}
              
              <Button variant="ghost" size="sm" className="relative p-2 hover:bg-accent">
                <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
                <div className="absolute -top-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 bg-primary rounded-full"></div>
              </Button>
              
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-[0_4px_20px_hsl(var(--primary))_/_0.3] text-sm lg:text-base px-3 lg:px-4">
                <PlusCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Novo</span>
                <span className="sm:hidden">+</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area - Profile Form */}
        <main className="p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-2">
                <Card className="bg-card border-border">
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <ProfilePhotoUpload size="lg" />
                    </div>
                    <CardTitle className="text-foreground text-2xl">Informações Pessoais</CardTitle>
                    {isAdmin && <div className="inline-block bg-primary px-3 py-1 rounded-full text-sm text-primary-foreground">
                        Administrador
                      </div>}
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={e => {
                    e.preventDefault();
                    handleSave();
                  }} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-foreground font-medium">
                            Nome Completo
                          </Label>
                          <Input id="name" type="text" value={userInfo.name} onChange={e => setUserInfo({
                          ...userInfo,
                          name: e.target.value
                        })} disabled={!isEditing} placeholder="Digite seu nome completo" className="bg-background border-border text-foreground placeholder:text-muted-foreground disabled:opacity-60" autoComplete="name" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-foreground font-medium">
                            Email
                          </Label>
                          <Input id="email" type="email" value={userInfo.email} onChange={e => setUserInfo({
                          ...userInfo,
                          email: e.target.value
                        })} disabled={!isEditing} className="bg-background border-border text-foreground placeholder:text-muted-foreground disabled:opacity-60" autoComplete="email" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="whatsapp" className="text-foreground font-medium">
                          WhatsApp
                        </Label>
                        <Input id="whatsapp" type="tel" value={userInfo.whatsapp} onChange={e => setUserInfo({
                        ...userInfo,
                        whatsapp: e.target.value
                      })} disabled={!isEditing} placeholder="(11) 99999-9999" className="bg-background border-border text-foreground placeholder:text-muted-foreground disabled:opacity-60" autoComplete="tel" />
                      </div>

                      {isEditing && <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="password" className="text-foreground font-medium">
                              Nova Senha (opcional)
                            </Label>
                            <div className="relative">
                              <Input id="password" type={showPassword ? "text" : "password"} value={userInfo.password} onChange={e => setUserInfo({
                            ...userInfo,
                            password: e.target.value
                          })} placeholder="Digite uma nova senha" className="bg-background border-border text-foreground placeholder:text-muted-foreground pr-10" autoComplete="new-password" />
                              <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                              Confirmar Nova Senha
                            </Label>
                            <Input id="confirmPassword" type="password" value={userInfo.confirmPassword} onChange={e => setUserInfo({
                          ...userInfo,
                          confirmPassword: e.target.value
                        })} placeholder="Confirme a nova senha" className="bg-background border-border text-foreground placeholder:text-muted-foreground" autoComplete="new-password" />
                          </div>
                        </div>}

                      <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        {!isEditing ? <>
                            <Button type="button" onClick={() => setIsEditing(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                              <Edit2 className="h-4 w-4 mr-2" />
                              Editar Informações
                            </Button>
                            <Button type="button" onClick={handleSignOut} variant="destructive" className="bg-red-600 hover:bg-red-700">
                              <LogOut className="h-4 w-4 mr-2" />
                              Sair da Conta
                            </Button>
                          </> : <div className="flex gap-4">
                            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                              <Save className="h-4 w-4 mr-2" />
                              Salvar Alterações
                            </Button>
                            <Button type="button" onClick={handleCancel} variant="outline" className="border-border bg-background text-foreground hover:bg-accent">
                              <X className="h-4 w-4 mr-2" />
                              Cancelar
                            </Button>
                          </div>}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Account Info Sidebar */}
              <div className="space-y-6">
                {/* Plan Info Card */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary" />
                      Plano Ativo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      {currentUserError ? <div className="text-red-400">Erro ao carregar plano</div> : currentUser?.plan ? <div>
                          <div className="text-lg font-semibold text-primary mb-1">
                            {currentUser.plan.name}
                          </div>
                          <div className="text-2xl font-bold text-foreground mb-2">
                            R$ {Number(currentUser.plan.price).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {currentUser.plan.description || 'Plano ativo'}
                          </div>
                        </div> : currentUser ? <div className="text-yellow-400">Nenhum plano ativo</div> : <div className="text-muted-foreground">Carregando...</div>}
                    </div>
                  </CardContent>
                </Card>

                {/* Account Stats */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Estatísticas da Conta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tipo de Usuário</span>
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        {currentUser?.user_role || 'Cliente'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        Ativo
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Membro desde</span>
                      <span className="text-foreground text-sm">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>;
};
export default DesignTestUserProfile;