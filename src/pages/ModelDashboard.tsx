import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Image, Settings, BarChart3, LogOut, Shield, Home, Target, MessageSquare, Calendar, Briefcase, Users, DollarSign, Star, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useModelProfile } from '@/hooks/useModelProfile';
import { toast } from 'sonner';
import EnhancedModelProfileManager from '@/components/model/EnhancedModelProfileManager';
import EnhancedModelMediaManager from '@/components/model/EnhancedModelMediaManager';
import ModelPrivacySettings from '@/components/model/ModelPrivacySettings';
import ModelStats from '@/components/model/ModelStats';
import ModelDashboardHome from '@/components/model/ModelDashboardHome';
import ModelGoals from '@/components/model/ModelGoals';

const ModelDashboard = () => {
  const [activeSection, setActiveSection] = useState('home');
  const { user, signOut, loading, authComplete } = useAuth();
  const { profile, isLoading: profileLoading } = useModelProfile();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('=== ModelDashboard Debug ===');
    console.log('Auth state:', { user: !!user, loading, authComplete });
    console.log('User details:', user ? { id: user.id, email: user.email } : 'No user');
    console.log('Profile loading:', profileLoading);
    console.log('Profile data:', profile);
    
    if (authComplete && !user) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [user, loading, authComplete, navigate, profile, profileLoading]);

  const handleSignOut = async () => {
    console.log('Model dashboard - initiating logout');
    
    const loadingToast = toast.loading('Fazendo logout...');
    
    try {
      await signOut();
      toast.dismiss(loadingToast);
      toast.success('Logout realizado com sucesso');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Unexpected logout error:', error);
      toast.dismiss(loadingToast);
      toast.success('Logout realizado');
      navigate('/login', { replace: true });
    }
  };

  if (loading || !authComplete || profileLoading) {
    console.log('Still loading...', { loading, authComplete, profileLoading });
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Redirecionando para login...</div>
      </div>
    );
  }

  if (!profile) {
    console.log('No profile found, showing error message');
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-zinc-900 border-zinc-800 max-w-md">
          <CardHeader>
            <CardTitle className="text-white">Perfil de Modelo Não Encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-zinc-400 mb-4 space-y-2">
              <p>Você precisa estar associado a um perfil de modelo para acessar esta área.</p>
              <div className="text-xs bg-zinc-800 p-2 rounded">
                <p><strong>Debug Info:</strong></p>
                <p>User ID: {user.id}</p>
                <p>Email: {user.email}</p>
                <p>Verifique o console para mais detalhes.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/')} variant="outline">
                Voltar ao Início
              </Button>
              <Button onClick={handleSignOut} variant="ghost">
                Fazer Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { key: 'home', label: 'Dashboard', icon: Home },
    { key: 'messages', label: 'Mensagens', icon: MessageSquare },
    { key: 'schedule', label: 'Agenda', icon: Calendar },
    { key: 'services', label: 'Serviços', icon: Briefcase },
    { key: 'clients', label: 'Clientes', icon: Users },
    { key: 'privabank', label: 'PriveBank', icon: DollarSign },
    { key: 'reviews', label: 'Avaliações', icon: Star },
    { key: 'goals', label: 'Metas', icon: Target },
    { key: 'profile', label: 'Perfil', icon: User },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <ModelDashboardHome profile={profile} modelId={profile.model_id} onSectionChange={setActiveSection} />;
      case 'profile':
        return <EnhancedModelProfileManager profile={profile} />;
      case 'media':
        return <EnhancedModelMediaManager modelId={profile.model_id} />;
      case 'goals':
        return <ModelGoals modelId={profile.model_id} />;
      case 'privacy':
        return <ModelPrivacySettings modelId={profile.model_id} />;
      case 'stats':
        return <ModelStats modelId={profile.model_id} />;
      case 'messages':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-4">Mensagens</h1>
            <p className="text-zinc-400">Em desenvolvimento...</p>
          </div>
        );
      case 'schedule':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-4">Agenda</h1>
            <p className="text-zinc-400">Em desenvolvimento...</p>
          </div>
        );
      case 'services':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-4">Serviços</h1>
            <p className="text-zinc-400">Em desenvolvimento...</p>
          </div>
        );
      case 'clients':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-4">Clientes</h1>
            <p className="text-zinc-400">Em desenvolvimento...</p>
          </div>
        );
      case 'privabank':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-4">PriveBank</h1>
            <p className="text-zinc-400">Em desenvolvimento...</p>
          </div>
        );
      case 'reviews':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-4">Avaliações</h1>
            <p className="text-zinc-400">Em desenvolvimento...</p>
          </div>
        );
      default:
        return <ModelDashboardHome profile={profile} modelId={profile.model_id} onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-zinc-900 border-r border-zinc-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = activeSection === item.key;
              const IconComponent = item.icon;
              
              return (
                <li key={item.key}>
                  <button
                    onClick={() => {
                      setActiveSection(item.key);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      isActive 
                        ? 'bg-red-500 text-white border border-red-500' 
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile menu button */}
        <div className="lg:hidden p-4 border-b border-zinc-800">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-400 hover:text-white"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ModelDashboard;
