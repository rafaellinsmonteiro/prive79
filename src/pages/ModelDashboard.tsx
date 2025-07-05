import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Image, Settings, BarChart3, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useModelProfile } from '@/hooks/useModelProfile';
import { toast } from 'sonner';
import EnhancedModelProfileManager from '@/components/model/EnhancedModelProfileManager';
import EnhancedModelMediaManager from '@/components/model/EnhancedModelMediaManager';
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
        return <EnhancedModelProfileManager profile={profile} />;
      case 'media':
        return <EnhancedModelMediaManager modelId={profile.model_id} />;
      case 'privacy':
        return <ModelPrivacySettings modelId={profile.model_id} />;
      case 'stats':
        return <ModelStats modelId={profile.model_id} />;
      default:
        return <EnhancedModelProfileManager profile={profile} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">

      {/* Mobile Navigation Tabs */}
      <div className="bg-zinc-900 border-b border-zinc-800 overflow-x-auto">
        <div className="flex space-x-1 px-4 py-2 min-w-max">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeSection === item.key
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default ModelDashboard;
