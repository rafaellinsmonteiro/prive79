
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Upload, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminPlans } from '@/hooks/useAdminPlans';
import { useFileUpload } from '@/hooks/useFileUpload';

interface CustomFieldFormProps {
  field?: any;
  onSubmit: (fieldData: any) => void;
  onCancel: () => void;
  loading: boolean;
  availableSections?: string[];
}

const CustomFieldForm = ({ field, onSubmit, onCancel, loading, availableSections = [] }: CustomFieldFormProps) => {
  const { data: plans = [] } = useAdminPlans();
  const { uploadPhoto, uploading } = useFileUpload();
  
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
    section: 'Campos Personalizados',
    allowed_plan_ids: [] as string[],
    icon_url: '',
  });

  useEffect(() => {
    if (field) {
      setFormData({
        field_name: field.field_name || '',
        label: field.label || '',
        field_type: field.field_type || 'text',
        is_required: field.is_required || false,
        is_active: field.is_active !== undefined ? field.is_active : true,
        display_order: field.display_order || 0,
        placeholder: field.placeholder || '',
        help_text: field.help_text || '',
        options: field.options ? field.options.join('\n') : '',
        section: field.section || 'Campos Personalizados',
        allowed_plan_ids: field.allowed_plan_ids || [],
        icon_url: field.icon_url || '',
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

  // Ensure we have the default section available
  const allSections = ['Campos Personalizados', ...availableSections].filter((section, index, arr) => arr.indexOf(section) === index);

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
                Nome do Campo *
              </Label>
              <Input
                id="field_name"
                value={formData.field_name}
                onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                placeholder="ex: data_nascimento"
                className="bg-zinc-800 border-zinc-700 text-white"
                required
                disabled={!!field}
              />
              <p className="text-xs text-zinc-400">
                Use apenas letras minúsculas, números e underscore (_)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="label" className="text-white">
                Rótulo (nome exibido) *
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
              <Label htmlFor="section" className="text-white">
                Seção
              </Label>
              <Select
                value={formData.section}
                onValueChange={(value) => setFormData({ ...formData, section: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {allSections.map((section) => (
                    <SelectItem key={section} value={section} className="text-white">
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

          {/* Upload de Ícone */}
          <div className="space-y-2">
            <Label className="text-white">Ícone do Campo</Label>
            <div className="flex items-center space-x-4">
              {formData.icon_url && (
                <div className="flex items-center space-x-2">
                  <img
                    src={formData.icon_url}
                    alt="Ícone do campo"
                    className="w-8 h-8 object-contain"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, icon_url: '' })}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept=".png,.svg,image/png,image/svg+xml"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const iconUrl = await uploadPhoto(file, 'temp-model-id');
                        setFormData({ ...formData, icon_url: iconUrl });
                      } catch (error) {
                        console.error('Erro ao fazer upload do ícone:', error);
                      }
                    }
                  }}
                  className="hidden"
                  id="icon-upload"
                />
                <Label
                  htmlFor="icon-upload"
                  className="flex items-center space-x-2 cursor-pointer bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white hover:bg-zinc-700"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Enviando...' : 'Escolher Ícone (PNG/SVG)'}</span>
                </Label>
              </div>
            </div>
          </div>

          {/* Restrições de Planos */}
          <div className="space-y-2">
            <Label className="text-white">Restringir a Planos Específicos</Label>
            <p className="text-xs text-zinc-400">
              Se nenhum plano for selecionado, o campo será visível para todos os usuários
            </p>
            <div className="flex flex-wrap gap-2">
              {plans.map((plan) => (
                <div key={plan.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`plan-${plan.id}`}
                    checked={formData.allowed_plan_ids.includes(plan.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          allowed_plan_ids: [...formData.allowed_plan_ids, plan.id]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          allowed_plan_ids: formData.allowed_plan_ids.filter(id => id !== plan.id)
                        });
                      }
                    }}
                    className="rounded border-zinc-600 bg-zinc-700"
                  />
                  <Label htmlFor={`plan-${plan.id}`} className="text-white text-sm">
                    {plan.name}
                  </Label>
                </div>
              ))}
            </div>
            {formData.allowed_plan_ids.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.allowed_plan_ids.map((planId) => {
                  const plan = plans.find(p => p.id === planId);
                  return plan ? (
                    <Badge key={planId} variant="secondary" className="text-xs">
                      {plan.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
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
              {loading ? 'Salvando...' : field ? 'Atualizar Campo' : 'Criar Campo'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomFieldForm;
