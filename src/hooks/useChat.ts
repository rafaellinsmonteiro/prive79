
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from './useAuth';
import { useChatUser } from './useChatUsers';
import { useEffect } from 'react';

type Conversation = Tables<'conversations'> & {
  sender_chat_user?: {
    id: string;
    chat_display_name: string | null;
    model_profile?: {
      model_id: string;
      models?: {
        id: string;
        name: string;
        photos?: Array<{
          id: string;
          photo_url: string;
          is_primary: boolean;
        }>;
      };
    } | null;
  } | null;
  receiver_chat_user?: {
    id: string;
    chat_display_name: string | null;
    model_profile?: {
      model_id: string;
      models?: {
        id: string;
        name: string;
        photos?: Array<{
          id: string;
          photo_url: string;
          is_primary: boolean;
        }>;
      };
    } | null;
  } | null;
  last_message_content?: string;
  last_message_type?: string;
};

type Message = Tables<'messages'>;
type TypingIndicator = Tables<'typing_indicators'>;

export const useConversations = () => {
  const { user } = useAuth();
  const { data: chatUser } = useChatUser();
  
  return useQuery({
    queryKey: ['conversations', chatUser?.id],
    queryFn: async (): Promise<Conversation[]> => {
      if (!user || !chatUser) throw new Error('User not authenticated or no chat user');
      
      console.log('=== Conversations Query Debug ===');
      console.log('Chat user:', { id: chatUser.id, display_name: chatUser.chat_display_name });
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          sender_chat_user:chat_users!sender_chat_id(
            id, 
            chat_display_name,
            model_profile:model_profiles!chat_user_id(
              model_id,
              models(
                id,
                name,
                model_photos!model_id(
                  id,
                  photo_url,
                  is_primary
                )
              )
            )
          ),
          receiver_chat_user:chat_users!receiver_chat_id(
            id, 
            chat_display_name,
            model_profile:model_profiles!chat_user_id(
              model_id,
              models(
                id,
                name,
                model_photos!model_id(
                  id,
                  photo_url,
                  is_primary
                )
              )
            )
          )
        `)
        .or(`sender_chat_id.eq.${chatUser.id},receiver_chat_id.eq.${chatUser.id}`)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }
      
      console.log('Conversations loaded with model data:', data);
      return data || [];
    },
    enabled: !!user && !!chatUser,
  });
};

export const useMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!conversationId,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: chatUser } = useChatUser();

  return useMutation({
    mutationFn: async (receiverChatId: string) => {
      if (!user || !chatUser) throw new Error('User not authenticated or no chat user');

      // Verificar se já existe uma conversa entre esses dois chat users
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(sender_chat_id.eq.${chatUser.id},receiver_chat_id.eq.${receiverChatId}),and(sender_chat_id.eq.${receiverChatId},receiver_chat_id.eq.${chatUser.id})`)
        .eq('is_active', true)
        .single();

      if (existingConversation) {
        return existingConversation;
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          sender_chat_id: chatUser.id,
          receiver_chat_id: receiverChatId,
          user_id: user.id, // Manter user_id para compatibilidade
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (messageData: {
      conversationId: string;
      content?: string;
      messageType?: 'text' | 'image' | 'video' | 'audio' | 'file';
      mediaUrl?: string;
      mediaType?: string;
      fileName?: string;
      fileSize?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: messageData.conversationId,
          sender_id: user.id,
          sender_type: 'user',
          message_type: messageData.messageType || 'text',
          content: messageData.content,
          media_url: messageData.mediaUrl,
          media_type: messageData.mediaType,
          file_name: messageData.fileName,
          file_size: messageData.fileSize,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { data, error } = await supabase
        .from('messages')
        .update({
          status: 'read',
          read_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.conversation_id] });
    },
  });
};

export const useTypingIndicator = (conversationId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const startTyping = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('typing_indicators')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          is_typing: true,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      return data;
    },
  });

  const stopTyping = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('typing_indicators')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          is_typing: false,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      return data;
    },
  });

  return { startTyping, stopTyping };
};

export const useRealtimeMessages = (conversationId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);
};

export const useRealtimeTyping = (conversationId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`typing-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['typing-indicators', conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);
};
