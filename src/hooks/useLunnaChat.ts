import { useCallback } from 'react';
import { useZaiaAI } from './useZaiaAI';
import { useLunnaTools } from './useLunnaTools';
import { useUserType } from './useUserType';
import { useSendMessage } from './useChat';

const LUNNA_CHAT_USER_ID = '00000000-0000-0000-0000-000000000001';

export const useLunnaChat = () => {
  const zaiaAI = useZaiaAI();
  const sendMessage = useSendMessage();
  const { tools: availableTools } = useLunnaTools();
  const { getUserType } = useUserType();

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
    try {
      // Obter tipo de usuário para contexto
      const userType = await getUserType();
      
      // Criar contexto com ferramentas disponíveis
      let context = `Você é a Lunna, assistente IA do Prive. Tipo de usuário: ${userType}.`;
      
      if (availableTools && availableTools.length > 0) {
        const toolNames = availableTools
          .filter(tool => tool.is_active && tool.allowed_user_types?.includes(userType))
          .map(tool => tool.label)
          .join(', ');
        context += ` Ferramentas disponíveis: ${toolNames}`;
      }

      // Enviar para Zaia AI
      const response = await zaiaAI.mutateAsync({
        message,
        context,
        type: 'chat'
      });

      if (response.success && response.response) {
        // Enviar resposta da AI como mensagem no chat
        await sendMessage.mutateAsync({
          conversationId,
          content: response.response,
          messageType: 'text',
        });
      }
    } catch (error) {
      console.error('Erro ao processar mensagem da Lunna:', error);
      
      // Enviar mensagem de erro como fallback
      await sendMessage.mutateAsync({
        conversationId,
        content: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        messageType: 'text',
      });
    }
  }, [zaiaAI, sendMessage, availableTools, getUserType]);

  return {
    isLunnaConversation,
    processLunnaMessage,
    isProcessing: zaiaAI.isPending || sendMessage.isPending
  };
};