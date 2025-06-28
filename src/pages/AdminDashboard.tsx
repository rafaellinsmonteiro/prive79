
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Tags, Image, Menu, Video, LogOut, Bot, UserCheck, CreditCard, Settings, MessageCircle, Navigation } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import ModelsListContainer from '@/components/admin/ModelsListContainer';
import CitiesManager from '@/components/admin/CitiesManager';
import CategoriesManager from '@/components/admin/CategoriesManager';
import MediaManagerContainer from '@/components/admin/MediaManagerContainer';
import MenuManager from '@/components/admin/MenuManager';
import ReelsManager from '@/components/admin/ReelsManager';
import ZaiaAIManager from '@/components/admin/ZaiaAIManager';
import UsersManager from '@/components/admin/UsersManager';
import PlansManager from '@/components/admin/PlansManager';
import CustomFieldsManager from '@/components/admin/CustomFieldsManager';
import ChatManager from '@/components/admin/ChatManager';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('models');
  const { user, signOut, loading, isAdmin, authComplete } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AdminDashboard - Auth state:', { user: !!user, isAdmin, loading, authComplete });
    
    // Redirect to login if user is not authenticated and auth check is complete
    if (authComplete && !user) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login', { replace: true });
    }
    
    // Show access denied if user is authenticated but not admin
    if (authComplete && user && !isAdmin) {
      console.log('User is not admin, showing access denied');
    }
  }, [user, isAdmin, loading, authComplete, navigate]);

  const handleSignOut = async () => {
    console.log('Admin dashboard - initiating logout');
    
    // Show loading toast
    const loadingToast = toast.loading('Fazendo logout...');
    
    try {
      // Call signOut (which now handles everything internally)
      await signOut();
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Show success message
      toast.success('Logout realizado com sucesso');
      
      console.log('Logout completed, navigating to login');
      
      // Navigate immediately since state is already cleared
      navigate('/login', { replace: true });
      
    } catch (error) {
      console.error('Unexpected logout error:', error);
      toast.dismiss(loadingToast);
      toast.success('Logout realizado'); // Still show success since we clear local state
      navigate('/login', { replace: true });
    }
  };

  if (loading || !authComplete) {
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">
              Você não tem permissão para acessar esta área.
            </p>
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              className="mt-4"
            >
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const menuItems = [
    { key: 'models', label: 'Modelos', icon: Users },
    { key: 'users', label: 'Usuários', icon: UserCheck },
    { key: 'plans', label: 'Planos', icon: CreditCard },
    { key: 'cities', label: 'Cidades', icon: MapPin },
    { key: 'categories', label: 'Categorias', icon: Tags },
    { key: 'custom-fields', label: 'Campos', icon: Settings },
    { key: 'chat', label: 'Chat', icon: MessageCircle },
    { key: 'media', label: 'Mídia', icon: Image },
    { key: 'sidebar-menu', label: 'Menu Sidebar', icon: Navigation },
    { key: 'menu', label: 'Menu (Legacy)', icon: Menu },
    { key: 'reels', label: 'Reels', icon: Video },
    { key: 'zaia-ai', label: 'IA', icon: Bot },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'models':
        return <ModelsListContainer />;
      case 'users':
        return <UsersManager />;
      case 'plans':
        return <PlansManager />;
      case 'cities':
        return <CitiesManager />;
      case 'categories':
        return <CategoriesManager />;
      case 'custom-fields':
        return <CustomFieldsManager />;
      case 'chat':
        return <ChatManager />;
      case 'media':
        return <MediaManagerContainer />;
      case 'sidebar-menu':
        return <MenuManager />;
      case 'menu':
        return <MenuManager />;
      case 'reels':
        return <ReelsManager />;
      case 'zaia-ai':
        return <ZaiaAIManager />;
      default:
        return <ModelsListContainer />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-zinc-900 min-h-screen border-r border-zinc-800">
          <div className="p-6">
            <h1 className="text-xl font-bold text-white mb-6">Admin Panel</h1>
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

export default AdminDashboard;
