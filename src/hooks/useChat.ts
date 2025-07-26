import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useAutoAddContact } from './useContacts';

type Conversation = Tables<'conversations'> & {
  models?: (Tables<'models'> & {
    photos?: Tables<'model_photos'>[];
  }) | null;
  client_info?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  last_message_content?: string;
  last_message_type?: string;
};

type Message = Tables<'messages'>;
type TypingIndicator = Tables<'typing_indicators'>;

// Hook para verificar se o usuário é uma modelo
export const useIsUserModel = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['isUserModel', user?.id],
    queryFn: async (): Promise<boolean> => {
      if (!user) return false;
      
      const { data: modelProfile } = await supabase
        .from('model_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      return !!modelProfile;
    },
    enabled: !!user,
  });
};

// Funções helper para exibição de conversas
export const getConversationDisplayName = (conversation: Conversation | undefined, isModel: boolean) => {
  if (!conversation) return 'Carregando...';
  
  if (isModel) {
    // Se for modelo, pode ser conversa com cliente ou com outra modelo
    if (conversation.client_info?.name) {
      // Conversa com cliente
      return conversation.client_info.name;
    } else if (conversation.models?.name) {
      // Conversa com outra modelo
      return conversation.models.name;
    }
    return 'Cliente';
  } else {
    // Se for cliente, mostrar nome da modelo
    return conversation.models?.name || 'Modelo';
  }
};

export const getConversationDisplayPhoto = (conversation: Conversation | undefined, isModel: boolean) => {
  if (!conversation) return '/placeholder.svg';
  
  if (isModel) {
    // Se for modelo, verificar se é conversa com cliente ou outra modelo
    if (conversation.client_info?.name) {
      // Conversa com cliente - usar placeholder
      return '/placeholder.svg';
    } else if (conversation.models?.photos && conversation.models.photos.length > 0) {
      // Conversa com outra modelo - mostrar foto da outra modelo
      const primaryPhoto = conversation.models.photos.find((p: any) => p.is_primary);
      if (primaryPhoto) return primaryPhoto.photo_url;
      return conversation.models.photos[0].photo_url;
    }
    return '/placeholder.svg';
  } else {
    // Se for cliente, mostrar foto da modelo
    if (conversation.models?.photos && conversation.models.photos.length > 0) {
      const primaryPhoto = conversation.models.photos.find((p: any) => p.is_primary);
      if (primaryPhoto) return primaryPhoto.photo_url;
      return conversation.models.photos[0].photo_url;
    }
    return '/placeholder.svg';
  }
};

export const useConversations = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('=== Conversations Query Debug ===');
      console.log('Authenticated user:', { id: user.id, email: user.email });
      
      // Nova lógica: verificar se o usuário tem um model_profile
      const { data: modelProfile } = await supabase
        .from('model_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      console.log('User model profile:', modelProfile);
      
      // Se for uma modelo, buscar conversas de duas formas:
      // 1. Conversas onde ela é a modelo (clientes conversando com ela)
      // 2. Conversas onde ela é o usuário (ela conversando com outras modelos)
      if (modelProfile) {
        console.log('User is a model, fetching conversations for model_id:', modelProfile.model_id);
        
        // Buscar conversas onde esta modelo recebe mensagens (de clientes)
        const { data: modelConversations, error: modelError } = await supabase
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

        // Buscar conversas onde esta modelo é o usuário (conversando com outras modelos)
        const { data: userConversations, error: userError } = await supabase
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

        if (modelError) {
          console.error('Error fetching model conversations:', modelError);
          throw modelError;
        }

        if (userError) {
          console.error('Error fetching user conversations:', userError);
          throw userError;
        }

        console.log('Model conversations (as model):', modelConversations);
        console.log('User conversations (as user):', userConversations);

        // Combinar e remover duplicatas
        const allConversations = [
          ...(modelConversations || []),
          ...(userConversations || [])
        ];

        // Remover duplicatas baseado no ID
        const uniqueConversations = allConversations.filter((conversation, index, self) =>
          self.findIndex(c => c.id === conversation.id) === index
        );

        // Para conversas como modelo, buscar informações dos clientes
        const conversationsWithClientInfo = await Promise.all(
          uniqueConversations.map(async (conversation) => {
            // Se esta modelo é a modelo da conversa, buscar info do cliente
            if (conversation.model_id === modelProfile.model_id) {
              // Buscar informações do cliente
              const { data: systemUser } = await supabase
                .from('system_users')
                .select('name, email')
                .eq('user_id', conversation.user_id)
                .maybeSingle();
              
              const { data: chatUser } = await supabase
                .from('chat_users')
                .select('chat_display_name')
                .eq('user_id', conversation.user_id)
                .maybeSingle();
              
              let clientName = chatUser?.chat_display_name || systemUser?.name || systemUser?.email;
              let clientEmail = systemUser?.email || clientName;
              
              if (!clientName) {
                clientName = `Usuario ${conversation.user_id.slice(0, 8)}`;
                clientEmail = clientName;
              }
              
              return {
                ...conversation,
                client_info: {
                  id: conversation.user_id,
                  name: clientName,
                  email: clientEmail
                }
              };
            } else {
              // Se esta modelo é o usuário da conversa, já tem as informações do modelo
              return conversation;
            }
          })
        );
        
        console.log('All conversations with info loaded:', conversationsWithClientInfo);
        return conversationsWithClientInfo.sort((a, b) => 
          new Date(b.last_message_at || b.created_at).getTime() - 
          new Date(a.last_message_at || a.created_at).getTime()
        );
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
  const autoAddContact = useAutoAddContact();

  return useMutation({
    mutationFn: async (modelId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Validar se o modelo existe e está ativo
      if (modelId) {
        const { data: modelExists, error: modelError } = await supabase
          .from('models')
          .select('id, name, is_active')
          .eq('id', modelId)
          .eq('is_active', true)
          .maybeSingle();

        if (modelError) {
          console.error('Error checking model:', modelError);
          throw new Error('Erro ao verificar modelo');
        }

        if (!modelExists) {
          throw new Error('Modelo não encontrado ou inativo');
        }

        // Verificar se já existe uma conversa para este usuário e modelo
        const { data: existingConversation } = await supabase
          .from('conversations')
          .select(`
            id,
            *,
            models (
              *,
              photos:model_photos(*)
            )
          `)
          .eq('user_id', user.id)
          .eq('model_id', modelId)
          .eq('is_active', true)
          .maybeSingle();

        if (existingConversation) {
          return existingConversation;
        }
      }

      // Criar nova conversa
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          model_id: modelId || null,
        })
        .select(`
          *,
          models (
            *,
            photos:model_photos(*)
          )
        `)
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        throw error;
      }
      
      console.log('✅ Conversation created successfully:', data);

      // Auto-adicionar como contato se não for já (apenas para modelos válidos)
      if (data.user_id && data.model_id) {
        try {
          // Buscar o user_id da modelo para adicionar como contato
          const { data: modelProfile } = await supabase
            .from('model_profiles')
            .select('user_id')
            .eq('model_id', data.model_id)
            .eq('is_active', true)
            .single();

          if (modelProfile?.user_id) {
            autoAddContact.mutate({ 
              contactUserId: modelProfile.user_id, 
              modelId: data.model_id 
            });
          }
        } catch (error) {
          console.log('Auto-add contact failed (non-critical):', error);
        }
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidar cache de conversas para recarregar a lista
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.refetchQueries({ queryKey: ['conversations'] });
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
