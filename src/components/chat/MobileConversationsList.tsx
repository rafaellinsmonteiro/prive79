
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Plus, Search, MoreVertical, User } from 'lucide-react';
import { useConversations, useCreateConversation, useIsUserModel, getConversationDisplayName, getConversationDisplayPhoto } from '@/hooks/useChat';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MobileConversationsListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

const MobileConversationsList = ({ onSelectConversation, selectedConversationId }: MobileConversationsListProps) => {
  const { data: conversations = [] } = useConversations();
  const { data: isModel = false } = useIsUserModel();
  const createConversation = useCreateConversation();

  const handleCreateConversation = async (modelId: string) => {
    try {
      const conversation = await createConversation.mutateAsync(modelId);
      onSelectConversation(conversation.id);
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
    }
  };

  const getLastMessageDisplay = (conversation: any) => {
    if (!conversation.last_message_content) {
      return 'Inicie uma conversa...';
    }
    return conversation.last_message_content;
  };

  return (
    <div className="h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 px-4 py-6 border-b border-zinc-800 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MessageCircle className="h-7 w-7 text-blue-500" />
            Conversas
          </h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800 rounded-full">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800 rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Pesquisar conversas..."
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pl-12 rounded-full h-12 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto bg-zinc-950">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="bg-zinc-900 rounded-full p-8 mb-6">
              <MessageCircle className="h-16 w-16 text-zinc-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Nenhuma conversa</h3>
            <p className="text-zinc-400 text-center mb-8 leading-relaxed">
              Comece uma nova conversa com suas modelos favoritas
            </p>
            <Button
              onClick={() => handleCreateConversation('')}
              className="bg-blue-600 hover:bg-blue-700 rounded-full px-8 py-4 text-base font-semibold shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nova Conversa
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full p-5 flex items-center space-x-4 hover:bg-zinc-900 transition-all duration-200 ${
                  selectedConversationId === conversation.id ? 'bg-zinc-900 border-r-4 border-blue-500' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={getConversationDisplayPhoto(conversation, isModel)}
                    alt={getConversationDisplayName(conversation, isModel)}
                    className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700 shadow-md"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-zinc-950"></div>
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold text-lg truncate">
                      {getConversationDisplayName(conversation, isModel)}
                    </h4>
                    <span className="text-xs text-zinc-500 ml-2 flex-shrink-0 font-medium">
                      {conversation.last_message_at &&
                        format(new Date(conversation.last_message_at), 'HH:mm', {
                          locale: ptBR,
                        })}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 truncate">
                    {getLastMessageDisplay(conversation)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileConversationsList;
