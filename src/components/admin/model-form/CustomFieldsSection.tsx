
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
  console.log('📋 All fields:', customFields.map(f => ({ name: f.field_name, section: f.section, active: f.is_active })));
  console.log('📋 All sections:', customSections.map(s => ({ name: s.name, active: s.is_active, order: s.display_order })));
  
  if (loadingFields || loadingSections) {
    return (
      <div className="space-y-4">
        <div className="text-center text-zinc-400">
          <p>Carregando campos personalizados...</p>
        </div>
      </div>
    );
  }
  
  // Sistema de seções que não devem aparecer como personalizadas
  const systemSections = [
    'Informações Básicas',
    'Características Físicas', 
    'Atendimento',
    'Outras Informações',
    'Controle de Acesso',
    'Configurações'
  ];
  
  // Filtrar apenas campos personalizados ativos, excluindo campos do sistema
  const customFieldsOnly = customFields.filter(field => {
    const isActive = field.is_active;
    const isSystemField = ['name', 'age', 'whatsapp_number', 'neighborhood', 'height', 'weight', 'eyes', 'body_type', 'shoe_size', 'bust', 'waist', 'hip', 'description', 'silicone', 'is_active', 'display_order', 'visibility_type', 'allowed_plan_ids'].includes(field.field_name);
    
    console.log(`🔍 Field ${field.field_name}: active=${isActive}, isSystem=${isSystemField}, section=${field.section}`);
    
    return isActive && !isSystemField;
  });
  
  console.log('✅ Filtered custom fields:', customFieldsOnly.length);
  console.log('📋 Custom fields to display:', customFieldsOnly.map(f => ({ name: f.field_name, section: f.section })));
  
  // Obter todas as seções ativas ordenadas
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
  console.log('🔍 Detailed section breakdown:');
  Object.entries(fieldsBySection).forEach(([sectionName, fields]) => {
    console.log(`  📁 ${sectionName}: ${fields.length} fields`);
    fields.forEach(field => {
      console.log(`    📄 ${field.field_name} (${field.field_type})`);
    });
  });

  // Se não há campos personalizados ativos, não mostrar nada
  if (customFieldsOnly.length === 0) {
    console.log('⚠️ No custom fields to display');
    return null;
  }

  console.log('🎯 Rendering custom fields sections...');

  return (
    <>
      {/* Renderizar seções definidas no sistema */}
      {activeSections.map((section) => {
        const fieldsInSection = fieldsBySection[section.name] || [];
        
        console.log(`🎨 Rendering section "${section.name}" with ${fieldsInSection.length} fields`);
        
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
      
      {/* Debug visual para mostrar o que está sendo renderizado */}
      <div className="mt-6 p-4 bg-zinc-800 rounded border-2 border-blue-500">
        <h4 className="text-blue-300 font-bold mb-2">🐛 DEBUG - Campos Personalizados</h4>
        <div className="text-xs text-white space-y-1">
          <p>📊 Total de campos carregados: <span className="text-green-400">{customFields.length}</span></p>
          <p>📊 Campos ativos: <span className="text-green-400">{customFields.filter(f => f.is_active).length}</span></p>
          <p>📊 Campos personalizados (não sistema): <span className="text-green-400">{customFieldsOnly.length}</span></p>
          <p>📊 Seções ativas: <span className="text-green-400">{activeSections.length}</span></p>
          <div className="mt-2">
            <p className="text-yellow-300">Seções encontradas:</p>
            {activeSections.map(s => (
              <p key={s.id} className="ml-2 text-gray-300">• {s.name} (ordem: {s.display_order})</p>
            ))}
          </div>
          <div className="mt-2">
            <p className="text-yellow-300">Campos por seção:</p>
            {Object.entries(fieldsBySection).map(([sectionName, fields]) => (
              <p key={sectionName} className="ml-2 text-gray-300">• {sectionName}: {fields.length} campos</p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomFieldsSection;
