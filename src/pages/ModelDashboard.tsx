import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Image, Settings, BarChart3, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useModelProfile } from '@/hooks/useModelProfile';
import { toast } from 'sonner';
import ModelProfileManager from '@/components/model/ModelProfileManager';
import ModelMediaManager from '@/components/model/ModelMediaManager';
import ModelPrivacySettings from '@/components/model/ModelPrivacySettings';
import ModelStats from '@/components/model/ModelStats';

const ModelDashboard = () => {
  const [activeSection, setActiveSection] = useState('profile');
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

  const menuItems = [
    { key: 'profile', label: 'Perfil', icon: User },
    { key: 'media', label: 'Mídias', icon: Image },
    { key: 'privacy', label: 'Privacidade', icon: Shield },
    { key: 'stats', label: 'Estatísticas', icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ModelProfileManager profile={profile} />;
      case 'media':
        return <ModelMediaManager modelId={profile.model_id} />;
      case 'privacy':
        return <ModelPrivacySettings modelId={profile.model_id} />;
      case 'stats':
        return <ModelStats modelId={profile.model_id} />;
      default:
        return <ModelProfileManager profile={profile} />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-zinc-900 min-h-screen border-r border-zinc-800">
          <div className="p-6">
            <h1 className="text-xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-zinc-400 text-sm mb-6">{profile.models?.name}</p>
            
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-colors ${
                      activeSection === item.key
                        ? 'bg-blue-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            
            <div className="mt-8 pt-8 border-t border-zinc-800">
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="w-full justify-start text-zinc-400 hover:text-white"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ModelDashboard;
