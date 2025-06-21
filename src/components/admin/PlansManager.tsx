
import { useState } from 'react';
import { useAdminPlans } from '@/hooks/useAdminPlans';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PlansList from './PlansList';
import PlanForm from './PlanForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const PlansManager = () => {
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: plans = [], isLoading } = useAdminPlans();

  const handleEdit = (id: string) => {
    setEditingPlanId(id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingPlanId(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestão de Planos</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPlanId ? 'Editar Plano' : 'Novo Plano'}
              </DialogTitle>
            </DialogHeader>
            <PlanForm
              planId={editingPlanId}
              onSuccess={handleCloseForm}
            />
          </DialogContent>
        </Dialog>
      </div>

      <PlansList
        plans={plans}
        loading={isLoading}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default PlansManager;
