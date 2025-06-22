
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModelFormData } from '../ModelForm';

interface CustomField {
  id: string;
  field_name: string;
  label: string;
  field_type: string;
  placeholder?: string;
  help_text?: string;
  options?: string[];
  is_required: boolean;
}

interface CustomFieldRendererProps {
  field: CustomField;
  form: UseFormReturn<ModelFormData>;
}

const CustomFieldRenderer = ({ field, form }: CustomFieldRendererProps) => {
  const fieldName = field.field_name;
  
  // Usar o nome do campo diretamente para campos integrados, custom_ prefix para outros
  const integratedFields = ['olhos', 'tatuagem', 'cabelo', 'etnia'];
  const formFieldName = integratedFields.includes(fieldName) 
    ? fieldName 
    : `custom_${fieldName}`;

  switch (field.field_type) {
    case 'text':
      return (
        <FormField
          control={form.control}
          name={formFieldName as any}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <Input
                  placeholder={field.placeholder || ''}
                  value={String(formField.value || '')}
                  onChange={(e) => formField.onChange(e.target.value)}
                />
              </FormControl>
              {field.help_text && (
                <p className="text-sm text-zinc-400">{field.help_text}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case 'textarea':
      return (
        <FormField
          control={form.control}
          name={formFieldName as any}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={field.placeholder || ''}
                  value={String(formField.value || '')}
                  onChange={(e) => formField.onChange(e.target.value)}
                  rows={4}
                />
              </FormControl>
              {field.help_text && (
                <p className="text-sm text-zinc-400">{field.help_text}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case 'number':
      return (
        <FormField
          control={form.control}
          name={formFieldName as any}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={field.placeholder || ''}
                  value={String(formField.value || '')}
                  onChange={(e) => formField.onChange(e.target.value ? Number(e.target.value) : '')}
                />
              </FormControl>
              {field.help_text && (
                <p className="text-sm text-zinc-400">{field.help_text}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case 'boolean':
      return (
        <FormField
          control={form.control}
          name={formFieldName as any}
          render={({ field: formField }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={!!formField.value}
                  onCheckedChange={formField.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{field.label}</FormLabel>
                {field.help_text && (
                  <p className="text-sm text-zinc-400">{field.help_text}</p>
                )}
              </div>
            </FormItem>
          )}
        />
      );

    case 'select':
      return (
        <FormField
          control={form.control}
          name={formFieldName as any}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <Select 
                value={String(formField.value || '')} 
                onValueChange={formField.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder || 'Selecione uma opção'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.help_text && (
                <p className="text-sm text-zinc-400">{field.help_text}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case 'radio':
      return (
        <FormField
          control={form.control}
          name={formFieldName as any}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {field.options?.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`${formFieldName}-${option}`}
                        name={formFieldName}
                        value={option}
                        checked={String(formField.value || '') === option}
                        onChange={(e) => formField.onChange(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label htmlFor={`${formFieldName}-${option}`} className="text-sm text-white">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </FormControl>
              {field.help_text && (
                <p className="text-sm text-zinc-400">{field.help_text}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case 'date':
      return (
        <FormField
          control={form.control}
          name={formFieldName as any}
          render={({ field: formField }) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={String(formField.value || '')}
                  onChange={(e) => formField.onChange(e.target.value)}
                />
              </FormControl>
              {field.help_text && (
                <p className="text-sm text-zinc-400">{field.help_text}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );

    default:
      return (
        <div className="p-4 border border-red-500 rounded bg-red-50">
          <p className="text-red-700">Tipo de campo não suportado: {field.field_type}</p>
        </div>
      );
  }
};

export default CustomFieldRenderer;
