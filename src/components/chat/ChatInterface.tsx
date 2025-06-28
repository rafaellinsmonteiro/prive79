
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Mic, MicOff, Phone, Video, Paperclip, MoreVertical } from 'lucide-react';
import { useMessages, useSendMessage, useRealtimeMessages, useTypingIndicator, useConversations } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import MessageItem from './MessageItem';
import MediaUpload from './MediaUpload';
import TypingIndicator from './TypingIndicator';

interface ChatInterfaceProps {
  conversationId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversationId }) => {
  const [message, setMessage] = useState('');
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const { data: messages = [], isLoading } = useMessages(conversationId);
  const { data: conversations = [] } = useConversations();
  const sendMessage = useSendMessage();
  const { startTyping, stopTyping } = useTypingIndicator(conversationId);
  
  // Enable realtime updates
  useRealtimeMessages(conversationId);

  // Find current conversation
  const currentConversation = conversations.find(c => c.id === conversationId);

  const getModelPhoto = (conversation: any) => {
    if (conversation?.models?.photos && conversation.models.photos.length > 0) {
      const primaryPhoto = conversation.models.photos.find((p: any) => p.is_primary);
      if (primaryPhoto) return primaryPhoto.photo_url;
      return conversation.models.photos[0].photo_url;
    }
    return '/placeholder.svg';
  };

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
    console.log('Voice recording:', !isRecording ? 'started' : 'stopped');
  };

  const handleMediaUpload = async (mediaData: {
    url: string;
    type: string;
    fileName?: string;
    fileSize?: number;
  }) => {
    try {
      await sendMessage.mutateAsync({
        conversationId,
        messageType: mediaData.type.startsWith('image/') ? 'image' : 
                    mediaData.type.startsWith('video/') ? 'video' : 
                    mediaData.type.startsWith('audio/') ? 'audio' : 'file',
        mediaUrl: mediaData.url,
        mediaType: mediaData.type,
        fileName: mediaData.fileName,
        fileSize: mediaData.fileSize,
      });
      setShowMediaUpload(false);
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-700 h-[600px] flex items-center justify-center">
        <CardContent>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-zinc-400">Carregando conversa...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-700 h-[600px] flex flex-col">
      {/* Header with Model Photo */}
      <CardHeader className="border-b border-zinc-800 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={getModelPhoto(currentConversation)}
                alt={currentConversation?.models?.name || 'Model'}
                className="w-10 h-10 rounded-full object-cover border-2 border-zinc-600 shadow-md"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900"></div>
            </div>
            <div>
              <h3 className="text-white font-semibold">
                {currentConversation?.models?.name || 'Chat'}
              </h3>
              <p className="text-xs text-green-400">Online agora</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 bg-zinc-950" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}
            <TypingIndicator conversationId={conversationId} />
          </div>
        </ScrollArea>

        {/* Media Upload */}
        {showMediaUpload && (
          <div className="border-t border-zinc-700 p-4">
            <MediaUpload
              onUpload={handleMediaUpload}
              onCancel={() => setShowMediaUpload(false)}
            />
          </div>
        )}

        {/* Input Area with Audio Button */}
        <div className="bg-zinc-800 px-4 py-4 border-t border-zinc-700">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMediaUpload(!showMediaUpload)}
              className="text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full flex-shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Mensagem..."
                className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-500 rounded-full pr-4 py-2 h-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Audio/Send Button - WhatsApp Style */}
            {message.trim() ? (
              <Button
                onClick={handleSendMessage}
                disabled={sendMessage.isPending}
                className="bg-blue-600 hover:bg-blue-700 rounded-full w-10 h-10 p-0 flex-shrink-0 shadow-lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleVoiceRecord}
                className={`rounded-full w-10 h-10 p-0 flex-shrink-0 shadow-lg transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
