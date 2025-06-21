
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { useDeletePlan } from '@/hooks/useAdminPlans';
import { toast } from 'sonner';

type Plan = Tables<'plans'> & {
  categories?: Tables<'categories'>[];
};

interface PlansListProps {
  plans: Plan[];
  loading: boolean;
  onEdit: (id: string) => void;
}

const PlansList = ({ plans, loading, onEdit }: PlansListProps) => {
  const deletePlanMutation = useDeletePlan();

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      try {
        await deletePlanMutation.mutateAsync(id);
        toast.success('Plano excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir plano');
      }
    }
  };

  if (loading) {
    return <div className="text-white">Carregando planos...</div>;
  }

  return (
    <div className="grid gap-4">
      {plans.map((plan) => (
        <Card key={plan.id} className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  {plan.name}
                  {!plan.is_active && (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </CardTitle>
                <p className="text-zinc-400 text-sm">{plan.description}</p>
                <p className="text-green-400 font-semibold">
                  R$ {plan.price ? Number(plan.price).toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(plan.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(plan.id)}
                  disabled={deletePlanMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {plan.categories && plan.categories.length > 0 && (
                <div>
                  <span className="text-zinc-400 text-sm">Categorias: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {plan.categories.map((category) => (
                      <Badge key={category.id} variant="outline" className="text-xs">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="text-zinc-400 text-sm">Ordem: </span>
                <span className="text-white">{plan.display_order}</span>
              </div>
              <div>
                <span className="text-zinc-400 text-sm">Criado em: </span>
                <span className="text-white">
                  {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PlansList;
