
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Plus, Search, MoreVertical } from 'lucide-react';
import { useConversations } from '@/hooks/useChat';
import { useChatUser } from '@/hooks/useChatUsers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import NewConversationModal from './NewConversationModal';

interface ConversationsListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

const ConversationsList = ({ onSelectConversation, selectedConversationId }: ConversationsListProps) => {
  const { data: conversations = [] } = useConversations();
  const { data: chatUser } = useChatUser();
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);

  const getOtherParticipant = (conversation: any) => {
    if (!chatUser) return null;
    
    if (conversation.sender_chat_user?.id === chatUser.id) {
      return conversation.receiver_chat_user;
    } else {
      return conversation.sender_chat_user;
    }
  };

  const getLastMessageDisplay = (conversation: any) => {
    if (!conversation.last_message_content) {
      return 'Inicie uma conversa...';
    }
    return conversation.last_message_content;
  };

  return (
    <>
      <Card className="bg-zinc-900 border-zinc-700 h-[600px] flex flex-col">
        <CardHeader className="border-b border-zinc-800 pb-4">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-white flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-blue-500" />
              Conversas
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-zinc-800 rounded-full"
                onClick={() => setShowNewConversationModal(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800 rounded-full">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800 rounded-full">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Pesquisar conversas..."
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pl-10 rounded-full h-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-hidden">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6">
              <div className="bg-zinc-800 rounded-full p-6 mb-4">
                <MessageCircle className="h-12 w-12 text-zinc-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Nenhuma conversa</h3>
              <p className="text-zinc-400 text-center mb-6 text-sm">
                Inicie uma nova conversa usando um ID de chat
              </p>
              <Button
                onClick={() => setShowNewConversationModal(true)}
                className="bg-blue-600 hover:bg-blue-700 rounded-full px-6 py-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Conversa
              </Button>
            </div>
          ) : (
            <div className="overflow-y-auto h-full">
              <div className="divide-y divide-zinc-800">
                {conversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation);
                  
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => onSelectConversation(conversation.id)}
                      className={`w-full p-4 flex items-center space-x-3 hover:bg-zinc-800 transition-all duration-200 ${
                        selectedConversationId === conversation.id ? 'bg-zinc-800 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {otherParticipant?.chat_display_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900"></div>
                      </div>
                      
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-white font-semibold truncate">
                            {otherParticipant?.chat_display_name || 'Usuário'}
                          </h4>
                          <span className="text-xs text-zinc-500 ml-2 flex-shrink-0">
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
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onConversationCreated={onSelectConversation}
      />
    </>
  );
};

export default ConversationsList;
