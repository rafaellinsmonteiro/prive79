
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

  console.log('VisibilitySection - Current values:', { visibilityType, allowedPlanIds });

  const handleVisibilityChange = (type: string, planIds: string[]) => {
    console.log('VisibilitySection - Updating visibility:', { type, planIds });
    setValue('visibility_type', type, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    setValue('allowed_plan_ids', planIds, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    
    // Forçar re-render
    form.trigger(['visibility_type', 'allowed_plan_ids']);
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
      
      {/* Debug info */}
      <div className="text-xs text-zinc-500 p-2 bg-zinc-800 rounded">
        <p>Debug - Tipo: {visibilityType}</p>
        <p>Debug - Planos: {JSON.stringify(allowedPlanIds)}</p>
      </div>
    </div>
  );
};

export default VisibilitySection;
