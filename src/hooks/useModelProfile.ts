
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useModelProfile = () => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['model-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔍 ModelProfile: No authenticated user found');
        return null;
      }

      console.log('🔍 ModelProfile: Checking profile for user:', { id: user.id, email: user.email });

      // Buscar o model_profile usando o user_id do usuário autenticado
      const { data: profileData, error: profileError } = await supabase
        .from('model_profiles')
        .select(`
          *,
          models (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('🔍 ModelProfile: Error fetching model profile:', profileError);
        return null;
      }

      if (!profileData) {
        console.log('🔍 ModelProfile: No model profile found for user:', user.id);
        return null;
      }

      console.log('🔍 ModelProfile: Found model profile:', profileData);
      console.log('🔍 ModelProfile: Model ID (Chat ID):', profileData.model_id);
      
      return profileData;
    },
    enabled: true,
    staleTime: 1 * 60 * 1000, // Reduzido para 1 minuto
    refetchOnWindowFocus: true, // Refetch quando a janela voltar ao foco
    refetchOnMount: true, // Refetch sempre que o componente montar
    retry: 2, // Tentar novamente se falhar
  });

  const createProfile = useMutation({
    mutationFn: async (modelId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // O ID do chat será o mesmo que o model_id
      const { data, error } = await supabase
        .from('model_profiles')
        .insert({
          user_id: user.id,
          model_id: modelId, // Este é também o chat_id
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
    chatId: profile?.model_id, // O ID do chat é o mesmo que o model_id
  };
};
