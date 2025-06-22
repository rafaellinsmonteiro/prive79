
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, GripVertical } from 'lucide-react';
import { CustomField, CustomSection } from '@/hooks/useCustomFields';
import { useUpdateSectionOrder, useUpdateFieldOrder } from '@/hooks/useCustomFields';

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
  const updateSectionOrder = useUpdateSectionOrder();
  const updateFieldOrder = useUpdateFieldOrder();

  // Update local state when props change
  if (sections !== localSections) {
    setLocalSections(sections);
  }
  if (fields !== localFields) {
    setLocalFields(fields);
  }

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

  const handleSectionDragEnd = (result: DropResult) => {
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
    updateSectionOrder.mutate(updates);
  };

  const handleFieldDragEnd = (result: DropResult, sectionName: string) => {
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
    updateFieldOrder.mutate(updates);
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
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onEdit(field.id)}
                                                className="text-zinc-400 hover:text-white"
                                              >
                                                <Edit className="h-4 w-4" />
                                              </Button>
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(field.id)}
                              className="text-zinc-400 hover:text-white"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
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
    </div>
  );
};

export default DraggableCustomFieldsList;
