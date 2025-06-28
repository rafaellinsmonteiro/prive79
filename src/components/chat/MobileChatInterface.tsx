
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Mic, MicOff, ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
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

  const handleInputChange = (e: React.ChangeEventHandler<HTMLInputElement>) => {
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
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Carregando conversa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-900 flex flex-col">
      {/* Header */}
      <div className="bg-zinc-800 px-4 py-3 flex items-center justify-between border-b border-zinc-700">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/chat')}
            className="text-white hover:bg-zinc-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            {modelPhoto && (
              <div className="relative">
                <img
                  src={modelPhoto}
                  alt={modelName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-800"></div>
              </div>
            )}
            <div>
              <h3 className="text-white font-medium">{modelName}</h3>
              <p className="text-xs text-green-400">Online</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-700">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-700">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-700">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
        <div className="py-4 space-y-4">
          {messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} />
          ))}
          <TypingIndicator conversationId={conversationId} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-zinc-800 px-4 py-3 border-t border-zinc-700">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Mensagem..."
              className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400 rounded-full pr-12 py-3"
            />
          </div>
          
          {message.trim() ? (
            <Button
              onClick={handleSendMessage}
              disabled={sendMessage.isPending}
              className="bg-blue-500 hover:bg-blue-600 rounded-full w-12 h-12 p-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={handleVoiceRecord}
              className={`rounded-full w-12 h-12 p-0 ${
                isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
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
