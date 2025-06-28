
import { useCustomFields, useCustomSections } from '@/hooks/useCustomFields';
import { UseFormReturn } from 'react-hook-form';
import { ModelFormData } from '../ModelForm';
import SectionRenderer from './SectionRenderer';
import CustomFieldRenderer from './CustomFieldRenderer';

interface CustomFieldsSectionProps {
  form: UseFormReturn<ModelFormData>;
}

const CustomFieldsSection = ({ form }: CustomFieldsSectionProps) => {
  const { data: customFields = [], isLoading: loadingFields } = useCustomFields();
  const { data: customSections = [], isLoading: loadingSections } = useCustomSections();
  
  console.log('🔧 CustomFieldsSection - Debug Info:');
  console.log('📊 Total fields:', customFields.length);
  console.log('📊 Active fields:', customFields.filter(f => f.is_active).length);
  console.log('📊 Total sections:', customSections.length);
  console.log('📊 Active sections:', customSections.filter(s => s.is_active).length);
  
  if (loadingFields || loadingSections) {
    return (
      <div className="space-y-4">
        <div className="text-center text-zinc-400">
          <p>Carregando campos personalizados...</p>
        </div>
      </div>
    );
  }
  
  // Seções que já existem no sistema e são integradas diretamente
  const systemSections = [
    'Informações Básicas',
    'Características Físicas', 
    'Atendimento',
    'Outras Informações',
    'Controle de Acesso',
    'Configurações'
  ];
  
  // Lista de campos do sistema que NÃO devem ser renderizados como campos personalizados
  // pois já estão implementados diretamente nos componentes do sistema
  const systemFieldsToExclude = [
    'name', 'age', 'whatsapp_number', 'neighborhood', 'city_id',
    'height', 'weight', 'body_type', 'shoe_size', 'bust', 'waist', 'hip', 
    'description', 'languages', 'appearance', 'city', 'is_active',
    'display_order', 'visibility_type', 'allowed_plan_ids', 'silicone'
  ];
  
  // Filtrar campos personalizados ativos, excluindo apenas os campos do sistema já implementados
  // MAS permitindo campos personalizados válidos como 'olhos', 'tatuagem', etc.
  const customFieldsOnly = customFields.filter(field => {
    const isActive = field.is_active;
    const shouldExclude = systemFieldsToExclude.includes(field.field_name);
    const isInSystemSection = systemSections.includes(field.section || '');
    
    console.log(`🔍 Field ${field.field_name}: active=${isActive}, shouldExclude=${shouldExclude}, section=${field.section}, inSystemSection=${isInSystemSection}`);
    
    // Incluir campos que são ativos E não estão na lista de exclusão
    // Não importa se estão em seções do sistema, pois podem ser campos personalizados válidos
    return isActive && !shouldExclude;
  });
  
  console.log('✅ Custom fields to display:', customFieldsOnly.length);
  console.log('✅ Custom field names:', customFieldsOnly.map(f => f.field_name));
  
  // Obter seções ativas ordenadas, incluindo seções do sistema que têm campos personalizados
  const activeSections = customSections
    .filter(section => section.is_active)
    .sort((a, b) => a.display_order - b.display_order);
  
  console.log('📂 Active sections to display:', activeSections.map(s => ({ name: s.name, order: s.display_order })));
  
  // Agrupar campos por seção
  const fieldsBySection = customFieldsOnly.reduce((acc, field) => {
    const section = field.section || 'Campos Personalizados';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(field);
    return acc;
  }, {} as Record<string, typeof customFieldsOnly>);

  // Ordenar campos dentro de cada seção
  Object.keys(fieldsBySection).forEach(sectionName => {
    fieldsBySection[sectionName].sort((a, b) => a.display_order - b.display_order);
  });

  console.log('🗂️ Fields grouped by section:', Object.keys(fieldsBySection));

  // Se não há campos personalizados ativos, não mostrar nada
  if (customFieldsOnly.length === 0) {
    console.log('⚠️ No custom fields to display');
    return null;
  }

  console.log('🎯 Rendering custom fields sections...');

  return (
    <>
      {/* Renderizar seções personalizadas que têm campos */}
      {activeSections.map((section) => {
        const fieldsInSection = fieldsBySection[section.name] || [];
        
        console.log(`🎨 Checking section "${section.name}" with ${fieldsInSection.length} fields`);
        
        if (fieldsInSection.length === 0) {
          console.log(`⏭️ Skipping empty section: ${section.name}`);
          return null;
        }
        
        return (
          <SectionRenderer
            key={section.id}
            section={section}
            fields={fieldsInSection}
            form={form}
          />
        );
      })}
      
      {/* Renderizar campos na seção padrão "Campos Personalizados" */}
      {fieldsBySection['Campos Personalizados'] && fieldsBySection['Campos Personalizados'].length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
            Campos Personalizados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldsBySection['Campos Personalizados'].map(field => {
              console.log(`🎨 Rendering field in default section: ${field.field_name}`);
              return (
                <CustomFieldRenderer 
                  key={field.id}
                  field={field} 
                  form={form} 
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default CustomFieldsSection;
