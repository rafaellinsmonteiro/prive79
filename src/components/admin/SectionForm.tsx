import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAdminPlans } from '@/hooks/useAdminPlans';

interface SectionFormProps {
  section?: any;
  onSubmit: (sectionData: any) => void;
  onCancel: () => void;
  loading: boolean;
}

const SectionForm = ({ section, onSubmit, onCancel, loading }: SectionFormProps) => {
  const { data: plans = [] } = useAdminPlans();
  
  const [formData, setFormData] = useState({
    name: '',
    display_order: 0,
    is_active: true,
    allowed_plan_ids: [] as string[],
  });

  useEffect(() => {
    if (section) {
      setFormData({
        name: section.name || '',
        display_order: section.display_order || 0,
        is_active: section.is_active !== undefined ? section.is_active : true,
        allowed_plan_ids: section.allowed_plan_ids || [],
      });
    }
  }, [section]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">
          {section ? 'Editar Seção' : 'Nova Seção'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Nome da Seção *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: Informações Profissionais"
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order" className="text-white">
                Ordem de Exibição
              </Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>

          {/* Restrições de Planos */}
          <div className="space-y-2">
            <Label className="text-white">Restringir a Planos Específicos</Label>
            <p className="text-xs text-zinc-400">
              Se nenhum plano for selecionado, a seção será visível para todos os usuários
            </p>
            <div className="flex flex-wrap gap-2">
              {plans.map((plan) => (
                <div key={plan.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`section-plan-${plan.id}`}
                    checked={formData.allowed_plan_ids.includes(plan.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          allowed_plan_ids: [...formData.allowed_plan_ids, plan.id]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          allowed_plan_ids: formData.allowed_plan_ids.filter(id => id !== plan.id)
                        });
                      }
                    }}
                    className="rounded border-zinc-600 bg-zinc-700"
                  />
                  <Label htmlFor={`section-plan-${plan.id}`} className="text-white text-sm">
                    {plan.name}
                  </Label>
                </div>
              ))}
            </div>
            {formData.allowed_plan_ids.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.allowed_plan_ids.map((planId) => {
                  const plan = plans.find(p => p.id === planId);
                  return plan ? (
                    <Badge key={planId} variant="secondary" className="text-xs">
                      {plan.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active" className="text-white">
              Ativa
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Salvando...' : section ? 'Atualizar Seção' : 'Criar Seção'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SectionForm;