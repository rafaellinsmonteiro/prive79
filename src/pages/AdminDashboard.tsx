
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminModels } from '@/hooks/useAdminModels';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, LogOut, Image, Settings } from 'lucide-react';
import ModelsList from '@/components/admin/ModelsList';
import ModelForm from '@/components/admin/ModelForm';
import MediaManager from '@/components/admin/MediaManager';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { data: models = [], isLoading } = useAdminModels();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [selectedModelForMedia, setSelectedModelForMedia] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/login');
    }
  }, [user, isAdmin, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Verificando autenticação...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro no logout",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate('/login');
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
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
          <TabsList className="grid w-full grid-cols-1 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="models">Modelos</TabsTrigger>
            <TabsTrigger value="media">Mídia</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                <h2 className="text-xl font-semibold">Gerenciar Modelos</h2>
              </div>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Modelo
              </Button>
            </div>

            {showCreateForm && (
              <ModelForm
                onSuccess={() => {
                  setShowCreateForm(false);
                  toast({
                    title: "Sucesso",
                    description: "Modelo criada com sucesso!",
                  });
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
              onEdit={(id) => setEditingModel(id)}
            />
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="h-6 w-6" />
                <h2 className="text-xl font-semibold">Gerenciar Mídia</h2>
              </div>
            </div>

            {models.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">Nenhuma modelo cadastrada</h3>
                <p className="text-zinc-400 mb-4">
                  Você precisa cadastrar pelo menos uma modelo antes de gerenciar mídias.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeira Modelo
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Seletor de modelo */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Selecione uma modelo para gerenciar mídia:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {models.map((model) => (
                      <div
                        key={model.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedModelForMedia === model.id
                            ? 'border-pink-500 bg-pink-500/10'
                            : 'border-zinc-700 hover:border-zinc-600'
                        }`}
                        onClick={() => setSelectedModelForMedia(model.id)}
                      >
                        <div className="flex items-center gap-3">
                          {model.photos[0] ? (
                            <img
                              src={model.photos[0].photo_url}
                              alt={model.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center">
                              <Users className="h-6 w-6 text-zinc-500" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-white">{model.name}</h4>
                            <p className="text-sm text-zinc-400">
                              {model.age} anos • {model.photos.length} foto(s)
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gerenciador de mídia */}
                {selectedModelForMedia && (
                  <MediaManager modelId={selectedModelForMedia} />
                )}
              </div>
            )}
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
