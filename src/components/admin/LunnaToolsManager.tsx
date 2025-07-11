import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Bot, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { useLunnaTools } from '@/hooks/useLunnaTools';

const LunnaToolsManager = () => {
  const { tools, loading, createTool, updateTool, deleteTool, reorderTool } = useLunnaTools();
  const [editingTool, setEditingTool] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    description: '',
    function_name: '',
    category: 'general',
    is_active: true,
    parameters: '{}',
    display_order: 0
  });

  const resetForm = () => {
    setFormData({
      name: '',
      label: '',
      description: '',
      function_name: '',
      category: 'general',
      is_active: true,
      parameters: '{}',
      display_order: 0
    });
    setEditingTool(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (tool) => {
    setFormData({
      name: tool.name,
      label: tool.label,
      description: tool.description || '',
      function_name: tool.function_name,
      category: tool.category || 'general',
      is_active: tool.is_active,
      parameters: JSON.stringify(tool.parameters || {}, null, 2),
      display_order: tool.display_order
    });
    setEditingTool(tool);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const toolData = {
        ...formData,
        parameters: JSON.parse(formData.parameters || '{}')
      };

      if (editingTool) {
        await updateTool(editingTool.id, toolData);
        toast.success('Ferramenta atualizada com sucesso!');
      } else {
        await createTool(toolData);
        toast.success('Ferramenta criada com sucesso!');
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar ferramenta:', error);
      toast.error('Erro ao salvar ferramenta');
    }
  };

  const handleDelete = async (toolId) => {
    if (confirm('Tem certeza que deseja deletar esta ferramenta?')) {
      try {
        await deleteTool(toolId);
        toast.success('Ferramenta deletada com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar ferramenta:', error);
        toast.error('Erro ao deletar ferramenta');
      }
    }
  };

  const handleReorder = async (toolId, direction) => {
    try {
      await reorderTool(toolId, direction);
      toast.success('Ordem atualizada!');
    } catch (error) {
      console.error('Erro ao reordenar:', error);
      toast.error('Erro ao reordenar ferramenta');
    }
  };

  const categories = [
    { value: 'general', label: 'Geral' },
    { value: 'busca', label: 'Busca' },
    { value: 'dados', label: 'Dados' },
    { value: 'usuario', label: 'Usuário' },
    { value: 'comunicacao', label: 'Comunicação' }
  ];

  const getCategoryLabel = (category) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-white">Carregando ferramentas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Bot className="h-6 w-6" />
        <h2 className="text-xl font-semibold text-white">Ferramentas da Lunna</h2>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Gerenciar Ferramentas</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Ferramenta
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingTool ? 'Editar Ferramenta' : 'Nova Ferramenta'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Nome</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        disabled={!!editingTool}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="label" className="text-white">Rótulo</Label>
                      <Input
                        id="label"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        required
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="function_name" className="text-white">Nome da Função</Label>
                      <Input
                        id="function_name"
                        value={formData.function_name}
                        onChange={(e) => setFormData({ ...formData, function_name: e.target.value })}
                        required
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-white">Categoria</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="display_order" className="text-white">Ordem de Exibição</Label>
                      <Input
                        id="display_order"
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active" className="text-white">Ativa</Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="parameters" className="text-white">Parâmetros (JSON)</Label>
                    <Textarea
                      id="parameters"
                      value={formData.parameters}
                      onChange={(e) => setFormData({ ...formData, parameters: e.target.value })}
                      placeholder="{}"
                      className="bg-zinc-800 border-zinc-700 text-white font-mono"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      {editingTool ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Ordem</TableHead>
                <TableHead className="text-zinc-400">Nome</TableHead>
                <TableHead className="text-zinc-400">Rótulo</TableHead>
                <TableHead className="text-zinc-400">Categoria</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools?.map((tool, index) => (
                <TableRow key={tool.id} className="border-zinc-800">
                  <TableCell className="text-white">
                    <div className="flex items-center space-x-1">
                      <span>{tool.display_order}</span>
                      <div className="flex flex-col">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(tool.id, 'up')}
                          disabled={index === 0}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(tool.id, 'down')}
                          disabled={index === tools.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white font-mono text-sm">{tool.name}</TableCell>
                  <TableCell className="text-white">{tool.label}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getCategoryLabel(tool.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tool.is_active ? "default" : "destructive"}>
                      {tool.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(tool)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tool.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LunnaToolsManager;