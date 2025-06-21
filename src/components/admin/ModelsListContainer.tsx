
import { useState } from 'react';
import { useAdminModels } from '@/hooks/useAdminModels';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ModelsList from './ModelsList';
import ModelForm from './ModelForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const ModelsListContainer = () => {
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: models = [], isLoading } = useAdminModels();

  const handleEdit = (id: string) => {
    setEditingModelId(id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingModelId(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestão de Modelos</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Modelo
            </Button>
          </DialogTrigger>
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
      </div>

      <ModelsList
        models={models}
        loading={isLoading}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default ModelsListContainer;
