import React, { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Clock
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useModelProfile } from '@/hooks/useModelProfile';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
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
  const navigate = useNavigate();

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

  const menuSections = [
    {
      title: "Principal",
      items: [
        { name: "Dashboard", path: "dashboard", icon: LayoutDashboard },
        { name: "Feed", path: "feed", icon: Rss },
        { name: "Conversas", path: "conversas", icon: MessageCircle },
        { name: "Perfil", path: "perfil", icon: User },
        { name: "Mídias", path: "midias", icon: Camera },
      ]
    },
    {
      title: "Vendas",
      items: [
        { name: "Agenda", path: "agenda", icon: Calendar },
        { name: "Serviços", path: "servicos", icon: Wrench },
        { name: "Clientes", path: "clientes", icon: Users },
      ]
    },
    {
      title: "Evolução",
      items: [
        { name: "Avaliações", path: "avaliacoes", icon: Star },
        { name: "Metas", path: "metas", icon: Target },
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border min-h-[calc(100vh-64px)] p-4">
          {/* Menu Sections */}
          <nav className="space-y-6">
            {menuSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => setActiveSection(item.path)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${activeSection === item.path
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                      <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${
                        activeSection === item.path ? 'rotate-90' : ''
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Profile Card */}
          <div className="mt-8 p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {profile?.models?.name?.charAt(0).toUpperCase() || 'M'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.models?.name || user?.email}
                </p>
                <p className="text-xs text-muted-foreground">Modelo</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-background/50 rounded p-2 text-center">
                <div className="font-medium text-foreground">4.8</div>
                <div className="text-muted-foreground">Rating</div>
              </div>
              <div className="bg-background/50 rounded p-2 text-center">
                <div className="font-medium text-foreground">23</div>
                <div className="text-muted-foreground">Reviews</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DesignTestModelDashboard;