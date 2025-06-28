
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Mic, MicOff, ArrowLeft, MoreVertical, Phone, Video, Paperclip } from 'lucide-react';
import { useMessages, useSendMessage, useRealtimeMessages, useTypingIndicator } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';
import { useNavigate } from 'react-router-dom';

interface MobileChatInterfaceProps {
  conversationId: string;
  modelName?: string;
  modelPhoto?: string;
}

const MobileChatInterface: React.FC<MobileChatInterfaceProps> = ({ 
  conversationId, 
  modelName = "Chat",
  modelPhoto 
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const { data: messages = [], isLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const { startTyping, stopTyping } = useTypingIndicator(conversationId);
  
  // Enable realtime updates
  useRealtimeMessages(conversationId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;

    const messageContent = message;
    setMessage('');

    try {
      await sendMessage.mutateAsync({
        conversationId,
        content: messageContent,
        messageType: 'text',
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessage(messageContent);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    if (e.target.value && !message) {
      startTyping.mutate();
    } else if (!e.target.value && message) {
      stopTyping.mutate();
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording functionality
    console.log('Voice recording:', !isRecording ? 'started' : 'stopped');
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Carregando conversa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-950 flex flex-col">
      {/* Header with Model Photo */}
      <div className="bg-zinc-900 px-4 py-4 flex items-center justify-between border-b border-zinc-800 shadow-lg">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/chat')}
            className="text-white hover:bg-zinc-800 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={modelPhoto || '/placeholder.svg'}
                alt={modelName}
                className="w-12 h-12 rounded-full object-cover border-2 border-zinc-600 shadow-md"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-900"></div>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{modelName}</h3>
              <p className="text-xs text-green-400 font-medium">Online agora</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800 rounded-full">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800 rounded-full">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800 rounded-full">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 bg-zinc-950" ref={scrollAreaRef}>
        <div className="py-6 space-y-6">
          {messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} />
          ))}
          <TypingIndicator conversationId={conversationId} />
        </div>
      </ScrollArea>

      {/* Input Area with Audio Button */}
      <div className="bg-zinc-900 px-4 py-4 border-t border-zinc-800">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full flex-shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Mensagem..."
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-full pr-4 py-3 h-12 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Audio/Send Button - WhatsApp Style */}
          {message.trim() ? (
            <Button
              onClick={handleSendMessage}
              disabled={sendMessage.isPending}
              className="bg-blue-600 hover:bg-blue-700 rounded-full w-12 h-12 p-0 flex-shrink-0 shadow-lg"
            >
              <Send className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={handleVoiceRecord}
              className={`rounded-full w-12 h-12 p-0 flex-shrink-0 shadow-lg transition-all duration-200 ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileChatInterface;
