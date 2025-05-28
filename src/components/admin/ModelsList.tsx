
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Model } from '@/hooks/useModels';
import { useDeleteModel, useUpdateModel, useUpdateModelOrder } from '@/hooks/useAdminModels';
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
} from '@/components/ui/alert-dialog';

interface ModelsListProps {
  models: Model[];
  loading: boolean;
  onEdit: (id: string) => void;
}

const ModelsList = ({ models, loading, onEdit }: ModelsListProps) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const deleteModel = useDeleteModel();
  const updateModel = useUpdateModel();
  const updateOrder = useUpdateModelOrder();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deleteModel.mutateAsync(id);
      toast({
        title: "Sucesso",
        description: "Modelo excluída com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir modelo",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateModel.mutateAsync({ id, is_active: !currentStatus });
      toast({
        title: "Sucesso",
        description: `Modelo ${!currentStatus ? 'ativada' : 'desativada'} com sucesso!`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da modelo",
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) return;

    const reorderedModels = [...models];
    const draggedIndex = reorderedModels.findIndex(m => m.id === draggedItem);
    const targetIndex = reorderedModels.findIndex(m => m.id === targetId);

    const [draggedModel] = reorderedModels.splice(draggedIndex, 1);
    reorderedModels.splice(targetIndex, 0, draggedModel);

    const updates = reorderedModels.map((model, index) => ({
      id: model.id,
      display_order: index
    }));

    try {
      await updateOrder.mutateAsync(updates);
      toast({
        title: "Sucesso",
        description: "Ordem das modelos atualizada!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar ordem",
        variant: "destructive",
      });
    }

    setDraggedItem(null);
  };

  if (loading) {
    return <div className="text-center py-8">Carregando modelos...</div>;
  }

  return (
    <div className="space-y-4">
      {models.map((model) => (
        <Card
          key={model.id}
          className="bg-zinc-900 border-zinc-800"
          draggable
          onDragStart={(e) => handleDragStart(e, model.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, model.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <GripVertical className="h-5 w-5 text-zinc-500 cursor-move" />
              
              <div className="flex-shrink-0">
                {model.photos[0] ? (
                  <img
                    src={model.photos[0].photo_url}
                    alt={model.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-zinc-800 rounded flex items-center justify-center">
                    <span className="text-zinc-500 text-xs">Sem foto</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-medium text-white">{model.name}</h3>
                  <Badge variant={model.is_active ? "default" : "secondary"}>
                    {model.is_active ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <p className="text-zinc-400 text-sm">
                  {model.age} anos • {model.location || 'Localização não informada'}
                </p>
                <p className="text-zinc-500 text-sm">
                  {model.photos.length} foto(s) • Ordem: {model.display_order || 0}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleActive(model.id, model.is_active || false)}
                >
                  {model.is_active ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(model.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir a modelo {model.name}? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(model.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {models.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-400">Nenhuma modelo cadastrada ainda.</p>
        </div>
      )}
    </div>
  );
};

export default ModelsList;
