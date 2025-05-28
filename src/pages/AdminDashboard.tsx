
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminModels } from '@/hooks/useAdminModels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, LogOut } from 'lucide-react';
import ModelsList from '@/components/admin/ModelsList';
import ModelForm from '@/components/admin/ModelForm';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { user, signOut, isAdmin, loading } = useAuth();
  const { data: models = [], isLoading } = useAdminModels();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-600 mb-4">
              Você não tem permissão para acessar o dashboard administrativo.
            </p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
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

          <TabsContent value="media">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Gerenciamento de Mídia</h3>
              <p className="text-zinc-400">Em desenvolvimento...</p>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Configurações</h3>
              <p className="text-zinc-400">Em desenvolvimento...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
