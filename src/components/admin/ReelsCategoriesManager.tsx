
import { useState } from 'react';
import { useReelsCategories, useCreateReelsCategory, useUpdateReelsCategory, useDeleteReelsCategory } from '@/hooks/useReelsCategories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

const ReelsCategoriesManager = () => {
  const { data: categories = [], isLoading } = useReelsCategories();
  const createCategory = useCreateReelsCategory();
  const updateCategory = useUpdateReelsCategory();
  const deleteCategory = useDeleteReelsCategory();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true,
      display_order: 0,
    });
    setShowCreateForm(false);
    setEditingId(null);
  };

  const handleCreate = () => {
    createCategory.mutate(formData, {
      onSuccess: () => resetForm(),
    });
  };

  const handleUpdate = () => {
    if (editingId) {
      updateCategory.mutate(
        { id: editingId, ...formData },
        {
          onSuccess: () => resetForm(),
        }
      );
    }
  };

  const handleEdit = (category: any) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      is_active: category.is_active,
      display_order: category.display_order,
    });
    setEditingId(category.id);
    setShowCreateForm(true);
  };

  const handleDelete = (id: string) => {
    deleteCategory.mutate(id);
  };

  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <div className="text-center text-zinc-400">
            Carregando categorias...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Categorias de Reels</CardTitle>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              variant={showCreateForm ? "outline" : "default"}
            >
              {showCreateForm ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Formulário de Criação/Edição */}
          {showCreateForm && (
            <div className="space-y-4 p-4 border border-zinc-700 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-white">
                {editingId ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Nome</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome da categoria"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Ordem de Exibição</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da categoria (opcional)"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label className="text-white">Ativa</Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={editingId ? handleUpdate : handleCreate}
                    disabled={!formData.name.trim() || createCategory.isPending || updateCategory.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingId ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Categorias */}
          <div className="space-y-4">
            {categories.length === 0 ? (
              <div className="text-center text-zinc-400 py-8">
                <p>Nenhuma categoria criada ainda.</p>
                <p className="text-sm mt-2">Clique em "Nova Categoria" para começar.</p>
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-white">{category.name}</h3>
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                      <span className="text-xs text-zinc-400 bg-zinc-700 px-2 py-1 rounded">
                        Ordem: {category.display_order}
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-sm text-zinc-400 mt-1">{category.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-400 hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a categoria "{category.name}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(category.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReelsCategoriesManager;
