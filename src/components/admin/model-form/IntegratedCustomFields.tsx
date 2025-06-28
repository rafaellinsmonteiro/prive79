
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
  
  // Lista de campos do sistema que NÃO devem ser renderizados como campos personalizados
  // pois já estão implementados diretamente nos componentes do sistema
  const systemFieldsToExclude = [
    'name', 'age', 'whatsapp_number', 'neighborhood', 'city_id',
    'height', 'weight', 'body_type', 'shoe_size', 'bust', 'waist', 'hip',
    'description', 'languages', 'appearance', 'city', 'is_active',
    'display_order', 'visibility_type', 'allowed_plan_ids', 'silicone'
  ];
  
  // Filtrar campos personalizados que pertencem à seção específica
  // INCLUINDO campos como 'eyes', 'olhos', 'tatuagem', etc. que são campos personalizados válidos
  const sectionFields = customFields.filter(field => {
    const belongsToSection = field.section === sectionName;
    const isActive = field.is_active;
    const shouldExclude = systemFieldsToExclude.includes(field.field_name);
    
    console.log(`🔍 IntegratedCustomFields - Field ${field.field_name}: section=${field.section}, belongs=${belongsToSection}, active=${isActive}, shouldExclude=${shouldExclude}`);
    
    return belongsToSection && isActive && !shouldExclude;
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
