
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from './useAuth';
import { useEffect } from 'react';

type Conversation = Tables<'conversations'> & {
  models?: (Tables<'models'> & {
    photos?: Tables<'model_photos'>[];
  }) | null;
  last_message_content?: string;
  last_message_type?: string;
};

type Message = Tables<'messages'>;
type TypingIndicator = Tables<'typing_indicators'>;

export const useConversations = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('=== Conversations Query Debug ===');
      console.log('Authenticated user:', { id: user.id, email: user.email });
      
      // Primeiro, vamos verificar se o usuário tem um model_profile
      const { data: modelProfile } = await supabase
        .from('model_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      console.log('User model profile:', modelProfile);
      
      // Se for uma modelo, buscar conversas onde ela é a modelo
      if (modelProfile) {
        console.log('User is a model, fetching conversations for model_id:', modelProfile.model_id);
        
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            models (
              *,
              photos:model_photos(*)
            )
          `)
          .eq('model_id', modelProfile.model_id)
          .eq('is_active', true)
          .order('last_message_at', { ascending: false });

        if (error) {
          console.error('Error fetching model conversations:', error);
          throw error;
        }
        
        console.log('Model conversations loaded:', data);
        return data || [];
      }
      
      // Se for um cliente, buscar conversas onde ele é o usuário
      console.log('User is a client, fetching conversations for user_id:', user.id);
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          models (
            *,
            photos:model_photos(*)
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching client conversations:', error);
        throw error;
      }
      
      console.log('Client conversations loaded:', data);
      return data || [];
    },
    enabled: !!user,
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

  return useMutation({
    mutationFn: async (modelId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Primeiro, verificar se já existe uma conversa para este usuário e modelo
      if (modelId) {
        const { data: existingConversation } = await supabase
          .from('conversations')
          .select('id')
          .eq('user_id', user.id)
          .eq('model_id', modelId)
          .eq('is_active', true)
          .single();

        if (existingConversation) {
          return existingConversation;
        }
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          model_id: modelId || null,
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
