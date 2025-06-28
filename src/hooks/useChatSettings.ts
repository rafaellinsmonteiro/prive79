
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';

type ChatSettings = Tables<'chat_settings'>;

export const useChatSettings = () => {
  return useQuery({
    queryKey: ['chat-settings'],
    queryFn: async (): Promise<ChatSettings | null> => {
      const { data, error } = await supabase
        .from('chat_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });
};

export const useUpdateChatSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: TablesUpdate<'chat_settings'> & { id: string }) => {
      const { data, error } = await supabase
        .from('chat_settings')
        .update(settings)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-settings'] });
    },
  });
};
