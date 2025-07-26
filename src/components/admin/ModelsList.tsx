
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2, GripVertical, Eye, EyeOff, User, MapPin, Calendar, Images, Copy } from 'lucide-react';
import { Model } from '@/hooks/useModels';
import { useDeleteModel, useUpdateModel, useUpdateModelOrder, useDuplicateModel } from '@/hooks/useAdminModels';
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
  selectedModels: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  bulkMode: boolean;
}

const ModelsList = ({ models, loading, onEdit, selectedModels, onSelectionChange, bulkMode }: ModelsListProps) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const deleteModel = useDeleteModel();
  const updateModel = useUpdateModel();
  const updateOrder = useUpdateModelOrder();
  const duplicateModel = useDuplicateModel();
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

  const handleDuplicate = async (id: string, modelName: string) => {
    try {
      await duplicateModel.mutateAsync(id);
      toast({
        title: "Sucesso",
        description: `Modelo "${modelName}" duplicada com sucesso!`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao duplicar modelo",
        variant: "destructive",
      });
    }
  };

  const handleSelectModel = (modelId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedModels, modelId]);
    } else {
      onSelectionChange(selectedModels.filter(id => id !== modelId));
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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Carregando modelos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {models.map((model) => (
        <Card
          key={model.id}
          className="bg-card border-border hover:shadow-lg transition-all duration-200 group"
          draggable
          onDragStart={(e) => handleDragStart(e, model.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, model.id)}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                {bulkMode && (
                  <Checkbox
                    checked={selectedModels.includes(model.id)}
                    onCheckedChange={(checked) => handleSelectModel(model.id, !!checked)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                )}
                
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move hover:text-foreground transition-colors" />
                
                <div className="flex-shrink-0">
                  {model.photos[0] ? (
                    <div className="relative">
                      <img
                        src={model.photos[0].photo_url}
                        alt={model.name}
                        className="w-16 h-16 lg:w-20 lg:h-20 object-cover rounded-xl ring-2 ring-border group-hover:ring-primary/20 transition-all duration-200"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center ring-2 ring-card">
                        <Images className="w-3 h-3 text-primary-foreground" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-accent rounded-xl flex items-center justify-center ring-2 ring-border">
                      <User className="w-6 h-6 lg:w-8 lg:h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg lg:text-xl font-semibold text-foreground truncate">{model.name}</h3>
                  <Badge 
                    variant={model.is_active ? "default" : "secondary"}
                    className={model.is_active ? 
                      "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm" : 
                      "bg-muted text-muted-foreground"
                    }
                  >
                    {model.is_active ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{model.age} anos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{model.location || 'Localização não informada'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Images className="w-3 h-3" />
                    <span>{model.photos.length} foto(s)</span>
                  </div>
                  <span>•</span>
                  <span>Ordem: {model.display_order || 0}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleActive(model.id, model.is_active || false)}
                  className="hover:bg-accent transition-colors"
                >
                  {model.is_active ? (
                    <Eye className="h-4 w-4 text-primary" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(model.id)}
                  className="hover:bg-accent transition-colors"
                >
                  <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDuplicate(model.id, model.name)}
                  className="hover:bg-accent transition-colors"
                  disabled={duplicateModel.isPending}
                >
                  <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        Tem certeza que deseja excluir a modelo {model.name}? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="hover:bg-accent">Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(model.id)}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
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
          <div className="mx-auto w-24 h-24 bg-accent rounded-full flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-lg">Nenhuma modelo cadastrada ainda.</p>
          <p className="text-muted-foreground text-sm mt-1">Clique em "Nova Modelo" para começar.</p>
        </div>
      )}
    </div>
  );
};

export default ModelsList;
