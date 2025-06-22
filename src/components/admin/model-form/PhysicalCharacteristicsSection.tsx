
import { UseFormReturn } from 'react-hook-form';
import { ModelFormData } from '../ModelForm';
import IntegratedCustomFields from './IntegratedCustomFields';

interface PhysicalCharacteristicsSectionProps {
  form: UseFormReturn<ModelFormData>;
}

const PhysicalCharacteristicsSection = ({ form }: PhysicalCharacteristicsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
        Características Físicas
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TODOS os campos desta seção vêm do sistema de campos personalizados */}
        <IntegratedCustomFields form={form} sectionName="Características Físicas" />
      </div>
    </div>
  );
};

export default PhysicalCharacteristicsSection;
