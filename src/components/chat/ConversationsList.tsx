import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { useConversations, getConversationDisplayName, getConversationDisplayPhoto } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDisguiseMode } from '@/hooks/useDisguiseMode';

const ConversationsList = () => {
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: conversations, isLoading, isError } = useConversations();
  const [isModel, setIsModel] = useState(false);
  const { getDisguisedContact } = useDisguiseMode();

  useEffect(() => {
    const checkIsModel = async () => {
      if (user) {
        // Check if the user has a model profile
        const modelProfile = await fetch(`/api/model-profile?userId=${user.id}`);
        const modelData = await modelProfile.json();
        setIsModel(!!modelData.model_id);
      }
    };

    checkIsModel();
  }, [user]);

  const onSelectConversation = (conversationId: string) => {
    navigate(`/v2/chat?conversation=${conversationId}`);
  };

  const onCreateConversation = () => {
    navigate('/v2/new-chat');
  };

  const getDisplayName = (conversation: any) => {
    const originalName = isModel 
      ? getConversationDisplayName(conversation, isModel)
      : getConversationDisplayName(conversation, isModel);
    
    const disguised = getDisguisedContact(
      conversation.id, 
      originalName, 
      getConversationDisplayPhoto(conversation, isModel)
    );
    
    return disguised.name;
  };

  const getDisplayPhoto = (conversation: any) => {
    const originalPhoto = getConversationDisplayPhoto(conversation, isModel);
    const disguised = getDisguisedContact(
      conversation.id, 
      getConversationDisplayName(conversation, isModel), 
      originalPhoto
    );
    
    return disguised.photo;
  };

  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">Carregando conversas...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Erro ao carregar conversas.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="border-b border-zinc-800 p-4 bg-zinc-900">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Conversas</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Input
                type="search"
                placeholder="Buscar..."
                className="bg-zinc-800 border-zinc-700 text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="absolute top-2.5 right-2 h-4 w-4 text-zinc-500" />
            </div>
            <Button onClick={onCreateConversation} className="bg-pink-500 hover:bg-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conversa
            </Button>
          </div>
        </div>
      </div>

      <div className="p-0 flex-1 overflow-hidden">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-zinc-400">Nenhuma conversa encontrada.</p>
            <p className="text-zinc-500 text-sm mt-2">
              Comece uma nova conversa para ver as mensagens aqui.
            </p>
          </div>
        ) : (
          <div className="relative overflow-y-auto h-full pb-20 sm:pb-0">
            <div className="divide-y divide-zinc-800">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className="w-full p-4 flex items-center space-x-3 hover:bg-zinc-800/50 transition-colors text-left"
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getDisplayPhoto(conversation)} />
                      <AvatarFallback className="bg-zinc-700 text-white">
                        {getDisplayName(conversation).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-medium truncate">
                        {getDisplayName(conversation)}
                      </p>
                      {conversation.last_message_at && (
                        <span className="text-xs text-zinc-400">
                          {formatLastMessageTime(conversation.last_message_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-400 text-sm truncate">
                      {conversation.last_message_content || 'Iniciar conversa...'}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Botão flutuante para nova conversa */}
            <Button
              onClick={onCreateConversation}
              className="absolute bottom-4 right-4 bg-pink-500 hover:bg-pink-600 rounded-full shadow-lg"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;
