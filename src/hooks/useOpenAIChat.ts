import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedModels?: any[];
}

interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export const useOpenAIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Preparar histórico da conversa para enviar ao OpenAI
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      console.log('Sending message to OpenAI chat function...');

      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          message: message.trim(),
          conversationHistory
        }
      });

      if (error) {
        console.error('Error calling OpenAI chat function:', error);
        throw error;
      }

      console.log('Received response from OpenAI:', data);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        suggestedModels: data.suggestedModels || []
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Salvar a conversa no banco (opcional, para implementação futura)
      // await saveConversationToDatabase(userMessage, assistantMessage);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
  }, []);

  const startNewSession = useCallback(() => {
    clearMessages();
    // Adicionar mensagem de boas-vindas
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: 'Olá! Sou seu assistente pessoal para encontrar a modelo perfeita para você. Me conte o que está procurando: pode ser cor de cabelo, idade, cidade, disponibilidade ou qualquer preferência específica. Como posso ajudá-lo hoje?',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [clearMessages]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    startNewSession,
    currentSessionId
  };
};