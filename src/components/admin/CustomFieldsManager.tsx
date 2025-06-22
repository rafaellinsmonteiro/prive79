import { useState } from 'react';
import { useAdminCustomFields, useAdminCustomSections, useDeleteCustomField, useDeleteCustomSection } from '@/hooks/useAdminCustomFields';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import CustomFieldsList from './CustomFieldsList';
import CustomFieldForm from './CustomFieldForm';
import SectionManager from './SectionManager';
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

  const handleEditField = (id: string) => {
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

  const handleClearAll = async () => {
    setShowClearAllDialog(false);
  
    // Delete all custom fields
    for (const field of customFields) {
      try {
        await deleteCustomField.mutateAsync(field.id);
        console.log(`✅ Field ${field.id} deleted successfully`);
      } catch (error) {
        console.error(`❌ Error deleting field ${field.id}:`, error);
      }
    }
  
    // Delete all custom sections
    for (const section of customSections) {
      try {
        await deleteCustomSection.mutateAsync(section.id);
        console.log(`✅ Section ${section.id} deleted successfully`);
      } catch (error) {
        console.error(`❌ Error deleting section ${section.id}:`, error);
      }
    }
  
    // Optionally, you can show a toast message to indicate completion
    alert('All custom fields and sections have been cleared.');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestão de Campos Personalizados</h2>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={() => setShowClearAllDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Tudo
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
                sectionId={editingSectionId}
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
                fieldId={editingFieldId}
                onSuccess={handleCloseFieldForm}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <CustomFieldsList
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
              Esta ação removerá TODOS os campos personalizados e seções criados. 
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
