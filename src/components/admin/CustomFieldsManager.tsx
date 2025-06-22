
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCustomFields, useCreateCustomField, useUpdateCustomField, useDeleteCustomField } from '@/hooks/useCustomFields';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash } from 'lucide-react';
import CustomFieldForm from './CustomFieldForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const CustomFieldsManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const { data: customFields = [], isLoading } = useCustomFields();
  const createCustomField = useCreateCustomField();
  const updateCustomField = useUpdateCustomField();
  const deleteCustomField = useDeleteCustomField();
  const { toast } = useToast();

  // Campos padrão existentes no modelo
  const defaultFields = [
    { name: 'name', label: 'Nome', type: 'text', required: true, is_default: true },
    { name: 'age', label: 'Idade', type: 'number', required: true, is_default: true },
    { name: 'height', label: 'Altura', type: 'text', required: false, is_default: true },
    { name: 'weight', label: 'Peso', type: 'text', required: false, is_default: true },
    { name: 'silicone', label: 'Silicone', type: 'boolean', required: false, is_default: true },
    { name: 'shoe_size', label: 'Número do Sapato', type: 'text', required: false, is_default: true },
    { name: 'bust', label: 'Busto', type: 'text', required: false, is_default: true },
    { name: 'waist', label: 'Cintura', type: 'text', required: false, is_default: true },
    { name: 'hip', label: 'Quadril', type: 'text', required: false, is_default: true },
    { name: 'body_type', label: 'Tipo de Corpo', type: 'text', required: false, is_default: true },
    { name: 'eyes', label: 'Olhos', type: 'text', required: false, is_default: true },
    { name: 'languages', label: 'Idiomas', type: 'text', required: false, is_default: true },
    { name: 'description', label: 'Descrição', type: 'textarea', required: false, is_default: true },
    { name: 'whatsapp_number', label: 'WhatsApp', type: 'text', required: false, is_default: true },
    { name: 'neighborhood', label: 'Bairro', type: 'text', required: false, is_default: true },
  ];

  // Combinar campos padrão com campos personalizados
  const allFields = [...defaultFields, ...customFields];

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
        <h1 className="text-2xl font-bold text-white">Campos Personalizados</h1>
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

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Todos os Campos</CardTitle>
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
              {allFields.map((field, index) => (
                <TableRow key={field.id || `default-${index}`} className="border-zinc-700">
                  <TableCell className="text-white font-mono text-sm">
                    {field.field_name || field.name}
                  </TableCell>
                  <TableCell className="text-white">
                    {field.label}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {getFieldTypeName(field.field_type || field.type)}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {field.is_required || field.required ? 'Sim' : 'Não'}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {field.is_default ? (
                      <span className="text-blue-400">Padrão</span>
                    ) : field.is_active ? (
                      <span className="text-green-400">Ativo</span>
                    ) : (
                      <span className="text-red-400">Inativo</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {!field.is_default && (
                        <>
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
                        </>
                      )}
                      {field.is_default && (
                        <span className="text-xs text-zinc-500 px-2 py-1">
                          Campo do sistema
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {allFields.length === 0 && (
            <div className="text-center py-8 text-zinc-400">
              Nenhum campo encontrado. Clique em "Novo Campo" para criar o primeiro.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomFieldsManager;
