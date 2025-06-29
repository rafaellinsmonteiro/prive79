
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

      // Buscar o model_profile usando o user_id do usuário autenticado
      const { data: profileData, error: profileError } = await supabase
        .from('model_profiles')
        .select(`
          *,
          models (*),
          chat_users (*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching model profile:', profileError);
        throw profileError;
      }

      if (!profileData) {
        console.log('No model profile found for user:', user.id);
        return null;
      }

      console.log('Found model profile:', profileData);
      console.log('Model ID:', profileData.model_id);
      console.log('Chat User ID:', profileData.chat_user_id);
      
      return profileData;
    },
  });

  const createProfile = useMutation({
    mutationFn: async (modelId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Primeiro, buscar ou criar o chat_user para este usuário
      let { data: chatUser, error: chatUserError } = await supabase
        .from('chat_users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (chatUserError && chatUserError.code === 'PGRST116') {
        // Criar chat_user se não existir
        const { data: newChatUser, error: createChatUserError } = await supabase
          .from('chat_users')
          .insert({
            user_id: user.id,
            chat_display_name: user.email?.split('@')[0] || 'Modelo',
          })
          .select()
          .single();

        if (createChatUserError) throw createChatUserError;
        chatUser = newChatUser;
      } else if (chatUserError) {
        throw chatUserError;
      }

      // Criar o model_profile ligando o modelo ao chat_user
      const { data, error } = await supabase
        .from('model_profiles')
        .insert({
          user_id: user.id,
          model_id: modelId,
          chat_user_id: chatUser.id, // Conectar com o chat_user
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
    chatId: profile?.chat_users?.id, // Usar o ID do chat_user, não do modelo
    modelId: profile?.model_id,
  };
};
