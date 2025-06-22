
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAdminPlans } from '@/hooks/useAdminPlans';

interface VisibilityControlProps {
  visibilityType?: string;
  allowedPlanIds?: string[];
  onVisibilityChange: (type: string, planIds: string[]) => void;
  label?: string;
}

const VisibilityControl = ({ 
  visibilityType = 'public', 
  allowedPlanIds = [], 
  onVisibilityChange,
  label = "Visibilidade"
}: VisibilityControlProps) => {
  const { data: plans = [] } = useAdminPlans();
  const [selectedPlans, setSelectedPlans] = useState<string[]>(allowedPlanIds);
  const [currentType, setCurrentType] = useState(visibilityType);

  const handleTypeChange = (type: string) => {
    setCurrentType(type);
    if (type === 'public') {
      setSelectedPlans([]);
      onVisibilityChange(type, []);
    } else {
      onVisibilityChange(type, selectedPlans);
    }
  };

  const handlePlanToggle = (planId: string, checked: boolean) => {
    const newSelectedPlans = checked 
      ? [...selectedPlans, planId]
      : selectedPlans.filter(id => id !== planId);
    
    setSelectedPlans(newSelectedPlans);
    onVisibilityChange(currentType, newSelectedPlans);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-white">{label}</Label>
        <Select value={currentType} onValueChange={handleTypeChange}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="public" className="text-white hover:bg-zinc-700">
              Público (todos podem ver)
            </SelectItem>
            <SelectItem value="plans" className="text-white hover:bg-zinc-700">
              Restrito a planos específicos
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {currentType === 'plans' && (
        <div className="space-y-2">
          <Label className="text-white text-sm">Planos permitidos:</Label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {plans.map((plan) => (
              <div key={plan.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`plan-${plan.id}`}
                  checked={selectedPlans.includes(plan.id)}
                  onCheckedChange={(checked) => handlePlanToggle(plan.id, checked as boolean)}
                />
                <Label 
                  htmlFor={`plan-${plan.id}`} 
                  className="text-white text-sm cursor-pointer"
                >
                  {plan.name} {plan.price && `- R$ ${plan.price}`}
                </Label>
              </div>
            ))}
          </div>
          {plans.length === 0 && (
            <p className="text-zinc-400 text-sm">Nenhum plano disponível</p>
          )}
        </div>
      )}
    </div>
  );
};

export default VisibilityControl;
