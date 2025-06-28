
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Plus } from 'lucide-react';
import { useConversations, useCreateConversation } from '@/hooks/useChat';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConversationsListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

const ConversationsList = ({ onSelectConversation, selectedConversationId }: ConversationsListProps) => {
  const { data: conversations = [] } = useConversations();
  const createConversation = useCreateConversation();

  const handleCreateConversation = async (modelId: string) => {
    try {
      const conversation = await createConversation.mutateAsync(modelId);
      onSelectConversation(conversation.id);
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-700 h-[600px]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Conversas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1 max-h-[500px] overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-zinc-400 mb-4">Nenhuma conversa encontrada</p>
              <Button
                onClick={() => {
                  // Para demonstração, vamos criar uma conversa sem modelo específico
                  handleCreateConversation('');
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Conversa
              </Button>
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full p-4 text-left hover:bg-zinc-800 transition-colors border-b border-zinc-800 ${
                  selectedConversationId === conversation.id ? 'bg-zinc-800' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">
                      {conversation.models?.name || 'Conversa'}
                    </h4>
                    <p className="text-zinc-400 text-sm mt-1">
                      {conversation.last_message_at &&
                        format(new Date(conversation.last_message_at), 'dd/MM/yyyy HH:mm', {
                          locale: ptBR,
                        })}
                    </p>
                  </div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full opacity-0"></div>
                </div>
              </button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationsList;
