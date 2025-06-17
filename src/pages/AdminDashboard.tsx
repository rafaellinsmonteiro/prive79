
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminModels } from '@/hooks/useAdminModels';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, LogOut, Settings, Building, Tags, Menu } from 'lucide-react';
import ModelsList from '@/components/admin/ModelsList';
import ModelForm from '@/components/admin/ModelForm';
import { useToast } from '@/hooks/use-toast';
import CitiesManager from '@/components/admin/CitiesManager';
import CategoriesManager from '@/components/admin/CategoriesManager';
import MenuManager from '@/components/admin/MenuManager';

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading, authComplete, signOut } = useAuth();
  const { data: models = [], isLoading } = useAdminModels();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect when auth is complete
    if (authComplete && (!user || !isAdmin)) {
      console.log('Admin dashboard: redirecting to login', { user: !!user, isAdmin });
      navigate('/login');
    }
  }, [user, isAdmin, authComplete, navigate]);

  // Show loading while auth is being checked
  if (authLoading || !authComplete) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Verificando autenticação...</div>
      </div>
    );
  }

  // Don't render if user is not admin (will be redirected by useEffect)
  if (!user || !isAdmin) {
    return null;
  }

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error || (error && error.message === 'Auth session missing!')) {
      navigate('/'); // Redirect to the main site
      if (!error) {
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
      }
    } else {
      toast({
        title: "Erro no logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
            <div className="flex items-center gap-4">
              <span className="text-zinc-400">Olá, {user.email}</span>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="models" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 lg:w-auto lg:grid-cols-2">
            <TabsTrigger value="models">Modelos</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                <h2 className="text-xl font-semibold">Gerenciar Modelos</h2>
              </div>
              <Button onClick={() => { setShowCreateForm(true); setEditingModel(null); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Modelo
              </Button>
            </div>

            {showCreateForm && !editingModel && (
              <ModelForm
                onSuccess={(newModel) => {
                  setShowCreateForm(false);
                  if (newModel?.id) {
                    setEditingModel(newModel.id);
                    toast({
                      title: "Modelo criada com sucesso!",
                      description: "Agora você pode adicionar fotos e vídeos.",
                    });
                  } else {
                     toast({
                      title: "Sucesso",
                      description: "Modelo criada com sucesso!",
                    });
                  }
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            )}

            {editingModel && (
              <ModelForm
                modelId={editingModel}
                onSuccess={() => {
                  setEditingModel(null);
                  toast({
                    title: "Sucesso",
                    description: "Modelo atualizada com sucesso!",
                  });
                }}
                onCancel={() => setEditingModel(null)}
              />
            )}

            <ModelsList
              models={models}
              loading={isLoading}
              onEdit={(id) => {
                setShowCreateForm(false);
                setEditingModel(id);
              }}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Configurações Gerais</h2>
            </div>

            {/* Sistema de abas internas para Cidades, Categorias e Menu */}
            <Tabs defaultValue="cities" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="cities">
                  <Building className="h-4 w-4 mr-2" />
                  Cidades
                </TabsTrigger>
                <TabsTrigger value="categories">
                  <Tags className="h-4 w-4 mr-2" />
                  Categorias
                </TabsTrigger>
                <TabsTrigger value="menu">
                  <Menu className="h-4 w-4 mr-2" />
                  Menu
                </TabsTrigger>
              </TabsList>
              <TabsContent value="cities" className="mt-6">
                <CitiesManager />
              </TabsContent>
              <TabsContent value="categories" className="mt-6">
                <CategoriesManager />
              </TabsContent>
              <TabsContent value="menu" className="mt-6">
                <MenuManager />
              </TabsContent>
            </Tabs>

          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
