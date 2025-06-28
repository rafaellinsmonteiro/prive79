
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

      console.log('=== Model Profile Debug ===');
      console.log('Authenticated user:', { id: user.id, email: user.email });

      // Primeiro, vamos verificar se existe um registro na tabela system_users
      const { data: systemUser, error: systemUserError } = await supabase
        .from('system_users')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      console.log('System user query:', { systemUser, systemUserError });

      // Agora vamos buscar o model_profile usando tanto o user.id quanto o system_user.user_id se existir
      const userIds = [user.id];
      if (systemUser?.user_id && systemUser.user_id !== user.id) {
        userIds.push(systemUser.user_id);
      }

      console.log('Searching for model profile with user_ids:', userIds);

      // Tentar com todos os possíveis user_ids
      let profileData = null;
      let profileError = null;

      for (const userId of userIds) {
        console.log('Trying user_id:', userId);
        
        const { data, error } = await supabase
          .from('model_profiles')
          .select(`
            *,
            models (*)
          `)
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle();

        console.log(`Query result for user_id ${userId}:`, { data, error });

        if (data) {
          profileData = data;
          break;
        }
        if (error && error.code !== 'PGRST116') {
          profileError = error;
        }
      }

      // Se não encontrou nenhum perfil, vamos mostrar todos os model_profiles para debug
      if (!profileData) {
        console.log('No profile found, checking all model_profiles...');
        const { data: allProfiles, error: allError } = await supabase
          .from('model_profiles')
          .select('*');
        
        console.log('All model_profiles in database:', allProfiles);
        console.log('Query error:', allError);
      }

      if (profileError) {
        throw profileError;
      }

      if (!profileData) {
        console.log('No model profile found for any user_id:', userIds);
        return null;
      }

      console.log('Found model profile:', profileData);
      return profileData;
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
