
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateUser, useUpdateUser, useAdminUsers } from '@/hooks/useAdminUsers';
import { useAdminPlans } from '@/hooks/useAdminPlans';
import { toast } from 'sonner';

const userSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  user_role: z.enum(['admin', 'modelo', 'cliente']),
  plan_id: z.string().optional(),
  is_active: z.boolean().default(true),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  userId?: string | null;
  onSuccess: () => void;
}

const UserForm = ({ userId, onSuccess }: UserFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: users = [] } = useAdminUsers();
  const { data: plans = [] } = useAdminPlans();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      user_role: 'cliente',
      is_active: true,
    },
  });

  const userRole = watch('user_role');

  // Load existing user data for editing
  useEffect(() => {
    if (userId) {
      const user = users.find(u => u.id === userId);
      if (user) {
        reset({
          name: user.name || '',
          email: user.email,
          phone: user.phone || '',
          user_role: user.user_role as 'admin' | 'modelo' | 'cliente',
          plan_id: user.plan_id || '',
          is_active: user.is_active,
        });
      }
    }
  }, [userId, users, reset]);

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...data,
        plan_id: data.plan_id && data.plan_id !== '' ? data.plan_id : null,
      };

      if (userId) {
        await updateUserMutation.mutateAsync({ id: userId, ...submitData });
        toast.success('Usuário atualizado com sucesso!');
      } else {
        await createUserMutation.mutateAsync(submitData);
        toast.success('Usuário criado com sucesso!');
      }
      onSuccess();
    } catch (error) {
      toast.error('Erro ao salvar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-white">Nome</Label>
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
        <Label htmlFor="email" className="text-white">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          className="bg-zinc-800 border-zinc-700 text-white"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone" className="text-white">Telefone</Label>
        <Input
          id="phone"
          {...register('phone')}
          className="bg-zinc-800 border-zinc-700 text-white"
        />
      </div>

      <div>
        <Label className="text-white">Tipo de Usuário</Label>
        <Select onValueChange={(value) => setValue('user_role', value as 'admin' | 'modelo' | 'cliente')}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="modelo">Modelo</SelectItem>
            <SelectItem value="cliente">Cliente</SelectItem>
          </SelectContent>
        </Select>
        {errors.user_role && (
          <p className="text-red-500 text-sm">{errors.user_role.message}</p>
        )}
      </div>

      {userRole === 'cliente' && (
        <div>
          <Label className="text-white">Plano</Label>
          <Select onValueChange={(value) => setValue('plan_id', value)}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Selecione um plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no_plan">Nenhum plano</SelectItem>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} - R$ {plan.price}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
          {isSubmitting ? 'Salvando...' : (userId ? 'Atualizar' : 'Criar')}
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

export default UserForm;
