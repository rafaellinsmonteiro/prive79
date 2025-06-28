
import { useState } from 'react';
import { useAdminCustomFields, useAdminCustomSections, useDeleteCustomField, useDeleteCustomSection } from '@/hooks/useAdminCustomFields';
import { useCreateCustomField, useUpdateCustomField, useCreateCustomSection, useUpdateCustomSection } from '@/hooks/useCustomFields';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import DraggableCustomFieldsList from './DraggableCustomFieldsList';
import CustomFieldForm from './CustomFieldForm';
import SectionManager from './SectionManager';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const CustomFieldsManager = () => {
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [isFieldFormOpen, setIsFieldFormOpen] = useState(false);
  const [isSectionFormOpen, setIsSectionFormOpen] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);

  const { data: customFields = [], isLoading: isLoadingFields } = useAdminCustomFields();
  const { data: customSections = [], isLoading: isLoadingSections } = useAdminCustomSections();
  const deleteCustomField = useDeleteCustomField();
  const deleteCustomSection = useDeleteCustomSection();
  const createCustomField = useCreateCustomField();
  const updateCustomField = useUpdateCustomField();
  const createCustomSection = useCreateCustomSection();
  const updateCustomSection = useUpdateCustomSection();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Campos protegidos que não podem ser editados ou excluídos
  const protectedFields = ['name', 'age', 'city_id'];

  const handleEditField = (id: string) => {
    const field = customFields.find(f => f.id === id);
    if (field && protectedFields.includes(field.field_name)) {
      toast({
        title: "Campo Protegido",
        description: `O campo "${field.label}" não pode ser editado pois é essencial para o sistema.`,
        variant: "destructive"
      });
      return;
    }
    setEditingFieldId(id);
    setIsFieldFormOpen(true);
  };

  const handleCloseFieldForm = () => {
    setEditingFieldId(null);
    setIsFieldFormOpen(false);
  };

  const handleEditSection = (id: string) => {
    setEditingSectionId(id);
    setIsSectionFormOpen(true);
  };

  const handleCloseSectionForm = () => {
    setEditingSectionId(null);
    setIsSectionFormOpen(false);
  };

  const handleFieldSubmit = async (fieldData: any) => {
    try {
      if (editingFieldId) {
        await updateCustomField.mutateAsync({ id: editingFieldId, ...fieldData });
        toast({ title: "Campo atualizado com sucesso!" });
      } else {
        await createCustomField.mutateAsync(fieldData);
        toast({ title: "Campo criado com sucesso!" });
      }
      handleCloseFieldForm();
      
      // Force refresh all related queries
      await refreshCache();
    } catch (error) {
      console.error('Error saving field:', error);
      toast({ 
        title: "Erro ao salvar campo", 
        description: "Tente novamente.",
        variant: "destructive" 
      });
    }
  };

  const handleSectionSubmit = async (sectionData: any) => {
    try {
      if (editingSectionId) {
        await updateCustomSection.mutateAsync({ id: editingSectionId, ...sectionData });
        toast({ title: "Seção atualizada com sucesso!" });
      } else {
        await createCustomSection.mutateAsync(sectionData);
        toast({ title: "Seção criada com sucesso!" });
      }
      handleCloseSectionForm();
      
      // Force refresh all related queries
      await refreshCache();
    } catch (error) {
      console.error('Error saving section:', error);
      toast({ 
        title: "Erro ao salvar seção", 
        description: "Tente novamente.",
        variant: "destructive" 
      });
    }
  };

  const refreshCache = async () => {
    console.log('🔄 Forcing cache refresh for custom fields and sections...');
    await queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
    await queryClient.invalidateQueries({ queryKey: ['admin-custom-fields'] });
    await queryClient.invalidateQueries({ queryKey: ['custom-sections'] });
    await queryClient.invalidateQueries({ queryKey: ['admin-custom-sections'] });
    await queryClient.refetchQueries({ queryKey: ['custom-fields'] });
    await queryClient.refetchQueries({ queryKey: ['admin-custom-fields'] });
    await queryClient.refetchQueries({ queryKey: ['custom-sections'] });
    await queryClient.refetchQueries({ queryKey: ['admin-custom-sections'] });
    console.log('✅ Cache refresh completed');
  };

  const handleClearAll = async () => {
    setShowClearAllDialog(false);
  
    // Delete all non-protected custom fields
    for (const field of customFields) {
      if (!protectedFields.includes(field.field_name)) {
        try {
          await deleteCustomField.mutateAsync(field.id);
          console.log(`✅ Field ${field.id} deleted successfully`);
        } catch (error) {
          console.error(`❌ Error deleting field ${field.id}:`, error);
        }
      }
    }
  
    // Delete all custom sections (except system ones)
    const systemSections = ['Informações Básicas', 'Características Físicas', 'Outras Informações'];
    for (const section of customSections) {
      if (!systemSections.includes(section.name)) {
        try {
          await deleteCustomSection.mutateAsync(section.id);
          console.log(`✅ Section ${section.id} deleted successfully`);
        } catch (error) {
          console.error(`❌ Error deleting section ${section.id}:`, error);
        }
      }
    }
  
    toast({ title: "Campos e seções personalizados foram removidos." });
    await refreshCache();
  };

  // Get the field object for editing
  const editingField = editingFieldId ? customFields.find(f => f.id === editingFieldId) : undefined;
  const editingSection = editingSectionId ? customSections.find(s => s.id === editingSectionId) : undefined;

  // Get ordered sections for dropdown
  const orderedSections = customSections
    .filter(s => s.is_active)
    .sort((a, b) => a.display_order - b.display_order)
    .map(s => s.name);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestão de Campos Personalizados</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshCache}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Cache
          </Button>
          <Button variant="destructive" onClick={() => setShowClearAllDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Campos Personalizados
          </Button>
          <Dialog open={isSectionFormOpen} onOpenChange={setIsSectionFormOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nova Seção
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSectionId ? 'Editar Seção' : 'Nova Seção'}
                </DialogTitle>
              </DialogHeader>
              <SectionManager
                section={editingSection}
                onSubmit={handleSectionSubmit}
                onCancel={handleCloseSectionForm}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={isFieldFormOpen} onOpenChange={setIsFieldFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Campo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingFieldId ? 'Editar Campo' : 'Novo Campo'}
                </DialogTitle>
              </DialogHeader>
              <CustomFieldForm
                field={editingField}
                onSubmit={handleFieldSubmit}
                onCancel={handleCloseFieldForm}
                loading={createCustomField.isPending || updateCustomField.isPending}
                availableSections={orderedSections}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Aviso sobre campos protegidos */}
      <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
        <p className="text-yellow-200 text-sm">
          <strong>Campos Protegidos:</strong> Os campos Nome, Idade e Cidade são essenciais para o sistema e não podem ser editados ou excluídos.
        </p>
      </div>

      <DraggableCustomFieldsList
        fields={customFields}
        sections={customSections}
        loading={isLoadingFields || isLoadingSections}
        onEdit={handleEditField}
        onEditSection={handleEditSection}
      />

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Limpeza</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá APENAS os campos e seções personalizados que você criou. 
              Os campos essenciais (Nome, Idade, Cidade) serão preservados.
              Esta ação não pode ser desfeita. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll} className="bg-red-600 hover:bg-red-700">
              Confirmar Limpeza
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomFieldsManager;
