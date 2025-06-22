
import { useCustomFields } from '@/hooks/useCustomFields';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  
  // Agrupar campos por seção
  const fieldsBySection = customFields.reduce((acc, field) => {
    if (!field.is_active) return acc;
    
    const section = field.section || 'Campos Personalizados';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(field);
    return acc;
  }, {} as Record<string, typeof customFields>);

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
                    value={formField.value?.toString() || ''}
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
                    value={formField.value?.toString() || ''}
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
                <Select onValueChange={formField.onChange} value={formField.value?.toString() || ''}>
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
                    value={formField.value?.toString() || ''}
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
                    value={formField.value?.toString() || ''}
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
                    value={formField.value?.toString() || ''}
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
                    value={formField.value?.toString() || ''}
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

  if (Object.keys(fieldsBySection).length === 0) return null;

  return (
    <>
      {Object.entries(fieldsBySection).map(([sectionName, fields]) => (
        <div key={sectionName} className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
            {sectionName}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields
              .sort((a, b) => a.display_order - b.display_order)
              .map(renderField)}
          </div>
        </div>
      ))}
    </>
  );
};

export default CustomFieldsSection;
