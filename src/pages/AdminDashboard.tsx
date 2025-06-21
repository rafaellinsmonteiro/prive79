import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Tags, Image, Menu, Video, LogOut, Bot } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ModelsListContainer from '@/components/admin/ModelsListContainer';
import CitiesManager from '@/components/admin/CitiesManager';
import CategoriesManager from '@/components/admin/CategoriesManager';
import MediaManagerContainer from '@/components/admin/MediaManagerContainer';
import MenuManager from '@/components/admin/MenuManager';
import ReelsManager from '@/components/admin/ReelsManager';
import ZaiaAIManager from '@/components/admin/ZaiaAIManager';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('models');
  const { user, signOut, loading, isAdmin } = useAuth();

  useEffect(() => {
    console.log('AdminDashboard - Auth state:', { user: !!user, isAdmin, loading });
  }, [user, isAdmin, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
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
          </CardContent>
        </Card>
      </div>
    );
  }

  const menuItems = [
    { key: 'models', label: 'Modelos', icon: Users },
    { key: 'cities', label: 'Cidades', icon: MapPin },
    { key: 'categories', label: 'Categorias', icon: Tags },
    { key: 'media', label: 'Mídia', icon: Image },
    { key: 'menu', label: 'Menu', icon: Menu },
    { key: 'reels', label: 'Reels', icon: Video },
    { key: 'zaia-ai', label: 'Zaia AI', icon: Bot },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'models':
        return <ModelsListContainer />;
      case 'cities':
        return <CitiesManager />;
      case 'categories':
        return <CategoriesManager />;
      case 'media':
        return <MediaManagerContainer />;
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
                onClick={signOut}
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
