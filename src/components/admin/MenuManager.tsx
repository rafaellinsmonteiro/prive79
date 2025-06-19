
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminMenuItems } from '@/hooks/useAdminMenuItems';
import { Plus, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MenuItemsList from './MenuItemsList';
import MenuItemForm from './MenuItemForm';

const MenuManager = () => {
  const { data: menuItems = [], isLoading } = useAdminMenuItems();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [creatingSubmenuFor, setCreatingSubmenuFor] = useState<string | null>(null);
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-zinc-400">Carregando itens do menu...</div>
      </div>
    );
  }

  const handleCreateNew = () => {
    setShowCreateForm(true);
    setEditingItem(null);
    setCreatingSubmenuFor(null);
  };

  const handleCreateSubmenu = (parentId: string) => {
    setShowCreateForm(true);
    setEditingItem(null);
    setCreatingSubmenuFor(parentId);
  };

  const handleEdit = (id: string) => {
    setShowCreateForm(false);
    setEditingItem(id);
    setCreatingSubmenuFor(null);
  };

  const handleSuccess = (newItem?: any) => {
    setShowCreateForm(false);
    setCreatingSubmenuFor(null);
    
    if (newItem?.id && !editingItem) {
      // Se criou um novo item, abrir para edição
      setEditingItem(newItem.id);
      toast({
        title: "Item criado com sucesso!",
        description: "Agora você pode configurar a visibilidade.",
      });
    } else {
      // Se atualizou um item existente
      setEditingItem(null);
      toast({
        title: "Sucesso",
        description: "Item do menu atualizado com sucesso!",
      });
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingItem(null);
    setCreatingSubmenuFor(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Menu className="h-6 w-6" />
          <h3 className="text-xl font-semibold text-white">Gerenciar Menu</h3>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Item
        </Button>
      </div>

      {showCreateForm && (
        <MenuItemForm
          parentId={creatingSubmenuFor || undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}

      {editingItem && (
        <MenuItemForm
          itemId={editingItem}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Itens do Menu</CardTitle>
          <p className="text-sm text-zinc-400">
            Arraste os itens para reordenar. Clique no ícone + para adicionar submenus.
          </p>
        </CardHeader>
        <CardContent>
          <MenuItemsList
            items={menuItems}
            loading={isLoading}
            onEdit={handleEdit}
            onCreateSubmenu={handleCreateSubmenu}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuManager;
