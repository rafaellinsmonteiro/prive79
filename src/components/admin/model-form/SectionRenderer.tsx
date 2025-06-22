
import { CustomField, CustomSection } from '@/hooks/useCustomFields';
import { UseFormReturn } from 'react-hook-form';
import { ModelFormData } from '../ModelForm';
import CustomFieldRenderer from './CustomFieldRenderer';

interface SectionRendererProps {
  section: CustomSection;
  fields: CustomField[];
  form: UseFormReturn<ModelFormData>;
}

const SectionRenderer = ({ section, fields, form }: SectionRendererProps) => {
  if (fields.length === 0) {
    console.log(`⚠️ SectionRenderer - Section "${section.name}" skipped (no fields)`);
    return null;
  }

  console.log(`✅ SectionRenderer - Rendering section "${section.name}" with ${fields.length} fields`);

  return (
    <div key={section.id} className="space-y-4">
      <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
        {section.name}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(field => (
          <CustomFieldRenderer 
            key={field.id}
            field={field} 
            form={form} 
          />
        ))}
      </div>
    </div>
  );
};

export default SectionRenderer;
