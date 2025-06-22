
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCustomFields, useCreateCustomField, useUpdateCustomField, useDeleteCustomField, useCustomSections, useUpdateFieldOrder, useUpdateSectionOrder } from '@/hooks/useCustomFields';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash, GripVertical, FolderPlus, Folder, List } from 'lucide-react';
import CustomFieldForm from './CustomFieldForm';
import SectionManager from './SectionManager';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const CustomFieldsManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [showSectionManager, setShowSectionManager] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  
  const { data: customFields = [], isLoading } = useCustomFields();
  const { data: customSections = [] } = useCustomSections();
  const createCustomField = useCreateCustomField();
  const updateCustomField = useUpdateCustomField();
  const deleteCustomField = useDeleteCustomField();
  const updateFieldOrder = useUpdateFieldOrder();
  const updateSectionOrder = useUpdateSectionOrder();
  const { toast } = useToast();

  // Usar apenas as seções personalizadas da base de dados
  const allSections = customSections
    .filter(section => section.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  // Usar apenas os campos personalizados da base de dados
  const allFields = customFields
    .sort((a, b) => a.display_order - b.display_order);

  const handleSectionDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(allSections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Atualizar ordens de todas as seções
    const updates = items.map((item, index) => ({
      id: item.id,
      display_order: index + 1
    }));

    try {
      await updateSectionOrder.mutateAsync(updates);
      toast({
        title: "Sucesso",
        description: "Ordem das seções atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao reordenar seções:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar ordem das seções.",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(allFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

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
        description: "Campo criado com sucesso!",
      });
      setShowForm(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar campo.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateField = async (fieldData: any) => {
    try {
      await updateCustomField.mutateAsync({ id: editingField.id, ...fieldData });
      toast({
        title: "Sucesso",
        description: "Campo atualizado com sucesso!",
      });
      setEditingField(null);
      setShowForm(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar campo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteField = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este campo?')) {
      try {
        await deleteCustomField.mutateAsync(id);
        toast({
          title: "Sucesso",
          description: "Campo excluído com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir campo.",
          variant: "destructive",
        });
      }
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
        <h1 className="text-2xl font-bold text-white">Gerenciamento de Campos e Seções</h1>
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
            Novo Campo
          </Button>
        </div>
      </div>

      {(showForm || showSectionManager) && (
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
              availableSections={allSections.map(s => s.name)}
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
          <CardTitle className="text-white">Organização de Seções e Campos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sections" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
              <TabsTrigger value="sections" className="data-[state=active]:bg-zinc-700">
                <Folder className="h-4 w-4 mr-2" />
                Seções
              </TabsTrigger>
              <TabsTrigger value="fields" className="data-[state=active]:bg-zinc-700">
                <List className="h-4 w-4 mr-2" />
                Campos
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="sections" className="mt-4">
              <DragDropContext onDragEnd={handleSectionDragEnd}>
                <Droppable droppableId="sections">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
                          Seções - Arrastar e Soltar para Reordenar
                        </h3>
                        <Table>
                          <TableHeader>
                            <TableRow className="border-zinc-700">
                              <TableHead className="text-zinc-300 w-10"></TableHead>
                              <TableHead className="text-zinc-300">Nome da Seção</TableHead>
                              <TableHead className="text-zinc-300">Ordem</TableHead>
                              <TableHead className="text-zinc-300">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allSections.map((section, index) => (
                              <Draggable key={section.id} draggableId={section.id} index={index}>
                                {(provided, snapshot) => (
                                  <TableRow 
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`border-zinc-700 ${snapshot.isDragging ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}
                                  >
                                    <TableCell {...provided.dragHandleProps} className="text-zinc-400">
                                      <GripVertical className="h-4 w-4" />
                                    </TableCell>
                                    <TableCell className="text-white font-medium">
                                      <div className="flex items-center gap-2">
                                        <Folder className="h-4 w-4 text-zinc-400" />
                                        {section.name}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-300">
                                      {section.display_order}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-blue-400 hover:text-blue-300 hover:bg-zinc-800"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
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
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </TabsContent>

            <TabsContent value="fields" className="mt-4">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="fields">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
                          Campos - Arrastar e Soltar para Reordenar
                        </h3>
                        <Table>
                          <TableHeader>
                            <TableRow className="border-zinc-700">
                              <TableHead className="text-zinc-300 w-10"></TableHead>
                              <TableHead className="text-zinc-300">Nome do Campo</TableHead>
                              <TableHead className="text-zinc-300">Rótulo</TableHead>
                              <TableHead className="text-zinc-300">Tipo</TableHead>
                              <TableHead className="text-zinc-300">Seção</TableHead>
                              <TableHead className="text-zinc-300">Obrigatório</TableHead>
                              <TableHead className="text-zinc-300">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allFields.map((field, index) => (
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
                                      {field.field_name}
                                    </TableCell>
                                    <TableCell className="text-white">
                                      {field.label}
                                    </TableCell>
                                    <TableCell className="text-zinc-300">
                                      {getFieldTypeName(field.field_type)}
                                    </TableCell>
                                    <TableCell className="text-zinc-300">
                                      {field.section}
                                    </TableCell>
                                    <TableCell className="text-zinc-300">
                                      {field.is_required ? 'Sim' : 'Não'}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setEditingField(field);
                                            setShowForm(true);
                                          }}
                                          className="text-blue-400 hover:text-blue-300 hover:bg-zinc-800"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteField(field.id)}
                                          className="text-red-400 hover:text-red-300 hover:bg-zinc-800"
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
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
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomFieldsManager;
