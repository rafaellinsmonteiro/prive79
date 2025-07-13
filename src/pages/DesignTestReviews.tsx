import { useState } from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  MessageSquare, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut,
  Search,
  Bell,
  Plus,
  Menu,
  Star,
  Clock,
  Shield,
  TrendingUp
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PendingReviewsPanel } from '@/components/reviews/PendingReviewsPanel';
import { PriveTrustPanel } from '@/components/reviews/PriveTrustPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReviews } from '@/hooks/useReviews';
import { usePriveTrust } from '@/hooks/usePriveTrust';

const menuItems = [
  { title: "Dashboard", url: "/design-test", icon: Home },
  { title: "Modelos", url: "/design-test/models", icon: Users },
  { title: "Conversas", url: "/design-test/chat", icon: MessageSquare },
  { title: "Agendamentos", url: "/design-test/appointments", icon: Calendar },
  { title: "Clientes", url: "/design-test/clients", icon: Users },
  { title: "Serviços", url: "/design-test/services", icon: BarChart3 },
  { title: "Reviews", url: "/design-test/reviews", icon: Star },
];

function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, signOut } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getUserInitials = (name?: string): string => {
    if (!name) return 'U';
    const words = name.split(' ');
    const initials = words.map(word => word.charAt(0).toUpperCase()).join('');
    return initials.substring(0, 2);
  };

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "hidden" : ""}>
            PRINCIPAL
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        `flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-muted'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile Section */}
        <div className="mt-auto p-4">
          {collapsed ? (
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser?.profile_photo_url || ''} />
                <AvatarFallback className="text-xs">
                  {getUserInitials(currentUser?.name)}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => navigate('/profile')}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser?.profile_photo_url || ''} />
                  <AvatarFallback>
                    {getUserInitials(currentUser?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {currentUser?.name || 'Usuário'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start"
                  onClick={() => navigate('/profile')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Config
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default function DesignTestReviews() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pendingReviews, myReviews } = useReviews();
  const { getPriveTrustProgress, getLevelInfo } = usePriveTrust();

  const priveTrustProgress = getPriveTrustProgress();
  const levelInfo = getLevelInfo();

  // Estatísticas de resumo
  const stats = [
    {
      title: 'Avaliações Pendentes',
      value: pendingReviews.length,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      title: 'Avaliações Enviadas',
      value: myReviews.length,
      icon: Star,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Nível Atual',
      value: levelInfo?.currentLevel || 1,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Status Prive Trust',
      value: priveTrustProgress?.hasPriveTrust ? 'Conquistado' : 'Em Progresso',
      icon: Shield,
      color: priveTrustProgress?.hasPriveTrust ? 'text-green-600' : 'text-gray-600',
      bgColor: priveTrustProgress?.hasPriveTrust ? 
        'bg-green-100 dark:bg-green-900/20' : 
        'bg-gray-100 dark:bg-gray-900/20',
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b flex items-center justify-between px-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Reviews</h1>
          <div className="w-8" />
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Desktop Header */}
          <header className="hidden md:flex h-16 items-center justify-between px-6 border-b bg-background">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">Reviews</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar..."
                  className="pl-8 w-64"
                />
              </div>
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo
              </Button>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-6 mt-16 md:mt-0 bg-primary">
            <div className="space-y-6">
              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.title}>
                      <CardContent className="flex items-center p-6">
                        <div className={`rounded-full p-2 ${stat.bgColor} mr-4`}>
                          <Icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                          </p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Conteúdo principal */}
              <Tabs defaultValue="pending" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pending" className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Pendentes</span>
                  </TabsTrigger>
                  <TabsTrigger value="prive-trust" className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Prive Trust</span>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center space-x-2">
                    <Star className="h-4 w-4" />
                    <span>Histórico</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                  <PendingReviewsPanel />
                </TabsContent>

                <TabsContent value="prive-trust">
                  <PriveTrustPanel />
                </TabsContent>

                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle>Histórico de Avaliações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {myReviews.length === 0 ? (
                        <div className="text-center py-8">
                          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="font-semibold text-lg mb-2">Nenhuma avaliação enviada</h3>
                          <p className="text-muted-foreground">
                            Suas avaliações aparecerão aqui após serem enviadas
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {myReviews.map((review) => (
                            <Card key={review.id} className="border-l-4 border-l-primary">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <div className="flex items-center">
                                        {Array.from({ length: 5 }, (_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                              i < review.overall_rating
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-sm text-muted-foreground">
                                        {new Date(review.created_at).toLocaleDateString('pt-BR')}
                                      </span>
                                    </div>
                                    <p className="text-sm line-clamp-2">{review.description}</p>
                                    {review.status === 'pending_publication' && (
                                      <p className="text-xs text-orange-600">
                                        ⏳ Será publicada em 24h
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}