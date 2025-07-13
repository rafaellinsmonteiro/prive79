import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useIsMobile } from "@/hooks/use-mobile";
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
  ChevronRight,
  Clock,
  Shield,
  TrendingUp,
  Filter,
  Download
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PendingReviewsPanel } from '@/components/reviews/PendingReviewsPanel';
import { PriveTrustPanel } from '@/components/reviews/PriveTrustPanel';
import { useReviews } from '@/hooks/useReviews';
import { usePriveTrust } from '@/hooks/usePriveTrust';

export default function DesignTestReviews() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { data: currentUser } = useCurrentUser();
  const { pendingReviews, myReviews } = useReviews();
  const { getPriveTrustProgress, getLevelInfo } = usePriveTrust();

  const priveTrustProgress = getPriveTrustProgress();
  const levelInfo = getLevelInfo();

  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [isMobile]);

  const navigationItems = [
    { name: "Dashboard", icon: Home, href: "/design-test", badge: null },
    { name: "Modelos", icon: Users, href: "/design-test/models", badge: "24" },
    { name: "Conversas", icon: MessageSquare, href: "/design-test/chat", badge: "5" },
    { name: "Agendamentos", icon: Calendar, href: "/design-test/appointments", badge: null },
    { name: "Clientes", icon: Users, href: "/design-test/clients", badge: null },
    { name: "Serviços", icon: BarChart3, href: "/design-test/services", badge: null },
    { name: "Reviews", icon: Star, href: "/design-test/reviews", badge: null },
  ];

  const accountItems = [
    { name: "Configurações", icon: Settings },
    { name: "Sair", icon: LogOut },
  ];

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
    <div className="min-h-screen bg-background flex">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-14 bg-background border-b z-50 flex items-center justify-between px-4">
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
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'relative'}
        ${isMobile && !isMobileMenuOpen ? '-translate-x-full' : 'translate-x-0'}
        ${isExpanded ? 'w-64' : 'w-16'}
        bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col
      `}>
        {/* Logo */}
        <div className={`p-4 border-b border-border ${!isExpanded && !isMobile ? 'px-2' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
              P
            </div>
            {(isExpanded || isMobile) && (
              <div>
                <h1 className="font-bold text-foreground">PrivePlatform</h1>
                <p className="text-xs text-muted-foreground">Premium Experience</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div className={`text-xs font-medium text-muted-foreground mb-4 ${!isExpanded && !isMobile ? 'hidden' : ''}`}>
            PRINCIPAL
          </div>
          
          {navigationItems.map((item) => (
            <div
              key={item.name}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200
                ${item.name === "Reviews" ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}
                ${!isExpanded && !isMobile ? 'justify-center' : ''}
              `}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {(isExpanded || isMobile) && (
                <>
                  <span className="font-medium">{item.name}</span>
                  <div className="ml-auto flex items-center gap-2">
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </>
              )}
              
              {!isExpanded && !isMobile && hoveredItem === item.name && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-popover border border-border rounded-lg shadow-lg text-sm font-medium whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          {!isExpanded && !isMobile ? (
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser?.profile_photo_url || ''} />
                <AvatarFallback className="text-xs">
                  {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
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
                    {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {currentUser?.name || 'Usuário'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {currentUser?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Config
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {!isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-semibold text-foreground">Reviews</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Bem-vindo de volta! Aqui está o resumo da sua plataforma.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar..."
                className="pl-10 w-64 bg-muted/50 border-border"
              />
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Novo
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 bg-primary mt-14 md:mt-0">
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
  );
}