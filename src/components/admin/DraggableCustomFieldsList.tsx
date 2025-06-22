
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, GripVertical, Trash2 } from 'lucide-react';
import { CustomField, CustomSection } from '@/hooks/useCustomFields';
import { useUpdateSectionOrder, useUpdateFieldOrder } from '@/hooks/useCustomFields';
import { useDeleteCustomField, useDeleteCustomSection } from '@/hooks/useAdminCustomFields';
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
} from "@/components/ui/alert-dialog"

interface DraggableCustomFieldsListProps {
  fields: CustomField[];
  sections: CustomSection[];
  loading: boolean;
  onEdit: (id: string) => void;
  onEditSection: (id: string) => void;
}

const DraggableCustomFieldsList = ({ 
  fields, 
  sections, 
  loading, 
  onEdit, 
  onEditSection 
}: DraggableCustomFieldsListProps) => {
  const [localSections, setLocalSections] = useState(sections);
  const [localFields, setLocalFields] = useState(fields);
  const [deleteFieldId, setDeleteFieldId] = useState<string | null>(null);
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null);
  
  const updateSectionOrder = useUpdateSectionOrder();
  const updateFieldOrder = useUpdateFieldOrder();
  const deleteCustomField = useDeleteCustomField();
  const deleteCustomSection = useDeleteCustomSection();
  const { toast } = useToast();

  // Update local state when props change
  useEffect(() => {
    setLocalSections(sections);
  }, [sections]);

  useEffect(() => {
    setLocalFields(fields);
  }, [fields]);

  if (loading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <p className="text-white">Carregando campos personalizados...</p>
        </CardContent>
      </Card>
    );
  }

  // Group fields by section
  const fieldsBySection = localFields.reduce((acc, field) => {
    const section = field.section || 'Campos Personalizados';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(field);
    return acc;
  }, {} as Record<string, CustomField[]>);

  const handleSectionDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(localSections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display_order for all sections
    const updates = items.map((section, index) => ({
      id: section.id,
      display_order: index
    }));

    setLocalSections(items);
    
    try {
      await updateSectionOrder.mutateAsync(updates);
      toast({ title: "Ordem das seções atualizada!" });
    } catch (error) {
      console.error('Error updating section order:', error);
      toast({ 
        title: "Erro ao atualizar ordem", 
        variant: "destructive" 
      });
      // Revert on error
      setLocalSections(sections);
    }
  };

  const handleFieldDragEnd = async (result: DropResult, sectionName: string) => {
    if (!result.destination) return;

    const sectionFields = Array.from(fieldsBySection[sectionName]);
    const [reorderedItem] = sectionFields.splice(result.source.index, 1);
    sectionFields.splice(result.destination.index, 0, reorderedItem);

    // Update display_order for fields in this section
    const updates = sectionFields.map((field, index) => ({
      id: field.id,
      display_order: index,
      section: sectionName
    }));

    // Update local state
    const updatedFields = localFields.map(field => {
      const updatedField = updates.find(u => u.id === field.id);
      return updatedField ? { ...field, display_order: updatedField.display_order } : field;
    });

    setLocalFields(updatedFields);

    try {
      await updateFieldOrder.mutateAsync(updates);
      toast({ title: "Ordem dos campos atualizada!" });
    } catch (error) {
      console.error('Error updating field order:', error);
      toast({ 
        title: "Erro ao atualizar ordem", 
        variant: "destructive" 
      });
      // Revert on error
      setLocalFields(fields);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    try {
      await deleteCustomField.mutateAsync(fieldId);
      toast({ title: "Campo excluído com sucesso!" });
      setDeleteFieldId(null);
    } catch (error) {
      console.error('Error deleting field:', error);
      toast({ 
        title: "Erro ao excluir campo", 
        variant: "destructive" 
      });
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    try {
      await deleteCustomSection.mutateAsync(sectionId);
      toast({ title: "Seção excluída com sucesso!" });
      setDeleteSectionId(null);
    } catch (error) {
      console.error('Error deleting section:', error);
      toast({ 
        title: "Erro ao excluir seção", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="space-y-6">
      <DragDropContext onDragEnd={handleSectionDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {localSections.map((section, sectionIndex) => {
                const sectionFields = fieldsBySection[section.name] || [];
                
                return (
                  <Draggable key={section.id} draggableId={section.id} index={sectionIndex}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`mb-6 ${snapshot.isDragging ? 'opacity-50' : ''}`}
                      >
                        <Card className="bg-zinc-900 border-zinc-800">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-5 w-5 text-zinc-400 cursor-grab" />
                                </div>
                                <span>{section.name}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEditSection(section.id)}
                                  className="text-zinc-400 hover:text-white"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteSectionId(section.id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {sectionFields.length === 0 ? (
                              <p className="text-zinc-400">Nenhum campo nesta seção</p>
                            ) : (
                              <DragDropContext 
                                onDragEnd={(result) => handleFieldDragEnd(result, section.name)}
                              >
                                <Droppable droppableId={`fields-${section.id}`}>
                                  {(provided) => (
                                    <div 
                                      {...provided.droppableProps} 
                                      ref={provided.innerRef}
                                      className="space-y-2"
                                    >
                                      {sectionFields
                                        .sort((a, b) => a.display_order - b.display_order)
                                        .map((field, fieldIndex) => (
                                        <Draggable 
                                          key={field.id} 
                                          draggableId={field.id} 
                                          index={fieldIndex}
                                        >
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className={`flex items-center justify-between p-3 bg-zinc-800 rounded-lg ${
                                                snapshot.isDragging ? 'opacity-50' : ''
                                              }`}
                                            >
                                              <div className="flex items-center gap-2">
                                                <div {...provided.dragHandleProps}>
                                                  <GripVertical className="h-4 w-4 text-zinc-400 cursor-grab" />
                                                </div>
                                                <div>
                                                  <span className="text-white font-medium">{field.label}</span>
                                                  <span className="text-zinc-400 text-sm ml-2">
                                                    ({field.field_name}) - {field.field_type}
                                                    {field.is_required && ' *'}
                                                    {!field.is_active && ' (Inativo)'}
                                                  </span>
                                                </div>
                                              </div>
                                              <div className="flex gap-2">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => onEdit(field.id)}
                                                  className="text-zinc-400 hover:text-white"
                                                >
                                                  <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => setDeleteFieldId(field.id)}
                                                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      ))}
                                      {provided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              </DragDropContext>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* Show fields without sections */}
      {fieldsBySection['Campos Personalizados'] && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Campos Personalizados</CardTitle>
          </CardHeader>
          <CardContent>
            <DragDropContext 
              onDragEnd={(result) => handleFieldDragEnd(result, 'Campos Personalizados')}
            >
              <Droppable droppableId="fields-default">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {fieldsBySection['Campos Personalizados']
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((field, index) => (
                      <Draggable key={field.id} draggableId={field.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center justify-between p-3 bg-zinc-800 rounded-lg ${
                              snapshot.isDragging ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-4 w-4 text-zinc-400 cursor-grab" />
                              </div>
                              <div>
                                <span className="text-white font-medium">{field.label}</span>
                                <span className="text-zinc-400 text-sm ml-2">
                                  ({field.field_name}) - {field.field_type}
                                  {field.is_required && ' *'}
                                  {!field.is_active && ' (Inativo)'}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(field.id)}
                                className="text-zinc-400 hover:text-white"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteFieldId(field.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>
      )}

      {/* Delete Field Confirmation Dialog */}
      <AlertDialog open={!!deleteFieldId} onOpenChange={() => setDeleteFieldId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão do Campo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir este campo personalizado? 
              Esta ação não pode ser desfeita e todos os dados associados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteFieldId && handleDeleteField(deleteFieldId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Campo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Section Confirmation Dialog */}
      <AlertDialog open={!!deleteSectionId} onOpenChange={() => setDeleteSectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão da Seção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir esta seção? 
              Esta ação não pode ser desfeita e todos os campos associados à seção serão movidos para "Campos Personalizados".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteSectionId && handleDeleteSection(deleteSectionId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Seção
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DraggableCustomFieldsList;
