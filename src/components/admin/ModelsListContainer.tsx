
import React, { useState, useEffect, useMemo } from 'react';
import { useAdminModels } from '@/hooks/useAdminModels';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ModelsList from './ModelsList';
import ModelForm from './ModelForm';
import ModelsFilters, { ModelsFilterState } from './ModelsFilters';
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
  const [filters, setFilters] = useState<ModelsFilterState>({
    search: '',
    status: 'all',
    cityId: 'all',
    categoryId: 'all',
    ageMin: '',
    ageMax: '',
    hasPhotos: null,
    sortBy: 'display_order',
    sortOrder: 'asc',
  });
  const { data: allModels = [], isLoading } = useAdminModels();

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

  // Filtrar e ordenar modelos
  const filteredModels = useMemo(() => {
    let filtered = [...allModels];

    // Filtro de busca por nome
    if (filters.search) {
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtro de status
    if (filters.status !== 'all') {
      filtered = filtered.filter(model =>
        filters.status === 'active' ? model.is_active : !model.is_active
      );
    }

    // Filtro de cidade
    if (filters.cityId && filters.cityId !== 'all') {
      filtered = filtered.filter(model => model.city_id === filters.cityId);
    }

    // Filtro de categoria
    if (filters.categoryId && filters.categoryId !== 'all') {
      filtered = filtered.filter(model =>
        model.categories?.some(cat => cat.id === filters.categoryId)
      );
    }

    // Filtro de idade
    if (filters.ageMin) {
      filtered = filtered.filter(model => model.age >= parseInt(filters.ageMin));
    }
    if (filters.ageMax) {
      filtered = filtered.filter(model => model.age <= parseInt(filters.ageMax));
    }

    // Filtro de fotos
    if (filters.hasPhotos !== null) {
      filtered = filtered.filter(model =>
        filters.hasPhotos ? model.photos?.length > 0 : model.photos?.length === 0
      );
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'age':
          aValue = a.age;
          bValue = b.age;
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'display_order':
        default:
          aValue = a.display_order || 0;
          bValue = b.display_order || 0;
          break;
      }

      if (filters.sortOrder === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [allModels, filters]);

  // Expor a função para o componente pai
  useEffect(() => {
    if (onOpenForm) {
      (window as any).openModelForm = handleOpenNew;
    }
  }, [onOpenForm]);

  return (
    <div className="space-y-6">
      {/* Header com botão de nova modelo */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Modelos</h2>
          <p className="text-muted-foreground">Gerencie os perfis das modelos do sistema</p>
        </div>
        <Button
          onClick={handleOpenNew}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Nova Modelo
        </Button>
      </div>

      {/* Filtros */}
      <ModelsFilters
        onFiltersChange={setFilters}
        totalModels={allModels.length}
        filteredCount={filteredModels.length}
      />

      {/* Dialog para formulário */}
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

      {/* Lista de modelos */}
      <ModelsList
        models={filteredModels}
        loading={isLoading}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default ModelsListContainer;
