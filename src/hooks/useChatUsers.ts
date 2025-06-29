
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ChatUser {
  id: string;
  user_id: string;
  chat_display_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useChatUser = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['chat-user', user?.id],
    queryFn: async (): Promise<ChatUser | null> => {
      if (!user) return null;
      
      console.log('=== Chat User Query Debug ===');
      console.log('Authenticated user:', { id: user.id, email: user.email });
      
      const { data, error } = await supabase
        .from('chat_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No chat user found, create one
          console.log('No chat user found, creating one...');
          const { data: newChatUser, error: createError } = await supabase
            .from('chat_users')
            .insert({
              user_id: user.id,
              chat_display_name: user.email?.split('@')[0] || 'Usuário',
            })
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating chat user:', createError);
            throw createError;
          }
          
          console.log('Chat user created:', newChatUser);
          return newChatUser;
        }
        throw error;
      }
      
      console.log('Chat user found:', data);
      return data;
    },
    enabled: !!user,
  });
};

export const useUpdateChatUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: { chat_display_name?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('chat_users')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-user'] });
    },
  });
};
