
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCustomFields, useCreateCustomField, useUpdateCustomField, useDeleteCustomField } from '@/hooks/useCustomFields';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash, Settings, Layers } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomFieldForm from './CustomFieldForm';
import SystemFieldsSection from './SystemFieldsSection';
import SystemFieldEditForm from './SystemFieldEditForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SystemField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  section: string;
  description?: string;
}

const CustomFieldsManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [editingSystemField, setEditingSystemField] = useState<SystemField | null>(null);
  const { data: customFields = [], isLoading } = useCustomFields();
  const createCustomField = useCreateCustomField();
  const updateCustomField = useUpdateCustomField();
  const deleteCustomField = useDeleteCustomField();
  const { toast } = useToast();

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
      // For system fields, we create a custom field entry to override the default behavior
      await createCustomField.mutateAsync({
        ...fieldData,
        field_name: `system_${fieldData.field_name}`, // Prefix to identify system field customizations
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

      {(showForm || editingSystemField) && (
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
        </div>
      )}

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
          <TabsTrigger value="system" className="data-[state=active]:bg-zinc-700">
            <Settings className="h-4 w-4 mr-2" />
            Campos do Sistema
          </TabsTrigger>
          <TabsTrigger value="custom" className="data-[state=active]:bg-zinc-700">
            <Layers className="h-4 w-4 mr-2" />
            Campos Personalizados
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="system" className="mt-6">
          <SystemFieldsSection onEditField={handleEditSystemField} />
        </TabsContent>
        
        <TabsContent value="custom" className="mt-6">
          {customFields.length > 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Campos Personalizados Criados</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-700">
                      <TableHead className="text-zinc-300">Nome do Campo</TableHead>
                      <TableHead className="text-zinc-300">Rótulo</TableHead>
                      <TableHead className="text-zinc-300">Tipo</TableHead>
                      <TableHead className="text-zinc-300">Obrigatório</TableHead>
                      <TableHead className="text-zinc-300">Status</TableHead>
                      <TableHead className="text-zinc-300">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customFields.map((field) => (
                      <TableRow key={field.id} className="border-zinc-700">
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
                          {field.is_required ? 'Sim' : 'Não'}
                        </TableCell>
                        <TableCell className="text-zinc-300">
                          {field.is_active ? (
                            <span className="text-green-400">Ativo</span>
                          ) : (
                            <span className="text-red-400">Inativo</span>
                          )}
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="text-center py-8">
                <div className="text-zinc-400">
                  Nenhum campo personalizado criado ainda. Clique em "Novo Campo Personalizado" para criar o primeiro.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomFieldsManager;
