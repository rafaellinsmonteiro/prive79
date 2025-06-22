
import { useCustomFields, useCustomSections } from '@/hooks/useCustomFields';
import { UseFormReturn } from 'react-hook-form';
import { ModelFormData } from '../ModelForm';
import SectionRenderer from './SectionRenderer';

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
  
  // Get all active sections, ordered by display_order
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
        
        return (
          <SectionRenderer
            key={section.id}
            section={section}
            fields={fieldsInSection}
            form={form}
          />
        );
      })}
      
      {/* Show fields in default section if they exist */}
      {fieldsBySection['Campos Personalizados'] && fieldsBySection['Campos Personalizados'].length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
            Campos Personalizados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldsBySection['Campos Personalizados'].map(field => (
              <CustomFieldRenderer 
                key={field.id}
                field={field} 
                form={form} 
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default CustomFieldsSection;
