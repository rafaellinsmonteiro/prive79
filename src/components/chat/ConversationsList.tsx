
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Plus, Search, MoreVertical } from 'lucide-react';
import { useConversations, useCreateConversation, useIsUserModel, getConversationDisplayName, getConversationDisplayPhoto } from '@/hooks/useChat';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConversationsListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

const ConversationsList = ({ onSelectConversation, selectedConversationId }: ConversationsListProps) => {
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
    <Card className="bg-card border-border h-[600px] flex flex-col shadow-lg">
      <CardHeader className="border-b border-border pb-4 bg-gradient-to-r from-accent/5 to-accent/10">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-foreground flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-[0_4px_20px_hsl(var(--primary))_/_0.3]">
              <MessageCircle className="h-4 w-4 text-primary-foreground" />
            </div>
            Conversas
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar conversas..."
            className="bg-accent/50 border-border text-foreground placeholder:text-muted-foreground pl-10 rounded-xl h-10 focus:border-primary transition-all duration-200"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="bg-gradient-to-br from-accent to-accent/60 rounded-2xl p-6 mb-4 shadow-lg">
              <MessageCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma conversa</h3>
            <p className="text-muted-foreground text-center mb-6 text-sm">
              Comece uma nova conversa com suas modelos favoritas
            </p>
            <Button
              onClick={() => handleCreateConversation('')}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-[0_4px_20px_hsl(var(--primary))_/_0.3] rounded-xl px-6 py-2 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Conversa
            </Button>
          </div>
        ) : (
          <div className="overflow-y-auto h-full">
            <div className="divide-y divide-border">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full p-4 flex items-center space-x-3 hover:bg-accent/50 transition-all duration-200 group ${
                    selectedConversationId === conversation.id ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-r-2 border-primary shadow-lg' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={getConversationDisplayPhoto(conversation, isModel)}
                      alt={getConversationDisplayName(conversation, isModel)}
                      className="w-12 h-12 rounded-full object-cover border-2 border-border shadow-md group-hover:border-primary/50 transition-colors"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-card shadow-sm"></div>
                  </div>
                  
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-foreground font-semibold truncate group-hover:text-primary transition-colors">
                        {getConversationDisplayName(conversation, isModel)}
                      </h4>
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {conversation.last_message_at &&
                          format(new Date(conversation.last_message_at), 'HH:mm', {
                            locale: ptBR,
                          })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {getLastMessageDisplay(conversation)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationsList;
