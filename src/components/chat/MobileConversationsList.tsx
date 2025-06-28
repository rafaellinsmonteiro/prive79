
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Plus, Search, MoreVertical } from 'lucide-react';
import { useConversations, useCreateConversation } from '@/hooks/useChat';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MobileConversationsListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

const MobileConversationsList = ({ onSelectConversation, selectedConversationId }: MobileConversationsListProps) => {
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

  const getModelPhoto = (conversation: any) => {
    if (conversation.models?.photos && conversation.models.photos.length > 0) {
      // Try to get the primary photo first
      const primaryPhoto = conversation.models.photos.find((p: any) => p.is_primary);
      if (primaryPhoto) return primaryPhoto.photo_url;
      
      // If no primary photo, get the first one
      return conversation.models.photos[0].photo_url;
    }
    return '/placeholder.svg';
  };

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 px-4 py-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            Conversas
          </h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Pesquisar conversas..."
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pl-10 rounded-lg"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto bg-black">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <MessageCircle className="h-16 w-16 text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Nenhuma conversa</h3>
            <p className="text-zinc-400 text-center mb-6">
              Comece uma nova conversa com suas modelos favoritas
            </p>
            <Button
              onClick={() => handleCreateConversation('')}
              className="bg-blue-600 hover:bg-blue-700 rounded-lg px-6 py-3"
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
              className={`w-full p-4 flex items-center space-x-3 hover:bg-zinc-900 transition-colors border-b border-zinc-900 ${
                selectedConversationId === conversation.id ? 'bg-zinc-900' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={getModelPhoto(conversation)}
                  alt={conversation.models?.name || 'Model'}
                  className="w-14 h-14 rounded-full object-cover border-2 border-zinc-800"
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
              </div>
              
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white font-medium text-base truncate">
                    {conversation.models?.name || 'Modelo'}
                  </h4>
                  <span className="text-xs text-zinc-500 ml-2 flex-shrink-0">
                    {conversation.last_message_at &&
                      format(new Date(conversation.last_message_at), 'HH:mm', {
                        locale: ptBR,
                      })}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 truncate">
                  Última mensagem da conversa...
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default MobileConversationsList;
