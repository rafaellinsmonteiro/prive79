
import { UseFormReturn } from 'react-hook-form';
import { ModelFormData } from '../ModelForm';
import VisibilityControl from '../VisibilityControl';

interface VisibilitySectionProps {
  form: UseFormReturn<ModelFormData>;
}

const VisibilitySection = ({ form }: VisibilitySectionProps) => {
  const { setValue, watch } = form;
  
  const visibilityType = watch('visibility_type') || 'public';
  const allowedPlanIds = watch('allowed_plan_ids') || [];

  const handleVisibilityChange = (type: string, planIds: string[]) => {
    setValue('visibility_type', type);
    setValue('allowed_plan_ids', planIds);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white border-b border-zinc-700 pb-2">
        Controle de Acesso
      </h3>
      
      <VisibilityControl
        visibilityType={visibilityType}
        allowedPlanIds={allowedPlanIds}
        onVisibilityChange={handleVisibilityChange}
        label="Visibilidade do Modelo"
      />
    </div>
  );
};

export default VisibilitySection;
