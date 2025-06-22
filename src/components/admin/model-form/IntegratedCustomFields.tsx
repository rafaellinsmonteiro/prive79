
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
    const isSystemField = ['name', 'age', 'whatsapp_number', 'neighborhood', 'height', 'weight', 'eyes', 'body_type', 'shoe_size', 'bust', 'waist', 'hip', 'description', 'silicone', 'is_active', 'display_order', 'visibility_type', 'allowed_plan_ids'].includes(field.field_name);
    
    console.log(`🔍 IntegratedCustomFields - Field ${field.field_name}: active=${isActive}, section=${field.section}, forThisSection=${isForThisSection}, isSystem=${isSystemField}`);
    
    return isActive && isForThisSection && !isSystemField;
  }).sort((a, b) => a.display_order - b.display_order);

  console.log(`✅ IntegratedCustomFields - Found ${fieldsForSection.length} fields for section "${sectionName}"`);

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
