
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
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Gestão de Campos Personalizados
          </h2>
          <p className="text-muted-foreground">
            Configure e gerencie campos customizados para o sistema
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={refreshCache}
            className="hover-scale"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Cache
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={() => setShowClearAllDialog(true)}
            className="hover-scale"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Campos
          </Button>
          
          <Dialog open={isSectionFormOpen} onOpenChange={setIsSectionFormOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="hover-scale">
                <Plus className="h-4 w-4 mr-2" />
                Nova Seção
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">
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
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-[0_4px_20px_hsl(var(--primary))_/_0.3] hover-scale">
                <Plus className="h-4 w-4 mr-2" />
                Novo Campo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">
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

      {/* Warning Card */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4 lg:p-6 animate-scale-in">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center shrink-0 mt-1">
            <RefreshCw className="w-4 h-4 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Campos Protegidos</h3>
            <p className="text-muted-foreground text-sm">
              Os campos <strong>Nome</strong>, <strong>Idade</strong> e <strong>Cidade</strong> são essenciais para o sistema e não podem ser editados ou excluídos.
            </p>
          </div>
        </div>
      </div>

      {/* Fields List */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-lg animate-fade-in">
        <DraggableCustomFieldsList
          fields={customFields}
          sections={customSections}
          loading={isLoadingFields || isLoadingSections}
          onEdit={handleEditField}
          onEditSection={handleEditSection}
        />
      </div>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Confirmar Limpeza</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta ação removerá APENAS os campos e seções personalizados que você criou. 
              Os campos essenciais (Nome, Idade, Cidade) serão preservados.
              Esta ação não pode ser desfeita. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover-scale">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearAll} 
              className="bg-red-600 hover:bg-red-700 text-white hover-scale"
            >
              Confirmar Limpeza
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomFieldsManager;
