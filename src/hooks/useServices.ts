import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  max_people: number;
  is_active: boolean;
  model_id: string;
  created_at: string;
  updated_at: string;
}

export const useServices = () => {
  const queryClient = useQueryClient();

  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      console.log('useServices: Starting query...');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('useServices: User data:', user);
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar model_id do usuário
      const { data: profile, error: profileError } = await supabase
        .from('model_profiles')
        .select('model_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      console.log('useServices: Profile data:', profile, 'Error:', profileError);
      if (!profile) throw new Error('Perfil de modelo não encontrado');

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('model_id', profile.model_id)
        .order('created_at', { ascending: false });

      console.log('useServices: Services data:', data, 'Error:', error);
      if (error) throw error;
      return data as Service[];
    },
  });

  console.log('useServices: Final state - services:', services, 'isLoading:', isLoading, 'error:', error);

  const createService = useMutation({
    mutationFn: async (serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'model_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('model_profiles')
        .select('model_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!profile) throw new Error('Perfil de modelo não encontrado');

      const { data, error } = await supabase
        .from('services')
        .insert({
          ...serviceData,
          model_id: profile.model_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Serviço criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating service:', error);
      toast.error('Erro ao criar serviço');
    },
  });

  const updateService = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Service> & { id: string }) => {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Serviço atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating service:', error);
      toast.error('Erro ao atualizar serviço');
    },
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Serviço removido com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting service:', error);
      toast.error('Erro ao remover serviço');
    },
  });

  return {
    services,
    isLoading,
    createService,
    updateService,
    deleteService,
  };
};