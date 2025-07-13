import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Calendar, MessageCircle, Settings, LogOut, Home, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from 'sonner';
import ClientDashboardHome from '@/components/client/ClientDashboardHome';

const ClientDashboard = () => {
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section');
  const [activeSection, setActiveSection] = useState(section || 'home');
  const { user, signOut, loading, authComplete } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('=== ClientDashboard Debug ===');
    console.log('Auth state:', { user: !!user, loading, authComplete });
    console.log('User details:', user ? { id: user.id, email: user.email } : 'No user');
    
    if (authComplete && !user) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [user, loading, authComplete, navigate]);

  // Update active section when URL params change
  useEffect(() => {
    if (section) {
      setActiveSection(section);
    }
  }, [section]);

  const handleSignOut = async () => {
    console.log('Client dashboard - initiating logout');
    
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

  if (loading || !authComplete) {
    console.log('Still loading...', { loading, authComplete });
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

  const menuItems = [
    { key: 'home', label: 'Início', icon: Home },
    { key: 'search', label: 'Buscar', icon: Search },
    { key: 'agenda', label: 'Agenda', icon: Calendar },
    { key: 'chat', label: 'Chat', icon: MessageCircle },
    { key: 'settings', label: 'Configurações', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <ClientDashboardHome onSectionChange={setActiveSection} />;
      case 'search':
        return (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Buscar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400">Funcionalidade de busca em desenvolvimento...</p>
            </CardContent>
          </Card>
        );
      case 'agenda':
        return (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Agenda</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400">Sua agenda de compromissos...</p>
            </CardContent>
          </Card>
        );
      case 'chat':
        return (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400">Suas conversas...</p>
            </CardContent>
          </Card>
        );
      case 'settings':
        return (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Configurações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400">Configurações da conta...</p>
            </CardContent>
          </Card>
        );
      default:
        return <ClientDashboardHome onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 relative">
      {/* Floating User Icon */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={handleSignOut}
          size="icon"
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-100 rounded-full w-12 h-12 shadow-lg"
        >
          {currentUser?.profile_photo_url ? (
            <img 
              src={currentUser.profile_photo_url} 
              alt="User" 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <User className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;