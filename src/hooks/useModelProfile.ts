
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useModelProfile = () => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['model-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('Searching for model profile with user_id:', user.id);

      const { data, error } = await supabase
        .from('model_profiles')
        .select(`
          *,
          models (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      console.log('Model profile query result:', { data, error });

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No model profile found for user:', user.id);
          return null;
        }
        throw error;
      }

      return data;
    },
  });

  const createProfile = useMutation({
    mutationFn: async (modelId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('model_profiles')
        .insert({
          user_id: user.id,
          model_id: modelId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-profile'] });
      toast.success('Perfil criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating profile:', error);
      toast.error('Erro ao criar perfil');
    },
  });

  return {
    profile,
    isLoading,
    createProfile,
  };
};
