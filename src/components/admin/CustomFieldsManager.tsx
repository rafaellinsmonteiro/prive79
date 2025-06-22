import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCustomFields, useCreateCustomField, useUpdateCustomField, useDeleteCustomField, useCustomSections, useUpdateFieldOrder } from '@/hooks/useCustomFields';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash, Settings, GripVertical, FolderPlus } from 'lucide-react';
import CustomFieldForm from './CustomFieldForm';
import SystemFieldEditForm from './SystemFieldEditForm';
import SectionManager from './SectionManager';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SystemField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  section: string;
  description?: string;
  display_order: number;
  isSystemField: boolean;
}

interface CombinedField extends SystemField {
  isCustomField?: boolean;
}

const CustomFieldsManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [showSectionManager, setShowSectionManager] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [editingSystemField, setEditingSystemField] = useState<SystemField | null>(null);
  
  const { data: customFields = [], isLoading } = useCustomFields();
  const { data: customSections = [] } = useCustomSections();
  const createCustomField = useCreateCustomField();
  const updateCustomField = useUpdateCustomField();
  const deleteCustomField = useDeleteCustomField();
  const updateFieldOrder = useUpdateFieldOrder();
  const { toast } = useToast();

  const systemFields: SystemField[] = [
    { id: 'name', name: 'name', label: 'Nome', type: 'text', required: true, section: 'Informações Básicas', description: 'Nome da modelo', display_order: 1, isSystemField: true },
    { id: 'age', name: 'age', label: 'Idade', type: 'number', required: true, section: 'Informações Básicas', description: 'Idade da modelo', display_order: 2, isSystemField: true },
    { id: 'neighborhood', name: 'neighborhood', label: 'Bairro', type: 'text', required: false, section: 'Informações Básicas', description: 'Bairro onde atende', display_order: 3, isSystemField: true },
    { id: 'whatsapp_number', name: 'whatsapp_number', label: 'WhatsApp', type: 'text', required: false, section: 'Informações Básicas', description: 'Número do WhatsApp', display_order: 4, isSystemField: true },
    { id: 'height', name: 'height', label: 'Altura', type: 'text', required: false, section: 'Características Físicas', description: 'Altura da modelo', display_order: 10, isSystemField: true },
    { id: 'weight', name: 'weight', label: 'Peso', type: 'text', required: false, section: 'Características Físicas', description: 'Peso da modelo', display_order: 11, isSystemField: true },
    { id: 'eyes', name: 'eyes', label: 'Olhos', type: 'text', required: false, section: 'Características Físicas', description: 'Cor dos olhos', display_order: 12, isSystemField: true },
    { id: 'body_type', name: 'body_type', label: 'Manequim', type: 'text', required: false, section: 'Características Físicas', description: 'Tipo de corpo/manequim', display_order: 13, isSystemField: true },
    { id: 'bust', name: 'bust', label: 'Busto', type: 'text', required: false, section: 'Características Físicas', description: 'Medida do busto', display_order: 14, isSystemField: true },
    { id: 'waist', name: 'waist', label: 'Cintura', type: 'text', required: false, section: 'Características Físicas', description: 'Medida da cintura', display_order: 15, isSystemField: true },
    { id: 'hip', name: 'hip', label: 'Quadril', type: 'text', required: false, section: 'Características Físicas', description: 'Medida do quadril', display_order: 16, isSystemField: true },
    { id: 'silicone', name: 'silicone', label: 'Silicone', type: 'boolean', required: false, section: 'Configurações', description: 'Possui silicone', display_order: 20, isSystemField: true },
    { id: 'is_active', name: 'is_active', label: 'Perfil Ativo', type: 'boolean', required: false, section: 'Configurações', description: 'Se o perfil está ativo', display_order: 21, isSystemField: true },
    { id: 'display_order', name: 'display_order', label: 'Ordem de Exibição', type: 'number', required: false, section: 'Configurações', description: 'Ordem na listagem', display_order: 22, isSystemField: true },
    { id: 'languages', name: 'languages', label: 'Idiomas', type: 'text', required: false, section: 'Outras Informações', description: 'Idiomas falados', display_order: 30, isSystemField: true },
    { id: 'description', name: 'description', label: 'Descrição', type: 'textarea', required: false, section: 'Outras Informações', description: 'Descrição detalhada', display_order: 31, isSystemField: true },
  ];

  // Combinar seções padrão com seções personalizadas
  const allSections = [
    'Informações Básicas',
    'Características Físicas',
    'Configurações',
    'Outras Informações',
    ...customSections.map(section => section.name)
  ];

  const combinedFields: CombinedField[] = [
    ...systemFields,
    ...customFields.map(field => ({
      id: field.id,
      name: field.field_name,
      label: field.label,
      type: field.field_type,
      required: field.is_required,
      section: field.section || 'Campos Personalizados',
      description: field.help_text || '',
      display_order: field.display_order + 1000,
      isSystemField: false,
      isCustomField: true
    }))
  ].sort((a, b) => a.display_order - b.display_order);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(combinedFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Preparar updates para reordenação
    const updates = items.map((item, index) => ({
      id: item.id,
      display_order: index + 1,
      section: item.section
    }));

    try {
      await updateFieldOrder.mutateAsync(updates);
      toast({
        title: "Sucesso",
        description: "Ordem dos campos atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao reordenar campos:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar ordem dos campos.",
        variant: "destructive",
      });
    }
  };

  const handleCreateField = async (fieldData: any) => {
    try {
      await createCustomField.mutateAsync(fieldData);
      toast({
        title: "Sucesso",
        description: "Campo personalizado criado com sucesso!",
      });
      setShowForm(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar campo personalizado.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateField = async (fieldData: any) => {
    try {
      await updateCustomField.mutateAsync({ id: editingField.id, ...fieldData });
      toast({
        title: "Sucesso",
        description: "Campo personalizado atualizado com sucesso!",
      });
      setEditingField(null);
      setShowForm(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar campo personalizado.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteField = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este campo personalizado?')) {
      try {
        await deleteCustomField.mutateAsync(id);
        toast({
          title: "Sucesso",
          description: "Campo personalizado excluído com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir campo personalizado.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditSystemField = (field: SystemField) => {
    setEditingSystemField(field);
  };

  const handleSaveSystemField = async (fieldData: any) => {
    try {
      await createCustomField.mutateAsync({
        ...fieldData,
        field_name: `system_${fieldData.field_name}`,
      });
      toast({
        title: "Sucesso",
        description: "Configurações do campo do sistema salvas com sucesso!",
      });
      setEditingSystemField(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações do campo do sistema.",
        variant: "destructive",
      });
    }
  };

  const getFieldTypeName = (type: string) => {
    const types: { [key: string]: string } = {
      'text': 'Texto',
      'textarea': 'Texto Longo',
      'number': 'Número',
      'boolean': 'Sim/Não',
      'select': 'Lista de Opções',
      'date': 'Data',
      'email': 'Email',
      'url': 'URL',
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gerenciamento de Campos</h1>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowSectionManager(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Nova Seção
          </Button>
          <Button
            onClick={() => {
              setEditingField(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Campo Personalizado
          </Button>
        </div>
      </div>

      {(showForm || editingSystemField || showSectionManager) && (
        <div className="space-y-4">
          {showForm && (
            <CustomFieldForm
              field={editingField}
              onSubmit={editingField ? handleUpdateField : handleCreateField}
              onCancel={() => {
                setShowForm(false);
                setEditingField(null);
              }}
              loading={createCustomField.isPending || updateCustomField.isPending}
              availableSections={allSections}
            />
          )}
          
          {editingSystemField && (
            <SystemFieldEditForm
              field={editingSystemField}
              onSave={handleSaveSystemField}
              onCancel={() => setEditingSystemField(null)}
              loading={createCustomField.isPending}
            />
          )}

          {showSectionManager && (
            <SectionManager
              onCancel={() => setShowSectionManager(false)}
            />
          )}
        </div>
      )}

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Todos os Campos - Arrastar e Soltar para Reordenar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-700">
                        <TableHead className="text-zinc-300 w-10"></TableHead>
                        <TableHead className="text-zinc-300">Nome do Campo</TableHead>
                        <TableHead className="text-zinc-300">Rótulo</TableHead>
                        <TableHead className="text-zinc-300">Tipo</TableHead>
                        <TableHead className="text-zinc-300">Seção</TableHead>
                        <TableHead className="text-zinc-300">Obrigatório</TableHead>
                        <TableHead className="text-zinc-300">Origem</TableHead>
                        <TableHead className="text-zinc-300">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {combinedFields.map((field, index) => (
                        <Draggable key={field.id} draggableId={field.id} index={index}>
                          {(provided, snapshot) => (
                            <TableRow 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`border-zinc-700 ${snapshot.isDragging ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
                            >
                              <TableCell {...provided.dragHandleProps} className="text-zinc-400">
                                <GripVertical className="h-4 w-4" />
                              </TableCell>
                              <TableCell className="text-white font-mono text-sm">
                                {field.name}
                              </TableCell>
                              <TableCell className="text-white">
                                {field.label}
                              </TableCell>
                              <TableCell className="text-zinc-300">
                                {getFieldTypeName(field.type)}
                              </TableCell>
                              <TableCell className="text-zinc-300">
                                {field.section}
                              </TableCell>
                              <TableCell className="text-zinc-300">
                                {field.required ? 'Sim' : 'Não'}
                              </TableCell>
                              <TableCell className="text-zinc-300">
                                {field.isSystemField ? (
                                  <span className="text-blue-400">Sistema</span>
                                ) : (
                                  <span className="text-green-400">Personalizado</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (field.isSystemField) {
                                        handleEditSystemField(field);
                                      } else {
                                        const customField = customFields.find(cf => cf.id === field.id);
                                        if (customField) {
                                          setEditingField(customField);
                                          setShowForm(true);
                                        }
                                      }
                                    }}
                                    className="text-blue-400 hover:text-blue-300 hover:bg-zinc-800"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  {field.isCustomField && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteField(field.id)}
                                      className="text-red-400 hover:text-red-300 hover:bg-zinc-800"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomFieldsManager;
