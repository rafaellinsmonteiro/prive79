
import { useCustomFields } from '@/hooks/useCustomFields';
import { UseFormReturn } from 'react-hook-form';
import { ModelFormData } from '../ModelForm';
import CustomFieldRenderer from './CustomFieldRenderer';

interface IntegratedCustomFieldsProps {
  form: UseFormReturn<ModelFormData>;
  sectionName: string;
}

const IntegratedCustomFields = ({ form, sectionName }: IntegratedCustomFieldsProps) => {
  const { data: customFields = [] } = useCustomFields();
  
  // Filtrar campos personalizados ativos para a seção específica
  const fieldsForSection = customFields.filter(field => {
    const isActive = field.is_active;
    const isForThisSection = field.section === sectionName;
    
    console.log(`🔍 IntegratedCustomFields - Field ${field.field_name}: active=${isActive}, section=${field.section}, forThisSection=${isForThisSection}`);
    
    return isActive && isForThisSection;
  }).sort((a, b) => a.display_order - b.display_order);

  console.log(`✅ IntegratedCustomFields - Found ${fieldsForSection.length} fields for section "${sectionName}"`);
  console.log(`📝 Fields details:`, fieldsForSection.map(f => ({ 
    name: f.field_name, 
    label: f.label, 
    type: f.field_type,
    options: f.options,
    display_order: f.display_order
  })));

  if (fieldsForSection.length === 0) {
    return null;
  }

  return (
    <>
      {fieldsForSection.map(field => (
        <CustomFieldRenderer 
          key={field.id}
          field={field} 
          form={form} 
        />
      ))}
    </>
  );
};

export default IntegratedCustomFields;
