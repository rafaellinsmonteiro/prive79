
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Mic, MicOff, Image, Video } from 'lucide-react';
import { useMessages, useSendMessage, useRealtimeMessages, useTypingIndicator } from '@/hooks/useChat';
import { useChatSettings } from '@/hooks/useChatSettings';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';
import MediaUpload from './MediaUpload';

interface ChatInterfaceProps {
  conversationId: string;
}

const ChatInterface = ({ conversationId }: ChatInterfaceProps) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { data: messages = [] } = useMessages(conversationId);
  const { data: chatSettings } = useChatSettings();
  const sendMessage = useSendMessage();
  const { startTyping, stopTyping } = useTypingIndicator(conversationId);

  useRealtimeMessages(conversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage.mutateAsync({
        conversationId,
        content: message,
        messageType: 'text',
      });
      setMessage('');
      stopTyping.mutate();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);

    if (chatSettings?.enable_typing_indicators) {
      startTyping.mutate();

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        stopTyping.mutate();
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMediaUpload = async (file: File, type: 'image' | 'video' | 'audio' | 'file') => {
    try {
      // Aqui você implementaria o upload do arquivo para o storage
      // Por enquanto, vamos simular com uma URL
      const mediaUrl = URL.createObjectURL(file);
      
      await sendMessage.mutateAsync({
        conversationId,
        messageType: type,
        mediaUrl,
        mediaType: file.type,
        fileName: file.name,
        fileSize: file.size,
      });
      
      setShowMediaUpload(false);
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
    }
  };

  if (!chatSettings?.is_enabled) {
    return (
      <Card className="bg-zinc-900 border-zinc-700">
        <CardContent className="p-6 text-center">
          <p className="text-zinc-400">Chat está desabilitado no momento.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-700 h-[600px] flex flex-col">
      <CardContent className="flex-1 flex flex-col p-4">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} />
          ))}
          <TypingIndicator conversationId={conversationId} />
          <div ref={messagesEndRef} />
        </div>

        {/* Media Upload */}
        {showMediaUpload && (
          <MediaUpload
            onUpload={handleMediaUpload}
            onClose={() => setShowMediaUpload(false)}
            maxSizeMB={chatSettings?.max_file_size_mb || 10}
            allowedTypes={chatSettings?.allowed_file_types || []}
          />
        )}

        {/* Input Area */}
        <div className="flex items-center space-x-2">
          {chatSettings?.enable_file_upload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMediaUpload(!showMediaUpload)}
              className="text-zinc-400 hover:text-white"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          )}
          
          <Input
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-zinc-800 border-zinc-700 text-white"
            disabled={sendMessage.isPending}
          />
          
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessage.isPending}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
