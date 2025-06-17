
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
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-zinc-400">Carregando itens do menu...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Menu className="h-6 w-6" />
          <h3 className="text-xl font-semibold text-white">Gerenciar Menu</h3>
        </div>
        <Button onClick={() => { setShowCreateForm(true); setEditingItem(null); }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Item
        </Button>
      </div>

      {showCreateForm && !editingItem && (
        <MenuItemForm
          onSuccess={(newItem) => {
            setShowCreateForm(false);
            if (newItem?.id) {
              setEditingItem(newItem.id);
              toast({
                title: "Item criado com sucesso!",
                description: "Agora você pode configurar a visibilidade.",
              });
            } else {
              toast({
                title: "Sucesso",
                description: "Item do menu criado com sucesso!",
              });
            }
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingItem && (
        <MenuItemForm
          itemId={editingItem}
          onSuccess={() => {
            setEditingItem(null);
            toast({
              title: "Sucesso",
              description: "Item do menu atualizado com sucesso!",
            });
          }}
          onCancel={() => setEditingItem(null)}
        />
      )}

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Itens do Menu</CardTitle>
        </CardHeader>
        <CardContent>
          <MenuItemsList
            items={menuItems}
            loading={isLoading}
            onEdit={(id) => {
              setShowCreateForm(false);
              setEditingItem(id);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuManager;
