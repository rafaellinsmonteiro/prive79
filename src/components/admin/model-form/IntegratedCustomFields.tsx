
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
  
  // Lista de campos do sistema que já estão implementados
  const systemFields = [
    'name', 'age', 'whatsapp_number', 'neighborhood', 'city_id',
    'height', 'weight', 'eyes', 'body_type', 'shoe_size', 'bust', 'waist', 'hip',
    'silicone', 'description', 'languages', 'appearance', 'city', 'is_active',
    'display_order', 'visibility_type', 'allowed_plan_ids'
  ];
  
  // Filtrar campos personalizados que pertencem à seção específica
  // e que NÃO são campos do sistema
  const sectionFields = customFields.filter(field => {
    const belongsToSection = field.section === sectionName;
    const isActive = field.is_active;
    const isNotSystemField = !systemFields.includes(field.field_name);
    
    console.log(`🔍 IntegratedCustomFields - Field ${field.field_name}: section=${field.section}, belongs=${belongsToSection}, active=${isActive}, notSystem=${isNotSystemField}`);
    
    return belongsToSection && isActive && isNotSystemField;
  });
  
  console.log(`🎯 IntegratedCustomFields - Section "${sectionName}" has ${sectionFields.length} fields`);
  
  if (sectionFields.length === 0) {
    return null;
  }
  
  // Ordenar campos pela ordem de exibição
  const sortedFields = sectionFields.sort((a, b) => a.display_order - b.display_order);
  
  return (
    <>
      {sortedFields.map(field => (
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
