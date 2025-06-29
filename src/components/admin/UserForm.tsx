
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
import { useAdminModels } from '@/hooks/useAdminModels';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const createUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  user_role: z.enum(['admin', 'modelo', 'cliente']),
  plan_id: z.string().optional(),
  model_id: z.string().optional(),
  is_active: z.boolean().default(true),
});

const updateUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  password: z.string().optional(),
  user_role: z.enum(['admin', 'modelo', 'cliente']),
  plan_id: z.string().optional(),
  model_id: z.string().optional(),
  is_active: z.boolean().default(true),
});

type UserFormData = z.infer<typeof createUserSchema> | z.infer<typeof updateUserSchema>;

interface UserFormProps {
  userId?: string | null;
  onSuccess: () => void;
}

const UserForm = ({ userId, onSuccess }: UserFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: users = [] } = useAdminUsers();
  const { data: plans = [] } = useAdminPlans();
  const { data: models = [] } = useAdminModels();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const schema = userId ? updateUserSchema : createUserSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(schema),
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
        // Buscar model_id associado se existir
        const modelProfile = user.model_profiles?.find(mp => mp.is_active);
        
        reset({
          name: user.name || '',
          email: user.email,
          phone: user.phone || '',
          password: '',
          user_role: user.user_role as 'admin' | 'modelo' | 'cliente',
          plan_id: user.plan_id || '',
          model_id: modelProfile?.model_id || '',
          is_active: user.is_active,
        });
        
        console.log('Loading user for edit:', {
          user: user,
          modelProfile: modelProfile,
          model_id: modelProfile?.model_id
        });
      }
    }
  }, [userId, users, reset]);

  const createModelProfile = async (userId: string, modelId: string) => {
    console.log('Creating model profile:', { userId, modelId });
    
    try {
      // Primeiro, verificar se já existe um chat_user para este usuário
      let { data: chatUser, error: chatUserError } = await supabase
        .from('chat_users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (chatUserError && chatUserError.code !== 'PGRST116') {
        throw chatUserError;
      }

      // Se não existe chat_user, criar um
      if (!chatUser) {
        console.log('Creating chat_user for user:', userId);
        const { data: newChatUser, error: createChatUserError } = await supabase
          .from('chat_users')
          .insert({
            user_id: userId,
            chat_display_name: 'Modelo', // Nome padrão, pode ser alterado depois
          })
          .select()
          .single();

        if (createChatUserError) throw createChatUserError;
        chatUser = newChatUser;
      }

      // Agora criar o model_profile
      const { data: modelProfile, error: profileError } = await supabase
        .from('model_profiles')
        .insert({
          user_id: userId,
          model_id: modelId,
          chat_user_id: chatUser.id,
          is_active: true
        })
        .select()
        .single();

      if (profileError) throw profileError;
      
      console.log('Model profile created successfully:', modelProfile);
      return modelProfile;
    } catch (error) {
      console.error('Error creating model profile:', error);
      throw error;
    }
  };

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        user_role: data.user_role,
        plan_id: data.plan_id && data.plan_id !== 'no_plan' ? data.plan_id : null,
        is_active: data.is_active,
        ...(data.password && { password: data.password }),
      };

      console.log('Submitting user data:', submitData);
      console.log('Model ID to associate:', data.model_id);

      let userResult;

      if (userId) {
        // Atualização
        userResult = await updateUserMutation.mutateAsync({ 
          id: userId, 
          ...submitData,
          model_id: data.model_id 
        });
        
        // Se é modelo e tem model_id, garantir que o model_profile existe
        if (data.user_role === 'modelo' && data.model_id && data.model_id !== 'no_model') {
          const user = users.find(u => u.id === userId);
          if (user?.user_id) {
            try {
              await createModelProfile(user.user_id, data.model_id);
              console.log('Model profile updated/created for existing user');
            } catch (error) {
              console.log('Model profile may already exist or another error occurred:', error);
            }
          }
        }
        
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Criação
        if (!data.password) {
          toast.error('Senha é obrigatória para criar um usuário');
          return;
        }
        
        userResult = await createUserMutation.mutateAsync({ 
          ...submitData, 
          password: data.password 
        });
        
        console.log('User created:', userResult);
        
        // Se é modelo e tem model_id, criar o model_profile
        if (data.user_role === 'modelo' && data.model_id && data.model_id !== 'no_model' && userResult?.user_id) {
          try {
            await createModelProfile(userResult.user_id, data.model_id);
            toast.success('Usuário criado e associado à modelo com sucesso!');
          } catch (error) {
            console.error('Error creating model profile:', error);
            toast.success('Usuário criado com sucesso, mas houve erro ao associar à modelo. Tente editar o usuário.');
          }
        } else {
          toast.success('Usuário criado com sucesso! Agora ele pode fazer login no sistema.');
        }
      }
      
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao salvar usuário: ${errorMessage}`);
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
          autoComplete="name"
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
          autoComplete="email"
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
          autoComplete="tel"
        />
      </div>

      <div>
        <Label htmlFor="password" className="text-white">
          {userId ? 'Nova Senha (opcional)' : 'Senha'}
        </Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          className="bg-zinc-800 border-zinc-700 text-white"
          placeholder={userId ? 'Digite nova senha (opcional)' : 'Digite a senha'}
          autoComplete={userId ? 'new-password' : 'new-password'}
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
        {!userId && (
          <p className="text-zinc-400 text-xs mt-1">
            O usuário será criado no sistema de autenticação e poderá fazer login imediatamente
          </p>
        )}
      </div>

      <div>
        <Label className="text-white">Tipo de Usuário</Label>
        <Select onValueChange={(value) => setValue('user_role', value as 'admin' | 'modelo' | 'cliente')}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="admin" className="text-white hover:bg-zinc-700">Admin</SelectItem>
            <SelectItem value="modelo" className="text-white hover:bg-zinc-700">Modelo</SelectItem>
            <SelectItem value="cliente" className="text-white hover:bg-zinc-700">Cliente</SelectItem>
          </SelectContent>
        </Select>
        {errors.user_role && (
          <p className="text-red-500 text-sm">{errors.user_role.message}</p>
        )}
      </div>

      {userRole === 'modelo' && (
        <div>
          <Label className="text-white">Modelo Associado</Label>
          <Select onValueChange={(value) => setValue('model_id', value)}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Selecione um modelo" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="no_model" className="text-white hover:bg-zinc-700">Nenhum modelo</SelectItem>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id} className="text-white hover:bg-zinc-700">
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-zinc-400 text-xs mt-1">
            Associe este usuário a um perfil de modelo existente. Isso criará automaticamente a integração com o chat.
          </p>
        </div>
      )}

      {userRole === 'cliente' && (
        <div>
          <Label className="text-white">Plano</Label>
          <Select onValueChange={(value) => setValue('plan_id', value)}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Selecione um plano" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="no_plan" className="text-white hover:bg-zinc-700">Nenhum plano</SelectItem>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id} className="text-white hover:bg-zinc-700">
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
