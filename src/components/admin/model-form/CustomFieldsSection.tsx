
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
  
  // Obter apenas seções ativas e ordenadas
  const activeSections = customSections
    .filter(section => section.is_active)
    .sort((a, b) => a.display_order - b.display_order);
  
  console.log('🔍 CustomFieldsSection - Active sections:', activeSections.map(s => ({ name: s.name, order: s.display_order })));
  
  // Agrupar campos por seção, apenas campos ativos
  const fieldsBySection = customFields
    .filter(field => field.is_active)
    .reduce((acc, field) => {
      const section = field.section || 'Campos Personalizados';
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(field);
      return acc;
    }, {} as Record<string, typeof customFields>);

  // Ordenar campos dentro de cada seção
  Object.keys(fieldsBySection).forEach(sectionName => {
    fieldsBySection[sectionName].sort((a, b) => a.display_order - b.display_order);
  });

  console.log('🔍 CustomFieldsSection - Fields by section:', Object.keys(fieldsBySection));

  const renderField = (field: typeof customFields[0]) => {
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
                    value={formField.value != null ? String(formField.value) : ''}
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
                    value={formField.value != null ? String(formField.value) : ''}
                    onChange={(e) => formField.onChange(e.target.value)}
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
                  onValueChange={formField.onChange} 
                  value={formField.value != null ? String(formField.value) : ''}
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
                    value={formField.value != null ? String(formField.value) : ''}
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
                    value={formField.value != null ? String(formField.value) : ''}
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
                    value={formField.value != null ? String(formField.value) : ''}
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
                    value={formField.value != null ? String(formField.value) : ''}
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

  // Se não há seções ativas, não exibir nada
  if (activeSections.length === 0) {
    console.log('⚠️ CustomFieldsSection - No active sections to display');
    return null;
  }

  console.log('✅ CustomFieldsSection - Rendering sections in order:', activeSections.map(s => s.name));

  return (
    <>
      {activeSections.map((section) => {
        const fieldsInSection = fieldsBySection[section.name] || [];
        
        // Só exibir seção se tiver campos
        if (fieldsInSection.length === 0) {
          console.log(`⚠️ CustomFieldsSection - Section "${section.name}" has no fields, skipping`);
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
    </>
  );
};

export default CustomFieldsSection;
