
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
import { CustomField } from '@/hooks/useCustomFields';

interface CustomFieldRendererProps {
  field: CustomField;
  form: UseFormReturn<ModelFormData>;
}

const CustomFieldRenderer = ({ field, form }: CustomFieldRendererProps) => {
  // Para campos personalizados integrados, usar o nome direto do campo
  // Para outros campos personalizados, usar o prefixo custom_
  const isIntegratedField = ['olhos', 'tatuagem', 'cabelo', 'etnia'].includes(field.field_name);
  const fieldName = isIntegratedField ? field.field_name as keyof ModelFormData : `custom_${field.field_name}` as keyof ModelFormData;

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  };

  const formatNumberValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return '';
    return String(value);
  };

  console.log(`🎨 CustomFieldRenderer - Rendering field: ${field.field_name} (${field.field_type})`);
  console.log(`🎨 Field name used: ${String(fieldName)}, integrated: ${isIntegratedField}`);
  console.log(`🎨 Field options:`, field.options);

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
                  value={formatValue(formField.value)}
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
                  value={formatNumberValue(formField.value)}
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
                  onCheckedChange={(checked) => {
                    console.log(`🔧 Boolean field ${field.field_name} changed to:`, checked);
                    formField.onChange(checked);
                  }}
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
                onValueChange={(value) => {
                  console.log(`🔧 Select field ${field.field_name} changed to:`, value);
                  formField.onChange(value);
                }}
                value={formatValue(formField.value)}
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
                  value={formatValue(formField.value)}
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
                  value={formatValue(formField.value)}
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
                  value={formatValue(formField.value)}
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
                  value={formatValue(formField.value)}
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

export default CustomFieldRenderer;
