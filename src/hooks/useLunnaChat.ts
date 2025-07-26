import { useCallback } from 'react';
import { useLunnaTools } from './useLunnaTools';
import { useUserType } from './useUserType';
import { useSendMessage } from './useChat';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const LUNNA_CHAT_USER_ID = '00000000-0000-0000-0000-000000000001';

export const useLunnaChat = () => {
  const sendMessage = useSendMessage();
  const { tools: availableTools } = useLunnaTools();
  const { getUserType } = useUserType();
  const queryClient = useQueryClient();

  // Função para verificar se uma conversa é com a Lunna
  const isLunnaConversation = useCallback((conversation: any) => {
    if (!conversation) return false;
    
    // Conversa com Lunna não tem model_id (null)
    return conversation.model_id === null;
  }, []);

  // Função para processar mensagem da Lunna
  const processLunnaMessage = useCallback(async (
    message: string, 
    conversationId: string
  ) => {
    console.log('🌙 Processando mensagem da Lunna:', message);
    
    try {
      // Obter tipo de usuário para contexto
      const userType = await getUserType();
      console.log('🌙 Tipo de usuário:', userType);
      
      // Criar contexto com ferramentas disponíveis
      let context = `Você é a Lunna, assistente IA do Prive. Tipo de usuário: ${userType}.`;
      
      if (availableTools && availableTools.length > 0) {
        const toolNames = availableTools
          .filter(tool => tool.is_active && tool.allowed_user_types?.includes(userType))
          .map(tool => tool.label)
          .join(', ');
        context += ` Ferramentas disponíveis: ${toolNames}`;
      }

      console.log('🌙 Enviando para OpenAI com contexto:', context);

      // Enviar para OpenAI Chat via edge function
      const { data, error: openaiError } = await supabase.functions.invoke('openai-chat', {
        body: {
          message,
          conversationHistory: [],
          context
        }
      });

      console.log('🌙 Resposta do OpenAI:', data, openaiError);

      if (openaiError) {
        console.error('🌙 Erro do OpenAI:', openaiError);
        throw openaiError;
      }

      if (data && data.response) {
        console.log('🌙 Inserindo mensagem da IA no banco:', data.response);
        
        // Enviar resposta da AI diretamente via Supabase
        const { error: insertError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: LUNNA_CHAT_USER_ID,
            sender_type: 'ai',
            message_type: 'text',
            content: data.response,
          });

        if (insertError) {
          console.error('🌙 Erro ao inserir mensagem:', insertError);
          throw insertError;
        }

        console.log('🌙 Mensagem da IA inserida com sucesso');

        // Invalidar queries para atualizar UI
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      } else {
        console.warn('🌙 OpenAI não retornou resposta válida');
        throw new Error('Resposta inválida da IA');
      }
    } catch (error) {
      console.error('🌙 Erro ao processar mensagem da Lunna:', error);
      
      // Enviar mensagem de erro como fallback diretamente via Supabase
      const { error: fallbackError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: LUNNA_CHAT_USER_ID,
          sender_type: 'ai',
          message_type: 'text',
          content: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        });

      if (fallbackError) {
        console.error('🌙 Erro ao inserir mensagem de fallback:', fallbackError);
      }

      // Invalidar queries para atualizar UI
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    }
  }, [availableTools, getUserType, queryClient]);

  return {
    isLunnaConversation,
    processLunnaMessage,
    isProcessing: false // Para agora, depois podemos implementar estado de loading
  };
};