
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CustomFieldFormProps {
  field?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}

const CustomFieldForm = ({ field, onSubmit, onCancel, loading }: CustomFieldFormProps) => {
  const [formData, setFormData] = useState({
    field_name: '',
    label: '',
    field_type: 'text',
    is_required: false,
    is_active: true,
    display_order: 0,
    placeholder: '',
    help_text: '',
    options: '',
  });

  useEffect(() => {
    if (field) {
      setFormData({
        field_name: field.field_name || '',
        label: field.label || '',
        field_type: field.field_type || 'text',
        is_required: field.is_required || false,
        is_active: field.is_active !== false,
        display_order: field.display_order || 0,
        placeholder: field.placeholder || '',
        help_text: field.help_text || '',
        options: field.options ? field.options.join('\n') : '',
      });
    }
  }, [field]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      options: formData.field_type === 'select' && formData.options
        ? formData.options.split('\n').filter(option => option.trim())
        : null,
    };

    onSubmit(submitData);
  };

  const fieldTypes = [
    { value: 'text', label: 'Texto' },
    { value: 'textarea', label: 'Texto Longo' },
    { value: 'number', label: 'Número' },
    { value: 'boolean', label: 'Sim/Não' },
    { value: 'select', label: 'Lista de Opções' },
    { value: 'date', label: 'Data' },
    { value: 'email', label: 'Email' },
    { value: 'url', label: 'URL' },
  ];

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">
          {field ? 'Editar Campo Personalizado' : 'Novo Campo Personalizado'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="field_name" className="text-white">
                Nome do Campo (identificador único)
              </Label>
              <Input
                id="field_name"
                value={formData.field_name}
                onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                placeholder="ex: data_nascimento"
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
              <p className="text-xs text-zinc-400">
                Use apenas letras minúsculas, números e underscore (_)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="label" className="text-white">
                Rótulo (nome exibido)
              </Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="ex: Data de Nascimento"
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="field_type" className="text-white">
                Tipo do Campo
              </Label>
              <Select
                value={formData.field_type}
                onValueChange={(value) => setFormData({ ...formData, field_type: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {fieldTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-white">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order" className="text-white">
                Ordem de Exibição
              </Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="placeholder" className="text-white">
              Placeholder (texto de exemplo)
            </Label>
            <Input
              id="placeholder"
              value={formData.placeholder}
              onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
              placeholder="ex: Digite sua data de nascimento"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="help_text" className="text-white">
              Texto de Ajuda
            </Label>
            <Textarea
              id="help_text"
              value={formData.help_text}
              onChange={(e) => setFormData({ ...formData, help_text: e.target.value })}
              placeholder="Informações adicionais sobre este campo"
              className="bg-zinc-800 border-zinc-700 text-white"
              rows={2}
            />
          </div>

          {formData.field_type === 'select' && (
            <div className="space-y-2">
              <Label htmlFor="options" className="text-white">
                Opções (uma por linha)
              </Label>
              <Textarea
                id="options"
                value={formData.options}
                onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                className="bg-zinc-800 border-zinc-700 text-white"
                rows={4}
              />
            </div>
          )}

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_required"
                checked={formData.is_required}
                onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
              />
              <Label htmlFor="is_required" className="text-white">
                Campo Obrigatório
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active" className="text-white">
                Ativo
              </Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Salvando...' : field ? 'Atualizar' : 'Criar Campo'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomFieldForm;
