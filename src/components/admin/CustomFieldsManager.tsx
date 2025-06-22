
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCustomFields, useCreateCustomField, useUpdateCustomField, useDeleteCustomField, useCustomSections, useUpdateFieldOrder, useUpdateSectionOrder, useDeleteCustomSection, useCreateCustomSection, useUpdateCustomSection } from '@/hooks/useCustomFields';
import { useSystemFieldsInitializer } from '@/hooks/useSystemFieldsInitializer';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash, GripVertical, FolderPlus, Folder, List, Database, RefreshCw } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';

const CustomFieldsManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [showSectionManager, setShowSectionManager] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [isClearing, setIsClearing] = useState(false);
  
  const { data: customFields = [], isLoading } = useCustomFields();
  const { data: customSections = [] } = useCustomSections();
  const createCustomField = useCreateCustomField();
  const updateCustomField = useUpdateCustomField();
  const deleteCustomField = useDeleteCustomField();
  const deleteCustomSection = useDeleteCustomSection();
  const updateFieldOrder = useUpdateFieldOrder();
  const updateSectionOrder = useUpdateSectionOrder();
  const { toast } = useToast();
  const { initializeSystemData } = useSystemFieldsInitializer();

  // Debug dos dados carregados
  useEffect(() => {
    console.log('🔍 CustomFieldsManager - Fields loaded:', customFields.length);
    console.log('🔍 CustomFieldsManager - System fields found:', customFields.filter(f => 
      ['name', 'age', 'height', 'weight', 'whatsapp_number', 'neighborhood'].includes(f.field_name)
    ).map(f => f.field_name));
    console.log('🔍 CustomFieldsManager - Sections loaded:', customSections.length);
    console.log('🔍 CustomFieldsManager - Sections:', customSections.map(s => s.name));
  }, [customFields, customSections]);

  const clearAllCustomData = async () => {
    if (!confirm('Tem certeza que deseja limpar TODOS os campos e seções personalizados? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsClearing(true);
    try {
      console.log('🧹 Limpando todos os campos e seções personalizados...');
      
      // Primeiro, limpar todos os campos
      const { error: fieldsError } = await supabase
        .from('custom_fields')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (fieldsError) {
        throw fieldsError;
      }

      // Depois, limpar todas as seções
      const { error: sectionsError } = await supabase
        .from('custom_sections')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (sectionsError) {
        throw sectionsError;
      }

      console.log('✅ Dados limpos com sucesso. Recriando campos do sistema...');
      
      // Esperar um pouco para garantir que as tabelas foram limpas
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recriar os campos do sistema
      await initializeSystemData();
      
      toast({
        title: "Sucesso",
        description: "Todos os dados foram limpos e os campos do sistema foram recriados!",
      });
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao limpar dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const allSections = customSections
    .filter(section => section.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  const allFields = customFields
    .sort((a, b) => a.display_order - b.display_order);

  const handleSectionDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(allSections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

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

  const handleDeleteSection = async (id: string, sectionName: string) => {
    const fieldsInSection = customFields.filter(field => field.section === sectionName);
    
    if (fieldsInSection.length > 0) {
      toast({
        title: "Erro",
        description: `Não é possível excluir a seção "${sectionName}" porque ela contém ${fieldsInSection.length} campo(s). Remova ou mova os campos primeiro.`,
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Tem certeza que deseja excluir a seção "${sectionName}"?`)) {
      try {
        await deleteCustomSection.mutateAsync(id);
        toast({
          title: "Sucesso",
          description: "Seção excluída com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir seção.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditSection = (section: any) => {
    setEditingSection(section);
    setShowSectionManager(true);
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
            onClick={clearAllCustomData}
            disabled={isClearing}
            className="bg-red-600 hover:bg-red-700"
          >
            {isClearing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Limpando...
              </>
            ) : (
              <>
                <Trash className="h-4 w-4 mr-2" />
                Limpar Tudo
              </>
            )}
          </Button>
          <Button
            onClick={() => initializeSystemData()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Database className="h-4 w-4 mr-2" />
            Recriar Sistema
          </Button>
          <Button
            onClick={() => {
              setEditingSection(null);
              setShowSectionManager(true);
            }}
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

      {/* Debug info */}
      <div className="text-xs text-yellow-400 p-4 bg-zinc-800 rounded border border-yellow-400">
        <p className="font-bold">🐛 DEBUG INFO:</p>
        <p>Campos carregados: {customFields.length}</p>
        <p>Seções carregadas: {customSections.length}</p>
        <p>Campos do sistema encontrados: {customFields.filter(f => 
          ['name', 'age', 'height', 'weight', 'whatsapp_number', 'neighborhood'].includes(f.field_name)
        ).length}</p>
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
              section={editingSection}
              onCancel={() => {
                setShowSectionManager(false);
                setEditingSection(null);
              }}
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
                              <TableHead className="text-zinc-300">Campos</TableHead>
                              <TableHead className="text-zinc-300">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allSections.map((section, index) => {
                              const fieldsInSection = customFields.filter(field => field.section === section.name);
                              return (
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
                                      <TableCell className="text-zinc-300">
                                        {fieldsInSection.length} campo(s)
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex space-x-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditSection(section)}
                                            className="text-blue-400 hover:text-blue-300 hover:bg-zinc-800"
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteSection(section.id, section.name)}
                                            className="text-red-400 hover:text-red-300 hover:bg-zinc-800"
                                          >
                                            <Trash className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </Draggable>
                              );
                            })}
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
