
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreatePlan, useUpdatePlan, useAdminPlans } from '@/hooks/useAdminPlans';
import { useAdminCategories } from '@/hooks/useAdminCategories';
import { toast } from 'sonner';

const planSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  price: z.number().min(0, 'Preço deve ser positivo'),
  display_order: z.number().min(0, 'Ordem deve ser positiva'),
  is_active: z.boolean().default(true),
  categories: z.array(z.string()).optional(),
});

type PlanFormData = z.infer<typeof planSchema>;

interface PlanFormProps {
  planId?: string | null;
  onSuccess: () => void;
}

const PlanForm = ({ planId, onSuccess }: PlanFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { data: plans = [] } = useAdminPlans();
  const { data: categories = [] } = useAdminCategories();
  const createPlanMutation = useCreatePlan();
  const updatePlanMutation = useUpdatePlan();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      display_order: 0,
      is_active: true,
      price: 0,
    },
  });

  // Load existing plan data for editing
  useEffect(() => {
    if (planId) {
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        reset({
          name: plan.name,
          description: plan.description || '',
          price: Number(plan.price) || 0,
          display_order: plan.display_order,
          is_active: plan.is_active,
        });
        
        const planCategories = plan.categories?.map(c => c.id) || [];
        setSelectedCategories(planCategories);
      }
    }
  }, [planId, plans, reset]);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const onSubmit = async (data: PlanFormData) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        name: data.name,
        description: data.description,
        price: data.price,
        display_order: data.display_order,
        is_active: data.is_active,
        categories: selectedCategories,
      };

      if (planId) {
        await updatePlanMutation.mutateAsync({ id: planId, ...submitData });
        toast.success('Plano atualizado com sucesso!');
      } else {
        await createPlanMutation.mutateAsync(submitData);
        toast.success('Plano criado com sucesso!');
      }
      onSuccess();
    } catch (error) {
      toast.error('Erro ao salvar plano');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-white">Nome do Plano</Label>
        <Input
          id="name"
          {...register('name')}
          className="bg-zinc-800 border-zinc-700 text-white"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description" className="text-white">Descrição</Label>
        <Textarea
          id="description"
          {...register('description')}
          className="bg-zinc-800 border-zinc-700 text-white"
        />
      </div>

      <div>
        <Label htmlFor="price" className="text-white">Preço (R$)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          {...register('price', { valueAsNumber: true })}
          className="bg-zinc-800 border-zinc-700 text-white"
        />
        {errors.price && (
          <p className="text-red-500 text-sm">{errors.price.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="display_order" className="text-white">Ordem de Exibição</Label>
        <Input
          id="display_order"
          type="number"
          {...register('display_order', { valueAsNumber: true })}
          className="bg-zinc-800 border-zinc-700 text-white"
        />
        {errors.display_order && (
          <p className="text-red-500 text-sm">{errors.display_order.message}</p>
        )}
      </div>

      <div>
        <Label className="text-white">Categorias Incluídas</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => handleCategoryChange(category.id, !!checked)}
              />
              <Label
                htmlFor={category.id}
                className="text-white text-sm cursor-pointer"
              >
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          onCheckedChange={(checked) => setValue('is_active', checked)}
          defaultChecked={true}
        />
        <Label htmlFor="is_active" className="text-white">Ativo</Label>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Salvando...' : (planId ? 'Atualizar' : 'Criar')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default PlanForm;
