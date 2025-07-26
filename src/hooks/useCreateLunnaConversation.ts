import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const LUNNA_CHAT_USER_ID = '00000000-0000-0000-0000-000000000001';

export const useCreateLunnaConversation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Verificar se já existe uma conversa com a Lunna
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('model_id', null) // Lunna não é um modelo
        .eq('is_active', true)
        .maybeSingle();

      if (existingConversation) {
        return existingConversation;
      }

      // Criar nova conversa com a Lunna
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          model_id: null, // Lunna não é um modelo
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating Lunna conversation:', error);
        throw error;
      }

      // Enviar mensagem de boas-vindas da Lunna
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: data.id,
          sender_id: LUNNA_CHAT_USER_ID,
          sender_type: 'ai',
          message_type: 'text',
          content: 'Olá! Sou a Lunna, sua assistente inteligente do Prive. Como posso ajudá-lo hoje? 🌙',
        });

      if (messageError) {
        console.error('Error creating welcome message:', messageError);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidar cache de conversas para recarregar a lista
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};