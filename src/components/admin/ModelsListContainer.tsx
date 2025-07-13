
import React, { useState, useEffect } from 'react';
import { useAdminModels } from '@/hooks/useAdminModels';
import ModelsList from './ModelsList';
import ModelForm from './ModelForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ModelsListContainerProps {
  onOpenForm?: boolean;
}

const ModelsListContainer = ({ onOpenForm }: ModelsListContainerProps) => {
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: models = [], isLoading } = useAdminModels();

  const handleEdit = (id: string) => {
    setEditingModelId(id);
    setIsFormOpen(true);
  };

  const handleOpenNew = () => {
    setEditingModelId(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingModelId(null);
    setIsFormOpen(false);
  };

  // Expor a função para o componente pai
  useEffect(() => {
    if (onOpenForm) {
      (window as any).openModelForm = handleOpenNew;
    }
  }, [onOpenForm]);

  return (
    <div className="space-y-6">
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingModelId ? 'Editar Modelo' : 'Nova Modelo'}
            </DialogTitle>
          </DialogHeader>
          <ModelForm
            modelId={editingModelId}
            onSuccess={handleCloseForm}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      <ModelsList
        models={models}
        loading={isLoading}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default ModelsListContainer;
