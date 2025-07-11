import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tool_calls?: any[];
}

interface OpenAIChatOptions {
  tools?: any[];
  sharedMessages?: ChatMessage[];
  onMessagesUpdate?: (messages: ChatMessage[]) => void;
}

export const useOpenAIChat = (options: OpenAIChatOptions = {}) => {
  const { tools = [], sharedMessages, onMessagesUpdate } = options;
  const [messages, setMessages] = useState<ChatMessage[]>(sharedMessages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMessages = useCallback((newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    onMessagesUpdate?.(newMessages);
  }, [onMessagesUpdate]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    const currentMessages = sharedMessages || messages;
    const newMessages = [...currentMessages, userMessage];
    updateMessages(newMessages);

    try {
      // Prepare conversation history (last 10 messages for context)
      const conversationHistory = newMessages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      
      // Convert tools to OpenAI format if provided
      const openAITools = tools.map(tool => ({
        type: 'function',
        function: {
          name: tool.function_name,
          description: tool.description || tool.label,
          parameters: tool.parameters || {
            type: 'object',
            properties: {},
            required: []
          }
        }
      }));

      const { data, error: functionError } = await supabase.functions.invoke('openai-chat', {
        body: {
          message,
          conversationHistory,
          tools: openAITools
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Erro ao enviar mensagem');
      }

      if (!data) {
        throw new Error('Resposta vazia da API');
      }

      // Handle function calls
      if (data.type === 'function_call' && data.tool_calls) {
        console.log('🌙 Function calls received:', data.tool_calls);
        
        // Execute function calls
        for (const toolCall of data.tool_calls) {
          const functionName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments || '{}');
          
          console.log(`🌙 Executing function: ${functionName}`, args);
          
          // Find the corresponding tool and execute it
          const tool = tools.find(t => t.function_name === functionName);
          if (tool && tool.handler) {
            try {
              const result = await tool.handler(args);
              console.log(`🌙 Function result:`, result);
              
              // Add function result as a message
              const functionMessage: ChatMessage = {
                role: 'assistant',
                content: result,
                timestamp: new Date().toISOString()
              };
              
              updateMessages([...newMessages, functionMessage]);
            } catch (toolError) {
              console.error(`🌙 Error executing function ${functionName}:`, toolError);
              const errorMessage: ChatMessage = {
                role: 'assistant',
                content: `Erro ao executar ${functionName}: ${toolError.message}`,
                timestamp: new Date().toISOString()
              };
              updateMessages([...newMessages, errorMessage]);
            }
          }
        }
        return;
      }

      // Add AI response
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.response || 'Desculpe, não consegui processar sua mensagem.',
        timestamp: data.timestamp || new Date().toISOString()
      };

      updateMessages([...newMessages, aiMessage]);

    } catch (err) {
      console.error('Erro no chat:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Add error message as AI response
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente.',
        timestamp: new Date().toISOString()
      };
      
      updateMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, sharedMessages, tools, updateMessages]);

  const clearMessages = useCallback(() => {
    updateMessages([]);
    setError(null);
  }, [updateMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  };
};