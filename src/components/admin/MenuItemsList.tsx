
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  GripVertical, 
  ExternalLink, 
  Tag,
  Eye,
  EyeOff,
  Plus,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { MenuItem } from '@/hooks/useMenuItems';
import { useDeleteMenuItem, useUpdateMenuItem, useUpdateMenuItemOrder } from '@/hooks/useAdminMenuItems';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MenuItemsListProps {
  items: MenuItem[];
  loading: boolean;
  onEdit: (id: string) => void;
  onCreateSubmenu: (parentId: string) => void;
}

const MenuItemsList = ({ items, loading, onEdit, onCreateSubmenu }: MenuItemsListProps) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const deleteMenuItem = useDeleteMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const updateOrder = useUpdateMenuItemOrder();
  const { toast } = useToast();

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMenuItem.mutateAsync(id);
      toast({
        title: "Sucesso",
        description: "Item do menu removido com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover item do menu.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (item: MenuItem) => {
    try {
      await updateMenuItem.mutateAsync({
        id: item.id,
        is_active: !item.is_active,
      });
      toast({
        title: "Sucesso",
        description: `Item ${item.is_active ? 'desativado' : 'ativado'} com sucesso!`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do item.",
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      return;
    }

    // Função para buscar todos os itens de forma plana com seus níveis
    const flattenItems = (itemList: MenuItem[], parentLevel = 0): Array<MenuItem & { level: number }> => {
      const result: Array<MenuItem & { level: number }> = [];
      
      const traverse = (list: MenuItem[], level: number) => {
        list.forEach(item => {
          result.push({ ...item, level });
          if (item.children && item.children.length > 0) {
            traverse(item.children, level + 1);
          }
        });
      };
      
      traverse(itemList, parentLevel);
      return result;
    };

    const flatItems = flattenItems(items);
    const draggedIndex = flatItems.findIndex(item => item.id === draggedItem);
    const targetIndex = flatItems.findIndex(item => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reordenar apenas itens do mesmo nível
    const draggedItemData = flatItems[draggedIndex];
    const targetItemData = flatItems[targetIndex];

    if (draggedItemData.parent_id !== targetItemData.parent_id) {
      toast({
        title: "Erro",
        description: "Só é possível reordenar itens do mesmo nível.",
        variant: "destructive",
      });
      setDraggedItem(null);
      return;
    }

    // Encontrar todos os itens do mesmo nível
    const sameLevelItems = flatItems.filter(item => item.parent_id === draggedItemData.parent_id);
    
    const reorderedItems = [...sameLevelItems];
    const draggedIndexInLevel = reorderedItems.findIndex(item => item.id === draggedItem);
    const targetIndexInLevel = reorderedItems.findIndex(item => item.id === targetId);

    // Remover item arrastado e inserir na nova posição
    const [draggedItemInLevel] = reorderedItems.splice(draggedIndexInLevel, 1);
    reorderedItems.splice(targetIndexInLevel, 0, draggedItemInLevel);

    // Atualizar display_order
    const orderUpdates = reorderedItems.map((item, index) => ({
      id: item.id,
      display_order: index + 1,
    }));

    try {
      await updateOrder.mutateAsync(orderUpdates);
      toast({
        title: "Sucesso",
        description: "Ordem dos itens atualizada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao reordenar itens do menu.",
        variant: "destructive",
      });
    }

    setDraggedItem(null);
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    
    return (
      <div key={item.id}>
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, item.id)}
          className={`
            flex items-center justify-between p-4 border border-zinc-700 rounded-lg 
            bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-move
            ${draggedItem === item.id ? 'opacity-50' : ''}
            ${!item.is_active ? 'opacity-60' : ''}
            ${level > 0 ? 'ml-8 border-l-4 border-l-blue-500' : ''}
          `}
        >
          <div className="flex items-center gap-3">
            <GripVertical className="h-4 w-4 text-zinc-500" />
            
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(item.id)}
                className="p-1 h-6 w-6"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{item.title}</span>
                
                {level > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Submenu
                  </Badge>
                )}
                
                {level === 0 && item.menu_type === 'url' && (
                  <Badge variant="outline" className="text-xs">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    URL
                  </Badge>
                )}
                
                {level === 0 && item.menu_type === 'category' && (
                  <Badge variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    Categoria
                  </Badge>
                )}
                
                {!item.is_active && (
                  <Badge variant="destructive" className="text-xs">
                    Inativo
                  </Badge>
                )}
              </div>
              
              <div className="text-sm text-zinc-400">
                {level === 0 && item.menu_type === 'url' && item.url && (
                  <span>URL: {item.url}</span>
                )}
                {level === 0 && item.menu_type === 'category' && (
                  <span>Categoria: {item.categories?.name || 'N/A'}</span>
                )}
                {level > 0 && (
                  <span>Item de submenu</span>
                )}
              </div>
              
              <div className="text-xs text-zinc-500">
                Ordem: {item.display_order}
                {hasChildren && (
                  <span className="ml-2">• {item.children?.length || 0} submenu(s)</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {level === 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCreateSubmenu(item.id)}
                className="text-blue-400 hover:text-blue-300"
                title="Adicionar Submenu"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleActive(item)}
              className="text-zinc-400 hover:text-zinc-100"
            >
              {item.is_active ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item.id)}
              className="text-zinc-400 hover:text-zinc-100"
            >
              <Edit className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">
                    Confirmar exclusão
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400">
                    Tem certeza que deseja remover o item "{item.title}"?
                    {hasChildren && (
                      <span className="text-yellow-400 block mt-2">
                        ⚠️ Este item possui {item.children?.length} submenu(s) que também serão removidos.
                      </span>
                    )}
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Renderizar submenus se expandido */}
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-zinc-400">Carregando...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center p-8 text-zinc-400">
        <p>Nenhum item de menu encontrado.</p>
        <p className="text-sm mt-2">Clique em "Novo Item" para adicionar o primeiro item.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map(item => renderMenuItem(item))}
    </div>
  );
};

export default MenuItemsList;
