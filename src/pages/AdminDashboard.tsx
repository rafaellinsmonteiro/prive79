
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminModels } from '@/hooks/useAdminModels';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, LogOut, Settings } from 'lucide-react';
import ModelsList from '@/components/admin/ModelsList';
import ModelForm from '@/components/admin/ModelForm';
import { useToast } from '@/hooks/use-toast';

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

    // The user is effectively logged out if the session is missing.
    // In this case, or on successful logout, redirect them to the main page.
    if (!error || (error && error.message === 'Auth session missing!')) {
      navigate('/'); // Redirect to the main site
      if (!error) {
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
      }
    } else {
      // For other errors (e.g., network issues), show an error toast and stay on the page.
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

          <TabsContent value="settings">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Configurações</h2>
            </div>
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Configurações do Sistema</h3>
              <p className="text-zinc-400">Em desenvolvimento...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
