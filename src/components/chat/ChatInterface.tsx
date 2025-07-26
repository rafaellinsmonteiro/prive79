import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, MoreVertical } from 'lucide-react';
import { useMessages, useSendMessage, useConversations, getConversationDisplayName, getConversationDisplayPhoto } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsUserModel } from '@/hooks/useChat';
import { ContactInfoSheet } from './ContactInfoSheet';
import { useDisguiseMode } from '@/hooks/useDisguiseMode';

interface ChatInterfaceProps {
  conversationId?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversationId }) => {
  const { user } = useAuth();
  const { data: isModel } = useIsUserModel();
  const { data: conversations } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState(conversations?.find(c => c.id === conversationId));
  const { data: messages } = useMessages(conversationId || '');
  const sendMessage = useSendMessage();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const { getDisguisedContact } = useDisguiseMode();

  useEffect(() => {
    if (conversations) {
      setSelectedConversation(conversations.find(c => c.id === conversationId));
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !conversationId) return;

    try {
      await sendMessage.mutateAsync({
        conversationId: conversationId,
        content: input,
      });
      setInput('');
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getContactDisplayName = () => {
    if (!selectedConversation) return 'Carregando...';
    const originalName = getConversationDisplayName(selectedConversation, isModel);
    const disguised = getDisguisedContact(
      selectedConversation.id,
      originalName,
      getConversationDisplayPhoto(selectedConversation, isModel)
    );
    return disguised.name;
  };

  const getContactDisplayPhoto = () => {
    if (!selectedConversation) return '/placeholder.svg';
    const originalPhoto = getConversationDisplayPhoto(selectedConversation, isModel);
    const disguised = getDisguisedContact(
      selectedConversation.id,
      getConversationDisplayName(selectedConversation, isModel),
      originalPhoto
    );
    return disguised.photo;
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd \'de\' MMMM, HH:mm', { locale: ptBR });
  };

  if (!selectedConversation) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        Selecione uma conversa para começar a trocar mensagens.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-800 p-4 bg-zinc-900 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={getContactDisplayPhoto()} />
            <AvatarFallback className="bg-zinc-700 text-white">
              {getContactDisplayName().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-white">{getContactDisplayName()}</h3>
            <p className="text-green-400 text-sm">Online</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="hover:bg-zinc-800 rounded-full h-8 w-8 p-0">
                <MoreVertical className="h-5 w-5 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700">
              <DropdownMenuItem className="text-white hover:bg-zinc-800 focus:bg-zinc-800" onClick={() => setIsInfoOpen(true)}>
                Ver contato
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500 hover:bg-zinc-800 focus:bg-zinc-800">
                Apagar conversa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {messages?.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${message.sender_id === user?.id ? 'items-end' : 'items-start'
                  }`}
              >
                <div className="text-xs text-zinc-500">
                  {message.sender_id === user?.id ? 'Você' : getContactDisplayName()} - {formatDate(new Date(message.created_at))}
                </div>
                <div
                  className={`rounded-lg px-3 py-2 inline-block ${message.sender_id === user?.id
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-zinc-800 text-zinc-300 rounded-bl-none'
                    }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input area */}
      <div className="border-t border-zinc-800 p-4 bg-zinc-900 pb-20 sm:pb-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" className="hover:bg-zinc-800 rounded-full h-10 w-10 p-0">
            <Paperclip className="h-5 w-5 text-white" />
          </Button>
          <Input
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            className="bg-zinc-800 border-zinc-700 text-white rounded-full flex-1"
          />
          <Button
            onClick={handleSendMessage}
            className="bg-blue-600 hover:bg-blue-700 rounded-full h-10 w-10 p-0"
          >
            <Send className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>

      <ContactInfoSheet
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        modelId={selectedConversation?.model_id}
        modelName={getContactDisplayName()}
        modelPhoto={getContactDisplayPhoto()}
      />
    </div>
  );
};

export default ChatInterface;
