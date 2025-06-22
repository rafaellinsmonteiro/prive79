
import { useCustomFields, useCustomSections } from '@/hooks/useCustomFields';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ModelFormData } from '../ModelForm';

interface CustomFieldsSectionProps {
  form: UseFormReturn<ModelFormData>;
}

const CustomFieldsSection = ({ form }: CustomFieldsSectionProps) => {
  const { data: customFields = [] } = useCustomFields();
  const { data: customSections = [] } = useCustomSections();
  
  console.log('🔍 CustomFieldsSection - Total fields loaded:', customFields.length);
  console.log('🔍 CustomFieldsSection - Field names:', customFields.map(f => f.field_name));
  console.log('🔍 CustomFieldsSection - Active fields:', customFields.filter(f => f.is_active).length);
  console.log('🔍 CustomFieldsSection - Total sections loaded:', customSections.length);
  console.log('🔍 CustomFieldsSection - All sections:', customSections.map(s => ({ name: s.name, active: s.is_active })));
  
  // Define system sections that should not be displayed as custom sections
  const systemSections = [
    'Informações Básicas',
    'Características Físicas', 
    'Atendimento',
    'Outras Informações',
    'Controle de Acesso',
    'Configurações'
  ];
  
  // Get all active sections, ordered by display_order (not filtering out system sections anymore)
  const activeSections = customSections
    .filter(section => section.is_active)
    .sort((a, b) => a.display_order - b.display_order);
  
  console.log('🔍 CustomFieldsSection - Active sections for display:', activeSections.map(s => ({ name: s.name, order: s.display_order })));
  
  // Group fields by section, only active fields that are not system fields
  const customFieldsOnly = customFields.filter(field => 
    field.is_active && !systemSections.some(sysSection => 
      field.section === sysSection || 
      ['name', 'age', 'whatsapp_number', 'neighborhood', 'height', 'weight', 'eyes', 'body_type', 'shoe_size', 'bust', 'waist', 'hip', 'description', 'silicone', 'is_active', 'display_order', 'visibility_type', 'allowed_plan_ids'].includes(field.field_name)
    )
  );
  
  const fieldsBySection = customFieldsOnly.reduce((acc, field) => {
    const section = field.section || 'Campos Personalizados';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(field);
    return acc;
  }, {} as Record<string, typeof customFieldsOnly>);

  // Sort fields within each section
  Object.keys(fieldsBySection).forEach(sectionName => {
    fieldsBySection[sectionName].sort((a, b) => a.display_order - b.display_order);
  });

  console.log('🔍 CustomFieldsSection - Custom fields by section:', Object.keys(fieldsBySection));

  const renderField = (field: typeof customFieldsOnly[0]) => {
    const fieldName = `custom_${field.field_name}` as keyof ModelFormData;

    switch (field.field_type) {
      case 'textarea':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-white">
                  {field.label} {field.is_required && '*'}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...formField}
                    value={String(formField.value || '')}
                    onChange={(e) => formField.onChange(e.target.value)}
                    placeholder={field.placeholder || ''}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </FormControl>
                {field.help_text && (
                  <p className="text-xs text-zinc-400">{field.help_text}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'number':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-white">
                  {field.label} {field.is_required && '*'}
                </FormLabel>
                <FormControl>
                  <Input
                    {...formField}
                    value={String(formField.value || '')}
                    onChange={(e) => {
                      const value = e.target.value;
                      formField.onChange(value === '' ? '' : Number(value));
                    }}
                    type="number"
                    placeholder={field.placeholder || ''}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </FormControl>
                {field.help_text && (
                  <p className="text-xs text-zinc-400">{field.help_text}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'boolean':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-700 p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-white">
                    {field.label} {field.is_required && '*'}
                  </FormLabel>
                  {field.help_text && (
                    <p className="text-xs text-zinc-400">{field.help_text}</p>
                  )}
                </div>
                <FormControl>
                  <Switch
                    checked={Boolean(formField.value)}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'select':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-white">
                  {field.label} {field.is_required && '*'}
                </FormLabel>
                <Select 
                  onValueChange={(value) => formField.onChange(value)}
                  value={String(formField.value || '')}
                >
                  <FormControl>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder={field.placeholder || 'Selecione uma opção'} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option} className="text-white">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.help_text && (
                  <p className="text-xs text-zinc-400">{field.help_text}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'date':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-white">
                  {field.label} {field.is_required && '*'}
                </FormLabel>
                <FormControl>
                  <Input
                    {...formField}
                    value={String(formField.value || '')}
                    onChange={(e) => formField.onChange(e.target.value)}
                    type="date"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </FormControl>
                {field.help_text && (
                  <p className="text-xs text-zinc-400">{field.help_text}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'email':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-white">
                  {field.label} {field.is_required && '*'}
                </FormLabel>
                <FormControl>
                  <Input
                    {...formField}
                    value={String(formField.value || '')}
                    onChange={(e) => formField.onChange(e.target.value)}
                    type="email"
                    placeholder={field.placeholder || ''}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </FormControl>
                {field.help_text && (
                  <p className="text-xs text-zinc-400">{field.help_text}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'url':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-white">
                  {field.label} {field.is_required && '*'}
                </FormLabel>
                <FormControl>
                  <Input
                    {...formField}
                    value={String(formField.value || '')}
                    onChange={(e) => formField.onChange(e.target.value)}
                    type="url"
                    placeholder={field.placeholder || ''}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </FormControl>
                {field.help_text && (
                  <p className="text-xs text-zinc-400">{field.help_text}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default: // text
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-white">
                  {field.label} {field.is_required && '*'}
                </FormLabel>
                <FormControl>
                  <Input
                    {...formField}
                    value={String(formField.value || '')}
                    onChange={(e) => formField.onChange(e.target.value)}
                    placeholder={field.placeholder || ''}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </FormControl>
                {field.help_text && (
                  <p className="text-xs text-zinc-400">{field.help_text}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }  
  };

  // If no custom fields are active, don't display anything
  const hasActiveCustomFields = customFieldsOnly.length > 0;
  if (!hasActiveCustomFields) {
    console.log('⚠️ CustomFieldsSection - No active custom fields to display');
    return null;
  }

  console.log('✅ CustomFieldsSection - Rendering sections in order:', activeSections.map(s => s.name));

  return (
    <>
      {activeSections.map((section) => {
        const fieldsInSection = fieldsBySection[section.name] || [];
        
        // Only display section if it has fields
        if (fieldsInSection.length === 0) {
          console.log(`⚠️ CustomFieldsSection - Section "${section.name}" skipped (no fields)`);
          return null;
        }

        console.log(`✅ CustomFieldsSection - Rendering section "${section.name}" with ${fieldsInSection.length} fields`);
        
        return (
          <div key={section.id} className="space-y-4">
            <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
              {section.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fieldsInSection.map(renderField)}
            </div>
          </div>
        );
      })}
      
      {/* Show fields in default section if they exist */}
      {fieldsBySection['Campos Personalizados'] && fieldsBySection['Campos Personalizados'].length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
            Campos Personalizados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldsBySection['Campos Personalizados'].map(renderField)}
          </div>
        </div>
      )}
    </>
  );
};

export default CustomFieldsSection;
